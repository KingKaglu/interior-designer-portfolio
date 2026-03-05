import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const LANG_OPTIONS = [
  { code: "en", label: "EN" },
  { code: "ka", label: "KA" },
  { code: "ru", label: "RU" },
];

const projectImages = [
  "/assets/project1.jpg",
  "/assets/project2.jpg",
  "/assets/project3.jpg",
  "/assets/project4.jpg",
  "/assets/project5.jpg",
  "/assets/project16.jpg",
];

const INITIAL_FORM = {
  name: "",
  email: "",
  type: "",
  message: "",
  website: "",
};

function SectionHeading({ eyebrow, title, text, align = "left" }) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <p className="section-text">{text}</p>
    </div>
  );
}

function scrollToHash(hash, closeMenu) {
  if (!hash?.startsWith("#")) return;
  const target = document.querySelector(hash);
  if (!target) return;

  closeMenu?.();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = window.__lenis;

  if (!prefersReducedMotion && lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(target, { offset: -88, duration: 1 });
    return;
  }

  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
}

function normalizeForm(values) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    type: values.type.trim(),
    message: values.message.trim(),
    website: values.website.trim(),
  };
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitState, setSubmitState] = useState("idle");
  const [errorText, setErrorText] = useState("");
  const { t, i18n } = useTranslation();

  const navItems = useMemo(
    () => [
      { label: t("nav.about"), href: "#about" },
      { label: t("nav.services"), href: "#services" },
      { label: t("nav.portfolio"), href: "#portfolio" },
      { label: t("nav.process"), href: "#process" },
      { label: t("nav.testimonials"), href: "#testimonials" },
      { label: t("nav.contact"), href: "#contact" },
    ],
    [t]
  );

  const stats = useMemo(() => {
    const value = t("stats", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const services = useMemo(() => {
    const value = t("services.items", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const education = useMemo(() => {
    const value = t("about.education", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const programs = useMemo(() => {
    const value = t("about.programs", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const processItems = useMemo(() => {
    const value = t("process.items", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const testimonials = useMemo(() => {
    const value = t("testimonials.items", { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  const projects = useMemo(() => {
    const meta = t("portfolio.projects", { returnObjects: true });
    const arr = Array.isArray(meta) ? meta : [];

    return projectImages.map((src, idx) => ({
      src,
      title: arr[idx]?.title || "Project",
      location: arr[idx]?.location || "Tbilisi, Georgia",
      type: arr[idx]?.type || "Interior",
    }));
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || "en";
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const setLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setMenuOpen(false);
  };

  const handleNavClick = (event, hash) => {
    event.preventDefault();
    scrollToHash(hash, () => setMenuOpen(false));
  };

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (submitState !== "idle") {
      setSubmitState("idle");
      setErrorText("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const values = normalizeForm(formData);
    if (!values.name || !values.email || !values.type || !values.message) {
      setSubmitState("error");
      setErrorText(t("contact.error", { defaultValue: "Please fill all fields." }));
      return;
    }

    if (values.website) {
      setSubmitState("success");
      setFormData(INITIAL_FORM);
      setErrorText("");
      return;
    }

    setSubmitState("loading");
    setErrorText("");

    const payload = new FormData();
    payload.append("name", values.name);
    payload.append("email", values.email);
    payload.append("project_type", values.type);
    payload.append("message", values.message);
    payload.append("_subject", "New interior design inquiry");
    payload.append("_captcha", "false");
    payload.append("_template", "table");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("https://formsubmit.co/ajax/gzirishviligiorgiwork@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
        signal: controller.signal,
      });

      const data = await response.json();
      if (response.ok && data?.success === "true") {
        setSubmitState("success");
        setFormData(INITIAL_FORM);
      } else {
        setSubmitState("error");
        setErrorText(data?.message || t("contact.error", { defaultValue: "Failed to send message. Please try again." }));
      }
    } catch {
      setSubmitState("error");
      setErrorText(t("contact.error", { defaultValue: "Failed to send message. Please try again." }));
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="site-shell">
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <header className="site-header" role="banner">
        <div className="container-row">
          <a href="#top" className="brand" onClick={(e) => handleNavClick(e, "#top")}>
            {t("brand")}
          </a>

          <nav className="desktop-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="lang-switch desktop-lang" role="group" aria-label="Language switcher">
            {LANG_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                className={i18n.resolvedLanguage === item.code ? "lang-btn active" : "lang-btn"}
                onClick={() => setLang(item.code)}
                aria-pressed={i18n.resolvedLanguage === item.code}
              >
                {item.label}
              </button>
            ))}
          </div>

          <a
            href="#contact"
            className="cta-pill desktop-cta"
            onClick={(e) => handleNavClick(e, "#contact")}
          >
            {t("nav.book")}
          </a>

          <button
            type="button"
            className="menu-button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? t("nav.close") : t("nav.menu")}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-panel" id="mobile-navigation">
            <div className="lang-switch mobile-lang" role="group" aria-label="Language switcher">
              {LANG_OPTIONS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={i18n.resolvedLanguage === item.code ? "lang-btn active" : "lang-btn"}
                  onClick={() => setLang(item.code)}
                  aria-pressed={i18n.resolvedLanguage === item.code}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
                {item.label}
              </a>
            ))}

            <a href="#contact" className="cta-pill" onClick={(e) => handleNavClick(e, "#contact")}>
              {t("nav.book")}
            </a>
          </div>
        )}
      </header>

      <main id="content">
        <section className="hero-wrap" id="top">
          <div className="hero-noise" />
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="hero-title">{t("hero.title")}</h1>
              <p className="hero-copy">{t("hero.copy")}</p>
              <div className="hero-actions">
                <a className="cta-pill" href="#portfolio" onClick={(e) => handleNavClick(e, "#portfolio")}>
                  {t("hero.ctaPrimary")}
                </a>
                <a className="ghost-pill" href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
                  {t("hero.ctaSecondary")}
                </a>
              </div>
            </div>

            <div className="hero-card">
              <img src="/assets/mariam.jpg" alt="Interior designer Mariam" width="1200" height="900" decoding="async" />
              <div>
                <p className="hero-card-kicker">{t("hero.designerRole")}</p>
                <p className="hero-card-name">{t("hero.designerName")}</p>
                <p className="hero-card-text">{t("hero.designerText")}</p>
              </div>
            </div>
          </div>

          <div className="container stats-grid">
            {stats.map((item, idx) => (
              <article key={`${item.label}-${idx}`} className="stat-item">
                <p className="stat-value">{item.value}</p>
                <p className="stat-label">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="section">
          <div className="container about-grid">
            <div>
              <SectionHeading eyebrow={t("about.eyebrow")} title={t("about.title")} text={t("about.text")} />
              <p className="about-note">{t("about.note")}</p>

              <div className="profile-card">
                <p className="profile-title">{t("about.profileTitle")}</p>
                <div className="profile-row">
                  <span>{t("about.fullNameLabel")}:</span>
                  <strong>{t("about.fullNameValue")}</strong>
                </div>
                <div className="profile-row">
                  <span>{t("about.ageLabel")}:</span>
                  <strong>{t("about.ageValue")}</strong>
                </div>
                <div className="profile-row">
                  <span>{t("about.experienceLabel")}:</span>
                  <strong>{t("about.experienceValue")}</strong>
                </div>

                <p className="profile-subtitle">{t("about.educationTitle")}</p>
                <ul className="profile-list">
                  {education.map((item, idx) => (
                    <li key={`${item.school}-${idx}`}>
                      <span>{item.school}</span>
                      <strong>{item.date}</strong>
                    </li>
                  ))}
                </ul>

                <p className="profile-subtitle">{t("about.programsTitle")}</p>
                <div className="program-chips">
                  {programs.map((item, idx) => (
                    <span key={`${item}-${idx}`}>{item}</span>
                  ))}
                </div>
              </div>
            </div>

            <figure className="about-visual">
              <img src="/assets/mariam2.jpg" alt="Designer portrait" width="900" height="1125" loading="lazy" decoding="async" />
            </figure>
          </div>
        </section>

        <section id="services" className="section section-soft">
          <div className="container">
            <SectionHeading eyebrow={t("services.eyebrow")} title={t("services.title")} text={t("services.text")} />
            <div className="services-grid">
              {services.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className="service-card">
                  <p className="service-number">{String(idx + 1).padStart(2, "0")}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="section">
          <div className="container">
            <SectionHeading eyebrow={t("portfolio.eyebrow")} title={t("portfolio.title")} text={t("portfolio.text")} />
            <div className="project-grid">
              {projects.map((item, idx) => (
                <article key={`${item.title}-${idx}`} className={`project-card ${idx === 0 ? "project-wide" : ""}`}>
                  <img src={item.src} alt={item.title} loading="lazy" decoding="async" width="1216" height="832" />
                  <div className="project-meta">
                    <p>{item.type}</p>
                    <h3>{item.title}</h3>
                    <span>{item.location}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section section-soft">
          <div className="container">
            <SectionHeading eyebrow={t("process.eyebrow")} title={t("process.title")} text={t("process.text")} />
            <div className="process-grid">
              {processItems.map((item, idx) => (
                <article key={`${item.step}-${idx}`} className="process-card">
                  <p className="process-step">{item.step}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="section">
          <div className="container">
            <SectionHeading
              eyebrow={t("testimonials.eyebrow")}
              title={t("testimonials.title")}
              text={t("testimonials.text")}
              align="center"
            />
            <div className="testimonial-grid">
              {testimonials.map((item, idx) => (
                <article key={`${item.name}-${idx}`} className="testimonial-card">
                  <p className="quote">"{item.quote}"</p>
                  <p className="client-name">{item.name}</p>
                  <p className="client-role">{item.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section section-contact">
          <div className="container contact-grid">
            <div>
              <SectionHeading eyebrow={t("contact.eyebrow")} title={t("contact.title")} text={t("contact.text")} />
              <ul className="contact-list">
                <li>
                  {t("contact.email")}: <a href={`mailto:${t("contact.emailValue")}`}>{t("contact.emailValue")}</a>
                </li>
                <li>
                  {t("contact.phone")}: <a href={`tel:${t("contact.phoneValue").replace(/\s+/g, "")}`}>{t("contact.phoneValue")}</a>
                </li>
                <li>{t("contact.location")}: {t("contact.locationValue")}</li>
              </ul>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label className="honeypot" aria-hidden="true">
                Website
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={onFieldChange}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </label>

              <label>
                {t("contact.formName")}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFieldChange}
                  placeholder={t("contact.placeholderName")}
                  maxLength={80}
                  required
                />
              </label>

              <label>
                {t("contact.formEmail")}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onFieldChange}
                  placeholder={t("contact.placeholderEmail")}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                {t("contact.formType")}
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={onFieldChange}
                  placeholder={t("contact.placeholderType")}
                  maxLength={80}
                  required
                />
              </label>

              <label>
                {t("contact.formMessage")}
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={onFieldChange}
                  placeholder={t("contact.placeholderMessage")}
                  maxLength={1200}
                  required
                />
              </label>

              <button type="submit" className="cta-pill" disabled={submitState === "loading"}>
                {submitState === "loading" ? t("contact.sending") : t("contact.submit")}
              </button>

              <p className="form-status ok" aria-live="polite" hidden={submitState !== "success"}>
                {t("contact.success")}
              </p>
              <p className="form-status err" aria-live="polite" hidden={submitState !== "error"}>
                {errorText || t("contact.error")}
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <p>{t("footer.left")}</p>
          <p>{t("footer.right")}</p>
        </div>
      </footer>
    </div>
  );
}
