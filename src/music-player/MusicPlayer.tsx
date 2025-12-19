import { useRef } from "react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import MusicPlayerControls from "./MusicPlayerControls";

type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

function MusicPlayer() {
  const {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startAudioTrack() {
    start();
  }

  function handleButtonClick() {
    fileInputRef.current?.click();
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

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleSongUpload}
          className="hidden"
        />

        <button
          onClick={handleButtonClick}
          className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-slate-100 transition-colors hover:bg-slate-600"
        >
          {file.current ? file.current.name : "Upload a song"}
        </button>

        <MusicPlayerControls
          isPaused={isPaused}
          onPause={handlePause}
          onVolumeChange={setVolume}
        />
      </div>
    </>
  );
}

export default MusicPlayer;
