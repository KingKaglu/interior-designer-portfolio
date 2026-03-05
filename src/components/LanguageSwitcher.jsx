const LANG_OPTIONS = [
  { code: "en", label: "EN" },
  { code: "ka", label: "KA" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher({ currentLang, onChange, className = "", ariaLabel }) {
  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {LANG_OPTIONS.map((item) => (
        <button
          key={item.code}
          type="button"
          className={currentLang === item.code ? "lang-btn active" : "lang-btn"}
          onClick={() => onChange(item.code)}
          aria-pressed={currentLang === item.code}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
