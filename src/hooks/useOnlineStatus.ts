import { useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";
import { localDate } from "../utils/localDate";

export default function useOnlineStatus() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let intervalId: NodeJS.Timeout;

    const setOnline = async () => {
      await supabase
        .from("users")
        .update({
          is_online: true,
          last_seen: localDate(),
        })
        .eq("id", user.id);
    };

    const setOffline = async () => {
      await supabase
        .from("users")
        .update({
          is_online: false,
          last_seen: localDate(),
        })
        .eq("id", user.id);
    };

    // Set online when component mounts
    setOnline();

    // Heartbeat every 60 seconds to keep session alive
    intervalId = setInterval(() => {
      setOnline();
    }, 60_000); // every 60 seconds

    // Set offline on page close or tab hide
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setOffline();
      } else {
        setOnline(); // Back to visible = online
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", setOffline);

    return () => {
      clearInterval(intervalId);
      setOffline();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [user]);
}
