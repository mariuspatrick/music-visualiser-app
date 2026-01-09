import { useCallback, useRef, useState } from "react";
import { DEFAULT_VOLUME } from "../enums/AudioPlayerTypes";

export function useAudioPlayer() {
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const volumeRef = useRef<number>(DEFAULT_VOLUME);

  const initialize = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
      // const analyser = new AnalyserNode(audioCtx.current);
      gainNode.current = audioCtx.current.createGain();

      gainNode.current.gain.value = volumeRef.current;

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

  const connectAndStart = (
    buffer: AudioBuffer,
    currentStartTime: number = 0,
  ) => {
    if (!audioCtx.current || !gainNode.current) return;

    const source = audioCtx.current.createBufferSource();
    source.buffer = buffer;

    // Connect Source -> Gain (and implicitly to -> Destination)
    source.connect(gainNode.current);

    // Set playback reference time. When starting from beginning (currentStartTime = 0),
    // this marks the current moment. When seeking, it offsets to account for the seek position.
    startTime.current = audioCtx.current.currentTime - currentStartTime;

    // Update the UI duration
    setDuration(buffer.duration);

    source.start(0, currentStartTime);

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
    volumeRef.current = value;

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

  const seek = (newTime: number) => {
    if (!sourceNode.current || !sourceNode.current.buffer) return;

    const currentBuffer = sourceNode.current.buffer;

    stopPreviousSource();

    connectAndStart(currentBuffer, newTime);
  };

  return {
    hasStarted,
    isPaused,
    duration,
    volume: volumeRef.current,
    initialize,
    restart,
    pause,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    getCurrentTime,
    seek,
    isInitialized: () => audioCtx.current !== null,
  };
}
