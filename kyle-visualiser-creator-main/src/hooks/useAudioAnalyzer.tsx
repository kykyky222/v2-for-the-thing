import { useRef, useState, useCallback } from "react";

export const useAudioAnalyzer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setCurrentFile(file.name);
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    const audio = new Audio(url);
    audioElementRef.current = audio;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
    }

    if (!sourceRef.current && audioContextRef.current && analyzerRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
    }

    audio.addEventListener("ended", () => setIsPlaying(false));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const getFrequencyData = useCallback(() => {
    if (!analyzerRef.current) return null;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  return {
    handleFileUpload,
    togglePlayPause,
    getFrequencyData,
    isPlaying,
    currentFile,
    hasAudio: !!audioElementRef.current,
  };
};
