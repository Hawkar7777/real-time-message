import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/userService";

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: ({ queryKey }) => {
      // queryKey: ['user-profile', userId]
      const [, id] = queryKey;
      return getUserProfile(id as string);
    },
    enabled: !!userId, // avoid running if no userId
  });
}
