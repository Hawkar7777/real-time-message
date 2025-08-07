import Button from "../ui/Button";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import type { ChatHeaderProps } from "../types";

export default function ChatHeader({ user, onSelectUser }: ChatHeaderProps) {
  return (
    <header className="!p-4 bg-purple-300 flex items-center gap-3">
      <Button onClick={() => onSelectUser(null)}>
        <IoMdArrowRoundBack />
      </Button>
      <img
        src={user?.avatar_url}
        alt={user?.username}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <h2 className="text-xl font-semibold">{user?.username}</h2>
        <p className="text-sm text-gray-700">
          {user?.is_online
            ? "Online"
            : user?.last_seen
            ? `Last seen ${formatDistanceToNow(new Date(user.last_seen), {
                addSuffix: true,
              })}`
            : "Offline"}
        </p>
      </div>
    </header>
  );
}
