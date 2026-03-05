export default function SectionHeading({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "is-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <p className="section-text">{text}</p>
    </div>
  );
}
