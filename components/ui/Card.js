/**
 * Rounded surface. `as` picks the element (section, li, article…).
 * `tint` uses the soft brand background. Extra props (ref, aria-*, tabIndex) pass through.
 */
export default function Card({ as: Tag = "div", tint = false, className = "", children, ...props }) {
  const classes = ["card", tint && "card-tint", className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
