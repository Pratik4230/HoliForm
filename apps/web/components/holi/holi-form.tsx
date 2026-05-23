"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

// ─── Questions ────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  text: string;
  subtitle: string;
  placeholder: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What's your name?",
    subtitle: "Let's start with what we call you.",
    placeholder: "Your name…",
  },
  {
    id: 2,
    text: "Where are you based?",
    subtitle: "The city or country you're in.",
    placeholder: "e.g. Mumbai, London…",
  },
  {
    id: 3,
    text: "What do you do?",
    subtitle: "Your role or what you're working on.",
    placeholder: "e.g. Designer, founder…",
  },
  {
    id: 4,
    text: "What brought you here?",
    subtitle: "How did you find us?",
    placeholder: "e.g. Twitter, a friend…",
  },
  {
    id: 5,
    text: "Anything else you'd like to share?",
    subtitle: "Optional — say whatever's on your mind.",
    placeholder: "Go ahead…",
  },
];

// ─── Slide variants ───────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    transition: { duration: 0.25, ease: EASE },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export function HoliForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = QUESTIONS[step]!;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [step]);

  const handleNext = useCallback(() => {
    if (!answers[step]?.trim()) return;
    if (step === QUESTIONS.length - 1) {
      setDone(true);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, answers]);

  const handleBack = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }, [step]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <AnimatePresence mode="wait" custom={direction}>
          {done ? (
            <Done key="done" />
          ) : (
            <Slide
              key={step}
              question={currentQ}
              value={answers[step] ?? ""}
              onValueChange={(v) =>
                setAnswers((prev) => {
                  const next = [...prev];
                  next[step] = v;
                  return next;
                })
              }
              onNext={handleNext}
              onBack={handleBack}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              step={step}
              total={QUESTIONS.length}
              direction={direction}
              inputRef={inputRef}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Slide ────────────────────────────────────────────────────────────────────

function Slide({
  question,
  value,
  onValueChange,
  onNext,
  onBack,
  onKeyDown,
  step,
  total,
  direction,
  inputRef,
}: {
  question: Question;
  value: string;
  onValueChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  step: number;
  total: number;
  direction: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col gap-6"
    >
      {/* Counter */}
      <span className="text-xs font-medium text-gray-400">
        {step + 1} / {total}
      </span>

      {/* Question */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">{question.text}</h2>
        <p className="text-sm text-gray-500">{question.subtitle}</p>
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={question.placeholder}
        className="h-12 text-base"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        <Button onClick={onNext} disabled={!value.trim()}>
          {step === total - 1 ? "Submit" : "Continue →"}
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 pt-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 20 : 6,
              backgroundColor: i === step ? "#111827" : "#d1d5db",
            }}
            transition={{ duration: 0.25 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Done ─────────────────────────────────────────────────────────────────────

function Done() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col items-center gap-4 py-6 text-center"
    >
      <span className="text-4xl">✓</span>
      <h2 className="text-xl font-semibold text-gray-900">All done!</h2>
      <p className="text-sm text-gray-500">Thanks for filling this out. We'll be in touch.</p>
    </motion.div>
  );
}
