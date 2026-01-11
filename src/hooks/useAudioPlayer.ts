import { useCallback, useRef, useState } from "react";
import { DEFAULT_VOLUME } from "../enums/AudioPlayerTypes";

const MAX_GAIN = 0.5 as const;

export function useAudioPlayer() {
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const volumeRef = useRef<number>(DEFAULT_VOLUME * MAX_GAIN);
  const compressorNode = useRef<DynamicsCompressorNode | null>(null);

  const initialize = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();

      const compressor = audioCtx.current.createDynamicsCompressor();
      compressor.threshold.value = -10; // Start lowering volume if it gets near -10dB
      compressor.knee.value = 30; // Smooth transition
      compressor.ratio.value = 12; // Squash high peaks hard
      compressor.attack.value = 0; // React instantly
      compressor.release.value = 0.25; // Release quickly

      compressorNode.current = compressor;

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

  const toggleAudioPlayback = async () => {
    if (audioCtx.current === null) return;

    if (isPaused) {
      await audioCtx.current.resume();
      setIsPaused(false);
    } else {
      await audioCtx.current.suspend();
      setIsPaused(true);
    }
  };

  const connectAndStart = (buffer: AudioBuffer, offsetTime: number = 0) => {
    if (!audioCtx.current || !gainNode.current) return;

    const source = audioCtx.current.createBufferSource();
    source.buffer = buffer;

    if (volumeRef.current !== undefined && gainNode.current) {
      gainNode.current.gain.value = volumeRef.current;
    }

    // Connect Source -> Gain (and implicitly to -> Destination)
    source.connect(gainNode.current);

    // Set playback reference time. When starting from beginning (currentStartTime = 0),
    // this marks the current moment. When seeking, it offsets to account for the seek position.
    startTime.current = audioCtx.current.currentTime - offsetTime;

    // Update the UI duration
    setDuration(buffer.duration);

    source.start(0, offsetTime);

    if (isPaused) {
      audioCtx.current.resume();
    }

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
    restartWithBuffer();
  };

  const seek = (newTime: number) => {
    restartWithBuffer(newTime);
  };

  const stopPreviousSource = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }
  };

  const restartWithBuffer = (startTime: number = 0) => {
    if (!sourceNode.current?.buffer) return;

    const currentBuffer = sourceNode.current.buffer;
    stopPreviousSource();
    connectAndStart(currentBuffer, startTime);
    setIsPaused(false);
  };

  const setVolume = (val: number) => {
    const safeVolume = val * MAX_GAIN;

    volumeRef.current = safeVolume;

    if (gainNode.current) {
      // Smoothly transition the volume to avoid "clicks"
      // "Move to this volume over 0.1 seconds"
      gainNode.current.gain.setTargetAtTime(
        safeVolume,
        audioCtx.current!.currentTime,
        0.01,
      );
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
    volume: volumeRef.current,
    initialize,
    restart,
    toggleAudioPlayback,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    getCurrentTime,
    seek,
    setIsPaused,
    isInitialized: () => audioCtx.current !== null,
  };
}
