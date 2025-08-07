import Header from "./Header";
import Main from "./Main";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useState } from "react";
import type { User } from "../types";

export default function Home() {
  useOnlineStatus();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  return (
    <>
      <Header selectedUser={selectedUser} />
      <Main selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
    </>
  );
}
