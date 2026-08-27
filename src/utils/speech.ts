// Utility for reliable Text-to-Speech in all browsers & iFrames with ElevenLabs, Web Audio API, and Web Speech API

let currentVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;
let sharedAudioContext: AudioContext | null = null;
let unlockedAudioElement: HTMLAudioElement | null = null;
let activeSpeechSession = 0;
let keepAliveTimer: any = null;

export const ELEVENLABS_VOICES = [
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica (Friendly & Clear)", persona: "Bright, warm & natural" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel / Ava (Warm & Professional)", persona: "Velvet, soothing & confident" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Calm & Trustworthy)", persona: "Measured & reassuring" },
  { id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde (Confident & Reassuring)", persona: "Engaging & friendly male" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Authoritative & Deep)", persona: "Deep & professional male" },
];

export const STORAGE_KEY_VOICE = "cub_ai_voice_id";

export const getStoredVoiceId = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VOICE);
    if (saved && ELEVENLABS_VOICES.some((v) => v.id === saved)) return saved;
  } catch (e) {}
  return "cgSgspJ2msm6clMCkdW9"; // Jessica as default friendly & clear voice
};

export const setStoredVoiceId = (id: string) => {
  try {
    localStorage.setItem(STORAGE_KEY_VOICE, id);
  } catch (e) {}
};

/**
 * Normalizes speech text for natural human cadence, eliminating markdown syntax,
 * raw bracket links, robotic reading of abbreviations, and formatting currency/phone numbers.
 */
