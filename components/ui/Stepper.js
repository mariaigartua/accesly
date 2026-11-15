/**
 * Progress indicator for multi-step flows: "Step 2 of 3" plus a labelled bar per step.
 * steps: ["Event details", "Location", "Questionnaire"]; current: 1-based index.
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
              <span className="visually-hidden">
                {state === "done" ? "Completed: " : state === "todo" ? "Not started: " : "Current: "}
              </span>
              {s}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
