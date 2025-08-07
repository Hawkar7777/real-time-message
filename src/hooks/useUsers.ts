// src/hooks/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { fetchUsersExcluding } from "../services/userService";
import type { User } from "../types";

export function useUsers(currentUserId: string | null) {
  return useQuery<User[]>({
    queryKey: ["users", currentUserId],
    queryFn: () => {
      if (!currentUserId) return Promise.resolve([]);
      return fetchUsersExcluding(currentUserId);
    },
    enabled: !!currentUserId,
  });
}
