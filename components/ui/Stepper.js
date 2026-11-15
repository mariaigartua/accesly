import { Check } from "lucide-react";

/**
 * Progress indicator for multi-step flows: "Step 2 of 3: Location", numbered circles
 * (done = ✓ on teal, current = cyan), and a progress bar. current is 1-based.
 */
export default function Stepper({ steps, current }) {
  return (
    <nav className="stepper" aria-label="Progress">
      <p className="stepper-label">
        Step {current} of {steps.length}: {steps[current - 1]}
      </p>
      <ol>
        {steps.map((s, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "todo";
          return (
            <li key={s} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="step-num" aria-hidden="true">
                {state === "done" ? <Check focusable="false" width={18} height={18} /> : n}
              </span>
              <span className="step-name">
                <span className="visually-hidden">
                  {state === "done" ? "Completed: " : state === "todo" ? "Not started: " : "Current: "}
                </span>
                {s}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${(current / steps.length) * 100}%` }} />
      </div>
    </nav>
  );
}
