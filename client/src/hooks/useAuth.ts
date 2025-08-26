import { useQuery } from "@tanstack/react-query";
import type { IUser } from "@shared/models";

export function useAuth() {
  const { data: user, isLoading } = useQuery<IUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    isSuperAdmin: user?.role === "super_admin",
    isMember: user?.role === "member",
    isParticipant: user?.role === "participant",
  };
}