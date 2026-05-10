/* ==============================================================
   PRIMORIS — interaction layer
   - loader fade
   - custom cursor + hover states
   - magnetic buttons
   - scroll-triggered reveals (IntersectionObserver)
   - parallax floats
   - nav scroll state
   - smooth anchor scrolling
   - simple counter animation for pillars
   ============================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initCursor();
  initMagnetic();
  initReveal();
  initNavScroll();
  initParallax();
  initCounters();
  initSmoothAnchors();
  initServiceCardTilt();
});

/* --------------------------- loader --------------------------- */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("done"), 1500);
  });
  // safety net if load already fired
  setTimeout(() => loader.classList.add("done"), 2400);
}

/* --------------------------- custom cursor -------------------- */
function initCursor() {
  if (window.matchMedia("(max-width: 900px)").matches) return;
  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursor-dot");
  if (!cursor || !dot) return;

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let cx = x, cy = y, dx = x, dy = y;

  document.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });

  const tick = () => {
    cx += (x - cx) * 0.15;
    cy += (y - cy) * 0.15;
    dx += (x - dx) * 0.6;
    dy += (y - dy) * 0.6;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const hoverables = document.querySelectorAll(
    "a, button, .service-card, .client-card, .process-row, .contact-card, [data-magnetic]"
  );
  hoverables.forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
}

/* --------------------------- magnetic buttons ----------------- */
function initMagnetic() {
  if (window.matchMedia("(max-width: 900px)").matches) return;
  const els = document.querySelectorAll("[data-magnetic]");
  els.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

/* --------------------------- scroll reveal -------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(i => i.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => el.classList.add("in"), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  items.forEach(el => io.observe(el));
}

/* --------------------------- nav scroll state ----------------- */
function initNavScroll() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* --------------------------- parallax floats ------------------ */
function initParallax() {
  const items = document.querySelectorAll(".parallax");
  if (!items.length) return;

  let ticking = false;
  const update = () => {
    const sy = window.scrollY;
    items.forEach(el => {
      const speed = parseFloat(el.dataset.speed || 0.1);
      el.style.transform = `translate3d(0, ${sy * -speed}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* --------------------------- counters ------------------------- */
function initCounters() {
  const pillars = document.querySelectorAll(".pillar-num");
  if (!pillars.length) return;

  const animate = (el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/(\D*)(\d+(?:\.\d+)?)(.*)/);
    if (!match) return;
    const prefix = match[1] || "";
    const target = parseFloat(match[2]);
    const suffix = match[3] || "";
    const dur = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    // Preserve any nested HTML markers (we used <i>) by re-injecting suffix raw
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const v = Math.round(target * ease(t));
      el.textContent = `${prefix}${v}`;
      // re-append suffix children (keeps the <i>+</i> styling? we only have %, +)
      // simpler: just set text then add a span for i-styled suffix
      if (t < 1) requestAnimationFrame(step);
      else {
        // restore final HTML with <i> wrapping the suffix mark
        el.innerHTML = `${prefix}${target}<i>${suffix}</i>`;
      }
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  pillars.forEach(p => io.observe(p));
}

/* --------------------------- smooth anchors ------------------- */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* --------------------------- service card tilt ---------------- */
function initServiceCardTilt() {
  if (window.matchMedia("(max-width: 900px)").matches) return;
  const cards = document.querySelectorAll(".service-card, .client-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
