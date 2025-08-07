import type { Dispatch, SetStateAction } from "react";

export type User = {
  id: string;
  email?: string;
  username: string;
  avatar_url: string;
  is_online?: boolean;
};

export type AsideUserListProps = {
  onSelectUser: (user: User) => void;
  selectedUserId: string | null;
};

export type SelectedChatProps = {
  selectedUser: User | null;
  onSelectUser: (user: User | null) => void;
};

export type ChatHeaderProps = {
  user: {
    id: string;
    username: string;
    avatar_url: string;
    is_online: boolean;
    last_seen: string | null;
  } | null;
  onSelectUser: (user: User | null) => void;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  logout: () => void;
};

export type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type MainProps = {
  selectedUser: User | null;
  setSelectedUser: Dispatch<SetStateAction<User | null>>;
};

export type HeaderProps = {
  selectedUser: User | null;
};

export type FormValuesLogin = {
  email: string;
  password: string;
};
