// Utility for reliable Text-to-Speech in all browsers & iFrames

let currentVoices: SpeechSynthesisVoice[] = [];

// Safely initialize voices without throwing at module import time
if (typeof window !== "undefined") {
  try {
    if ("speechSynthesis" in window && window.speechSynthesis) {
      const loadVoices = () => {
        try {
          currentVoices = window.speechSynthesis.getVoices() || [];
        } catch {
          currentVoices = [];
        }
      };
      loadVoices();
      try {
        if ("onvoiceschanged" in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      } catch {
        // Ignore onvoiceschanged registration errors
      }
    }
  } catch (err) {
    console.warn("Speech synthesis not accessible in this browser context:", err);
  }
}

export const stopSpeech = () => {
  if (typeof window !== "undefined") {
    try {
      if ("speechSynthesis" in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      // Ignore cancellation errors
    }
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      if ("speechSynthesis" in window && window.speechSynthesis) {
        return !!window.speechSynthesis.speaking;
      }
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Splits text into natural sentence chunks to prevent SpeechSynthesis timeouts
 */
function splitTextIntoSentences(text: string): string[] {
  // Strip out markdown formatting and emojis for clean speech
  const cleaned = text
    .replace(/\*+/g, "")
    .replace(/[`_~]/g, "")
    .replace(/#+\s/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .trim();

  if (!cleaned) return [];

  // Split on sentence boundary or line breaks
  const rawSentences = cleaned.match(/[^.!?\n]+[.!?\n]+/g) || [cleaned];
  
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).length < 180) {
      currentChunk += (currentChunk ? " " : "") + trimmed;
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

export const speakText = (
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    callbacks?.onError?.("Speech synthesis not supported in this environment");
    return;
  }

  // Stop any ongoing speech safely
  stopSpeech();

  // Resume paused synthesis engine
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {
    // Ignore resume errors
  }

  const chunks = splitTextIntoSentences(text);
  if (chunks.length === 0) {
    callbacks?.onEnd?.();
    return;
  }

  // Reload voices if necessary
  if (currentVoices.length === 0) {
    try {
      currentVoices = window.speechSynthesis.getVoices() || [];
    } catch {
      currentVoices = [];
    }
  }

  // If voices are still loading asynchronously, wait up to 100ms or proceed with default
  const proceedWithSpeech = () => {
    if (currentVoices.length === 0) {
      try {
        currentVoices = window.speechSynthesis.getVoices() || [];
      } catch {}
    }

    // Pick an English voice if available
    const preferredVoice =
      currentVoices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Alex"))
      ) ||
      currentVoices.find((v) => v.lang.startsWith("en")) ||
      currentVoices[0];

    let currentChunkIndex = 0;

    const speakChunk = (index: number) => {
      if (index >= chunks.length) {
        callbacks?.onEnd?.();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          if (index === 0) {
            callbacks?.onStart?.();
          }
        };

        utterance.onend = () => {
          currentChunkIndex++;
          speakChunk(currentChunkIndex);
        };

        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          if (e.error === "canceled" || e.error === "interrupted") {
            callbacks?.onEnd?.();
            return;
          }

          console.warn(`Speech synthesis notice (${e.error || "unknown"}) for chunk ${index}`);
          currentChunkIndex++;
          if (currentChunkIndex < chunks.length) {
            speakChunk(currentChunkIndex);
          } else {
            callbacks?.onError?.(e);
            callbacks?.onEnd?.();
          }
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Error invoking SpeechSynthesis:", err);
        callbacks?.onError?.(err);
        callbacks?.onEnd?.();
      }
    };

    speakChunk(0);
  };

  if (currentVoices.length === 0 && typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    setTimeout(proceedWithSpeech, 50);
  } else {
    proceedWithSpeech();
  }
};

