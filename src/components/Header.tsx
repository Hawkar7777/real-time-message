import { useState } from "react";
import {
  MdOutlinePerson,
  MdExitToApp,
  MdChatBubbleOutline,
} from "react-icons/md";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUsername } from "../services/userService";
import Spinner from "../ui/Spinner";
import type { HeaderProps } from "../types";

export default function Header({ selectedUser }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user?.id,
  });

  const { mutate: changeUsername, isPending: isUpdating } = useMutation({
    mutationFn: (username: string) =>
      updateUsername({ id: user!.id, username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  const handleUsernameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    changeUsername(newUsername);
    setNewUsername("");
  };

  const width = useWindowWidth();
  const isPhScreen = width <= 768;
  const shouldHideHeader = selectedUser && isPhScreen;

  return (
    <header
      className={`bg-purple-200 text-purple-800 max-w-[120rem] !mx-auto !p-4 flex items-center justify-between rounded-xl  ${
        shouldHideHeader ? "hidden" : "block"
      }  `}
    >
      <div className="bg-purple-300/70 !px-2 !py-2 rounded-xl">
        <MdChatBubbleOutline size={30} />
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="bg-purple-300/90 !px-2 !py-2 hover:bg-purple-400/70"
          onClick={() => setIsModalOpen(true)}
        >
          <MdOutlinePerson size={30} />
        </Button>

        <Button
          className="bg-purple-300/90 !px-2 !py-2 hover:bg-purple-400/70"
          onClick={logout}
        >
          <MdExitToApp size={30} />
        </Button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Account Info"
      >
        {isLoading ? (
          <div className="bg-purple-300 flex items-center justify-center !p-4">
            <Spinner />
          </div>
        ) : (
          profile && (
            <div className="flex flex-col gap-3 space-y-4 !p-4 text-purple-900 text-[2rem]">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-2 border-purple-300 object-cover"
                />
                <p className="text-lg text-gray-500">
                  Account created:{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              <form
                onSubmit={handleUsernameChange}
                className="flex flex-col gap-3 "
              >
                <label className="block">
                  Username:
                  <input
                    className="w-full !mt-1 !p-2 rounded border"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={profile.username}
                    disabled={isUpdating}
                  />
                </label>
                <div className="self-center">
                  <Button
                    className="bg-purple-600 text-white hover:bg-purple-700 !px-2 !py-2 text-2xl"
                    type="submit"
                    disabled={isUpdating || !newUsername}
                  >
                    {isUpdating ? "Updating..." : "Change Username"}
                  </Button>
                </div>
              </form>

              <div>
                <label className="block text-gray-600">Email:</label>
                <span className="text-2xl">{profile.email}</span>
              </div>
            </div>
          )
        )}
      </Modal>
    </header>
  );
}
