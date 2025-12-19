import { useRef } from "react";
import { useAudioPlayer } from "./hooks/useAudioPlayer";

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
      <div>
        <input type="file" accept="audio/*" onChange={handleSongUpload} />
        {hasStarted && <p>Audio Engine Ready</p>}
        <div className="flex justify-between items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            className="flex-1"
            onChange={handleVolumeChange}
          />
          <button onClick={handlePause}>{isPaused ? "Play" : "Pause"}</button>
        </div>
      </div>
    </>
  );
}

export default MusicPlayer;
