export default function ProjectModal({
  activeProject,
  activeImage,
  onClose,
  onNext,
  onPrev,
  onThumbSelect,
  t,
}) {
  if (!activeProject) return null;

  const visibleImage = activeImage || activeProject.gallery[0];
  const currentIndex = activeProject.gallery.indexOf(visibleImage);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;

  return (
    <div className="project-modal-wrap" role="dialog" aria-modal="true" aria-label={activeProject.title}>
      <button
        type="button"
        className="project-modal-backdrop"
        aria-label={t("aria.closeProject")}
        onClick={onClose}
      />
      <div className="project-modal" data-lenis-prevent>
        <div className="project-modal-head">
          <div>
            <p>{activeProject.type}</p>
            <h3>{activeProject.title}</h3>
            <span>{activeProject.location}</span>
          </div>
          <button type="button" className="project-modal-close" onClick={onClose}>
            {t("nav.close")}
          </button>
        </div>

        <div className="project-modal-image-wrap">
          <button type="button" className="project-nav prev" onClick={onPrev} aria-label={t("aria.prevImage")}>
            {t("gallery.prev")}
          </button>
          <img src={visibleImage} alt={activeProject.title} className="project-modal-main" loading="eager" />
          <button type="button" className="project-nav next" onClick={onNext} aria-label={t("aria.nextImage")}>
            {t("gallery.next")}
          </button>
        </div>

        <div className="project-modal-thumbs">
          {activeProject.gallery.map((imageSrc, index) => (
            <button
              type="button"
              key={`${imageSrc}-${index}`}
              className={visibleImage === imageSrc ? "thumb is-active" : "thumb"}
              onClick={() => onThumbSelect(imageSrc)}
              aria-label={t("gallery.thumb", { number: index + 1 })}
            >
              <img src={imageSrc} alt={`${activeProject.title} view ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
        <p className="project-modal-count">
          {safeIndex + 1} / {activeProject.gallery.length}
        </p>
      </div>
    </div>
  );
}
