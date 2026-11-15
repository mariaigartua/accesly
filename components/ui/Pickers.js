import { Check } from "lucide-react";

/**
 * Multi-select chips: each is a visually-hidden checkbox inside a <label>, so it works with
 * keyboard and screen readers as a normal checkbox. Selected = cyan + ✓ (not color alone).
 * options: [[value, label]], value: string[], onChange(nextValues)
 */
export function ChipPicker({ legend, hint, options, value, onChange, idPrefix, describedBy }) {
  const toggle = (v, on) => onChange(on ? [...value, v] : value.filter((x) => x !== v));
  const hintId = hint ? `${idPrefix}-hint` : undefined;
  const countId = `${idPrefix}-count`;
  return (
    <fieldset className="field" aria-describedby={[hintId, countId, describedBy].filter(Boolean).join(" ")}>
      <legend className="label">{legend}</legend>
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      <div className="pick-list">
        {options.map(([v, label]) => (
          <label key={v} className="pick">
            <input type="checkbox" checked={value.includes(v)} onChange={(e) => toggle(v, e.target.checked)} />
            <Check className="pick-check" aria-hidden="true" focusable="false" />
            {label}
          </label>
        ))}
      </div>
      <p id={countId} className="pick-count">
        {value.length} selected
      </p>
    </fieldset>
  );
}

/**
 * Single choice as equal pills (e.g. Yes / No / Not sure). Native radios, visually hidden.
 * options: [[value, label]]
 */
export function Segmented({ name, options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map(([v, label]) => (
        <label key={v} className="pick">
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <Check className="pick-check" aria-hidden="true" focusable="false" />
          {label}
        </label>
      ))}
    </div>
  );
}

/** Toggle switch row: <input type="checkbox" role="switch"> inside a full-row label. */
export function Switch({ id, title, description, checked, onChange }) {
  return (
    <label className="switch-row" htmlFor={id}>
      <span className="switch-text">
        <span className="switch-title">{title}</span>
        {description && <span className="switch-desc">{description}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
