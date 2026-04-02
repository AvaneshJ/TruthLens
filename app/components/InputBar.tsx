import { useState, useRef } from "react";
import { Search, Paperclip, X, Mic, MicOff } from "lucide-react";

export default function InputBar({
  query,
  setQuery,
  onSearch,
  loading,
  language,
  setLanguage,
  selectedFile,
  onFileSelect,
  previewUrl,
  clearFile,
}: any) {
  const [isListening, setIsListening] = useState(false);
  const originalRef = useRef("");
  const recognitionRef = useRef<any>(null);

  const handleVoiceTyping = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const languageCodes: Record<string, string> = {
      English: "en-IN",
      Hindi: "hi-IN",
      Tamil: "ta-IN",
      Telugu: "te-IN",
      Bengali: "bn-IN",
      Marathi: "mr-IN",
      Gujarati: "gu-IN",
    };
    recognition.lang = languageCodes[language] || "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      originalRef.current = query;
    };
    recognition.onresult = (event: any) => {
      let liveTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        liveTranscript += event.results[i][0].transcript;
      }
      setQuery(
        (originalRef.current ? originalRef.current + " " : "") + liveTranscript,
      );
    };
    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) onFileSelect(file);
      } else if (items[i].kind === "string" && items[i].type === "text/plain") {
        items[i].getAsString((text) => setQuery(text));
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative group w-full">
      {previewUrl && (
        <div className="absolute -top-20 sm:-top-24 left-2 sm:left-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl"
            />
            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex flex-col sm:flex-row items-center bg-white dark:bg-slate-900 rounded-[20px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20 gap-2 sm:gap-0">
        <div className="flex items-center w-full flex-1">
          <label className="ml-1 p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full group transition-all shrink-0">
            <Paperclip
              size={18}
              className="text-slate-400 group-hover:text-blue-600 sm:w-5 sm:h-5"
            />
            <input
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => onFileSelect(e.target.files![0])}
            />
          </label>
          <Search
            className="hidden sm:block ml-2 text-slate-400 shrink-0"
            size={20}
          />
          <button
            onClick={handleVoiceTyping}
            type="button"
            className={`ml-2 p-2 rounded-full transition-all shrink-0 ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            className="flex-1 w-full p-2 sm:p-3 ml-1 sm:ml-2 outline-none text-[14px] sm:text-[15px] bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 min-w-0"
            placeholder={
              isListening
                ? `Listening in ${language}...`
                : selectedFile
                  ? "Add text context..."
                  : "Enter a claim or paste screenshot..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            onPaste={handlePaste}
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-2 px-1 sm:px-0">
          <div className="relative flex items-center mr-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-transparent py-1.5 sm:py-2 pl-2 sm:pl-3 pr-6 sm:pr-8 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-0 cursor-pointer"
            >
              {[
                "English",
                "Hindi",
                "Tamil",
                "Telugu",
                "Bengali",
                "Marathi",
                "Gujarati",
              ].map((lang) => (
                <option
                  key={lang}
                  className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  value={lang}
                >
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onSearch()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 sm:px-8 sm:py-3.5 rounded-[12px] sm:rounded-[24px] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
          >
            {loading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
