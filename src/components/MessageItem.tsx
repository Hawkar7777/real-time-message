import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import type { MessageRow } from "../services/chatService";

// ✅ Import React Icons
import { FaPlay, FaPause, FaSpinner, FaFilePdf } from "react-icons/fa";
import { getOriginalFilename } from "../utils/getOriginalFilename";
import { truncateFilename } from "../utils/truncateFilename";

interface MessageItemProps {
  msg: MessageRow;
  isMine: boolean;
  avatar: string;
  onImageClick: (url: string) => void;
}

export default function MessageItem({
  msg,
  isMine,
  avatar,
  onImageClick,
}: MessageItemProps) {
  const hasFile = !!msg.file_url;
  const isAudio = hasFile && msg.file_url?.endsWith(".webm");
  const isPdf = hasFile && msg.file_url?.endsWith(".pdf");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showDuration, setShowDuration] = useState(true);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !msg.file_url) return;

    const updateDuration = () => {
      if (isFinite(audioEl.duration) && !isNaN(audioEl.duration)) {
        setDuration(audioEl.duration);
      }
    };

    const updateCurrentTime = () => {
      setCurrentTime(audioEl.currentTime);
    };

    const onLoadedMetadata = () => {
      updateDuration();
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowDuration(true);
    };

    const onTimeUpdate = () => {
      updateCurrentTime();
    };

    audioEl.src = msg.file_url;

    audioEl.addEventListener("loadedmetadata", onLoadedMetadata);
    audioEl.addEventListener("ended", onEnded);
    audioEl.addEventListener("durationchange", updateDuration);
    audioEl.addEventListener("timeupdate", onTimeUpdate);

    audioEl.load();

    return () => {
      audioEl.removeEventListener("loadedmetadata", onLoadedMetadata);
      audioEl.removeEventListener("ended", onEnded);
      audioEl.removeEventListener("durationchange", updateDuration);
      audioEl.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [msg.file_url]);

  const togglePlay = () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
      setShowDuration(true);
    } else {
      setLoading(true);
      setShowDuration(false);
      audioEl
        .play()
        .then(() => {
          setLoading(false);
          setIsPlaying(true);
        })
        .catch(() => {
          setLoading(false);
          setIsPlaying(false);
          setShowDuration(true);
        });
    }
  };

  const formatDuration = (sec: number | null) => {
    if (sec === null || !isFinite(sec) || isNaN(sec)) return "--:--";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getDisplayTime = () => {
    if (showDuration || !isPlaying) {
      return formatDuration(duration);
    } else {
      const remaining = duration ? duration - currentTime : 0;
      return formatDuration(remaining);
    }
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && <img src={avatar} className="w-8 h-8 rounded-full" />}

      <div>
        {hasFile ? (
          isAudio ? (
            <div
              className={`max-w-xs cursor-pointer rounded-lg bg-purple-500 !px-4 !py-2 flex items-center gap-3 select-none ${
                isMine ? "bg-purple-600 text-white" : "text-white"
              }`}
              onClick={togglePlay}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePlay();
                }
              }}
            >
              {loading ? (
                <FaSpinner className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <FaPause className="w-6 h-6" />
              ) : (
                <FaPlay className="w-6 h-6" />
              )}

              <span>{getDisplayTime()}</span>

              <audio
                ref={audioRef}
                src={msg.file_url!}
                preload="metadata"
                crossOrigin="anonymous"
              />
            </div>
          ) : isPdf ? (
            <a
              href={msg.file_url!}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 max-w-xs px-4 py-2 rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-50 transition ${
                isMine ? "text-right justify-end" : "text-left justify-start"
              }`}
            >
              <div className="flex flex-col items-center justify-center !p-2 gap-3 overflow-hidden">
                <FaFilePdf className="text-red-600 w-10 h-10 " />
                <span className="underline">
                  {msg.file_url
                    ? truncateFilename(
                        getOriginalFilename(msg.file_url.split("/").pop()!)
                      )
                    : ""}
                </span>
              </div>
            </a>
          ) : (
            <img
              src={msg.file_url!}
              alt="attachment"
              className="max-w-xs cursor-pointer rounded-lg"
              onClick={() => onImageClick(msg.file_url!)}
            />
          )
        ) : (
          <div
            className={`max-w-[30rem] break-words whitespace-pre-wrap inline-block !px-4 !py-2 rounded-lg text-white ${
              isMine ? "bg-purple-600" : "bg-purple-400"
            }`}
          >
            {msg.content}
          </div>
        )}

        {isMine && (
          <div className="text-xs text-gray-600 !mt-1 text-right">
            {msg.seen ? "Seen" : msg.receiver_online ? "Delivered" : "Sent"}
          </div>
        )}

        <div className="text-xs text-gray-600 !mt-1 text-right">
          {format(new Date(msg.created_at), "hh:mm a")}
        </div>
      </div>

      {isMine && <img src={avatar} className="w-8 h-8 rounded-full" />}
    </div>
  );
}
