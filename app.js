const STORAGE_KEY = "linkedinCarouselDesigner:v1";

const templates = [
  {
    name: "Forest Night",
    colors: { primary: "#0f172a", secondary: "#12213f", accent: "#4ade80", altBg: "#1f345f" },
    headingFont: "Oswald, Arial, sans-serif",
    baseFont: "Inter, Arial, sans-serif",
  },
  {
    name: "Ocean Deep",
    colors: { primary: "#102a43", secondary: "#1d4e89", accent: "#60a5fa", altBg: "#243b67" },
    headingFont: "Poppins, Arial, sans-serif",
    baseFont: "Montserrat, Arial, sans-serif",
  },
  {
    name: "Dark Gold",
    colors: { primary: "#161311", secondary: "#3e342d", accent: "#eab308", altBg: "#5f544b" },
    headingFont: "Playfair Display, Georgia, serif",
    baseFont: "Lora, Georgia, serif",
  },
];

const defaultState = {
  schemaVersion: 1,
  settings: {
    primary: "#111827",
    secondary: "#1f2937",
    accent: "#22c55e",
    altBg: "#334155",
    baseFont: "Inter, Arial, sans-serif",
    headingFont: "Poppins, Arial, sans-serif",
    textScale: 100,
    brandName: "@yourbrand",
    footerText: "Swipe for more",
    logoText: "◆",
    safeMargin: 10,
    themePreset: "Custom",
  },
  activeSlideId: "hero",
  slides: [
    {
      id: "hero",
      type: "hero",
      heading: "How to Build Better LinkedIn Carousels",
      bodyHtml: "<p>Focus on your content, not design complexity.</p><p><b>Create hero, body, and CTA slides</b> in one flow.</p>",
      bg: "#111827",
      align: "left",
    },
    {
      id: crypto.randomUUID(),
      type: "body",
      heading: "Body Slide",
      bodyHtml: "<ul><li>Add points with bullets</li><li>Use bold and italic</li></ul>",
      bg: "#334155",
      align: "left",
    },
    {
      id: "cta",
      type: "cta",
      heading: "Ready to publish?",
      bodyHtml: "<p>Export your carousel as PDF and upload to LinkedIn.</p>",
      bg: "#0f172a",
      align: "center",
    },
  ],
};

let state = loadState();
let saveTimer;

const el = {
  slideList: document.getElementById("slideList"),
  preview: document.getElementById("preview"),
  overflowFlag: document.getElementById("overflowFlag"),
  themePreset: document.getElementById("themePreset"),
  primaryColor: document.getElementById("primaryColor"),
  secondaryColor: document.getElementById("secondaryColor"),
  accentColor: document.getElementById("accentColor"),
  baseFont: document.getElementById("baseFont"),
  headingFont: document.getElementById("headingFont"),
  textScale: document.getElementById("textScale"),
  slideBg: document.getElementById("slideBg"),
  altBg: document.getElementById("altBg"),
  brandName: document.getElementById("brandName"),
  footerText: document.getElementById("footerText"),
  logoText: document.getElementById("logoText"),
  safeMargin: document.getElementById("safeMargin"),
  templateList: document.getElementById("templateList"),
};

init();

function init() {
  seedThemePresets();
  mountTemplateCards();
  bindTabs();
  bindActions();
  bindFormattingButtons();
  syncInputsFromState();
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    if (!parsed.schemaVersion) return structuredClone(defaultState);
    return parsed;
  } catch {
    return structuredClone(defaultState);
  }
}

function persistNow() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 300);
}

function seedThemePresets() {
  ["Custom", ...templates.map((t) => t.name)].forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    el.themePreset.append(opt);
  });
}

function mountTemplateCards() {
  el.templateList.innerHTML = "";
  templates.forEach((t) => {
    const card = document.createElement("button");
    card.className = "template-card";
    card.innerHTML = `<strong>${t.name}</strong><br><small>${t.headingFont.split(",")[0]} + ${t.baseFont.split(",")[0]}</small>`;
    card.addEventListener("click", () => applyTemplate(t));
    el.templateList.append(card);
  });
}

