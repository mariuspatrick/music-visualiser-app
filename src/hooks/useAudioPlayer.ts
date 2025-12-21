import { useCallback, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const initialize = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
      // const analyser = new AnalyserNode(audioCtx.current);
      gainNode.current = audioCtx.current.createGain();
      gainNode.current.connect(audioCtx.current.destination);
      // const analyser = audioCtx.createAnalyser();
    }
    return audioCtx.current.resume().then(() => {
      console.log("State:", audioCtx.current?.state);
      setHasStarted(true);
    });
  };

  const [isPaused, setIsPaused] = useState(false);

  const pause = async () => {
    if (audioCtx.current === null) return;

    if (isPaused) {
      await audioCtx.current.resume();
      setIsPaused(false);
    } else {
      await audioCtx.current.suspend();
      setIsPaused(true);
    }
  };

  const connectAndStart = (buffer: AudioBuffer) => {
    if (!audioCtx.current || !gainNode.current) return;

    const source = audioCtx.current.createBufferSource();
    source.buffer = buffer;

    // Connect Source -> Gain (and implicitly to -> Destination)
    source.connect(gainNode.current);

    // reset Time, every time we start a sound
    startTime.current = audioCtx.current.currentTime;

    // Update the UI duration
    setDuration(buffer.duration);

    source.start(0);
    sourceNode.current = source;
  };

  const [duration, setDuration] = useState(0);
  const startTime = useRef(0);

  const playAudioBuffer = (audioBuffer: AudioBuffer) => {
    stopPreviousSource();

    connectAndStart(audioBuffer);

    setIsPaused(false);
  };

  // to restart we need to create a new AudioBufferSourceNode using the same source file and start it from scratch
  // we cannot simply 'rewind'
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);

  const restart = () => {
    if (!sourceNode.current || !sourceNode.current.buffer) return;

    const currentBuffer = sourceNode.current.buffer;

    stopPreviousSource();

    connectAndStart(currentBuffer);
  };

  const stopPreviousSource = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }
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

  const getCurrentTime = useCallback(() => {
    if (!audioCtx.current) return 0;

    const rawTime = audioCtx.current.currentTime - startTime.current;

    return Math.max(0, rawTime);
  }, []);

  return {
    hasStarted,
    isPaused,
    duration,
    initialize,
    restart,
    pause,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    getCurrentTime,
    isInitialized: () => audioCtx.current !== null,
  };
}
