import { useEffect, useState } from "react";

interface ProgressBarProps {
  duration: number;
  isPlaying: boolean;
  getCurrentTime: () => number;
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
}: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    // this runs 60 times a second
    const loop = () => {
      if (isPlaying) {
        const time = getCurrentTime();

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
  }, [isPlaying]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-between font-mono text-xs text-slate-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
