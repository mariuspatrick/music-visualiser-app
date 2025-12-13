import { useRef, useState } from "react";

export function useAudioPlayer() {
  const [hasStarted, setHasStarted] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);

  const start = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
      gainNode.current = audioCtx.current.createGain();
      gainNode.current.connect(audioCtx.current.destination);
    }
    return audioCtx.current.resume().then(() => {
      console.log("State:", audioCtx.current?.state);
      setHasStarted(true);
    });
  };

  const stopPreviousSource = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }
  };

  const playAudioBuffer = (audioBuffer: AudioBuffer) => {
    if (!audioCtx.current || !gainNode.current) return;

    const source = audioCtx.current.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(gainNode.current);
    source.start();
    sourceNode.current = source;
  };

  const setVolume = (value: number) => {
    if (gainNode.current) {
      gainNode.current.gain.value = value;
    }
  };

  const decodeAudioData = async (arrayBuffer: ArrayBuffer) => {
    if (!audioCtx.current) return null;
    return audioCtx.current.decodeAudioData(arrayBuffer);
  };

  return {
    hasStarted,
    start,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    isInitialized: () => audioCtx.current !== null,
  };
}
