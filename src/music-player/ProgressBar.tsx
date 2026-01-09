import { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  duration: number;
  isPlaying: boolean;
  getCurrentTime: () => number;
  onSeek: (arg0: number) => void;
  onComplete: () => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

function ProgressBar({
  duration,
  isPlaying,
  getCurrentTime,
  onSeek,
  onComplete,
}: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    // this runs 60 times a second
    const loop = () => {
      if (getCurrentTime) {
        const time = getCurrentTime();

        if (time >= duration && duration > 0) {
          setCurrentTime(duration);
          if (onComplete) onComplete();
          return;
        }

        setCurrentTime(time);

        requestRef.current = requestAnimationFrame(loop);
      }
    };
    // START condition: If we are playing, start the loop
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(loop);
    }
    // CLEANUP: If we pause or unmount, kill the loop
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, duration, getCurrentTime, onComplete]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);

    setCurrentTime(newTime);

    if (onSeek) onSeek(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group relative flex w-full flex-col gap-2">
      <div className="flex justify-between font-mono text-xs text-slate-400 select-none">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative flex h-2 w-full items-center">
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <input
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        <div
          className="pointer-events-none absolute h-4 w-4 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `${progressPercent}%`, marginLeft: "-8px" }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