export function cleanSpeechText(text: string, lang = "en"): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~`#>]/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/^[•\-\*]\s+/gm, "")
    .replace(/\n[•\-\*]\s+/g, ", ")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n\d+\.\s+/g, ", ")
    .replace(/\bCUB\b/g, "C-U-B")
    .replace(/\bECCB\b/g, "E-C-C-B")
    .replace(/\bEC\$/g, "Eastern Caribbean dollars ")
    .replace(/\bp\.a\./gi, "per year")
    .replace(/\bAPY\b/gi, "A-P-Y")
    .replace(/\bAPR\b/gi, "A-P-R")
    .replace(/\bATM\b/g, "A-T-M")
    .replace(/\bATMs\b/g, "A-T-Ms")
    .replace(/\bPIN\b/g, "pin")
    .replace(/\be\.g\.,?\s*/gi, "for example, ")
    .replace(/\bi\.e\.,?\s*/gi, "that is, ")
    .replace(/(\d+)%/g, "$1 percent")
    .replace(/(\d{3})-(\d{3})-(\d{4})/g, "$1, $2, $3")
    .replace(/(\d+):00([ap]m)/gi, "$1 $2")
    .replace(/–|-/g, " to ")
    .replace(/\s+/g, " ")
    .trim();

  // Caribbean Creole / Jamaican Patois natural rhythm & punctuation enhancements:
  if (lang === "creole" || lang === "jam") {
    cleaned = cleaned
      .replace(/\bWa gwan\b/gi, "Wa gwan,")
      .replace(/\bWah a go on\b/gi, "Wah a go on,")
      .replace(/\bBless up\b/gi, "Bless up,")
      .replace(/,\s*,/g, ",");
  }

  return cleaned;
}

/**
 * Initializes and unlocks AudioContext and HTMLAudioElement during user gesture (click/tap)
 * Crucial for preventing "NotAllowedError: play() failed because the user didn't interact"
 */
export const unlockAudio = () => {
  if (typeof window === "undefined") return;

  // 1. Unlock Web Audio Context
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        sharedAudioContext = new AudioContextClass();
      }
      if (sharedAudioContext.state === "suspended") {
        sharedAudioContext.resume().catch(() => {});
      }
    }
  } catch (e) {
    // Ignore AudioContext errors
  }

  // 2. Unlock HTMLAudioElement with tiny silent wav
  try {
    if (!unlockedAudioElement) {
      unlockedAudioElement = new Audio();
      unlockedAudioElement.setAttribute("playsinline", "true");
      unlockedAudioElement.setAttribute("webkit-playsinline", "true");
    }
    // Silent 1-pixel WAV audio to unlock user interaction token in browser
    unlockedAudioElement.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    unlockedAudioElement.play().then(() => {
      if (unlockedAudioElement) {
        unlockedAudioElement.pause();
        unlockedAudioElement.currentTime = 0;
      }
    }).catch(() => {
      // Benign if blocked
    });
  } catch (e) {}

  // 3. Unstick SpeechSynthesis if browser paused it
  if ("speechSynthesis" in window && window.speechSynthesis) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}
  }
};

// Listen to visibilitychange to fix browsers pausing audio/speech when user leaves the tab
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Resume AudioContext if suspended
      if (sharedAudioContext && sharedAudioContext.state === "suspended") {
        sharedAudioContext.resume().catch(() => {});
      }
      // Resume SpeechSynthesis if browser paused it while tab was hidden
      if ("speechSynthesis" in window && window.speechSynthesis) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (e) {}
      }
    }
  });

  // Global click / tap listener to auto-unlock audio on the user's very first interaction
  const unlockOnFirstClick = () => {
    unlockAudio();
    window.removeEventListener("click", unlockOnFirstClick);
    window.removeEventListener("touchstart", unlockOnFirstClick);
    window.removeEventListener("keydown", unlockOnFirstClick);
  };
  window.addEventListener("click", unlockOnFirstClick, { once: true, passive: true });
  window.addEventListener("touchstart", unlockOnFirstClick, { once: true, passive: true });
  window.addEventListener("keydown", unlockOnFirstClick, { once: true, passive: true });
}

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
  activeSpeechSession++;

  // Clear Chrome SpeechSynthesis keep-alive timer
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  // Stop Web Audio API buffer playback
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
      currentAudioSource.disconnect();
    } catch {}
    currentAudioSource = null;
  }

  // Stop HTML5 Audio playback
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  // Stop Browser Web Speech synthesis
  if (typeof window !== "undefined") {
    try {
      if ("speechSynthesis" in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }
};

export const isSpeaking = (): boolean => {
  if (currentAudioSource) {
    return true;
  }
  if (currentAudio && !currentAudio.paused && !currentAudio.ended) {
    return true;
  }
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

export const getBCP47LanguageCode = (langCode: string): string => {
  const map: Record<string, string> = {
    en: "en-US",
    creole: "en-AG",
    es: "es-ES",
    fr: "fr-FR",
    ht: "ht-HT",
    pt: "pt-BR",
    de: "de-DE",
    it: "it-IT",
    nl: "nl-NL",
    pap: "pap-AW",
    zh: "zh-CN",
    yue: "zh-HK",
    hi: "hi-IN",
    ar: "ar-SA",
    ja: "ja-JP",
    ko: "ko-KR",
    ru: "ru-RU",
    tl: "tl-PH",
    vi: "vi-VN",
    jam: "en-JM",
    pl: "pl-PL",
    sv: "sv-SE",
    el: "el-GR",
    tr: "tr-TR",
    sw: "sw-KE",
    bn: "bn-BD",
  };
  return map[langCode] || langCode || "en-US";
};

/**
 * Returns prioritized BCP-47 candidate tags with phonetic dialect fallbacks.
 * For example, if a browser lacks 'ht-HT' (Haitian Creole), it falls back to French ('fr-FR') phonetics
 * rather than an English voice which would distort the pronunciation.
 */
export const getLanguageVoiceCandidates = (langCode: string): string[] => {
  const candidates: Record<string, string[]> = {
    en: ["en-US", "en-GB", "en-AU", "en-CA", "en"],
    creole: ["en-AG", "en-JM", "en-GB", "en-US", "en"],
    es: ["es-ES", "es-US", "es-419", "es-MX", "es-AR", "es"],
    fr: ["fr-FR", "fr-CA", "fr-BE", "fr-CH", "fr"],
    ht: ["ht-HT", "ht", "fr-FR", "fr-CA", "fr"], // French-lexified phonetics
    pt: ["pt-BR", "pt-PT", "pt"],
    de: ["de-DE", "de-AT", "de-CH", "de"],
    it: ["it-IT", "it-CH", "it"],
    nl: ["nl-NL", "nl-BE", "nl"],
    pap: ["pap-AW", "pap", "es-419", "es-ES", "pt-BR", "es"], // Romance phonetics
    zh: ["zh-CN", "zh-SG", "zh-TW", "zh-HK", "zh"],
    yue: ["zh-HK", "yue-Hant-HK", "zh-TW", "zh-CN", "zh"],
    hi: ["hi-IN", "hi"],
    ar: ["ar-SA", "ar-EG", "ar-AE", "ar"],
    ja: ["ja-JP", "ja"],
    ko: ["ko-KR", "ko"],
    ru: ["ru-RU", "ru"],
    tl: ["fil-PH", "tl-PH", "tl", "fil"],
    vi: ["vi-VN", "vi"],
    jam: ["en-JM", "en-AG", "en-GB", "en-US", "en"],
    pl: ["pl-PL", "pl"],
    sv: ["sv-SE", "sv"],
    el: ["el-GR", "el"],
    tr: ["tr-TR", "tr"],
    sw: ["sw-KE", "sw-TZ", "sw"],
    bn: ["bn-BD", "bn-IN", "bn"],
  };
  return candidates[langCode] || [langCode, getBCP47LanguageCode(langCode)];
};

/**
 * Splits text into natural sentence chunks to prevent SpeechSynthesis timeouts
 */
function splitTextIntoSentences(text: string): string[] {
  // Strip out markdown formatting, links, and emojis for clean speech
  const cleaned = text
    .replace(/\*+/g, "")
    .replace(/[`_~]/g, "")
    .replace(/#+\s/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
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

/**
 * Browser-native Web Speech Synthesis implementation with Chrome unfreeze workarounds
 */
function speakWithWebSpeech(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  },
  lang: string = "en",
  sessionToken: number = activeSpeechSession
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    callbacks?.onError?.("Speech synthesis not supported in this environment");
    return;
  }

  // Clear any existing speech and unpause
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

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

  const proceedWithSpeech = () => {
    if (sessionToken !== activeSpeechSession) return;

    if (currentVoices.length === 0) {
      try {
        currentVoices = window.speechSynthesis.getVoices() || [];
      } catch {}
    }

    const bcp47 = getBCP47LanguageCode(lang);
    const candidateTags = getLanguageVoiceCandidates(lang);
    const isEnglishFamily = lang === "en" || lang === "creole" || lang === "jam";

    // Sophisticated voice matcher: test prioritized candidate tags
    let preferredVoice: SpeechSynthesisVoice | undefined;
    for (const tag of candidateTags) {
      const normalizedTag = tag.toLowerCase().replace(/_/g, "-");
      const prefix = normalizedTag.split("-")[0];

      // 1. Natural/Neural/Google voice for exact tag
      preferredVoice = currentVoices.find(
        (v) =>
          v.lang.toLowerCase().replace(/_/g, "-") === normalizedTag &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Neural") ||
            v.name.includes("Online") ||
            v.name.includes("Premium") ||
            v.name.includes("Enhanced") ||
            v.name.includes("Siri"))
      );
      if (preferredVoice) break;

      // 2. Any voice for exact tag
      preferredVoice = currentVoices.find((v) => v.lang.toLowerCase().replace(/_/g, "-") === normalizedTag);
      if (preferredVoice) break;

      // 3. Natural/Neural voice for language prefix
      preferredVoice = currentVoices.find(
        (v) =>
          v.lang.toLowerCase().replace(/_/g, "-").startsWith(prefix) &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Neural") ||
            v.name.includes("Online") ||
            v.name.includes("Premium") ||
            v.name.includes("Enhanced") ||
            v.name.includes("Siri"))
      );
      if (preferredVoice) break;

      // 4. Any voice for language prefix
      preferredVoice = currentVoices.find((v) => v.lang.toLowerCase().replace(/_/g, "-").startsWith(prefix));
      if (preferredVoice) break;
    }

    // Only fallback to English voices if the requested language is actually in the English family
    if (!preferredVoice && isEnglishFamily) {
      preferredVoice =
        currentVoices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural"))
        ) ||
        currentVoices.find((v) => v.lang.startsWith("en")) ||
        currentVoices[0];
    } else if (!preferredVoice) {
      // For foreign languages without matching browser voice, try the first available voice
      preferredVoice = currentVoices[0];
    }

    let currentChunkIndex = 0;

    const speakChunk = (index: number) => {
      if (sessionToken !== activeSpeechSession) return;

      if (index >= chunks.length) {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        callbacks?.onEnd?.();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = bcp47;

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          if (sessionToken !== activeSpeechSession) return;
          if (index === 0) {
            callbacks?.onStart?.();
          }
        };

        utterance.onend = () => {
          if (sessionToken !== activeSpeechSession) return;
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

        // Workaround for Chrome freezing SpeechSynthesis after tab switches or on long texts
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        keepAliveTimer = setInterval(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            if (window.speechSynthesis.speaking) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }
        }, 8000);

        // Cancel previous and resume before speak to unfreeze Chrome queue
        window.speechSynthesis.cancel();
        setTimeout(() => {
          if (sessionToken !== activeSpeechSession) return;
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utterance);
            // Double-resume to guarantee Chrome triggers utterance immediately
            window.speechSynthesis.resume();
          } catch (speakErr) {
            console.warn("SpeechSynthesis speak retry error:", speakErr);
            callbacks?.onError?.(speakErr);
            callbacks?.onEnd?.();
          }
        }, 30);
      } catch (err) {
        console.warn("Error invoking SpeechSynthesis:", err);
        callbacks?.onError?.(err);
        callbacks?.onEnd?.();
      }
    };

    speakChunk(0);
  };

  if (currentVoices.length === 0 && typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
    setTimeout(proceedWithSpeech, 60);
  } else {
    proceedWithSpeech();
  }
}

