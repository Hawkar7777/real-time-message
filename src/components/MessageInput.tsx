import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaFile } from "react-icons/fa";
import { FaMicrophone, FaStop } from "react-icons/fa6";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export default function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (s: string) => void;
  onSend: (file?: File) => void;
  disabled: boolean;
}) {
  const [file, setFile] = useState<File | undefined>();
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value && !file) return;
    onSend(file);
    onChange("");
    setFile(undefined);
  };

  const handleMicClick = async () => {
    if (isRecording) {
      const recordedFile = await stopRecording();
      setFile(recordedFile);
    } else {
      await startRecording();
    }
  };

  const shouldHide = value.trim().length > 0;

  // State to control actual display:none after animation
  const [isActuallyHidden, setIsActuallyHidden] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldHide) {
      // Start hiding animation, after duration hide fully
      timeoutRef.current = window.setTimeout(() => {
        setIsActuallyHidden(true);
      }, 300); // match transition duration
    } else {
      // Show immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsActuallyHidden(false);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [shouldHide]);

  // Classes for smooth hide/show animation
  // Animate opacity + max-width + padding + margin for shrink effect
  const animatedClasses = [
    "transition-all duration-300 ease-in-out overflow-hidden",
    shouldHide
      ? "opacity-0 max-w-0 p-0 m-0"
      : "opacity-100 max-w-[200px] px-3 py-1 m-0",
  ].join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="!p-4 bg-purple-200 flex gap-4 items-center"
    >
      <input
        className="!px-4 !py-2 rounded-full border w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Text"
      />

      <div className="flex items-center justify-between gap-5">
        {/* Animated File Input */}
        <label
          style={{ display: isActuallyHidden ? "none" : undefined }}
          className={`flex items-center gap-2 cursor-pointer text-lg text-purple rounded flex-1 sm:flex-auto md:flex-auto lg:flex-none justify-center transform ${animatedClasses}`}
        >
          <FaFile size={24} />
          <input
            type="file"
            accept="image/*,audio/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Animated Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          style={{ display: isActuallyHidden ? "none" : undefined }}
          className={`text-purple-700 hover:text-purple-900 transform transition-all duration-300 ease-in-out ${
            shouldHide
              ? "opacity-0 max-w-0 p-0 m-0 overflow-hidden"
              : "opacity-100 max-w-[48px] p-0 m-0 overflow-visible"
          }`}
          title={isRecording ? "Stop Recording" : "Start Voice Message"}
        >
          {isRecording ? <FaStop size={24} /> : <FaMicrophone size={24} />}
        </button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled}
          className="bg-purple-600 text-purple-50 !px-4 !py-2 hover:bg-purple-700 cursor-pointer transition-all duration-300 disabled:bg-purple-950 disabled:cursor-not-allowed"
        >
          {disabled ? <Spinner /> : "Send"}
        </Button>
      </div>
    </form>
  );
}