function applyTemplate(template) {
  state.settings.primary = template.colors.primary;
  state.settings.secondary = template.colors.secondary;
  state.settings.accent = template.colors.accent;
  state.settings.altBg = template.colors.altBg;
  state.settings.headingFont = template.headingFont;
  state.settings.baseFont = template.baseFont;
  state.settings.themePreset = template.name;
  state.slides.forEach((slide, i) => {
    slide.bg = i % 2 === 0 ? template.colors.primary : template.colors.altBg;
  });
  syncInputsFromState();
  render();
  persistDebounced();
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}-panel`).classList.add("active");
    });
  });
}

function bindActions() {
  document.getElementById("addSlideBtn").addEventListener("click", addBodySlide);
  document.getElementById("saveBtn").addEventListener("click", () => {
    persistNow();
    alert("Saved to local browser storage.");
  });
  document.getElementById("downloadBtn").addEventListener("click", exportPdf);

  const bindInput = (target, key, cast = (v) => v) => {
    target.addEventListener("input", (e) => {
      state.settings[key] = cast(e.target.value);
      if (["primary", "secondary", "accent", "altBg"].includes(key)) state.settings.themePreset = "Custom";
      if (key === "altBg") {
        state.slides.forEach((slide, i) => {
          if (i > 0 && i < state.slides.length - 1 && i % 2 === 1) slide.bg = state.settings.altBg;
        });
      }
      render();
      persistDebounced();
    });
  };

  bindInput(el.primaryColor, "primary");
  bindInput(el.secondaryColor, "secondary");
  bindInput(el.accentColor, "accent");
  bindInput(el.baseFont, "baseFont");
  bindInput(el.headingFont, "headingFont");
  bindInput(el.textScale, "textScale", Number);
  bindInput(el.altBg, "altBg");
  bindInput(el.brandName, "brandName");
  bindInput(el.footerText, "footerText");
  bindInput(el.logoText, "logoText");
  bindInput(el.safeMargin, "safeMargin", Number);

  el.slideBg.addEventListener("input", (e) => {
    const slide = getActiveSlide();
    if (!slide) return;
    slide.bg = e.target.value;
    render();
    persistDebounced();
  });

  el.themePreset.addEventListener("change", (e) => {
    const selected = templates.find((t) => t.name === e.target.value);
    if (selected) applyTemplate(selected);
  });
}

function bindFormattingButtons() {
  document.querySelectorAll(".toolbar button[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.execCommand(btn.dataset.cmd, false, null);
      const active = document.querySelector(`.slide[data-id='${state.activeSlideId}'] .slide-body`);
      if (active) syncSlideFromDom(state.activeSlideId, active.innerHTML);
    });
  });
}

function syncInputsFromState() {
  el.primaryColor.value = state.settings.primary;
  el.secondaryColor.value = state.settings.secondary;
  el.accentColor.value = state.settings.accent;
  el.baseFont.value = state.settings.baseFont;
  el.headingFont.value = state.settings.headingFont;
  el.textScale.value = state.settings.textScale;
  el.altBg.value = state.settings.altBg;
  el.brandName.value = state.settings.brandName;
  el.footerText.value = state.settings.footerText;
  el.logoText.value = state.settings.logoText;
  el.safeMargin.value = state.settings.safeMargin;
  el.themePreset.value = state.settings.themePreset;
  el.slideBg.value = getActiveSlide()?.bg ?? state.settings.primary;
}

function getActiveSlide() {
  return state.slides.find((s) => s.id === state.activeSlideId);
}

function render() {
  renderSlideList();
  renderPreview();
  syncInputsFromState();
}

function renderSlideList() {
  el.slideList.innerHTML = "";
  state.slides.forEach((slide, index) => {
    const item = document.createElement("div");
    item.className = `slide-item ${slide.id === state.activeSlideId ? "active" : ""}`;
    item.innerHTML = `<div><strong>${index + 1}. ${slide.heading.slice(0, 22) || "Untitled"}</strong><br><small>${slide.type}</small></div>`;
    const tools = document.createElement("div");

    const openBtn = document.createElement("button");
    openBtn.textContent = "Edit";
    openBtn.addEventListener("click", () => {
      state.activeSlideId = slide.id;
      render();
    });
    tools.append(openBtn);

    if (slide.type === "body") {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        state.slides = state.slides.filter((s) => s.id !== slide.id);
        state.activeSlideId = state.slides[0].id;
        render();
        persistDebounced();
      });
      tools.append(delBtn);
    }

    item.append(tools);
    el.slideList.append(item);
  });
}

function renderPreview() {
  el.preview.innerHTML = "";
  state.slides.forEach((slide) => {
    const card = document.createElement("article");
    card.className = `slide ${slide.id === state.activeSlideId ? "active" : ""}`;
    card.dataset.id = slide.id;
    card.style.background = slide.bg || state.settings.primary;
    card.style.fontFamily = state.settings.baseFont;

    const safety = document.createElement("div");
    safety.className = "safety";
    safety.style.padding = `${state.settings.safeMargin}%`;

    const top = document.createElement("div");
    const heading = document.createElement("h3");
    heading.className = "slide-header";
    heading.style.fontFamily = state.settings.headingFont;
    heading.style.fontSize = `${2.1 * (state.settings.textScale / 100)}rem`;
    heading.style.textAlign = slide.align;
    heading.contentEditable = "true";
    heading.textContent = slide.heading;
    heading.addEventListener("focus", () => (state.activeSlideId = slide.id));
    heading.addEventListener("input", () => {
      slide.heading = heading.textContent;
      renderSlideList();
      persistDebounced();
    });

    const body = document.createElement("div");
    body.className = "slide-body";
    body.style.textAlign = slide.align;
    body.style.fontSize = `${1.1 * (state.settings.textScale / 100)}rem`;
    body.contentEditable = "true";
    body.innerHTML = slide.bodyHtml;
    body.addEventListener("focus", () => (state.activeSlideId = slide.id));
    body.addEventListener("input", () => {
      syncSlideFromDom(slide.id, body.innerHTML);
      maybeCreateSlideOnOverflow(card, slide.id);
      persistDebounced();
    });

    top.append(heading, body);

    const footer = document.createElement("div");
    footer.className = "footer";
    footer.innerHTML = `<span>${state.settings.logoText} ${state.settings.brandName}</span><span>${state.settings.footerText}</span>`;

    const role = document.createElement("span");
    role.className = "role-pill";
    role.textContent = slide.type;

    safety.append(top, footer);
    card.append(safety, role);
    card.addEventListener("click", () => {
      state.activeSlideId = slide.id;
      render();
    });
    el.preview.append(card);
  });
}

function syncSlideFromDom(id, html) {
  const slide = state.slides.find((s) => s.id === id);
  if (!slide) return;
  slide.bodyHtml = html;
}

function addBodySlide(afterId = null) {
  const slide = {
    id: crypto.randomUUID(),
    type: "body",
    heading: "New Slide",
    bodyHtml: "<p>Add your point here.</p>",
    bg: state.settings.altBg,
    align: "left",
  };
  const ctaIndex = state.slides.findIndex((s) => s.type === "cta");
  if (!afterId) {
    state.slides.splice(ctaIndex, 0, slide);
  } else {
    const idx = state.slides.findIndex((s) => s.id === afterId);
    state.slides.splice(idx + 1, 0, slide);
  }
  state.activeSlideId = slide.id;
  render();
  persistDebounced();
}

function maybeCreateSlideOnOverflow(card, slideId) {
  const body = card.querySelector(".slide-body");
  if (!body) return;
  const slide = state.slides.find((s) => s.id === slideId);
  if (!slide || slide.type === "cta") return;
  const isOverflowing = body.scrollHeight > body.clientHeight + 10;
  if (!isOverflowing) return;

  const currentIndex = state.slides.findIndex((s) => s.id === slideId);
  const next = state.slides[currentIndex + 1];
  if (!next || next.type === "cta") {
    addBodySlide(slideId);
  } else {
    state.activeSlideId = next.id;
  }

  el.overflowFlag.classList.remove("hidden");
  setTimeout(() => el.overflowFlag.classList.add("hidden"), 1600);
}

async function exportPdf() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [1080, 1350] });
  const cards = [...document.querySelectorAll(".slide")];
  if (!cards.length) return;

  for (let i = 0; i < cards.length; i += 1) {
    const canvas = await html2canvas(cards[i], {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const data = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage([1080, 1350], "portrait");
    pdf.addImage(data, "PNG", 0, 0, 1080, 1350, undefined, "FAST");
  }

  pdf.save("linkedin-carousel.pdf");
}
