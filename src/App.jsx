import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ProjectModal from "./components/ProjectModal";
import SectionHeading from "./components/SectionHeading";
import { mapProjects } from "./data/projects";

const INITIAL_FORM = {
  name: "",
  email: "",
  type: "",
  message: "",
  website: "",
};

const MAX_UPLOAD_FILES = 6;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_SIZE = 10 * 1024 * 1024;

function scrollToHash(hash, closeMenu) {
  if (!hash?.startsWith("#")) return;

  const target = document.querySelector(hash);
  if (!target) return;

  closeMenu?.();

  const lenis = window.__lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(target, { offset: -88, duration: 1.05 });
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [activeSection, setActiveSection] = useState("top");
  const [showTopButton, setShowTopButton] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitState, setSubmitState] = useState(() => {
    if (typeof window === "undefined") return "idle";
    const params = new URLSearchParams(window.location.search);
    return params.get("sent") === "1" ? "success" : "idle";
  });
  const [errorText, setErrorText] = useState("");

  const resolvedLang = i18n.resolvedLanguage || "en";
  const phoneText = t("contact.phoneValue");
  const phoneDigits = phoneText.replace(/[^\d]/g, "");
  const phoneHref = `tel:${phoneDigits}`;
  const whatsappHref = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
    t("quickContact.whatsappPrefill", {
      defaultValue: "Hello, I want to book an interior design consultation.",
    })
  )}`;

  const nextUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?sent=1#contact`
      : "";

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
    const value = t("portfolio.projects", { returnObjects: true });
    const meta = Array.isArray(value) ? value : [];
    return mapProjects(meta);
  }, [t]);

  useEffect(() => {
    document.documentElement.lang = resolvedLang;
  }, [resolvedLang]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sent") !== "1") return;
    params.delete("sent");

    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
    window.history.replaceState({}, "", next);
  }, []);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setActiveProject(null);
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    const sections = ["top", "about", "services", "portfolio", "process", "testimonials", "contact"];
    const observed = sections.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!activeProject) return;

    const onKey = (event) => {
      if (event.key === "ArrowRight") setActiveImage((current) => cycleImage("next", current, activeProject.gallery));
      if (event.key === "ArrowLeft") setActiveImage((current) => cycleImage("prev", current, activeProject.gallery));
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeProject]);

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

  const onImagesChange = (event) => {
    const selected = Array.from(event.target.files || []);

    if (!selected.length) {
      setImageFiles([]);
      return;
    }

    if (selected.length > MAX_UPLOAD_FILES) {
      setSubmitState("error");
      setErrorText(
        t("contact.uploadTooMany", {
          defaultValue: `Please upload up to ${MAX_UPLOAD_FILES} images.`,
        })
      );
      event.target.value = "";
      return;
    }

    const hasInvalidType = selected.some((file) => !file.type.startsWith("image/"));
    if (hasInvalidType) {
      setSubmitState("error");
      setErrorText(t("contact.uploadTypeError", { defaultValue: "Only image files are allowed." }));
      event.target.value = "";
      return;
    }

    const hasOversizedFile = selected.some((file) => file.size > MAX_FILE_SIZE);
    if (hasOversizedFile) {
      setSubmitState("error");
      setErrorText(t("contact.uploadSizeError", { defaultValue: "Each image must be under 8MB." }));
      event.target.value = "";
      return;
    }

    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_UPLOAD_SIZE) {
      setSubmitState("error");
      setErrorText(
        t("contact.uploadTotalSizeError", {
          defaultValue: "Total upload size must be under 10MB.",
        })
      );
      event.target.value = "";
      return;
    }

    setImageFiles(selected);
    if (submitState !== "idle") {
      setSubmitState("idle");
      setErrorText("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = normalizeForm(formData);
    if (!values.name || !values.email) {
      setSubmitState("error");
      setErrorText(t("contact.requiredError", { defaultValue: "Please fill at least name and email." }));
      return;
    }

    if (!imageFiles.every((file) => file.type.startsWith("image/"))) {
      setSubmitState("error");
      setErrorText(t("contact.uploadTypeError", { defaultValue: "Only image files are allowed." }));
      return;
    }

    setSubmitState("loading");
    setErrorText("");
    event.currentTarget.submit();
  };

  const openProject = (project) => {
    setActiveProject(project);
    setActiveImage(project.gallery?.[0] || project.src);
  };

  const showPrevImage = () => {
    if (!activeProject?.gallery?.length) return;
    setActiveImage((current) => cycleImage("prev", current, activeProject.gallery));
  };

  const showNextImage = () => {
    if (!activeProject?.gallery?.length) return;
    setActiveImage((current) => cycleImage("next", current, activeProject.gallery));
  };

  return (
    <div className="site-shell">
      <a href="#content" className="skip-link">
        {t("aria.skipToContent")}
      </a>

      <header className="site-header" role="banner">
        <div className="container-row">
          <a href="#top" className="brand" onClick={(e) => handleNavClick(e, "#top")}>
            {t("brand")}
          </a>

          <nav className="desktop-nav" aria-label={t("aria.primaryNavigation")}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={activeSection === item.href.slice(1) ? "is-active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <LanguageSwitcher
            currentLang={resolvedLang}
            onChange={setLang}
            className="desktop-lang"
            ariaLabel={t("aria.languageSwitcher")}
          />

          <a href="#contact" className="cta-pill desktop-cta" onClick={(e) => handleNavClick(e, "#contact")}>
            {t("nav.book")}
          </a>

          <button
            type="button"
            className={`menu-button ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? t("aria.closeMenu") : t("aria.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true" className="menu-glyph">
              <span />
              <span />
              <span />
            </span>
            <span className="menu-label-wrap">
              <span className="menu-label menu-text">{t("nav.menu")}</span>
              <span className="menu-label close-text">{t("nav.close")}</span>
            </span>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-overlay">
            <button
              type="button"
              className="mobile-backdrop"
              onClick={() => setMenuOpen(false)}
              aria-label={t("aria.closeMenu")}
            />
            <aside
              className="mobile-drawer"
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              data-lenis-prevent
            >
              <nav className="mobile-nav-links" aria-label={t("aria.mobileNavigation")}>
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={activeSection === item.href.slice(1) ? "is-active" : ""}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mobile-lang-wrap">
                <p>{t("nav.language")}</p>
                <LanguageSwitcher
                  currentLang={resolvedLang}
                  onChange={setLang}
                  className="mobile-lang"
                  ariaLabel={t("aria.languageSwitcher")}
                />
              </div>

              <a href="#contact" className="cta-pill mobile-cta" onClick={(e) => handleNavClick(e, "#contact")}>
                {t("nav.book")}
              </a>
            </aside>
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
              <p className="price-note">{t("pricing.rate")}</p>
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
              <img
                src="/assets/mariam.jpg"
                alt={t("hero.designerImageAlt")}
                width="1200"
                height="900"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
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
              <img
                src="/assets/mariam2.jpg"
                alt={t("about.imageAlt")}
                width="900"
                height="1125"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </figure>
          </div>
        </section>

        <section id="services" className="section section-soft">
          <div className="container">
            <SectionHeading eyebrow={t("services.eyebrow")} title={t("services.title")} text={t("services.text")} />
            <p className="price-note section-price">{t("pricing.rate")}</p>
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
                <button
                  type="button"
                  key={`${item.title}-${idx}`}
                  className={`project-card project-card-btn ${idx === 0 ? "project-wide" : ""}`}
                  onClick={() => openProject(item)}
                  aria-label={t("portfolio.openProject", { title: item.title })}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    width="1216"
                    height="832"
                    sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="project-meta">
                    <p>{item.type}</p>
                    <h3>{item.title}</h3>
                    <span>{item.location}</span>
                  </div>
                </button>
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
              <p className="price-note">{t("pricing.rate")}</p>
              <ul className="contact-list">
                <li>
                  {t("contact.email")}: <a href={`mailto:${t("contact.emailValue")}`}>{t("contact.emailValue")}</a>
                </li>
                <li>
                  {t("contact.phone")}: <a href={`tel:${phoneDigits}`}>{t("contact.phoneValue")}</a>
                </li>
                <li>
                  {t("contact.location")}: {t("contact.locationValue")}
                </li>
              </ul>
            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
              action="https://formsubmit.co/gzirishviligiorgiwork@gmail.com"
              method="POST"
              encType="multipart/form-data"
              noValidate
            >
              <input type="hidden" name="_subject" value="New interior design inquiry" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value={nextUrl} />

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
                />
              </label>

              <label>
                {t("contact.formImages", { defaultValue: "Upload home images (optional)" })}
                <input
                  type="file"
                  name="attachment"
                  className="file-input"
                  accept="image/*"
                  multiple
                  onChange={onImagesChange}
                />
                <small className="file-selected" aria-live="polite">
                  {imageFiles.length
                    ? t("contact.filesSelected", {
                        count: imageFiles.length,
                        defaultValue: `${imageFiles.length} file(s) selected`,
                      })
                    : t("contact.noFilesSelected", { defaultValue: "No files selected yet." })}
                </small>
                <small className="file-help">
                  {t("contact.formImagesHelp", {
                    defaultValue: "Up to 6 images, max 8MB each.",
                  })}
                </small>
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

      <ProjectModal
        activeProject={activeProject}
        activeImage={activeImage}
        onClose={() => setActiveProject(null)}
        onNext={showNextImage}
        onPrev={showPrevImage}
        onThumbSelect={setActiveImage}
        t={t}
      />

      <button
        type="button"
        className={`back-to-top ${showTopButton ? "show" : ""}`}
        onClick={(e) => handleNavClick(e, "#top")}
        aria-label={t("aria.backToTop")}
      >
        {t("common.top")}
      </button>

      <div className="quick-contact" aria-label={t("aria.quickContact")}>
        <a href={whatsappHref} className="quick-pill whatsapp" target="_blank" rel="noreferrer">
          {t("quickContact.whatsapp", { defaultValue: "WhatsApp" })}
        </a>
        <a href={phoneHref} className="quick-pill phone">
          {t("quickContact.call", { defaultValue: "Call" })}
        </a>
      </div>

      <footer className="site-footer">
        <div className="container footer-row">
          <p>{t("footer.left")}</p>
          <p>{t("footer.right")}</p>
        </div>
        <div className="container footer-source">
          <a href="https://unsplash.com" target="_blank" rel="noreferrer">
            {t("footer.source")}
          </a>
        </div>
      </footer>
    </div>
  );
}

function cycleImage(direction, currentImage, gallery) {
  const currentIndex = gallery.indexOf(currentImage || gallery[0]);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;

  const nextIndex =
    direction === "next"
      ? (safeIndex + 1) % gallery.length
      : (safeIndex - 1 + gallery.length) % gallery.length;

  return gallery[nextIndex];
}
