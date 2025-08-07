// src/components/Main.tsx
import AsideUserList from "./AsideUserList";
import SelectedChat from "./SelectedChat";
import type { MainProps } from "../types";
import { useWindowWidth } from "../hooks/useWindowWidth";

export default function Main({ selectedUser, setSelectedUser }: MainProps) {
  const width = useWindowWidth();
  const isPhScreen = width <= 768;
  const shouldHideHeader = selectedUser && isPhScreen;

  return (
    <main
      className={`max-w-[100rem] !mx-auto !mt-5 bg-purple-300/70 !p-4 text-purple-800 rounded-xl ${
        shouldHideHeader ? "h-screen" : "h-[80vh]"
      } 
        grid gap-4
        ${
          // md and up: grid-cols-4
          "md:grid-cols-4"
        }
      `}
    >
      {/* AsideUserList */}
      <aside
        className={`
          bg-purple-200 rounded-xl !p-4 overflow-y-auto
          ${
            // md and up: col-span-1, visible
            "md:col-span-1 md:block"
          }
          ${
            // below md: show only if no user selected, occupy full screen
            selectedUser ? "hidden" : "block col-span-full h-full"
          }
        `}
      >
        <AsideUserList
          onSelectUser={setSelectedUser}
          selectedUserId={selectedUser?.id || null}
        />
      </aside>

      {/* SelectedChat */}
      <section
        className={`
          bg-purple-100 rounded-xl overflow-hidden flex flex-col
          ${
            // md and up: col-span-3 and show
            "md:col-span-3 md:flex"
          }
          ${
            // below md: show only if user selected, occupy full screen
            selectedUser ? "block col-span-full h-full" : "hidden"
          }
        `}
      >
        <SelectedChat
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </section>
    </main>
  );
}
