import React from "react";
import ReactDOM from "react-dom/client";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import App from "./App.jsx";
import "./index.css";
import "./i18n/i18n";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const lenis = new Lenis({
    duration: 1,
    smoothWheel: true,
    smoothTouch: false,
  });

  window.__lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
