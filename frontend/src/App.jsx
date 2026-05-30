import { useSession } from "./hooks/useSession";
import ConsentGate    from "./components/ConsentGate";
import Header         from "./components/Header";
import Controls       from "./components/Controls";
import TranscriptPanel from "./components/TranscriptPanel";
import NotePanel       from "./components/NotePanel";

export default function App() {
  const {
    consented, setConsented,
    recording, chunks, note, summary, language, generating, wsStatus, fullTranscript,
    startSession, stopSession, generateNote, resetSession,
  } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {!consented && <ConsentGate onConsent={() => setConsented(true)} />}

      <Header recording={recording} language={language} wsStatus={wsStatus} />

      <Controls
        recording={recording}
        hasChunks={chunks.length > 0}
        generating={generating}
        onStart={startSession}
        onStop={stopSession}
        onGenerate={generateNote}
        onReset={resetSession}
      />

      {/* Main panels */}
      <main className="flex-1 grid grid-cols-2 gap-4 px-6 pb-6 min-h-0" style={{ height: "calc(100vh - 120px)" }}>
        <TranscriptPanel chunks={chunks} recording={recording} />
        <NotePanel note={note} summary={summary} fullTranscript={fullTranscript} generating={generating} />
      </main>
    </div>
  );
}
