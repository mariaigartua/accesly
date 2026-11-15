import { Search } from "lucide-react";

/**
 * Pill search field (plain GET form; works without JavaScript; results are server-rendered).
 * `keep` = other query params to carry along so searching one list doesn't clear the other.
 */
export default function SearchForm({ id, name, label, value, placeholder, anchor, keep = {} }) {
  return (
    <form role="search" action={`/explore#${anchor}`} method="get" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <div className="pill-field">
        <Search aria-hidden="true" focusable="false" />
        <input id={id} name={name} type="search" defaultValue={value} placeholder={placeholder} autoComplete="off" />
        {Object.entries(keep)
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        <button type="submit" className="icon-btn" aria-label="Search">
          <Search aria-hidden="true" focusable="false" />
        </button>
      </div>
    </form>
  );
}
