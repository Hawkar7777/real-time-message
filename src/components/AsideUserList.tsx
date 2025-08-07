// src/components/AsideUserList.tsx
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  fetchUnseenCounts,
  markConversationAsSeen,
} from "../services/chatService";
import { MdCircle } from "react-icons/md";
import type { User, AsideUserListProps } from "../types";
import Spinner from "../ui/Spinner";

export default function AsideUserList({
  onSelectUser,
  selectedUserId,
}: AsideUserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unseenCounts, setUnseenCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // 1) Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // 2) Fetch user list (excluding yourself)
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);

    supabase
      .from("users")
      .select("id, username, avatar_url, is_online")
      .neq("id", currentUserId)
      .order("username")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load users:", error);
        } else if (data) {
          setUsers(data as User[]);
        }
        setLoading(false);
      });
  }, [currentUserId]);

  // 3) Subscribe to realtime changes on users table for online status updates
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("public:users") // unique channel name
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=neq.${currentUserId}`, // exclude current user updates to avoid unnecessary renders
        },
        (payload) => {
          const updatedUser = payload.new as User;
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            )
          );
        }
      )
      // Also listen for INSERT if new users are added (optional)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "users",
          filter: `id=neq.${currentUserId}`,
        },
        (payload) => {
          const newUser = payload.new as User;
          setUsers((prevUsers) => {
            // avoid duplicate insertions
            if (prevUsers.find((u) => u.id === newUser.id)) return prevUsers;
            return [...prevUsers, newUser].sort((a, b) =>
              a.username.localeCompare(b.username)
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // 4) Helper to load unseen counts
  const loadCounts = () => {
    if (!currentUserId) return;
    fetchUnseenCounts(currentUserId).then(setUnseenCounts);
  };

  // 5) Initial fetch of unseen counts
  useEffect(loadCounts, [currentUserId]);

  // 6) Subscribe to message changes for unseen counts
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`unseen_for_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        () => {
          loadCounts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        () => {
          loadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // 7) Handle user select
  const handleSelect = (user: User) => {
    onSelectUser(user);
    if (currentUserId) {
      markConversationAsSeen(currentUserId, user.id).then(loadCounts);
    }
  };

  if (loading) {
    return (
      <aside className="col-span-1 overflow-y-auto bg-purple-400 rounded-xl !p-4 flex justify-center items-center h-full">
        <Spinner />
      </aside>
    );
  }

  return (
    <aside className="col-span-1 overflow-y-auto bg-purple-200 rounded-xl !p-4 space-y-4">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId;
        const unseen = unseenCounts[user.id] || 0;

        return (
          <div
            key={user.id}
            onClick={() => handleSelect(user)}
            className={`flex items-center gap-3 bg-purple-50/70 !p-2 rounded-lg shadow-sm cursor-pointer transition-all duration-300 hover:bg-purple-200 ${
              isSelected ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  unseen > 0 ? "text-purple-900" : "text-purple-600"
                }`}
              >
                {user.username.length > 10
                  ? user.username.slice(0, 10) + "..."
                  : user.username}
                {unseen > 0 && ` (${unseen})`}
              </p>
              <p className="text-sm flex items-center gap-1">
                <MdCircle
                  size={10}
                  className={
                    user.is_online ? "text-green-500" : "text-gray-400"
                  }
                />
                {user.is_online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
