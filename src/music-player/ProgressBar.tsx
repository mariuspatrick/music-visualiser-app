import { useEffect, useState } from "react";

interface ProgressBarProps {
  duration: number;
  isPlaying: boolean;
  getCurrentTime: () => number;
  onSeek: (arg0: number) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

function ProgressBar({
  duration,
  isPlaying,
  getCurrentTime,
  onSeek,
}: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    // this runs 60 times a second
    const loop = () => {
      if (isPlaying) {
        const time = getCurrentTime();

        if (time > duration) {
          return () => cancelAnimationFrame(animationFrameId);
        }

        setCurrentTime(time);

        animationFrameId = requestAnimationFrame(loop);
      }
    };

    // START condition: If we are playing, start the loop
    if (isPlaying) {
      loop();
    }

    // CLEANUP: If we pause or unmount, kill the loop
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration]);

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
