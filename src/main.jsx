import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n/i18n";

async function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const [{ default: Lenis }] = await Promise.all([import("lenis"), import("lenis/dist/lenis.css")]);
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: true,
    wheelMultiplier: 0.95,
    allowNestedScroll: true,
  });

  window.__lenis = lenis;
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

initSmoothScroll();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
