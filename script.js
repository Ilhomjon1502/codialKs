// ===== Yordamchi =====
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const icon = name => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) { return null; }
}

// ===== Preloader =====
window.addEventListener("load", () => {
  setTimeout(() => $("#preloader").classList.add("done"), reduceMotion ? 0 : 1400);
});

// ===== Mavzu (yorug' / qorong'i) =====
const root = document.documentElement;
// Birinchi kirishda iliq yorug' mavzu; tanlov eslab qolinadi
const savedTheme = store("theme");
if (savedTheme) root.dataset.theme = savedTheme;
$("#themeToggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  store("theme", root.dataset.theme);
});

// ===== Menyu =====
const burger = $("#burger");
const navLinks = $("#navLinks");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
$$("a", navLinks).forEach(a => a.addEventListener("click", () => {
  burger.classList.remove("open");
  navLinks.classList.remove("open");
}));

// ===== Scroll: nav, progress, yuqoriga tugmasi, faol havola =====
const sections = $$("main section[id]");
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#scrollProgress").style.width = (y / max) * 100 + "%";
  $("#nav").classList.toggle("scrolled", y > 30);
  $("#toTop").classList.toggle("show", y > 600);

  let current = "";
  sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
  $$("a", navLinks).forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
$("#toTop").addEventListener("click", () => window.scrollTo({ top: 0 }));

// ===== Kursor nuri =====
const glow = $("#cursorGlow");
window.addEventListener("pointermove", e => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// ===== Kurs dasturi (Notion'dagi mavzular) =====
const lessons = [
  { ic: "monitor", t: "Kompyuter nima?", d: "Kompyuter qismlari, yoqish-o'chirish, sichqoncha va klaviatura bilan ishlash, fayl va papkalar." },
  { ic: "globe", t: "Internet", d: "Brauzer, qidiruv tizimlari, foydali saytlar va internetda xavfsiz bo'lish qoidalari." },
  { ic: "type", t: "Word 1", d: "Hujjat yaratish, matn yozish, shrift, o'lcham va rang bilan ishlash." },
  { ic: "image", t: "Word 2", d: "Jadval, rasm, ro'yxatlar qo'shish va hujjatni chiroyli bezash." },
  { ic: "table", t: "Excel 1", d: "Katakchalar, ustun va qatorlar, ma'lumot kiritish va oddiy hisob-kitoblar." },
  { ic: "calculator", t: "Excel 2", d: "Formulalar (SUM, AVERAGE...), saralash, filtr va diagrammalar." },
  { ic: "presentation", t: "PowerPoint 1", d: "Taqdimot yaratish, slaydlar, matn va rasm joylashtirish." },
  { ic: "sparkles", t: "PowerPoint 2", d: "Animatsiya va o'tishlar, dizayn va chiqish qilish sirlari." },
  { ic: "palette", t: "Canva", d: "Afisha, post va taklifnomalarni tayyor shablonlar bilan chiroyli dizayn qilish." },
  { ic: "file-text", t: "Google Docs", d: "Onlayn hujjat, birgalikda tahrirlash va havola orqali ulashish." },
  { ic: "sheet", t: "Google Sheets", d: "Onlayn jadvallar, formulalar va jamoa bilan birga ishlash." },
  { ic: "list-checks", t: "Google Forms", d: "So'rovnoma va test yaratish, javoblarni yig'ish va tahlil qilish." },
];
const lessonsEl = $("#lessons");
lessonsEl.innerHTML = lessons.map((l, i) => `
  <button class="lesson reveal" style="transition-delay:${(i % 4) * 70}ms" aria-expanded="false">
    <span class="check">${icon("check")}</span>
    <span class="num">${String(i + 1).padStart(2, "0")}</span>
    <div class="l-ic">${icon(l.ic)}</div>
    <h4>${l.t}</h4>
    <p class="desc">${l.d}</p>
  </button>`).join("");

// Kartani bosish — ochiladi va "o'rganildi" deb belgilanadi
const doneSet = new Set(JSON.parse(store("done") || "[]"));
const labels = ["Boshlang'ich nuqta", "Zo'r boshlanish!", "Yarim yo'l bosildi", "Deyarli tayyor", "Kompyuter ustasi!"];
function updateProgress() {
  const pct = (doneSet.size / lessons.length) * 100;
  $("#cpFill").style.width = pct + "%";
  $("#cpLabel").textContent = `${doneSet.size}/${lessons.length} · ` +
    labels[doneSet.size === lessons.length ? 4 : Math.min(3, Math.ceil(pct / 34))];
}
$$(".lesson", lessonsEl).forEach((card, i) => {
  if (doneSet.has(i)) card.classList.add("done");
  card.addEventListener("click", () => {
    const open = card.classList.toggle("open");
    card.setAttribute("aria-expanded", open);
    if (!doneSet.has(i)) {
      doneSet.add(i);
      card.classList.add("done");
      store("done", JSON.stringify([...doneSet]));
      updateProgress();
      if (doneSet.size === lessons.length) confetti();
    }
  });
});
updateProgress();

// ===== Paydo bo'lish (scroll reveal) =====
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => io.observe(el));

// ===== Raqamlar sanog'i =====
const countIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.count;
    let n = 0;
    const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 900 / target); };
    step();
    countIO.unobserve(el);
  });
});
$$("[data-count]").forEach(el => countIO.observe(el));

