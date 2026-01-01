document.addEventListener("DOMContentLoaded", () => {
  // 1. THEME LOGIC
  const themeBtn = document.getElementById("theme-toggle");
  const html = document.documentElement;
  const themeIcon = document.querySelector("#theme-toggle i");

  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    themeBtn.setAttribute("aria-pressed", next === "dark");
    localStorage.setItem("theme", next);
  });

  // 2. ACCORDION LOGIC
  const accBtns = document.querySelectorAll(".acc-btn");
  accBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isExpanded = btn.getAttribute("aria-expanded") === "true";

      // Close others
      document.querySelectorAll(".acc-item").forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
      });

      if (!isExpanded) {
        item.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // 3. GSAP ANIMATIONS
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(".hero-heading", {
    scale: 0.92,
    opacity: 0.85,
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Initial Reveal
  const tl = gsap.timeline();
  tl.from(".hero-heading", {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  })
    .from(".recruiter-box", { opacity: 0, duration: 0.8 }, "-=0.5")
    .from(".cta-row", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5")
    .from(".avatar-frame", { x: 30, opacity: 0, duration: 1 }, "-=0.8");

  // Scroll Elements
  const animateOnScroll = (selector) => {
    gsap.utils.toArray(selector).forEach((item) => {
      gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: item,
          start: "top 95%", // Triggers immediately on view
          toggleActions: "play none none none",
        },
      });
    });
  };

  animateOnScroll(".fade-item");

  // Bar Fill
  gsap.utils.toArray(".bar-fill").forEach((bar) => {
    const targetWidth = bar.style.width;

    gsap.fromTo(
      bar,
      { width: "0%" },
      {
        width: targetWidth,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bar,
          start: "top 85%",
          end: "bottom 60%",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  });

  // 4. TILT
  VanillaTilt.init(document.querySelector(".tilt-card"), {
    max: 8,
    speed: 400,
    glare: true,
    "max-glare": 0.1,
  });
});
const nav = document.querySelector(".hud-nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    nav.style.padding = "8px 0";
  } else {
    nav.style.padding = "15px 0";
  }
});
// 5. SECTION-BASED NAV GLOW INTENSITY
const sections = document.querySelectorAll("section[data-section]");
const navLinks = document.querySelectorAll(".hud-link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const weight = parseFloat(entry.target.dataset.weight || 0.7);
      const ratio = entry.intersectionRatio;

      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          const glow = Math.min(ratio * weight, 1);

          link.classList.add("glow");
          link.style.setProperty("--glow", glow.toFixed(2));

          if (glow > 0.4) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        }
      });
    });
  },
  {
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
  }
);

sections.forEach((section) => observer.observe(section));

window.addEventListener("scroll", () => {
  navLinks.forEach((link) => {
    if (!link.classList.contains("active")) {
      link.style.setProperty("--glow", 0);
      link.classList.remove("glow");
    }
  });
});

// SCROLL VELOCITY → NAV GLOW BOOST
let lastScrollY = window.scrollY;
let velocity = 0;

window.addEventListener("scroll", () => {
  const delta = Math.abs(window.scrollY - lastScrollY);
  velocity = Math.min(delta / 40, 1);
  lastScrollY = window.scrollY;

  navLinks.forEach((link) => {
    const currentGlow = parseFloat(link.style.getPropertyValue("--glow")) || 0;
    const boostedGlow = Math.min(currentGlow + velocity * 0.3, 1);
    link.style.setProperty("--glow", boostedGlow.toFixed(2));
  });
});

// NAV MAGNETIC HOVER
navLinks.forEach((link) => {
  link.addEventListener("mousemove", (e) => {
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    link.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  link.addEventListener("mouseleave", () => {
    link.style.transform = "translate(0,0)";
  });
});

// KEYBOARD SECTION NAVIGATION
const sectionIds = [...document.querySelectorAll("section[data-section]")].map(
  (sec) => sec.id
);

let currentIndex = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
    currentIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
    document
      .getElementById(sectionIds[currentIndex])
      .scrollIntoView({ behavior: "smooth" });
  }

  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
    currentIndex = Math.max(currentIndex - 1, 0);
    document
      .getElementById(sectionIds[currentIndex])
      .scrollIntoView({ behavior: "smooth" });
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// HERO PARALLAX MICRO-INTERACTION
const hero = document.querySelector(".hero-section");

window.addEventListener("load", () => {
  const hero = document.querySelector(".hero-section");
  if (!hero) return;

  hero.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    hero.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  hero.addEventListener("mouseleave", () => {
    hero.style.transform = "translate3d(0,0,0)";
  });
});
