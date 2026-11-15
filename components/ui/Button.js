import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * One button style for the whole app (all pills).
 * - Pass `href` to render a link that looks like a button (navigation).
 * - Otherwise renders a <button> (actions). Defaults to type="button".
 * variant: "primary" (filled blue) | "secondary" (outlined) | "ghost" | "danger" | "cyan"
 *        | "cta" (main action: cyan, uppercase, trailing arrow circle)
 * icon: a lucide-react component; always shown next to the visible label.
 */
export default function Button({
  href,
  variant = "primary",
  block = false,
  icon: Icon,
  iconAfter: IconAfter,
  className = "",
  children,
  type = "button",
  pill, // eslint-disable-line no-unused-vars -- kept for old call sites; every button is a pill now
  ...props
}) {
  const classes = ["btn", variant !== "primary" && `btn-${variant}`, block && "btn-block", className]
    .filter(Boolean)
    .join(" ");

  const content =
    variant === "cta" ? (
      <>
        <span>{children}</span>
        <span className="cta-arrow" aria-hidden="true">
          {Icon ? <Icon focusable="false" /> : <ArrowRight focusable="false" />}
        </span>
      </>
    ) : (
      <>
        {Icon && <Icon aria-hidden="true" focusable="false" />}
        {children}
        {IconAfter && <IconAfter aria-hidden="true" focusable="false" />}
      </>
    );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