// ===== Hero: almashinuvchi so'zlar =====
const words = ["Word", "Excel", "PowerPoint", "Canva", "Internet", "AI bilan ishlash"];
const typedEl = $("#typed");
let wi = 0, ci = words[0].length, deleting = true;
function typeLoop() {
  const w = words[wi];
  typedEl.textContent = w.slice(0, ci);
  if (deleting) {
    ci--;
    if (ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; }
  } else {
    ci++;
    if (ci > words[wi].length) { deleting = true; ci = words[wi].length; return setTimeout(typeLoop, 1600); }
  }
  setTimeout(typeLoop, deleting ? 55 : 95);
}
if (!reduceMotion) setTimeout(typeLoop, 2600);

// ===== Mini terminal =====
const termLines = [
  '<span class="c">// Codial · 1-dars</span>',
  '<span class="k">const</span> oquvchilar = [<span class="s">"Ixlosbek"</span>, <span class="s">"Islombek"</span>, <span class="s">"Shukrona"</span>];',
  '<span class="k">const</span> ustoz = <span class="s">"Ilhomjon"</span>;',
  'oquvchilar.forEach(o =&gt; organ(o, <span class="s">"AI"</span>));',
  '<span class="g">✓ Kayfiyat: 100%</span>',
];
const termEl = $("#terminal");
function runTerminal() {
  termEl.innerHTML = "";
  let i = 0;
  const next = () => {
    if (i < termLines.length) {
      termEl.innerHTML += (i ? "\n" : "") + termLines[i++];
      setTimeout(next, 700);
    } else setTimeout(runTerminal, 3500);
  };
  next();
}
reduceMotion ? (termEl.innerHTML = termLines.join("\n")) : setTimeout(runTerminal, 1600);

// ===== AI chat namoyishi =====
const chat = [
  ["user", "Excel'da ustundagi sonlarni qanday qo'shaman?"],
  ["bot", "Oson! Katakchaga =SUM(A1:A10) deb yozing va Enter bosing."],
  ["user", "Taqdimotim uchun 3 ta g'oya ber"],
  ["bot", "1) Mening sevimli fanim 2) Kelajak kasbim 3) Farg'ona — go'zal shahrim"],
  ["user", "Rahmat! Endi o'zim sinab ko'raman!"],
  ["bot", "Barakalla! Eng yaxshi o'rganish — amaliyot!"],
];
const chatBody = $("#chatBody");
let chatStarted = false;
function playChat() {
  chatBody.innerHTML = "";
  let i = 0;
  const next = () => {
    if (i >= chat.length) return setTimeout(playChat, 5000);
    const [who, text] = chat[i++];
    const add = () => {
      const m = document.createElement("div");
      m.className = "msg " + who;
      m.textContent = text;
      chatBody.appendChild(m);
      setTimeout(next, 1100);
    };
    if (who === "bot") {
      const t = document.createElement("div");
      t.className = "msg bot typing";
      t.innerHTML = "<i></i><i></i><i></i>";
      chatBody.appendChild(t);
      setTimeout(() => { t.remove(); add(); }, 1000);
    } else add();
  };
  next();
}
new IntersectionObserver((en, obs) => {
  if (en[0].isIntersecting && !chatStarted) { chatStarted = true; playChat(); obs.disconnect(); }
}, { threshold: 0.3 }).observe(chatBody);

// ===== 3D egilish effekti =====
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  $$(".tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

// ===== Raqamni nusxalash =====
const toast = $("#toast");
const toastText = $("#toastText");
$$(".copy").forEach(b => b.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); toastText.textContent = "Nusxalandi"; }
  catch (e) { toastText.textContent = b.dataset.copy; }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}));

// ===== Fon: IT tarmog'i (nuqtalar va chiziqlar) =====
const canvas = $("#network");
const ctx = canvas.getContext("2d");
let pts = [], W, H;
const mouse = { x: -999, y: -999 };
function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(70, Math.floor((W * H) / 22000));
  pts = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
  }));
}
window.addEventListener("resize", resize);
window.addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize();
function draw() {
  const rgb = getComputedStyle(root).getPropertyValue("--net").trim();
  ctx.clearRect(0, 0, W, H);
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.fillStyle = `rgba(${rgb},.45)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * 0.18})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
    if (dm < 170) {
      ctx.strokeStyle = `rgba(${rgb},${(1 - dm / 170) * 0.4})`;
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}
draw();

// ===== Konfetti (barcha darslar belgilanganda) =====
function confetti() {
  const colors = ["#2563eb", "#0ea5e9", "#14b8a6", "#22c55e", "#ffa000"];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement("i");
    Object.assign(c.style, {
      position: "fixed", left: Math.random() * 100 + "vw", top: "-12px", width: "8px", height: "12px",
      background: colors[i % colors.length], zIndex: 500, borderRadius: "2px", pointerEvents: "none",
    });
    document.body.appendChild(c);
    c.animate([
      { transform: "translateY(0) rotate(0)" },
      { transform: `translateY(${innerHeight + 40}px) rotate(${Math.random() * 720}deg)` },
    ], { duration: 2000 + Math.random() * 1500, easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => c.remove();
  }
}

$("#year").textContent = new Date().getFullYear();