/**
 * Main Text-to-Speech function:
 * 1. Synchronously unlocks audio to bypass browser autoplay blocks
 * 2. Fetches audio from ElevenLabs with Web Audio API decoding
 * 3. Falls back gracefully to Web Speech API if ElevenLabs is unavailable or fails
 */
export const speakText = (
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  },
  lang: string = "en",
  voiceId?: string
) => {
  // CRITICAL: Immediately unlock audio hardware synchronously during user interaction
  unlockAudio();

  // Stop any ongoing speech safely
  stopSpeech();
  const sessionToken = activeSpeechSession;

  const targetVoiceId = voiceId || getStoredVoiceId();
  const cleaned = cleanSpeechText(text, lang);
  if (!cleaned) {
    callbacks?.onEnd?.();
    return;
  }

  // Attempt high-fidelity neural speech via backend proxy (ElevenLabs or Server Multilingual Engine)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s generous timeout for high-definition neural synthesis

  fetch("/api/tts/elevenlabs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cleaned, voiceId: targetVoiceId, lang }),
    signal: controller.signal,
  })
    .then(async (response) => {
      clearTimeout(timeoutId);
      if (sessionToken !== activeSpeechSession) return;

      const engine = response.headers.get("x-tts-engine") || "unknown";
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && (contentType.includes("audio") || contentType.includes("octet-stream"))) {
        console.log(`[CUB AI Speech] Serving high-quality audio via [${engine}] for lang [${lang}]`);
        const arrayBuffer = await response.arrayBuffer();
        if (sessionToken !== activeSpeechSession) return;

        // Preferred Playback Method: Web Audio API (never blocked after unlockAudio())
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!sharedAudioContext || sharedAudioContext.state === "closed") {
            sharedAudioContext = new AudioContextClass();
          }
          if (sharedAudioContext.state === "suspended") {
            await sharedAudioContext.resume().catch(() => {});
          }

          try {
            const audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer.slice(0));
            if (sessionToken !== activeSpeechSession) return;

            const source = sharedAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(sharedAudioContext.destination);

            currentAudioSource = source;

            source.onended = () => {
              if (currentAudioSource === source) {
                currentAudioSource = null;
              }
              callbacks?.onEnd?.();
            };

            source.start(0);
            callbacks?.onStart?.();
            return;
          } catch (decodeErr) {
            console.warn("[Web Audio Decode Error, trying HTMLAudioElement]", decodeErr);
          }
        }

        // Secondary Playback Method: HTMLAudioElement using primed audio
        try {
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(blob);
          const audio = unlockedAudioElement || new Audio();
          currentAudio = audio;

          audio.onplay = () => {
            if (sessionToken === activeSpeechSession) {
              callbacks?.onStart?.();
            }
          };

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudio === audio) currentAudio = null;
            callbacks?.onEnd?.();
          };

          audio.onerror = (err) => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudio === audio) currentAudio = null;
            console.warn("[ElevenLabs Audio Error] Falling back to Web Speech:", err);
            speakWithWebSpeech(cleaned, callbacks, lang, sessionToken);
          };

          audio.src = audioUrl;
          await audio.play();
          return;
        } catch (playErr) {
          console.warn("[ElevenLabs Play Catch] Falling back to Web Speech:", playErr);
          speakWithWebSpeech(cleaned, callbacks, lang, sessionToken);
        }
      } else {
        // Non-audio response (e.g. key missing, offline, fallback flag) -> use Web Speech API
        speakWithWebSpeech(cleaned, callbacks, lang, sessionToken);
      }
    })
    .catch((fetchErr) => {
      clearTimeout(timeoutId);
      if (sessionToken !== activeSpeechSession) return;
      console.warn("[TTS Fetch Fallback] Using Web Speech:", fetchErr);
      speakWithWebSpeech(cleaned, callbacks, lang, sessionToken);
    });
};
