import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStepBackward,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { DEFAULT_VOLUME } from "../enums/AudioPlayerTypes";

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface MusicPlayerControlsProps {
  isPaused: boolean;
  onPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onRewind: () => void;
}

function MusicPlayerControls({
  isPaused,
  onPause,
  onRewind,
  onVolumeChange,
}: MusicPlayerControlsProps) {
  const [showVolume, setShowVolume] = useState(false);
  const [volumeState, setVolumeState] = useState<
    typeof DEFAULT_VOLUME | number
  >(DEFAULT_VOLUME);

  function handleVolumeChange(rangeEvent: ReactChangeEvent) {
    const newVol = parseFloat(rangeEvent.target.value);
    setVolumeState(newVol);
    onVolumeChange(newVol);
  }

  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={onRewind}
        className="transition-colors hover:text-slate-300"
      >
        <FontAwesomeIcon icon={faStepBackward} />
      </button>

      <button
        onClick={onPause}
        className="transition-colors hover:text-slate-300"
      >
        {isPaused ? (
          <FontAwesomeIcon icon={faPlay} />
        ) : (
          <FontAwesomeIcon icon={faPause} />
        )}
      </button>

      <div className="relative flex items-center">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="transition-colors hover:text-slate-300"
        >
          <FontAwesomeIcon icon={faVolumeHigh} />
        </button>
        {showVolume && (
          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-slate-800 p-2 shadow-lg">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={volumeState}
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
