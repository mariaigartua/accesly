import { Search } from "lucide-react";
import Button from "./ui/Button";

/**
 * Plain GET search form (works without JavaScript; results are server-rendered).
 * `keep` = other query params to carry along so searching one list doesn't clear the other.
 */
export default function SearchForm({ id, name, label, value, placeholder, anchor, keep = {} }) {
  return (
    <form role="search" action={`/explore#${anchor}`} method="get" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <div className="input-row">
        <input id={id} name={name} type="search" defaultValue={value} placeholder={placeholder} autoComplete="off" />
        {Object.entries(keep)
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        <Button type="submit" icon={Search}>
          Search
        </Button>
      </div>
    </form>
  );
}
