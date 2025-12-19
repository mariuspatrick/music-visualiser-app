import { useRef, useState } from "react";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

function MusicPlayer() {
  const {
    hasStarted,
    start,
    isPaused,
    handlePause,
    stopPreviousSource,
    playAudioBuffer,
    setVolume,
    decodeAudioData,
    isInitialized,
  } = useAudioPlayer();

  const file = useRef<File>(null);
  const [showVolume, setShowVolume] = useState(false);

  function startAudioTrack() {
    start();
  }

  async function handleSongUpload(e: ReactChangeEvent) {
    if (!isInitialized()) startAudioTrack();

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    file.current = selectedFile;

    try {
      console.log("1. Reading file...");
      const bufferFile = await file.current.arrayBuffer();

      if (bufferFile.byteLength === 0) {
        console.error("Error: File is empty.");
        return;
      }

      console.log("3. Decoding audio data...");
      const audioBuffer = await decodeAudioData(bufferFile);

      if (!audioBuffer) {
        console.error("Decoding failed");
        return;
      }

      console.log("4. Audio decoded successfully.");

      // Run the helpers
      stopPreviousSource();
      playAudioBuffer(audioBuffer);
    } catch (err) {
      console.error("CRASH IN UPLOAD:", err);
      alert("Could not play this file. Try a standard MP3.");
    }
  }

  function handleVolumeChange(rangeEvent: ReactChangeEvent) {
    const { value } = rangeEvent.target;

    // gainNode uses volume from 0 to 1 so we divide by 100 (unless you want your ears to be blasted :( )
    setVolume(parseInt(value) / 100);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleSongUpload}
          className="cursor-pointer"
        />

        <div className="flex w-full justify-center gap-4">
          <button onClick={handlePause}>
            {isPaused ? (
              <FontAwesomeIcon icon={faPlay} />
            ) : (
              <FontAwesomeIcon icon={faPause} />
            )}
          </button>

          <div className="flex w-full items-center">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="cursor-pointer"
            >
              <FontAwesomeIcon icon={faVolumeHigh} />
            </button>
            {showVolume && (
              <div className="mb-2 rounded-lg p-2 shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  className="writing-mode-vertical h-32"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  onChange={handleVolumeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MusicPlayer;
