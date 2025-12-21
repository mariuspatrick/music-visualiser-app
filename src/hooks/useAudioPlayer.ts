import { useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioCtx = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const start = async () => {
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

  // to restart we need to create a new AudioBufferSourceNode using the same source file and start it from scratch
  // we cannot simply 'rewind'
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);

  const restart = async () => {
    if (!sourceNode.current || !audioCtx.current || !gainNode.current) return;

    const currentBuffer = sourceNode.current.buffer;

    stopPreviousSource();

    const newSource = audioCtx.current.createBufferSource();

    startTime.current = audioCtx.current.currentTime;

    newSource.buffer = currentBuffer;

    newSource.connect(gainNode.current);
    newSource.start(0);
    sourceNode.current = newSource;
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

  const stopPreviousSource = () => {
    if (sourceNode.current) {
      setCurrentTime(0);
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }
  };

  const [duration, setDuration] = useState(0);
  const startTime = useRef(0);

  const playAudioBuffer = (audioBuffer: AudioBuffer) => {
    if (!audioCtx.current || !gainNode.current) return;

    const source = audioCtx.current.createBufferSource();

    // the source audio buffer (the actual song)
    source.buffer = audioBuffer;

    setDuration(audioBuffer.duration);

    startTime.current = audioCtx.current.currentTime;

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

  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => {
    let animationFrameId: number;

    // this runs 60 times a second
    const loop = () => {
      if (audioCtx.current && !isPaused) {
        const time = audioCtx.current.currentTime - startTime.current;

        setCurrentTime(time);

        animationFrameId = requestAnimationFrame(loop);
      }
    };

    // START condition: If we are playing, start the loop
    if (hasStarted && !isPaused) {
      loop();
    }

    // CLEANUP: If we pause or unmount, kill the loop
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, isPaused]);

  return {
    hasStarted,
    isPaused,
    duration,
    currentTime,
    start,
    restart,
    pause,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    isInitialized: () => audioCtx.current !== null,
  };
}
