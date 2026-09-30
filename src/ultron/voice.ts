export type VoiceCallbacks = {
  onTranscript?: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
  onError?: (message: string) => void;
};

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionConstructor = new () => Recognition;

export function createVoiceController(callbacks: VoiceCallbacks = {}) {
  const SpeechRecognition = (window as any).SpeechRecognition as RecognitionConstructor | undefined;
  const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition as RecognitionConstructor | undefined;
  const Constructor = SpeechRecognition ?? WebkitSpeechRecognition;
  let recognition: Recognition | null = null;

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const start = () => {
    if (!Constructor) {
      callbacks.onError?.("Speech recognition is not available in this WebView.");
      return;
    }
    recognition?.stop();
    recognition = new Constructor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onstart = () => callbacks.onListeningChange?.(true);
    recognition.onend = () => callbacks.onListeningChange?.(false);
    recognition.onerror = event => callbacks.onError?.(event?.error ?? "Speech recognition failed.");
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) callbacks.onTranscript?.(transcript);
    };
    recognition.start();
  };

  const stop = () => recognition?.stop();

  return { start, stop, speak };
}
