import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface MusicPlayerControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onVolumeChange: (volume: number) => void;
}

function MusicPlayerControls({
  isPaused,
  onPause,
  onVolumeChange,
}: MusicPlayerControlsProps) {
  const [showVolume, setShowVolume] = useState(false);

  function handleVolumeChange(rangeEvent: ReactChangeEvent) {
    const { value } = rangeEvent.target;
    onVolumeChange(parseInt(value) / 100);
  }

  return (
    <div className="flex justify-center gap-4">
      <button onClick={onPause}>
        {isPaused ? (
          <FontAwesomeIcon icon={faPlay} />
        ) : (
          <FontAwesomeIcon icon={faPause} />
        )}
      </button>

      <div className="relative flex items-center">
        <button onClick={() => setShowVolume(!showVolume)}>
          <FontAwesomeIcon icon={faVolumeHigh} />
        </button>
        {showVolume && (
          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-slate-800 p-2 shadow-lg">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="h-32"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
              onChange={handleVolumeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicPlayerControls;
