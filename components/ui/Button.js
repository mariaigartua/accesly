import Link from "next/link";

/**
 * One button style for the whole app.
 * - Pass `href` to render a link that looks like a button (navigation).
 * - Otherwise renders a <button> (actions). Defaults to type="button".
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * icon: a lucide-react component; always shown next to the visible label.
 */
export default function Button({
  href,
  variant = "primary",
  pill = false,
  block = false,
  icon: Icon,
  iconAfter: IconAfter,
  className = "",
  children,
  type = "button",
  ...props
}) {
  const classes = [
    "btn",
    variant !== "primary" && `btn-${variant}`,
    pill && "btn-pill",
    block && "btn-block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
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
