"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  BookOpen,
  ShoppingBag,
  Settings,
  RotateCcw,
  CheckCircle2,
  Share2,
  ExternalLink,
  Award,
  PartyPopper,
  Wind,
  X,
  Save,
  Upload,
  FileText,
  Plus,
  Trash2,
  Eye,
  Heart,
  Crown,
  Gift,
  ChevronRight,
  Music,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Book } from "@/lib/data/books";
import { DEFAULT_HASINI_LAUNCH_BOOKS } from "@/lib/birthdayLaunch";

type Stage =
  | "curtain"        // Act I: Royal Velvet Invitation Curtain
  | "birthday_cake"  // Act II-A: Happy Birthday Hasini + BGM + Flickering 5-Wish Candles + Mic Blow
  | "cake_cutting"   // Act II-B: Golden Knife Cake Slice + Royal Birthday Tribute Card
  | "ready_launch"   // Act III: 2 Veiled Books on Spotlight Podiums + Ribbon Cutting Launch
  | "countdown"      // Act III-B: 3, 2, 1... Cinematic Countdown
  | "launched";      // Act IV: Grand 3D Book Reveal + Commemorative Certificate + Bookstore Live

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: "circle" | "rect" | "spark" | "heart";
  rotation: number;
  vRot: number;
}

interface AmbientDust {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  phase: number;
}

const CANDLE_BLESSINGS = [
  "Endless Joy ✨",
  "Good Health 💖",
  "Grand Success 🌟",
  "Boundless Wisdom 📚",
  "All Dreams Fulfilled 👑"
];

const getBestSweetVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;

  // 1. Natural / Online Indian English female voices (native authentic pronunciation of Hasini)
  const indianFemale = voices.find((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    const isMale =
      n.includes("male") ||
      n.includes("david") ||
      n.includes("ravi") ||
      n.includes("mark") ||
      n.includes("george");
    return (l.includes("en-in") || l.includes("hi-in")) && !isMale;
  });
  if (indianFemale) return indianFemale;

  // 2. Microsoft Edge Natural Sweet Female Voices (Jenny, Aria, Sonia, etc.)
  const edgeNatural = voices.find((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return (
      l.startsWith("en") &&
      n.includes("natural") &&
      (n.includes("jenny") ||
        n.includes("aria") ||
        n.includes("sonia") ||
        n.includes("neerja") ||
        n.includes("female"))
    );
  });
  if (edgeNatural) return edgeNatural;

  // 3. Google UK English Female (exceptionally smooth, warm, sweet British human tone)
  const googleUkFemale = voices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      n.includes("google") &&
      (n.includes("uk") || n.includes("british") || v.lang.toLowerCase() === "en-gb") &&
      !n.includes("male")
    );
  });
  if (googleUkFemale) return googleUkFemale;

  // 4. Any Google Female Voice (Google US English, etc.)
  const googleFemale = voices.find((v) => {
    const n = v.name.toLowerCase();
    return n.includes("google") && v.lang.toLowerCase().startsWith("en") && !n.includes("male");
  });
  if (googleFemale) return googleFemale;

  // 5. Apple Samantha / Karen / Victoria / Serena
  const appleFemale = voices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      v.lang.toLowerCase().startsWith("en") &&
      (n.includes("samantha") ||
        n.includes("karen") ||
        n.includes("victoria") ||
        n.includes("serena"))
    );
  });
  if (appleFemale) return appleFemale;

  // 6. Microsoft Zira (Clear female Windows voice)
  const zira = voices.find((v) => v.name.toLowerCase().includes("zira"));
  if (zira) return zira;

  // 7. Any female voice (strictly avoid robotic male voices like David)
  const anyFemale = voices.find((v) => {
    const n = v.name.toLowerCase();
    const isMale =
      n.includes("david") ||
      n.includes("mark") ||
      n.includes("george") ||
      n.includes("male");
    return v.lang.toLowerCase().startsWith("en") && !isMale;
  });
  if (anyFemale) return anyFemale;

  return voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0] || null;
};

