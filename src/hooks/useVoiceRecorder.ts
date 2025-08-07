// src/hooks/useVoiceRecorder.ts
import { useState, useRef } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null); // ✅ Track the mic stream

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    streamRef.current = stream; // ✅ Store the stream

    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = (): Promise<File> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm; codecs=opus",
        });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: blob.type,
        });

        // ✅ Stop the mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolve(file);
        setIsRecording(false);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    });
  };

  return { isRecording, startRecording, stopRecording };
}
