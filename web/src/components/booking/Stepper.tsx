"use client";

interface StepperProps {
  steps: string[];
  current: number; // index langkah aktif (0-based)
}

/** Indikator progres checkout: Pilih → Review → Pay. */
export default function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-ink-900 text-white"
                      : "bg-ink-900/10 text-ink-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  active ? "text-ink-900" : done ? "text-ink-600" : "text-ink-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`h-0.5 flex-1 rounded transition-colors duration-200 ${
                  done ? "bg-green-500" : "bg-ink-900/10"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