export default function HasiniBirthdayLaunchPage() {
  const [stage, setStage] = useState<Stage>("curtain");
  const [curtainOpening, setCurtainOpening] = useState(false);
  const [books, setBooks] = useState<Book[]>(DEFAULT_HASINI_LAUNCH_BOOKS);
  const [isAlreadyLaunchedInStore, setIsAlreadyLaunchedInStore] = useState(false);
  const [launchedAt, setLaunchedAt] = useState<string | null>(null);

  // Audio & Microphone states
  const [isMuted, setIsMuted] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [blowIntensity, setBlowIntensity] = useState(0); // 0 to 100
  const [blowProgress, setBlowProgress] = useState(0);   // 0 to 100
  const [freqBars, setFreqBars] = useState<number[]>([8, 12, 16, 10, 14, 18, 14, 10, 16, 12, 8, 10]);
  const [candlesLit, setCandlesLit] = useState<boolean[]>([true, true, true, true, true]);
  const [activeBlessingToast, setActiveBlessingToast] = useState<string>("");

  // Cake cutting & countdown states
  const [knifeProgress, setKnifeProgress] = useState(0); // 0 = above, 1 = slicing, 2 = sliced
  const [sliceSeparated, setSliceSeparated] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [copiedLink, setCopiedLink] = useState(false);

  // Organizer Setup Modal & Preview PDF Modal states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [editableBooks, setEditableBooks] = useState<Book[]>(DEFAULT_HASINI_LAUNCH_BOOKS);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupToast, setSetupToast] = useState("");
  const [selectedPreviewBook, setSelectedPreviewBook] = useState<Book | null>(null);
  const [selectedReadingBook, setSelectedReadingBook] = useState<Book | null>(null);
  const [uploadingFullPdfIdx, setUploadingFullPdfIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [magicWordDetected, setMagicWordDetected] = useState(false);
  const [isListeningForWord, setIsListeningForWord] = useState(false);
  const recognitionRef = useRef<any>(null);
  const stageRef = useRef<Stage>("curtain");
  const candlesLitRef = useRef<boolean[]>([true, true, true, true, true]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    candlesLitRef.current = candlesLit;
  }, [candlesLit]);
  const voicesListRef = useRef<SpeechSynthesisVoice[]>([]);
  const [activeVoiceName, setActiveVoiceName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesListRef.current = v;
        const best = getBestSweetVoice(v);
        if (best) setActiveVoiceName(best.name);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const speakSweetCelebration = useCallback((speechText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || isMutedRef.current) return;
    try {
      window.speechSynthesis.cancel();

      const availableVoices =
        voicesListRef.current.length > 0
          ? voicesListRef.current
          : window.speechSynthesis.getVoices();
      const sweetVoice = getBestSweetVoice(availableVoices);

      // Accurate sweet human pronunciation of "Hasini" (హాసిని):
      // Standard English TTS often reduces "-sini" and says "Hasan".
      // Phonetically replacing "Hasini" with "Haa-see-nee" forces crystal-clear
      // 3-syllable pronunciation (Haa - see - nee), ensuring it NEVER sounds like "Hasan".
      // For Indian English voices (en-IN), "Haasini" / "Haa-see-nee" is beautifully spoken.
      const isIndianVoice = sweetVoice?.lang?.toLowerCase().includes("in");
      const phoneticText = isIndianVoice
        ? speechText.replace(/\bHasini\b/gi, "Haasini")
        : speechText.replace(/\bHasini\b/gi, "Haa-see-nee");

      const utterance = new SpeechSynthesisUtterance(phoneticText);
      if (sweetVoice) {
        utterance.voice = sweetVoice;
        utterance.lang = sweetVoice.lang;
      }
      utterance.pitch = 1.08; // Melodious, sweet, warm celebratory pitch
      utterance.rate = 0.88;  // Relaxed human speaking cadence (ensures clear enunciation without rushing)
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech announcement error:", err);
    }
  }, []);

  // Refs for Web Audio & Canvas Fireworks
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientDustRef = useRef<AmbientDust[]>([]);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Lock page scrolling & track Full Screen state
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore if blocked by browser policy
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
  }, []);

  // Load current launch state & custom book details from backend
  useEffect(() => {
    fetch("/api/birthday-launch")
      .then((res) =>
        res.ok && (res.headers.get("content-type") || "").includes("application/json")
          ? res.json()
          : null
      )
      .then((data) => {
        if (data) {
          if (Array.isArray(data.books) && data.books.length >= 2) {
            setBooks(data.books);
            setEditableBooks(data.books);
          }
          setIsAlreadyLaunchedInStore(Boolean(data.isLaunched));
          setLaunchedAt(data.launchedAt || null);
        }
      })
      .catch(() => {});

    // Clean up any lingering query params so the birthday surprise always opens clean
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // CANVAS ENGINE: CONTINUOUS GOLDEN BOKEH DUST + FIREWORKS & CONFETTI
  // ---------------------------------------------------------------------------
  const spawnFireworkBurst = useCallback((cx?: number, cy?: number, count = 90) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = cx ?? canvas.width * (0.2 + Math.random() * 0.6);
    const y = cy ?? canvas.height * (0.16 + Math.random() * 0.35);
    const palette = [
      "#FDE047", "#F59E0B", "#FB7185", "#F43F5E",
      "#C084FC", "#38BDF8", "#34D399", "#FFFBEB"
    ];
    const shapes: Particle["shape"][] = ["rect", "circle", "spark", "heart"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const speed = 2.2 + Math.random() * 8.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3.2 + Math.random() * 5.2,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        decay: 0.0075 + Math.random() * 0.011,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initDust = (w: number, h: number) => {
      const dust: AmbientDust[] = [];
      for (let i = 0; i < 55; i++) {
        dust.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 2.4,
          vy: -0.18 - Math.random() * 0.45,
          vx: (Math.random() - 0.5) * 0.25,
          alpha: 0.15 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2
        });
      }
      ambientDustRef.current = dust;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (ambientDustRef.current.length === 0) {
        initDust(canvas.width, canvas.height);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    let animId: number;
    let tick = 0;
    const render = () => {
      tick += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render Ambient Golden Bokeh Dust
      for (const d of ambientDustRef.current) {
        d.x += d.vx + Math.sin(tick + d.phase) * 0.12;
        d.y += d.vy;
        if (d.y < -10) {
          d.y = canvas.height + 10;
          d.x = Math.random() * canvas.width;
        }
        if (d.x < -10) d.x = canvas.width + 10;
        if (d.x > canvas.width + 10) d.x = -10;

        const twinkle = d.alpha * (0.65 + 0.35 * Math.sin(tick * 2 + d.phase));
        ctx.save();
        ctx.globalAlpha = Math.max(0.05, twinkle);
        ctx.fillStyle = "#FDE68A";
        ctx.shadowColor = "#F59E0B";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Render Fireworks & Confetti Particles
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.11;
        p.vx *= 0.986;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.shape === "spark" ? 14 : 5;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
        } else if (p.shape === "spark") {
          ctx.beginPath();
          ctx.moveTo(-p.size * 1.7, 0);
          ctx.lineTo(p.size * 1.7, 0);
          ctx.moveTo(0, -p.size * 1.7);
          ctx.lineTo(0, p.size * 1.7);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else if (p.shape === "heart") {
          const s = p.size * 0.32;
          ctx.beginPath();
          ctx.moveTo(0, s * 2);
          ctx.bezierCurveTo(-s * 3, -s, -s * 1.5, -s * 3.5, 0, -s * 1.2);
          ctx.bezierCurveTo(s * 1.5, -s * 3.5, s * 3, -s, 0, s * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

  return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER (HAPPY BIRTHDAY BGM + SOUND EFFECTS + SPEECH)
  // ---------------------------------------------------------------------------
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playBellNote = useCallback(
    (freq: number, startTime: number, duration: number, volume = 0.14, harmonyFreq?: number) => {
      if (isMutedRef.current) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(freq * 2, startTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(volume * 0.25, startTime);
      subGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      osc.connect(gain);
      subOsc.connect(subGain);
      subGain.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      subOsc.start(startTime);
      osc.stop(startTime + duration + 0.05);
      subOsc.stop(startTime + duration + 0.05);

      if (harmonyFreq) {
        const hOsc = ctx.createOscillator();
        const hGain = ctx.createGain();
        hOsc.type = "sine";
        hOsc.frequency.setValueAtTime(harmonyFreq, startTime);
        hGain.gain.setValueAtTime(0.001, startTime);
        hGain.gain.linearRampToValueAtTime(volume * 0.42, startTime + 0.05);
        hGain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration * 1.15);
        hOsc.connect(hGain);
        hGain.connect(ctx.destination);
        hOsc.start(startTime);
        hOsc.stop(startTime + duration * 1.2);
      }
    },
    [getAudioContext]
  );

  const startBirthdayBGM = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25;
    const F3 = 174.61, C3 = 130.81, Bb2 = 116.54;

    const melody: Array<{ f: number; d: number; h?: number }> = [
      { f: C4, d: 0.38 }, { f: C4, d: 0.22 }, { f: D4, d: 0.58, h: F3 }, { f: C4, d: 0.58 }, { f: F4, d: 0.58, h: A4 }, { f: E4, d: 1.1, h: C3 },
      { f: C4, d: 0.38 }, { f: C4, d: 0.22 }, { f: D4, d: 0.58, h: C3 }, { f: C4, d: 0.58 }, { f: G4, d: 0.58, h: E4 }, { f: F4, d: 1.1, h: F3 },
      { f: C4, d: 0.38 }, { f: C4, d: 0.22 }, { f: C5, d: 0.58, h: F3 }, { f: A4, d: 0.58 }, { f: F4, d: 0.58, h: C4 }, { f: E4, d: 0.58 }, { f: D4, d: 0.95, h: Bb2 },
      { f: Bb4, d: 0.38 }, { f: Bb4, d: 0.22 }, { f: A4, d: 0.58, h: F3 }, { f: F4, d: 0.58 }, { f: G4, d: 0.58, h: C3 }, { f: F4, d: 1.35, h: F3 }
    ];

    const playSequence = () => {
      if (isMutedRef.current) return;
      const now = ctx.currentTime + 0.06;
      let cursor = now;
      for (const note of melody) {
        playBellNote(note.f, cursor, note.d * 0.95, 0.13, note.h);
        cursor += note.d;
      }
    };

    playSequence();
    const totalDurationMs = melody.reduce((acc, n) => acc + n.d, 0) * 1000 + 800;
    bgmIntervalRef.current = setInterval(playSequence, totalDurationMs);
  }, [getAudioContext, playBellNote]);

  const playCakeCutCelebrationAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && !isMutedRef.current) {
      const now = ctx.currentTime;
      const fanfare = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      fanfare.forEach((f, idx) => {
        playBellNote(f, now + idx * 0.09, 0.9, 0.16, f * 0.5);
      });
    }

    speakSweetCelebration(
      "Happy Birthday Hasini! Wishing you endless happiness, grand success, and a magical year ahead!"
    );
  }, [getAudioContext, playBellNote]);

  const playCountdownPulseSound = useCallback(
    (num: number) => {
      const ctx = getAudioContext();
      if (!ctx || isMutedRef.current) return;
      const now = ctx.currentTime;
      if (num > 0) {
        const freq = num === 3 ? 220 : num === 2 ? 261.63 : 329.63;
        playBellNote(freq, now, 0.65, 0.2, freq * 0.5);
        playBellNote(freq * 1.5, now + 0.04, 0.5, 0.12);
      } else {
        const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5];
        chord.forEach((f, i) => {
          playBellNote(f, now + i * 0.04, 1.8, 0.18, f * 0.5);
        });
      }
    },
    [getAudioContext, playBellNote]
  );

  useEffect(() => {
  return () => {
      if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // VOICE DETECTION ("HASINI") & CANDLE BLOWING / CAKE CUTTING CEREMONY
  // ---------------------------------------------------------------------------
  const stopVoiceDetection = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (micRafRef.current) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setMicActive(false);
    setIsListeningForWord(false);
  }, []);

  const triggerCakeCuttingCeremony = useCallback(() => {
    setActiveBlessingToast("All 5 Birthday Wishes Sealed in Gold! 🎂✨");
    setStage("cake_cutting");
    setKnifeProgress(1); // Knife hovers in slicing position

    const ctx = getAudioContext();
    if (ctx && !isMutedRef.current) {
      playBellNote(659.25, ctx.currentTime, 0.6, 0.15, 330);
      playBellNote(880.0, ctx.currentTime + 0.15, 0.8, 0.18, 440);
    }

    // Step 2: Knife descends and slices through the cake; slice separates onto golden plate!
    setTimeout(() => {
      setKnifeProgress(2);
      setSliceSeparated(true);

      playCakeCutCelebrationAudio();

      spawnFireworkBurst(window.innerWidth * 0.28, window.innerHeight * 0.32, 95);
      spawnFireworkBurst(window.innerWidth * 0.72, window.innerHeight * 0.32, 95);
      spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.24, 120);

      // Knife smoothly retracts
      setTimeout(() => {
        setKnifeProgress(0);
      }, 1600);
    }, 1100);
  }, [getAudioContext, playBellNote, playCakeCutCelebrationAudio, spawnFireworkBurst]);

  const triggerMagicWordHasini = useCallback(() => {
    if (stageRef.current !== "birthday_cake") return;
    setMagicWordDetected(true);
    setIsListeningForWord(false);
    stopVoiceDetection();

    setActiveBlessingToast("✨ Magic Word 'Hasini' Heard! Blowing Birthday Candles... ✨");

    const ctx = getAudioContext();

    // Sequentially extinguish each of the 5 candles with chimes and sparkles
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        setCandlesLit((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
        setBlowProgress(Math.round(((idx + 1) / 5) * 100));

        if (ctx && !isMutedRef.current) {
          playBellNote(523.25 + idx * 80, ctx.currentTime, 0.45, 0.15);
        }

        const candleX = window.innerWidth * (0.38 + idx * 0.06);
        const candleY = window.innerHeight * 0.45;
        spawnFireworkBurst(candleX, candleY, 20);

        setActiveBlessingToast(`Wish #${idx + 1}: ${CANDLE_BLESSINGS[idx]}`);

        if (idx === 4) {
          setTimeout(() => {
            triggerCakeCuttingCeremony();
          }, 850);
        }
      }, idx * 320);
    });
  }, [getAudioContext, playBellNote, spawnFireworkBurst, stopVoiceDetection, triggerCakeCuttingCeremony]);

  // Allow tapping any individual candle on the cake to blow it out!
  const handleToggleSingleCandle = (idx: number) => {
    if (stage !== "birthday_cake" || !candlesLit[idx]) return;
    const next = [...candlesLit];
    next[idx] = false;
    setCandlesLit(next);
    setActiveBlessingToast(`Wish #${idx + 1}: ${CANDLE_BLESSINGS[idx]}`);

    const ctx = getAudioContext();
    if (ctx && !isMutedRef.current) {
      playBellNote(523.25 + idx * 65, ctx.currentTime, 0.35, 0.12);
    }

    const extinguishedCount = next.filter((c) => !c).length;
    setBlowProgress(Math.round((extinguishedCount / 5) * 100));

    if (extinguishedCount === 5) {
      stopVoiceDetection();
      triggerCakeCuttingCeremony();
    }
  };

  const startVoiceDetectionForHasini = useCallback(async () => {
    setMagicWordDetected(false);
    setIsListeningForWord(true);

    // 1. Microphone stream for visual frequency bars with echo cancellation
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        micStreamRef.current = stream;
        setMicActive(true);
        setMicPermissionDenied(false);

        const ctx = getAudioContext();
        if (ctx) {
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateBars = () => {
            analyser.getByteFrequencyData(dataArray);
            const bars: number[] = [];
            for (let i = 0; i < 12; i++) {
              bars.push(Math.max(10, Math.min(100, Math.round((dataArray[i] / 255) * 100))));
            }
            setFreqBars(bars);
            micRafRef.current = requestAnimationFrame(updateBars);
          };
          micRafRef.current = requestAnimationFrame(updateBars);
        }
      } catch {
        setMicPermissionDenied(true);
      }
    }

    // 2. Web Speech Recognition strictly listening for the spoken word "Hasini"
    if (typeof window !== "undefined") {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch {}
          }
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-IN";

          recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const text = event.results[i][0].transcript.toLowerCase();
              if (
                text.includes("hasini") ||
                text.includes("hashini") ||
                text.includes("hasan") ||
                text.includes("hasi") ||
                text.includes("haasini") ||
                text.includes("hassini")
              ) {
                stopVoiceDetection();
                triggerMagicWordHasini();
                break;
              }
            }
          };

          recognition.onerror = () => {
            // Non-critical, user can also tap button or candle
          };

          recognition.onend = () => {
            if (stageRef.current === "birthday_cake" && candlesLitRef.current.some(Boolean)) {
              try { recognition.start(); } catch {}
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch {}
      }
    }
  }, [getAudioContext, stopVoiceDetection, triggerMagicWordHasini]);

  // ---------------------------------------------------------------------------
  // STAGE TRANSITIONS
  // ---------------------------------------------------------------------------
  const handleEnterCelebration = () => {
    enterFullscreen();
    setCurtainOpening(true);
    startBirthdayBGM();
    setTimeout(() => {
      setStage("birthday_cake");
      setCurtainOpening(false);
      startVoiceDetectionForHasini();
      spawnFireworkBurst(window.innerWidth * 0.25, window.innerHeight * 0.28, 80);
      spawnFireworkBurst(window.innerWidth * 0.75, window.innerHeight * 0.28, 80);
    }, 850);
  };

  const handleStartBookLaunchCountdown = () => {
    setStage("countdown");
    setCountdownNumber(3);
    playCountdownPulseSound(3);
    spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 65);

    setTimeout(() => {
      setCountdownNumber(2);
      playCountdownPulseSound(2);
      spawnFireworkBurst(window.innerWidth * 0.35, window.innerHeight * 0.35, 70);
    }, 1200);

    setTimeout(() => {
      setCountdownNumber(1);
      playCountdownPulseSound(1);
      spawnFireworkBurst(window.innerWidth * 0.65, window.innerHeight * 0.35, 70);
    }, 2400);

    setTimeout(async () => {
      setCountdownNumber(0);
      playCountdownPulseSound(0);
      setStage("launched");

      spawnFireworkBurst(window.innerWidth * 0.22, window.innerHeight * 0.25, 115);
      spawnFireworkBurst(window.innerWidth * 0.78, window.innerHeight * 0.25, 115);
      spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.18, 135);

      speakSweetCelebration(
        "Congratulations Hasini! Both books are now officially launched and available in the Lurnexa Bookstore!"
      );

      try {
        const res = await fetch("/api/birthday-launch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "launch" })
        });
        if (res.ok) {
          const updated = await res.json();
          setIsAlreadyLaunchedInStore(true);
          setLaunchedAt(updated.launchedAt || new Date().toISOString());
        }
      } catch (err) {
        console.error("Failed to persist book launch state:", err);
      }
    }, 3600);
  };

  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/launch/hasini-oct30`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSaveBooksConfig = async () => {
    setSavingSetup(true);
    try {
      const res = await fetch("/api/birthday-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_books", books: editableBooks })
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
        setEditableBooks(data.books);
        setSetupToast("Saved both launch books, chapters & preview PDFs!");
        setTimeout(() => setSetupToast(""), 3500);
      }
    } finally {
      setSavingSetup(false);
    }
  };

  const handleResetLaunchState = async () => {
    setSavingSetup(true);
    try {
      const res = await fetch("/api/birthday-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
      if (res.ok) {
        setIsAlreadyLaunchedInStore(false);
        setLaunchedAt(null);
        setCandlesLit([true, true, true, true, true]);
        setBlowProgress(0);
        setKnifeProgress(0);
        setSliceSeparated(false);
        setActiveBlessingToast("");
        setStage("curtain");
        setSetupToast("Reset complete! Ready for Hasini to experience from the beginning.");
        setTimeout(() => setSetupToast(""), 3500);
      }
    } finally {
      setSavingSetup(false);
    }
  };

  const handleCoverImageUpload = (bookIdx: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const next = [...editableBooks];
        next[bookIdx] = { ...next[bookIdx], coverImg: reader.result };
        setEditableBooks(next);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewPdfUpload = (bookIdx: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const next = [...editableBooks];
        next[bookIdx] = {
          ...next[bookIdx],
          pdfFileName: file.name,
          customPreviewPdfDataUrl: reader.result
        };
        setEditableBooks(next);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFullBookPdfUpload = async (bookIdx: number, file: File | null) => {
    if (!file) return;
    setUploadingFullPdfIdx(bookIdx);
    try {
      const book = editableBooks[bookIdx];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookId", String(book.id));
      formData.append("type", "full");

      const res = await fetch("/api/birthday-launch/upload-book-pdf", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const next = [...editableBooks];
        next[bookIdx] = {
          ...next[bookIdx],
          pdfFileName: data.fileName,
          fullBookPdfSize: data.fileSize,
          fullBookPdfUploadedAt: new Date().toISOString()
        };
        setEditableBooks(next);
        setSetupToast(`✓ Uploaded "${data.fileName}" for Softcopy Reading Mode!`);
        setTimeout(() => setSetupToast(""), 4500);
      } else {
        alert(data.error || "Failed to upload full book PDF");
      }
    } catch (err: any) {
      alert(err?.message || "Error uploading full book PDF");
    } finally {
      setUploadingFullPdfIdx(null);
    }
  };

  return (
    <div className="lx-zoom fixed inset-0 h-[100dvh] w-screen overflow-x-hidden overflow-y-auto md:overflow-hidden bg-[#05030B] text-white select-none flex flex-col">
      {/* =====================================================================
          ROYAL ATMOSPHERIC STAGE LIGHTING & VOLUMETRIC BEAMS
         ===================================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Deep Royal Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1F0924_0%,#090414_55%,#040208_100%)]" />
        {/* Volumetric Overhead Stage Beams */}
        <div
          className="absolute -top-32 left-1/4 w-[480px] h-[680px] opacity-30 blur-[90px] rotate-[14deg]"
          style={{
            background: "conic-gradient(from 165deg at 50% 0%, transparent 0deg, #F59E0B 25deg, transparent 55deg)"
          }}
        />
        <div
          className="absolute -top-32 right-1/4 w-[480px] h-[680px] opacity-30 blur-[90px] -rotate-[14deg]"
          style={{
            background: "conic-gradient(from 165deg at 50% 0%, transparent 0deg, #F43F5E 25deg, transparent 55deg)"
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[380px] w-[860px] rounded-full bg-amber-500/10 blur-[150px]" />
      </div>

      {/* Continuous Golden Bokeh Dust + Fireworks Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" />

      {/* =====================================================================
          FLOATING CORNER CONTROLS (FULL SCREEN, AUDIO, SHARE, CUSTOMIZE)
         ===================================================================== */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5 rounded-2xl bg-[#0A0514]/85 backdrop-blur-xl border border-amber-400/25 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.65)]">
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-rose-500/20 hover:from-amber-400/35 hover:to-rose-500/35 border border-amber-300/35 text-[11px] font-extrabold text-amber-200 transition-all cursor-pointer"
          title={isFullscreen ? "Exit Full Screen Mode" : "Enter Full Screen Mode"}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span className="hidden sm:inline">
            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
          </span>
        </button>

        <button
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-[11px] font-bold text-amber-200 transition-all cursor-pointer"
          title="Copy unique link to share with Hasini"
        >
          <Share2 size={13} />
          <span className="hidden md:inline">
            {copiedLink ? "✓ Copied" : "Share"}
          </span>
        </button>

        <button
          onClick={() => setIsMuted((m) => !m)}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isMuted
              ? "bg-rose-500/15 border-rose-400/30 text-rose-300"
              : "bg-amber-400/15 border-amber-400/30 text-amber-300"
          }`}
          title={isMuted ? "Unmute Birthday Music" : "Mute Birthday Music"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <button
          onClick={() => setShowSetupModal(true)}
          className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] border border-white/15 text-amber-200 transition-all cursor-pointer"
          title="Customize the 2 Books, Chapters, Preview PDFs, or Reset Launch State"
        >
          <Settings size={15} />
        </button>
      </div>

      {/* =====================================================================
          ACT I: ROYAL VELVET CURTAIN ENTRANCE (FITS 100% SCREEN RATIO)
         ===================================================================== */}
      <AnimatePresence mode="wait">
        {stage === "curtain" && (
          <motion.section
            key="curtain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 flex-1 min-h-0 w-full flex flex-col items-center justify-center px-4 py-4 text-center overflow-y-auto md:overflow-hidden"
          >
            {/* Left & Right 3D Pleated Velvet Theatre Curtains that part on click */}
            <motion.div
              animate={{ x: curtainOpening ? "-100%" : "0%" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed inset-y-0 left-0 w-[16vw] sm:w-[22vw] z-10 border-r-2 border-amber-400/40 shadow-[25px_0_60px_rgba(0,0,0,0.85)]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #4C0519 0px, #881337 28px, #3B0413 56px)"
              }}
            >
              <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 opacity-80" />
            </motion.div>

            <motion.div
              animate={{ x: curtainOpening ? "100%" : "0%" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed inset-y-0 right-0 w-[16vw] sm:w-[22vw] z-10 border-l-2 border-amber-400/40 shadow-[-25px_0_60px_rgba(0,0,0,0.85)]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #3B0413 0px, #881337 28px, #4C0519 56px)"
              }}
            >
              <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 opacity-80" />
            </motion.div>

            {/* Royal Invitation Card */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{
                y: curtainOpening ? -20 : 0,
                opacity: curtainOpening ? 0 : 1,
                scale: curtainOpening ? 1.05 : 1
              }}
              transition={{ duration: 0.65 }}
              className="relative z-20 max-w-xl w-full mx-auto rounded-[28px] p-[1.5px] bg-gradient-to-b from-amber-300/70 via-rose-400/40 to-amber-500/70 shadow-[0_25px_90px_-15px_rgba(245,158,11,0.4)]"
            >
              <div className="rounded-[26.5px] bg-[#0C0618]/90 backdrop-blur-2xl px-5 py-6 sm:px-10 sm:py-8 space-y-4 relative overflow-hidden">
                {/* Corner Gold Filigree Accents */}
                <div className="pointer-events-none absolute top-3.5 left-3.5 w-8 h-8 border-t-2 border-l-2 border-amber-400/50 rounded-tl-xl" />
                <div className="pointer-events-none absolute top-3.5 right-3.5 w-8 h-8 border-t-2 border-r-2 border-amber-400/50 rounded-tr-xl" />
                <div className="pointer-events-none absolute bottom-3.5 left-3.5 w-8 h-8 border-b-2 border-l-2 border-amber-400/50 rounded-bl-xl" />
                <div className="pointer-events-none absolute bottom-3.5 right-3.5 w-8 h-8 border-b-2 border-r-2 border-amber-400/50 rounded-br-xl" />

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-300 text-[10px] font-extrabold uppercase tracking-[0.25em]">
                  <Crown size={13} />
                  <span>October 30 • Royal Invitation</span>
                </div>

                <div className="space-y-1">
                  <p
                    className="text-2xl sm:text-3xl text-amber-300"
                    style={{ fontFamily: "var(--font-great-vibes), cursive" }}
                  >
                    Celebrating Our Guest of Honor
                  </p>
                  <h2
                    className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-yellow-300 to-rose-200 bg-clip-text text-transparent leading-tight"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    Happy Birthday Hasini
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  A special birthday celebration complete with music, a candlelit 3-tier birthday cake, and the{" "}
                  <span className="text-amber-300 font-bold">
                    Official Grand Launch of 2 Lurnexa Textbooks
                  </span>{" "}
                  inaugurated by <span className="text-white font-bold">Hasini</span>.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={handleEnterCelebration}
                    className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-rose-500 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_45px_rgba(245,158,11,0.55)] hover:shadow-[0_0_70px_rgba(245,158,11,0.85)] hover:scale-[1.03] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Sparkles size={18} className="text-slate-950 animate-spin" />
                    <span>Open Your Birthday Surprise, Hasini 🎂✨</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400">
                  🔊 Automatically enters Full Screen Mode with Birthday Music &amp; Microphone Candle Blowing
                </p>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* =====================================================================
            ACT II: HAPPY BIRTHDAY HASINI + 3D CAKE + BLOW CANDLES & CUT CAKE
           ===================================================================== */}
        {(stage === "birthday_cake" || stage === "cake_cutting") && (
          <motion.section
            key="cake-stage"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 flex-1 min-h-0 w-full flex flex-col items-center justify-between px-3 sm:px-6 py-2 sm:py-5 text-center overflow-y-auto md:overflow-hidden"
          >
            {/* Floating Decorative 3D Balloons Left & Right */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-10 hidden sm:block opacity-75 lg:opacity-100">
              {[
                { left: "5%", top: "14%", color: "from-rose-400 via-rose-500 to-rose-700", delay: 0 },
                { left: "11%", top: "52%", color: "from-amber-200 via-amber-400 to-amber-600", delay: 1.2 },
                { left: "89%", top: "16%", color: "from-fuchsia-400 via-purple-500 to-indigo-700", delay: 0.6 },
                { left: "83%", top: "54%", color: "from-amber-300 via-rose-400 to-rose-600", delay: 1.8 }
              ].map((b, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -18, 0], rotate: [-2.5, 2.5, -2.5] }}
                  transition={{ duration: 4.8, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
                  style={{ left: b.left, top: b.top }}
                  className="absolute flex flex-col items-center"
                >
                  <div
                    className={`w-16 h-20 rounded-full bg-gradient-to-br ${b.color} shadow-[inset_-8px_-8px_20px_rgba(0,0,0,0.45),0_15px_30px_rgba(0,0,0,0.5)] relative`}
                  >
                    <div className="absolute top-2.5 left-3.5 w-3.5 h-6 rounded-full bg-white/45 rotate-[-25deg] blur-[1px]" />
                  </div>
                  <div className="w-2 h-1.5 -mt-0.5 bg-amber-400 rounded-sm" />
                  <div className="w-[1px] h-24 bg-gradient-to-b from-amber-200/50 to-transparent" />
                </motion.div>
              ))}
            </div>

            {/* Luxury Calligraphy & Serif Birthday Header (Compact) */}
            <div className="shrink-0 space-y-0.5 max-w-3xl mx-auto">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl text-amber-300 leading-none"
                style={{ fontFamily: "var(--font-great-vibes), cursive" }}
              >
                Wishing the Happiest Birthday to
              </motion.p>

              <motion.h2
                animate={{
                  textShadow: [
                    "0 0 25px rgba(251,191,36,0.45)",
                    "0 0 50px rgba(244,63,94,0.65)",
                    "0 0 25px rgba(251,191,36,0.45)"
                  ]
                }}
                transition={{ duration: 3.2, repeat: Infinity }}
                className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-yellow-300 to-rose-300 bg-clip-text text-transparent leading-tight"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                ✨ Hasini ✨
              </motion.h2>

              <p className="text-[11px] sm:text-xs text-amber-100/85 font-medium max-w-xl mx-auto">
                {stage === "birthday_cake"
                  ? "Blow gently into your microphone, tap each candle, or click the button below to cut the birthday cake!"
                  : "🎂 Happy Birthday Hasini! Your cake is cut and your wishes are sealed in gold!"}
              </p>

              {/* Floating Blessing Pill when candles are blown */}
              <AnimatePresence mode="wait">
                {activeBlessingToast && (
                  <motion.div
                    key={activeBlessingToast}
                    initial={{ opacity: 0, y: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-extrabold shadow-lg"
                  >
                    <Sparkles size={12} className="text-amber-300" />
                    <span>{activeBlessingToast}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ===============================================================
                HYPER-REALISTIC 3-TIER BIRTHDAY CAKE (DYNAMIC SCREEN RATIO FIT)
               =============================================================== */}
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center my-1">
              {/* Warm Candlelight Halo Behind Cake */}
              <div
                className={`pointer-events-none absolute w-64 h-64 rounded-full transition-opacity duration-1000 blur-[65px] ${
                  candlesLit.some(Boolean) ? "bg-amber-400/35 opacity-100" : "bg-rose-400/15 opacity-40"
                }`}
              />

              {/* Master SVG 3D Cake Illustration scaled strictly by viewport height */}
              <div className="relative h-full max-h-[42vh] aspect-[440/400] flex items-center justify-center">
                <svg
                  viewBox="0 0 440 400"
                  className="w-full h-full overflow-visible drop-shadow-[0_22px_32px_rgba(0,0,0,0.75)]"
                >
                  <defs>
                    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94A3B8" />
                      <stop offset="25%" stopColor="#F8FAFC" />
                      <stop offset="50%" stopColor="#FFFFFF" />
                      <stop offset="75%" stopColor="#E2E8F0" />
                      <stop offset="100%" stopColor="#64748B" />
                    </linearGradient>
                    <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="30%" stopColor="#FDE047" />
                      <stop offset="50%" stopColor="#FFFBEB" />
                      <stop offset="70%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                    <linearGradient id="bottomTier" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9F1239" />
                      <stop offset="25%" stopColor="#F43F5E" />
                      <stop offset="52%" stopColor="#FB7185" />
                      <stop offset="80%" stopColor="#E11D48" />
                      <stop offset="100%" stopColor="#881337" />
                    </linearGradient>
                    <linearGradient id="midTier" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#D97706" />
                      <stop offset="22%" stopColor="#FEF3C7" />
                      <stop offset="50%" stopColor="#FFFBEB" />
                      <stop offset="78%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                    <linearGradient id="chocoGlaze" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5C2D16" />
                      <stop offset="40%" stopColor="#3E1C0A" />
                      <stop offset="85%" stopColor="#261005" />
                      <stop offset="100%" stopColor="#170802" />
                    </linearGradient>
                    <linearGradient id="candleBody" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="50%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <radialGradient id="flameHalo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#F97316" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="bladeHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#450A0A" />
                      <stop offset="40%" stopColor="#991B1B" />
                      <stop offset="70%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#7F1D1D" />
                    </linearGradient>
                  </defs>

                  {/* Pedestal Base & Plate */}
                  <ellipse cx="220" cy="366" rx="110" ry="18" fill="url(#goldTrim)" />
                  <path d="M165,332 L275,332 L295,364 L145,364 Z" fill="url(#plateGrad)" />
                  <ellipse cx="220" cy="326" rx="182" ry="30" fill="url(#goldTrim)" />
                  <ellipse cx="220" cy="322" rx="174" ry="26" fill="url(#plateGrad)" />

                  {/* Bottom Tier */}
                  <path
                    d="M68,225 L68,314 A152,24 0 0,0 372,314 L372,225 Z"
                    fill="url(#bottomTier)"
                  />
                  <ellipse cx="220" cy="225" rx="152" ry="24" fill="#FDA4AF" />
                  <path
                    d="M68,225 A152,24 0 0,0 372,225 L372,242
                       Q358,266 346,242 Q332,228 320,255 Q306,275 294,244
                       Q280,232 266,262 Q252,282 238,246 Q220,234 205,266
                       Q190,285 176,245 Q160,232 146,260 Q132,276 118,244
                       Q102,232 90,256 Q78,268 68,240 Z"
                    fill="url(#chocoGlaze)"
                  />
                  {Array.from({ length: 19 }).map((_, idx) => {
                    const angle = (Math.PI * idx) / 18;
                    const px = 220 - Math.cos(angle) * 148;
                    const py = 313 + Math.sin(angle) * 22;
                    return <circle key={`bpearl-${idx}`} cx={px} cy={py} r="5.5" fill="url(#goldTrim)" />;
                  })}

                  {/* Upper Main Tier */}
                  <path
                    d="M104,132 L104,222 A116,19 0 0,0 336,222 L336,132 Z"
                    fill="url(#midTier)"
                  />
                  <ellipse cx="220" cy="132" rx="116" ry="19" fill="url(#chocoGlaze)" />
                  <ellipse cx="195" cy="128" rx="75" ry="9" fill="#FFFFFF" opacity="0.12" />

                  <path
                    d="M104,132 A116,19 0 0,0 336,132 L336,146
                       Q324,168 312,146 Q298,136 286,162 Q272,182 258,148
                       Q242,138 228,166 Q214,186 200,148 Q186,136 172,162
                       Q158,178 144,146 Q130,136 118,158 Q110,168 104,145 Z"
                    fill="url(#chocoGlaze)"
                  />

                  {Array.from({ length: 15 }).map((_, idx) => {
                    const angle = (Math.PI * idx) / 14;
                    const px = 220 - Math.cos(angle) * 114;
                    const py = 221 + Math.sin(angle) * 18;
                    return <circle key={`mpearl-${idx}`} cx={px} cy={py} r="4.8" fill="url(#goldTrim)" />;
                  })}

                  {/* Royal Icing Plaque */}
                  <g transform="translate(220, 275)">
                    <rect
                      x="-105"
                      y="-22"
                      width="210"
                      height="42"
                      rx="21"
                      fill="#FFFBEB"
                      stroke="url(#goldTrim)"
                      strokeWidth="3.5"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#9F1239"
                      fontSize="11"
                      fontWeight="900"
                      letterSpacing="1.2"
                    >
                      HAPPY BIRTHDAY
                    </text>
                    <text
                      x="0"
                      y="13"
                      textAnchor="middle"
                      fill="#B45309"
                      fontSize="14"
                      fontWeight="900"
                      letterSpacing="2"
                    >
                      ✨ HASINI ✨
                    </text>
                  </g>

                  {/* Strawberries & Cream Rosettes */}
                  {[-88, -46, 0, 46, 88].map((offsetX, i) => (
                    <g key={`berry-${i}`} transform={`translate(${220 + offsetX}, ${134 + (i % 2 === 0 ? 4 : 7)})`}>
                      <ellipse cx="0" cy="4" rx="11" ry="6" fill="#FFFBEB" />
                      <path
                        d="M-7,2 C-9,-7 0,-12 0,-12 C0,-12 9,-7 7,2 C5,7 -5,7 -7,2 Z"
                        fill="#E11D48"
                      />
                      <path d="M-4,-10 L0,-7 L4,-10 L0,-13 Z" fill="#10B981" />
                    </g>
                  ))}

                  {/* 5 Interactive Flickering Candles (Tappable + Mic Blowable) */}
                  {[152, 186, 220, 254, 288].map((cx, idx) => {
                    const isLit = candlesLit[idx];
                    const cy = idx === 2 ? 120 : idx === 1 || idx === 3 ? 124 : 128;
                    const windBend = Math.min(22, blowIntensity * 0.25);

  return (
                      <g
                        key={`candle-${idx}`}
                        transform={`translate(${cx}, ${cy})`}
                        onClick={() => handleToggleSingleCandle(idx)}
                        className={isLit ? "cursor-pointer" : ""}
                      >
                        <rect
                          x="-6"
                          y="-54"
                          width="12"
                          height="54"
                          rx="4"
                          fill="url(#candleBody)"
                          stroke="#F59E0B"
                          strokeWidth="0.8"
                        />
                        <path d="M-6,-42 L6,-34 M-6,-26 L6,-18 M-6,-10 L6,-2" stroke="#F43F5E" strokeWidth="2.2" />
                        <line x1="0" y1="-54" x2="0" y2="-61" stroke="#1E293B" strokeWidth="1.8" />

                        {isLit ? (
                          <g
                            transform={`translate(${windBend * 0.35}, -62) rotate(${windBend})`}
                            className="origin-bottom"
                          >
                            <circle cx="0" cy="-12" r="28" fill="url(#flameHalo)" />
                            <path
                              d="M0,-32 C10,-18 11,-4 0,0 C-11,-4 -10,-18 0,-32 Z"
                              fill="#F97316"
                            >
                              <animate
                                attributeName="d"
                                values="M0,-32 C10,-18 11,-4 0,0 C-11,-4 -10,-18 0,-32 Z;
                                        M2,-35 C12,-19 9,-4 0,0 C-9,-4 -12,-19 2,-35 Z;
                                        M-2,-30 C9,-17 11,-4 0,0 C-11,-4 -9,-17 -2,-30 Z;
                                        M0,-32 C10,-18 11,-4 0,0 C-11,-4 -10,-18 0,-32 Z"
                                dur={`${0.38 + idx * 0.07}s`}
                                repeatCount="indefinite"
                              />
                            </path>
                            <path
                              d="M0,-23 C6,-13 6,-3 0,0 C-6,-3 -6,-13 0,-23 Z"
                              fill="#FEF08A"
                            />
                            <ellipse cx="0" cy="-3" rx="3.2" ry="3.8" fill="#BAE6FD" />
                          </g>
                        ) : (
                          <g transform="translate(0, -62)">
                            <path
                              d="M0,0 Q-8,-15 4,-30 T-4,-60"
                              fill="none"
                              stroke="#CBD5E1"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              opacity="0.65"
                            >
                              <animate
                                attributeName="d"
                                values="M0,0 Q-6,-15 4,-30 T-4,-58;M0,0 Q8,-18 -4,-34 T6,-64;M0,0 Q-6,-15 4,-30 T-4,-58"
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                            </path>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Inner Cut-out Cavity in Main Cake when slice is separated */}
                  {sliceSeparated && (
                    <g>
                      {/* Darkened cut cavity showing cake layers inside the upper tier */}
                      <path d="M220,132 L220,222 L278,236 L278,146 Z" fill="#881337" opacity="0.9" />
                      <path d="M220,158 L278,172 L278,178 L220,164 Z" fill="#FFFBEB" opacity="0.7" />
                      <path d="M220,190 L278,204 L278,210 L220,196 Z" fill="#FFFBEB" opacity="0.7" />
                      <path d="M220,132 L220,222 L278,236 L278,146 Z" fill="black" opacity="0.3" />
                    </g>
                  )}

                  {/* Animated Cut Cake Slice sliding out on Golden Dessert Plate */}
                  {sliceSeparated && (
                    <motion.g
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{ x: 65, y: 36, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 60, damping: 13 }}
                    >
                      {/* Porcelain Dessert Plate with Gold Trim */}
                      <ellipse cx="270" cy="245" rx="56" ry="17" fill="url(#plateGrad)" stroke="url(#goldTrim)" strokeWidth="2.8" />
                      
                      {/* Cake Slice Interior Cut Face (Strawberry Velvet + Cream) */}
                      <path d="M220,132 L220,222 L278,236 L278,146 Z" fill="#E11D48" />
                      <path d="M220,158 L278,172 L278,179 L220,165 Z" fill="#FFFBEB" />
                      <path d="M220,190 L278,204 L278,211 L220,197 Z" fill="#FFFBEB" />
                      {/* Top Glaze on Slice */}
                      <path d="M220,132 L278,146 L312,140 L256,127 Z" fill="url(#chocoGlaze)" />
                      {/* Outer Curved Icing Wall */}
                      <path d="M278,146 A48,15 0 0,0 312,140 L312,228 A48,15 0 0,1 278,236 Z" fill="url(#midTier)" />
                      <path d="M278,146 A48,15 0 0,0 312,140 L312,152 A48,15 0 0,1 278,158 Z" fill="url(#chocoGlaze)" />

                      {/* Fresh Strawberry Garnish on Cut Slice */}
                      <g transform="translate(266, 128)">
                        <ellipse cx="0" cy="5" rx="9" ry="5" fill="#FFFBEB" />
                        <path d="M-6,3 C-8,-5 0,-10 0,-10 C0,-10 8,-5 6,3 C4,7 -4,7 -6,3 Z" fill="#E11D48" />
                        <path d="M-3,-8 L0,-5 L3,-8 L0,-11 Z" fill="#10B981" />
                      </g>

                      {/* Golden Celebration Sparkles on the Slice */}
                      <circle cx="230" cy="142" r="3" fill="#FDE047" className="animate-pulse" />
                      <circle cx="295" cy="235" r="2.5" fill="#FDE047" />
                    </motion.g>
                  )}

                  {/* SVG-Integrated Ceremonial Golden Knife (Moves smoothly across the cut line) */}
                  {knifeProgress > 0 && (
                    <motion.g
                      initial={{ opacity: 0, x: 260, y: 35, rotate: -35 }}
                      animate={
                        knifeProgress === 1
                          ? { opacity: 1, x: 220, y: 100, rotate: -15 }
                          : knifeProgress === 2
                          ? {
                              opacity: [1, 1, 0.4, 0],
                              x: [220, 240, 270, 310],
                              y: [100, 150, 195, 230],
                              rotate: [-15, -8, 5, 20]
                            }
                          : { opacity: 0, x: 260, y: 35, rotate: -35 }
                      }
                      transition={{
                        duration: knifeProgress === 1 ? 0.75 : 1.4,
                        ease: "easeInOut"
                      }}
                      className="pointer-events-none origin-center"
                    >
                      <g transform="translate(-115, -30)">
                        <path
                          d="M10,50 Q75,54 150,26 L146,8 Q65,22 10,50 Z"
                          fill="url(#goldTrim)"
                          stroke="#FEF08A"
                          strokeWidth="1.8"
                          filter="drop-shadow(0 6px 10px rgba(0,0,0,0.65))"
                        />
                        <path
                          d="M16,45 Q75,49 142,24"
                          stroke="#FFFFFF"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          opacity="0.95"
                        />
                        <rect x="144" y="6" width="10" height="25" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                        <circle cx="149" cy="18" r="3" fill="#E11D48" />
                        <rect x="152" y="3" width="60" height="19" rx="8" fill="url(#bladeHandleGrad)" stroke="#F59E0B" strokeWidth="1.5" />
                        <circle cx="202" cy="12" r="4" fill="#F59E0B" />
                      </g>
                    </motion.g>
                  )}
                </svg>
              </div>
            </div>

            {/* ===============================================================
                BOTTOM STAGE CONTROLS (COMPACT FIT)
               =============================================================== */}
            <div className="shrink-0 w-full max-w-md mx-auto">
              {stage === "birthday_cake" && (
                <div className="w-full space-y-2.5 rounded-2xl p-3.5 bg-[#0E071B]/90 border border-amber-400/30 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1.5 text-amber-200">
                      {magicWordDetected ? (
                        <span className="text-emerald-300 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-300 animate-spin" />
                          <span>&ldquo;Hasini&rdquo; heard! Blowing birthday candles...</span>
                        </span>
                      ) : micActive ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span>Say &ldquo;Hasini&rdquo; into mic (or tap candles!)</span>
                        </>
                      ) : (
                        <>
                          <MicOff size={13} className="text-slate-400" />
                          <span>
                            {micPermissionDenied
                              ? "Tap candles or button below to blow!"
                              : 'Say "Hasini" or tap button below'}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="text-amber-300 font-mono font-black">
                      {candlesLit.filter((c) => !c).length}/5 Wishes
                    </span>
                  </div>

                  {/* 12-Bar Acoustic Spectrum */}
                  <div className="flex items-end justify-center gap-1.5 h-6 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10">
                    {freqBars.map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-rose-400 transition-all duration-75"
                        style={{ height: `${Math.max(18, val)}%` }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={triggerMagicWordHasini}
                    className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-rose-500 hover:from-amber-200 hover:to-rose-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wind size={16} />
                    <span>🎙️ Say &ldquo;Hasini&rdquo; or Tap to Blow Candles &amp; Cut Cake 🎂</span>
                  </button>
                </div>
              )}

              {stage === "cake_cutting" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="w-full rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-300 via-rose-400 to-amber-500 shadow-[0_15px_45px_rgba(245,158,11,0.35)]"
                >
                  <div className="rounded-[14.5px] bg-[#0D061A]/95 backdrop-blur-2xl p-3.5 sm:p-4 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-[10px] font-extrabold uppercase tracking-widest">
                      <Heart size={10} className="text-rose-400 fill-rose-400" />
                      <span>Special Birthday Note for Hasini</span>
                    </div>

                    <h3
                      className="text-sm sm:text-base font-black text-amber-200"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      &ldquo;May every chapter of your life shine brighter than the last!&rdquo;
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-200 leading-snug">
                      Happy Birthday, <strong className="text-amber-300">Hasini</strong>! Now step onto the royal podium as our{" "}
                      <strong className="text-white">Chief Guest of Honor</strong> to launch{" "}
                      <strong className="text-amber-300">2 new textbooks</strong> into the Lurnexa Bookstore!
                    </p>

                    <button
                      onClick={() => setStage("ready_launch")}
                      className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_35px_rgba(251,191,36,0.6)] hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BookOpen size={17} />
                      <span>Enter Grand Book Launch Podium 🚀📚</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* =====================================================================
            ACT III: READY TO LAUNCH BOOKS (FITS 100% SCREEN RATIO)
           ===================================================================== */}
        {stage === "ready_launch" && (
          <motion.section
            key="ready-launch"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 flex-1 min-h-0 w-full flex flex-col items-center justify-between px-3 sm:px-6 py-3 sm:py-6 text-center overflow-y-auto md:overflow-hidden"
          >
            <div className="shrink-0 space-y-1.5 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/35 text-amber-300 text-[10px] font-extrabold uppercase tracking-[0.22em]">
                <Award size={13} />
                <span>Chief Guest of Honor: Hasini • 30 October</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-yellow-300 to-rose-200 bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Official Dual Textbook Launch Podium
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mx-auto">
                Two peer-reviewed Lurnexa Publications textbooks rest under royal crimson silk below. Click the{" "}
                <span className="text-amber-300 font-bold">Ceremonial Launch Switch</span> to start the 3, 2, 1 countdown!
              </p>
            </div>

            {/* Two Veiled Books on Illuminated Marble & Gold Pedestals */}
            <div className="flex-1 min-h-0 flex items-center justify-center gap-3 sm:gap-10 w-full max-w-2xl my-2">
              {books.slice(0, 2).map((b, i) => (
                <motion.div
                  key={b.id}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4 }}
                  className="relative flex flex-col items-center h-full max-h-[52vh] justify-center"
                >
                  <div className="pointer-events-none absolute -top-8 w-40 h-56 bg-gradient-to-b from-amber-300/30 via-amber-400/5 to-transparent blur-xl" />

                  {/* Crimson & Gold Velvet Veil Over the Book */}
                  <div className="relative h-[28vh] sm:h-[36vh] max-h-60 aspect-[3/4] rounded-2xl bg-gradient-to-br from-rose-800 via-red-900 to-rose-950 border-2 border-amber-400/70 shadow-[0_20px_50px_-12px_rgba(225,29,72,0.55)] flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.28),transparent_60%)]" />
                    <div className="relative z-10 w-12 h-12 rounded-full bg-amber-400/20 border border-amber-300/60 flex items-center justify-center mb-2 shadow-inner">
                      <Crown size={22} className="text-amber-300 animate-pulse" />
                    </div>
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                      Edition #{i + 1}
                    </span>
                    <span className="relative z-10 text-[11px] font-bold text-rose-100/95 mt-1 line-clamp-2 px-1">
                      {b.domain}
                    </span>
                    <span className="relative z-10 text-[9px] font-semibold text-amber-200/80 mt-1.5 bg-black/30 px-2 py-0.5 rounded-full border border-amber-300/30">
                      {(b.tableOfContents || []).length} Chapters • Ready
                    </span>
                    {/* Ceremonial Gold Ribbons */}
                    <div className="absolute inset-x-0 top-1/2 h-2.5 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600 opacity-85 shadow" />
                    <div className="absolute inset-y-0 left-1/2 w-2.5 bg-gradient-to-b from-amber-600 via-yellow-300 to-amber-600 opacity-85 shadow" />
                  </div>

                  {/* Royal Pedestal Base */}
                  <div className="w-36 xs:w-44 sm:w-56 h-3 sm:h-3.5 rounded-t-xl bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700 mt-2 shadow-lg shrink-0" />
                  <div className="w-40 xs:w-48 sm:w-60 h-6 sm:h-7 rounded-b-xl bg-gradient-to-b from-slate-800 to-slate-950 border border-amber-400/35 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-black uppercase tracking-[0.28em] text-amber-300/80">
                      Lurnexa Royal Podium {i + 1}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ceremonial Launch Switch */}
            <div className="shrink-0">
              <button
                onClick={handleStartBookLaunchCountdown}
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-9 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-rose-500 text-slate-950 font-black text-sm sm:text-lg shadow-[0_0_65px_rgba(251,191,36,0.65)] hover:shadow-[0_0_90px_rgba(251,191,36,0.95)] hover:scale-[1.04] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles size={20} className="text-slate-950 animate-spin" />
                <span>🚀 Launch Both Books Now (3, 2, 1...)</span>
              </button>
            </div>
          </motion.section>
        )}

        {/* =====================================================================
            ACT III-B: DRAMATIC 3, 2, 1... COUNTDOWN (FITS 100% SCREEN RATIO)
           ===================================================================== */}
        {stage === "countdown" && (
          <motion.section
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-20 flex-1 h-full w-full flex flex-col items-center justify-center px-4 text-center overflow-hidden"
          >
            <p className="text-xs sm:text-sm font-black uppercase tracking-[0.38em] text-amber-300 mb-6">
              Official Book Launch by Hasini In...
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={countdownNumber}
                initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.45, ease: "backOut" }}
                className="relative flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72 rounded-full border-4 border-amber-400/70 bg-gradient-to-br from-amber-500/25 via-rose-500/20 to-fuchsia-600/25 shadow-[0_0_130px_rgba(251,191,36,0.65)]"
              >
                <span className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-40" />
                <span
                  className="text-7xl sm:text-9xl font-black bg-gradient-to-b from-white via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(251,191,36,0.8)]"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {countdownNumber > 0 ? countdownNumber : "🚀"}
                </span>
              </motion.div>
            </AnimatePresence>

            <p className="text-xs sm:text-sm text-slate-300 mt-6 font-semibold">
              Cutting the royal ribbon &amp; publishing both textbooks live to the Lurnexa Bookstore...
            </p>
          </motion.section>
        )}

        {/* =====================================================================
            ACT IV: GRAND REVEAL OF BOTH LAUNCHED BOOKS (ZERO-SCROLL WIDESCREEN)
           ===================================================================== */}
        {stage === "launched" && (
          <motion.section
            key="launched"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 flex-1 min-h-0 w-full max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col justify-between px-3 sm:px-6 py-2 sm:py-4 overflow-y-auto md:overflow-hidden"
          >
            {/* Top Header Banner */}
            <div className="shrink-0 text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/45 text-emerald-200 text-[11px] font-extrabold shadow">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>
                  Officially Launched by Hasini on 30 October • Both Books Are Now Live in the Lurnexa Bookstore!
                </span>
              </div>

              <h2
                className="text-xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-yellow-300 to-rose-200 bg-clip-text text-transparent leading-tight"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                🎉 Congratulations Hasini! Both Textbooks Are Live! 🎉
              </h2>
            </div>

            {/* Middle 2-Column Horizontal Book Cards (Fits Screen Height without Page Scroll) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-2 overflow-y-auto md:overflow-hidden">
              {books.slice(0, 2).map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 24, rotateY: -12 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: 0.15 + idx * 0.15, duration: 0.6, type: "spring" }}
                  className="group relative h-full min-h-0 rounded-2xl p-[1.5px] bg-gradient-to-b from-amber-300/60 via-white/15 to-rose-500/50 shadow-[0_15px_45px_-12px_rgba(245,158,11,0.3)] overflow-hidden"
                >
                  <div className="relative h-full w-full rounded-[14.5px] bg-gradient-to-br from-[#140A26]/95 via-[#0B0616]/95 to-[#1A0B1F]/95 backdrop-blur-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 overflow-hidden">
                    {/* Ambient glow behind the cover */}
                    <div className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
                    <div className="pointer-events-none absolute -right-24 -top-24 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl" />

                    {/* Left Column: Realistic 3D Book Cover + Price */}
                    <div className="relative z-10 w-full sm:w-[42%] lg:w-[44%] min-w-0 shrink-0 flex flex-col items-center justify-center gap-2.5 sm:gap-3 sm:pr-2">
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPreviewBook(book)}
                        whileHover={{ rotateY: -14, rotateX: 4, scale: 1.03, y: -4 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        style={{ transformPerspective: 1100, transformStyle: "preserve-3d" }}
                        className="group/cover relative block max-w-full cursor-pointer"
                        title="Preview sample PDF"
                      >
                        {/* Page edges (stacked paper on the right side) */}
                        <div className="absolute top-[3px] bottom-[3px] -right-[7px] w-[8px] rounded-r-[3px] bg-[repeating-linear-gradient(90deg,#f5f0e6_0px,#f5f0e6_1px,#d8cfbf_1px,#d8cfbf_2px)] shadow-[2px_0_6px_rgba(0,0,0,0.5)]" />
                        {/* Book body */}
                        <div className="relative max-w-full rounded-r-[6px] rounded-l-[2px] overflow-hidden ring-1 ring-white/20 shadow-[18px_22px_40px_-8px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(251,191,36,0.35)]">
                          <img
                            src={book.coverImg}
                            alt={book.title}
                            draggable={false}
                            className="block w-auto h-auto max-w-full max-h-[190px] sm:max-h-[26vh] md:max-h-[min(calc(100dvh-330px),440px)] 2xl:max-h-[520px] object-contain select-none bg-slate-900"
                          />
                          {/* Spine shading */}
                          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
                          <div className="pointer-events-none absolute inset-y-0 left-[13px] w-px bg-white/25" />
                          {/* Glossy sheen */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-60 group-hover/cover:opacity-100 transition-opacity" />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 flex items-end justify-center pb-3 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black shadow-lg">
                              <Eye size={11} />
                              Preview PDF
                            </span>
                          </div>
                        </div>
                        {/* Floor shadow */}
                        <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 w-[85%] h-3 rounded-[50%] bg-black/70 blur-md" />
                      </motion.button>

                      {/* Price pill */}
                      <div className="mt-1 flex items-baseline gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 via-amber-300/10 to-rose-400/15 border border-amber-300/35 shadow-inner">
                        <span className="text-lg sm:text-xl font-black bg-gradient-to-b from-amber-100 to-amber-400 bg-clip-text text-transparent leading-none">
                          ₹{book.price}
                        </span>
                        <span className="text-[10px] text-slate-300 leading-none whitespace-nowrap">
                          eBook ₹{book.digitalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Metadata + Chapters/Modules + Buttons */}
                    <div className="relative z-10 flex-1 min-w-0 flex flex-col text-left overflow-hidden">
                      <div className="shrink-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                            <Crown size={10} />
                            Book #{idx + 1}
                          </span>
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/35 px-2.5 py-0.5 rounded-full">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            </span>
                            Live in Store
                          </span>
                        </div>

                        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-300/90 truncate pt-0.5">
                          {book.domain}
                        </div>
                        <h3
                          className="text-sm sm:text-base lg:text-lg font-black text-white leading-tight line-clamp-3"
                          title={book.title}
                        >
                          {book.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-amber-100/80 truncate">
                          By {book.authors}
                        </p>
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 font-mono">
                            ISBN {book.isbn}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                            {book.pages} pages
                          </span>
                          {book.publishedDate && (
                            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                              {book.publishedDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chapters / Modules List */}
                      <div className="flex-1 min-h-0 mt-3 mb-3 flex flex-col overflow-hidden">
                        <div className="shrink-0 flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                            <FileText size={11} />
                            Chapters
                          </span>
                          <span className="h-px flex-1 bg-gradient-to-r from-amber-300/40 to-transparent" />
                          <span className="text-[10px] font-bold text-slate-400">
                            {(book.tableOfContents || []).length}
                          </span>
                        </div>
                        <ol className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pr-1 [scrollbar-width:thin]">
                          {(book.tableOfContents || []).map((ch, cIdx) => (
                            <li
                              key={cIdx}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.035] hover:bg-amber-300/10 border border-white/[0.06] hover:border-amber-300/30 transition-colors"
                              title={ch}
                            >
                              <span className="shrink-0 w-5 h-5 rounded-md bg-gradient-to-br from-amber-300/30 to-rose-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-black flex items-center justify-center">
                                {cIdx + 1}
                              </span>
                              <span className="text-[11px] text-slate-200 leading-snug line-clamp-2">
                                {ch.replace(/^Chapter\s*\d+\s*[:.-]\s*/i, "")}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewBook(book)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-amber-300/30 text-amber-100 font-bold text-xs transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <Link
                          href="/textbooks/store"
                          className="flex-[1.4] inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-rose-500 text-slate-950 font-black text-xs shadow-[0_6px_20px_-6px_rgba(251,191,36,0.7)] hover:shadow-[0_8px_26px_-6px_rgba(251,191,36,0.95)] hover:scale-[1.02] transition-all"
                        >
                          <ShoppingBag size={13} />
                          <span>Buy Now</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Commemorative Record & Action Bar */}
            <div className="shrink-0 rounded-2xl p-[1px] bg-gradient-to-r from-amber-300/60 via-yellow-400/50 to-amber-600/60 mt-2">
              <div className="rounded-[15px] bg-[#0E071C]/95 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-8 w-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                    <Award size={16} className="text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      Official Commemorative Launch Record • 30 October
                    </div>
                    <p className="text-[11px] text-slate-200 line-clamp-1">
                      Inaugurated by Guest of Honor <strong className="text-white">Hasini</strong> for Lurnexa Publications
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <Link
                    href="/textbooks/store"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                  >
                    <ShoppingBag size={14} />
                    <span>Open Lurnexa Bookstore</span>
                    <ExternalLink size={12} />
                  </Link>

                  <button
                    onClick={() => {
                      setCandlesLit([true, true, true, true, true]);
                      setBlowProgress(0);
                      setKnifeProgress(0);
                      setSliceSeparated(false);
                      setActiveBlessingToast("");
                      setStage("birthday_cake");
                      startVoiceDetectionForHasini();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw size={13} />
                    <span>Replay 🎂</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* =====================================================================
          ORGANIZER / BROTHER SETUP & RESET MODAL
         ===================================================================== */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-400/40 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <Settings size={18} className="text-amber-400" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Organizer Control Panel (Hasini&apos;s Oct 30 Dual Book Launch)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Customize the 2 books, their Chapters/Modules, and Sample Preview PDFs, or reset the launch state before sharing with Hasini.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {setupToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={15} />
                    <span>{setupToast}</span>
                  </div>
                )}

                {/* Current Launch Status & Reset Box */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span>Bookstore Status:</span>
                      {isAlreadyLaunchedInStore ? (
                        <span className="text-emerald-400 font-black">
                          ✅ LAUNCHED &amp; LIVE IN BOOKSTORE ({launchedAt ? new Date(launchedAt).toLocaleString() : ""})
                        </span>
                      ) : (
                        <span className="text-amber-300 font-black">
                          ⏳ WAITING FOR HASINI TO LAUNCH (Hidden from Bookstore until countdown finishes)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Shareable Link for Hasini:{" "}
                      <code className="text-amber-300 bg-black/40 px-2 py-0.5 rounded">
                        /launch/hasini-oct30
                      </code>
                    </p>
                  </div>

                  <button
                    onClick={handleResetLaunchState}
                    disabled={savingSetup}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Launch for Oct 30</span>
                  </button>
                </div>

                {/* Voice & Pronunciation Preview Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-amber-950/30 border border-pink-500/30 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shrink-0">
                      <Volume2 size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-pink-100">
                          Ceremony Voice: {activeVoiceName || "Sweet Human Female Voice"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                          Human Sweet Voice Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Accurately pronounces <strong className="text-amber-300">Hasini</strong> (Haa-see-nee) with warm human intonation — never "Hasan".
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakSweetCelebration(
                        "Happy Birthday Hasini! Wishing you endless happiness, grand success, and a magical year ahead!"
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/40 hover:to-purple-600/40 border border-pink-400/40 text-pink-200 text-xs font-bold shrink-0 cursor-pointer transition-all shadow-sm active:scale-95"
                  >
                    <Volume2 size={14} />
                    <span>Test Voice Pronunciation 🔊</span>
                  </button>
                </div>

                {/* Forms for Book 1 & Book 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editableBooks.slice(0, 2).map((b, idx) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
                    >
                      <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                        Book #{idx + 1} Details
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold block">Book Title</label>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const next = [...editableBooks];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setEditableBooks(next);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold block">Authors</label>
                        <input
                          type="text"
                          value={b.authors}
                          onChange={(e) => {
                            const next = [...editableBooks];
                            next[idx] = { ...next[idx], authors: e.target.value };
                            setEditableBooks(next);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Domain / Subject</label>
                          <input
                            type="text"
                            value={b.domain}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], domain: e.target.value };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                            placeholder="Computer Science & Engineering"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Total Pages</label>
                          <input
                            type="number"
                            value={b.pages}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], pages: Number(e.target.value) };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Paperback Price (₹)</label>
                          <input
                            type="number"
                            value={b.price}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], price: Number(e.target.value) };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Digital Price (₹)</label>
                          <input
                            type="number"
                            value={b.digitalPrice}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], digitalPrice: Number(e.target.value) };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Paperback ISBN</label>
                          <input
                            type="text"
                            value={b.isbn}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], isbn: e.target.value };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Digital ISBN</label>
                          <input
                            type="text"
                            value={b.isbnDigital}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], isbnDigital: e.target.value };
                              setEditableBooks(next);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold block">
                          Cover Image Path or Upload Cover
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={b.coverImg}
                            onChange={(e) => {
                              const next = [...editableBooks];
                              next[idx] = { ...next[idx], coverImg: e.target.value };
                              setEditableBooks(next);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                            placeholder="/portal_coverpages/..."
                          />
                          <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold cursor-pointer shrink-0">
                            <Upload size={13} />
                            <span>Upload Cover</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCoverImageUpload(idx, e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                        {b.coverImg && (
                          <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/10">
                            <div className="w-10 h-14 rounded overflow-hidden border border-white/20 bg-slate-950 shrink-0 flex items-center justify-center">
                              <img
                                src={b.coverImg}
                                alt="Cover preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1 text-[11px] text-slate-300">
                              <span className="font-semibold text-amber-300 block">Cover Preview:</span>
                              <span className="truncate block font-mono text-[10px] text-slate-400">{b.coverImg}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Full Textbook PDF (Softcopy / eBook Reading Mode) Upload */}
                      <div className="space-y-2 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black/40 border border-amber-500/30 shadow-inner">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] text-amber-200 font-bold flex items-center gap-1.5">
                            <BookOpen size={14} className="text-amber-400" />
                            <span>Full Book PDF (Softcopy / Reading Mode)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSelectedReadingBook(b)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            <BookOpen size={11} />
                            <span>Test Reading Mode 📖</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          When users buy or rent the softcopy in the bookstore, this uploaded PDF will be loaded for them in Reading Mode.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            uploadingFullPdfIdx === idx
                              ? "bg-amber-600/40 border-amber-400/50 text-amber-200 cursor-wait"
                              : "bg-gradient-to-r from-amber-500/30 to-yellow-600/30 hover:from-amber-500/40 hover:to-yellow-600/40 border-amber-400/40 text-amber-200 cursor-pointer shadow-sm"
                          }`}>
                            <Upload size={13} className={uploadingFullPdfIdx === idx ? "animate-bounce" : ""} />
                            <span>{uploadingFullPdfIdx === idx ? "Uploading Softcopy PDF..." : "Upload Full Book PDF"}</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              disabled={uploadingFullPdfIdx === idx}
                              className="hidden"
                              onChange={(e) => handleFullBookPdfUpload(idx, e.target.files?.[0] || null)}
                            />
                          </label>
                          {b.pdfFileName && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[10px] text-emerald-300">
                              <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                              <span className="font-mono truncate max-w-[170px]" title={b.pdfFileName}>{b.pdfFileName}</span>
                              {b.fullBookPdfSize ? (
                                <span className="text-slate-400">({(b.fullBookPdfSize / (1024 * 1024)).toFixed(1)} MB)</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preview PDF Upload or Auto-Generated PDF */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-black/35 border border-white/10">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                            <FileText size={13} />
                            <span>Sample Preview PDF</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSelectedPreviewBook(b)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 hover:underline cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>View Preview PDF</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold cursor-pointer">
                            <Upload size={13} />
                            <span>Upload Custom PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => handlePreviewPdfUpload(idx, e.target.files?.[0] || null)}
                            />
                          </label>
                          {b.customPreviewPdfDataUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...editableBooks];
                                next[idx] = { ...next[idx], customPreviewPdfDataUrl: undefined };
                                setEditableBooks(next);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-[10px] font-bold cursor-pointer"
                            >
                              Use Auto-Generated PDF Instead
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Auto-generates sample PDF from Title, Description &amp; Chapters/Modules
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold block">Description</label>
                        <textarea
                          rows={3}
                          value={b.description}
                          onChange={(e) => {
                            const next = [...editableBooks];
                            next[idx] = { ...next[idx], description: e.target.value };
                            setEditableBooks(next);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                        />
                      </div>

                      {/* Book Chapters / Modules Names (tableOfContents) Editor */}
                      <div className="space-y-2 p-3 rounded-xl bg-black/35 border border-white/10">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-amber-300 font-bold">
                            Book Chapters / Modules ({(b.tableOfContents || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...editableBooks];
                              const currentChapters = Array.isArray(next[idx].tableOfContents)
                                ? [...(next[idx].tableOfContents as string[])]
                                : [];
                              currentChapters.push(`Chapter ${currentChapters.length + 1}: New Module Title`);
                              next[idx] = { ...next[idx], tableOfContents: currentChapters };
                              setEditableBooks(next);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>Add Chapter / Module</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {(b.tableOfContents || []).map((chapterName, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={chapterName}
                                onChange={(e) => {
                                  const next = [...editableBooks];
                                  const updatedChapters = [...(next[idx].tableOfContents || [])];
                                  updatedChapters[cIdx] = e.target.value;
                                  next[idx] = { ...next[idx], tableOfContents: updatedChapters };
                                  setEditableBooks(next);
                                }}
                                placeholder={`Chapter / Module ${cIdx + 1}`}
                                className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...editableBooks];
                                  const updatedChapters = (next[idx].tableOfContents || []).filter(
                                    (_, i) => i !== cIdx
                                  );
                                  next[idx] = { ...next[idx], tableOfContents: updatedChapters };
                                  setEditableBooks(next);
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 cursor-pointer shrink-0"
                                title="Remove Chapter / Module"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveBooksConfig}
                  disabled={savingSetup}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow cursor-pointer"
                >
                  <Save size={14} />
                  <span>{savingSetup ? "Saving..." : "Save Both Books & Update PDF/Chapters"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          SAMPLE PREVIEW PDF & CHAPTERS MODAL
         ===================================================================== */}
      <AnimatePresence>
        {selectedPreviewBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-400/40 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">
                    {selectedPreviewBook.title}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Sample Preview PDF &amp; Complete Chapters / Modules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPreviewBook(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row min-h-[480px] max-h-[78vh] overflow-hidden">
                <div className="w-full md:w-80 p-5 border-r border-white/10 bg-slate-950/40 overflow-y-auto space-y-4 shrink-0">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                      {selectedPreviewBook.domain}
                    </span>
                    <h4 className="text-sm font-black text-white mt-1 leading-snug">
                      {selectedPreviewBook.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">By {selectedPreviewBook.authors}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedPreviewBook.description}
                  </p>

                  {selectedPreviewBook.tableOfContents && selectedPreviewBook.tableOfContents.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                        Chapters / Modules ({selectedPreviewBook.tableOfContents.length})
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {selectedPreviewBook.tableOfContents.map((ch, i) => (
                          <li key={i} className="flex items-start gap-2 bg-white/[0.04] p-2 rounded-lg border border-white/10">
                            <CheckCircle2 size={13} className="text-amber-400 mt-0.5 shrink-0" />
                            <span>{ch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 bg-slate-950 flex flex-col">
                  <iframe
                    src={
                      selectedPreviewBook.customPreviewPdfDataUrl
                        ? selectedPreviewBook.customPreviewPdfDataUrl
                        : `/api/birthday-launch/preview-pdf?bookId=${encodeURIComponent(selectedPreviewBook.id)}&t=${Date.now()}#toolbar=0&navpanes=0`
                    }
                    className="w-full h-full min-h-[420px] rounded-xl border border-white/10 bg-white"
                    title="Book Sample Preview PDF"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Book Reading Mode Modal (for Softcopy / eBook testing & reading) */}
      <AnimatePresence>
        {selectedReadingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#181126] to-[#0d0a14] border border-amber-500/30 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-3.5 bg-black/50 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      Reading Mode: {selectedReadingBook.title}
                    </h3>
                    <p className="text-[11px] text-amber-300/80 truncate">
                      Softcopy eBook • {selectedReadingBook.authors} • {selectedReadingBook.pages || 250}+ Pages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/textbooks/portal?search=${encodeURIComponent(selectedReadingBook.title)}`}
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold transition-colors"
                  >
                    <span>View in Bookstore Portal</span>
                    <ExternalLink size={12} />
                  </Link>
                  <button
                    onClick={() => setSelectedReadingBook(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close reading mode"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Reader iframe */}
              <div className="flex-1 p-2 sm:p-4 bg-slate-950 flex flex-col min-h-0">
                <iframe
                  src={`/api/birthday-launch/read-book-pdf?bookId=${encodeURIComponent(selectedReadingBook.id)}&t=${Date.now()}#toolbar=1&navpanes=1`}
                  className="w-full h-full rounded-xl border border-white/10 bg-white"
                  title="Full Book Reading Mode"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
