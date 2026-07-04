const CONFIG = {
  whatsapp: "6285188915925", // WhatsApp number, country code, no "+" or leading 0
  music: "assets/audio/audio.mp3",
  volume: 0.3,
  loop: true,
  autoplay: true,

  storageKey: "confessionName", // localStorage key used to remember the visitor's name

  texts: {
    loading: "Menyiapkan sesuatu yang spesial... ❤️",

    namePage: {
      title: "Sebelum kita mulai... ❤️",
      subtitle: "Aku ingin memanggilmu dengan namamu.",
      placeholder: "Tulis nama kamu...",
      button: "Mulai",
      errorEmpty: "Masukkan dulu namamu ya ❤️",
    },

    renameLabel: "✎ Ganti Nama",
    audioUnlockText: "Tap untuk Memulai",

    opening: [
      "Hai, {nama} 😊",
      "Aku punya sesuatu yang ingin aku sampaikan...",
      "Walaupun kita baru kenal beberapa hari...",
      "Tapi aku senang bisa ngobrol dan kenal sama kamu.",
      "Semoga kamu suka dengan kejutan kecil ini ❤️",
    ],

    timelineTitle: "Cerita Singkat Kita",
    timeline: [
      { icon: "👋", label: "Pertama Kenal" },
      { icon: "💬", label: "Mulai Chat" },
      { icon: "😄", label: "Semakin Seru" },
      { icon: "❤️", label: "Mulai Suka" },
      { icon: "✨", label: "Hari Ini" },
    ],

    confession: [
      "{nama}...",
      "Mungkin ini terdengar cukup cepat...",
      "Tapi aku ingin jujur sama perasaanku.",
      "Setiap ngobrol sama kamu rasanya selalu menyenangkan.",
      "Aku nyaman mengenal kamu.",
      "Aku ingin mengenal kamu lebih jauh lagi.",
      "Kalau kamu bersedia...",
      "Aku ingin menjalani semuanya bersama kamu.",
      "Boleh nggak aku jadi orang yang spesial buat kamu? ❤️",
    ],

    question: {
      heading: "Maukah Kamu Menjadi Pacarku? ❤️",
      yesLabel: "❤️ Iya, Aku Mau",
      noLabel: "💔 Tidak",

      noEvasiveTexts: [
        "Yakin nih? 🥺",
        "Coba dipikir lagi...",
        "Kasih aku kesempatan ya ❤️",
        "Aku serius loh 😊",
        "Sekali lagi ya...",
        "Semoga jawabannya berubah ❤️",
      ],

      popupText: "Hehe...<br>Aku tetap berharap jawabanmu adalah <b>Iya</b> ❤️",
    },

    celebration: {
      title: "YEAAYYY!! ❤️",
      lines: [
        "Makasih udah nerima aku 🥹",
        "Aku bakal berusaha jadi yang terbaik buat kamu.",
        "{nama}...",
        "Mulai hari ini, semoga kita bisa saling menjaga dan bahagia bareng ❤️",
      ],
    },

    buttons: {
      next: "Lanjut ➜",
      nextHeart: "Lanjut ❤️",
      sendWhatsapp: "❤️ Kirim Jawaban ke WhatsApp",
      restart: "🔄 Ulangi",
    },

    whatsappMessage:
      "Hai ❤️ Aku mau jadi pacarmu. Mulai hari ini kita resmi yaa 🥰",
  },
};

/* =========================================================================
   DOM REFERENCES
   ========================================================================= */
const dom = {
  loadingScreen: document.getElementById("loadingScreen"),
  loadingText: document.getElementById("loadingText"),

  nameScreen: document.getElementById("nameScreen"),
  nameCard: document.getElementById("nameCard"),
  nameTitle: document.getElementById("nameTitle"),
  nameSubtitle: document.getElementById("nameSubtitle"),
  nameInput: document.getElementById("nameInput"),
  nameError: document.getElementById("nameError"),
  startBtn: document.getElementById("startBtn"),

  renameFixedBtn: document.getElementById("renameFixedBtn"),

  audioUnlock: document.getElementById("audioUnlock"),
  audioUnlockText: document.getElementById("audioUnlockText"),

  scene1: document.getElementById("scene1"),
  typewriter1: document.getElementById("typewriter1"),
  scene1Next: document.getElementById("scene1Next"),

  scene2: document.getElementById("scene2"),
  timelineTitle: document.getElementById("timelineTitle"),
  timeline: document.getElementById("timeline"),
  scene2Next: document.getElementById("scene2Next"),

  scene3: document.getElementById("scene3"),
  typewriter3: document.getElementById("typewriter3"),
  scene3Next: document.getElementById("scene3Next"),

  scene4: document.getElementById("scene4"),
  scene4Name: document.getElementById("scene4Name"),
  questionText: document.getElementById("questionText"),
  yesBtn: document.getElementById("yesBtn"),
  noBtn: document.getElementById("noBtn"),
  noPopup: document.getElementById("noPopup"),
  noPopupText: document.getElementById("noPopupText"),

  scene5: document.getElementById("scene5"),
  celebrationTitle: document.getElementById("celebrationTitle"),
  celebrationLines: document.getElementById("celebrationLines"),
  waBtn: document.getElementById("waBtn"),
  restartBtn: document.getElementById("restartBtn"),

  floatingLayer: document.getElementById("floatingLayer"),
  cursorTrailCanvas: document.getElementById("cursorTrail"),
  effectsCanvas: document.getElementById("effectsCanvas"),
  bgGradient: document.querySelector(".bg-gradient"),
};

let currentName = "";

/* =========================================================================
   SMALL UTILITIES
   ========================================================================= */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Replaces every {nama} placeholder with the visitor's saved name
function replaceName(str) {
  return str.replaceAll("{nama}", currentName);
}

/* =========================================================================
   LOCAL STORAGE (visitor name)
   ========================================================================= */
function saveName(name) {
  try {
    localStorage.setItem(CONFIG.storageKey, name);
  } catch (e) {
    /* localStorage unavailable — flow continues without persistence */
  }
}

function loadName() {
  try {
    return localStorage.getItem(CONFIG.storageKey);
  } catch (e) {
    return null;
  }
}

function clearName() {
  try {
    localStorage.removeItem(CONFIG.storageKey);
  } catch (e) {
    /* ignore */
  }
}

/* =========================================================================
   AUDIO SYSTEM
   ========================================================================= */
let bgMusic = null;

function initAudio() {
  bgMusic = new Audio(CONFIG.music);
  bgMusic.loop = CONFIG.loop;
  bgMusic.volume = CONFIG.volume;
  bgMusic.addEventListener("error", () => {
    console.log("Background music not found.");
  });
}

// Returns a promise resolving true if playback actually started
function playMusic() {
  if (!bgMusic) return Promise.resolve(false);
  return bgMusic
    .play()
    .then(() => true)
    .catch(() => false);
}

function pauseMusic() {
  if (bgMusic) bgMusic.pause();
}

function stopMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function restartMusic() {
  if (!bgMusic) return;
  bgMusic.currentTime = 0;
  playMusic();
}

function setVolume(value) {
  if (bgMusic) bgMusic.volume = Math.min(1, Math.max(0, value));
}

// Shows the "Tap untuk Memulai" overlay and resolves once the user has
// tapped it and playback has started.
function waitForAudioUnlock() {
  return new Promise((resolve) => {
    dom.audioUnlock.classList.remove("hidden");
    function handler() {
      dom.audioUnlock.removeEventListener("click", handler);
      dom.audioUnlock.classList.add("hidden");
      playMusic().finally(resolve);
    }
    dom.audioUnlock.addEventListener("click", handler);
  });
}

// Attempts to start music; falls back to the tap-to-start overlay if the
// browser's autoplay policy blocked it.
async function ensureMusicPlaying() {
  if (!CONFIG.autoplay) return;
  const started = await playMusic();
  if (!started) {
    await waitForAudioUnlock();
  }
}

/* =========================================================================
   SCENE / SCREEN MANAGEMENT
   ========================================================================= */
function showScreen(el) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.add("hidden");
    s.classList.remove("scene-enter");
  });
  el.classList.remove("hidden");
  // force reflow so the enter animation replays every time
  void el.offsetWidth;
  el.classList.add("scene-enter");
}

/* =========================================================================
   TYPEWRITER EFFECT — stacked, fading/zooming lines
   ========================================================================= */
function typeLine(container, text, speed = 42) {
  return new Promise((resolve) => {
    const p = document.createElement("p");
    p.className = "typewriter-line typing";
    container.appendChild(p);

    let i = 0;
    (function tick() {
      if (i <= text.length) {
        p.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        p.classList.remove("typing");
        resolve();
      }
    })();
  });
}

async function playTypewriterSequence(
  container,
  rawLines,
  { speed = 42, linePause = 550 } = {},
) {
  container.innerHTML = "";
  for (const rawLine of rawLines) {
    await typeLine(container, replaceName(rawLine), speed);
    await sleep(linePause);
  }
}

/* =========================================================================
   AMBIENT FLOATING HEARTS / SPARKLES (background depth layer)
   ========================================================================= */
const FLOATING_SYMBOLS = ["❤️", "✨", "💗", "💫"];
let floatingIntervalId = null;

function spawnFloatingItem() {
  const item = document.createElement("div");
  item.className = "floating-item";
  item.textContent = randomFrom(FLOATING_SYMBOLS);

  const size = randRange(14, 30);
  const left = randRange(2, 96);
  const duration = randRange(9, 17);
  const drift = randRange(-60, 60);

  item.style.left = left + "vw";
  item.style.fontSize = size + "px";
  item.style.setProperty("--drift", drift + "px");
  item.style.animationDuration = duration + "s";

  dom.floatingLayer.appendChild(item);
  setTimeout(() => item.remove(), duration * 1000 + 200);
}

function startFloatingAmbience() {
  if (floatingIntervalId) return;
  spawnFloatingItem();
  floatingIntervalId = setInterval(spawnFloatingItem, 900);
}

/* =========================================================================
   CURSOR / TOUCH LOVE TRAIL
   ========================================================================= */
const trailCtx = dom.cursorTrailCanvas.getContext("2d");
let trailParticles = [];

function resizeCanvases() {
  [dom.cursorTrailCanvas, dom.effectsCanvas].forEach((c) => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });
}
window.addEventListener("resize", resizeCanvases);
resizeCanvases();

function addTrailParticle(x, y) {
  trailParticles.push({
    x,
    y,
    size: randRange(8, 16),
    life: 1,
    symbol: Math.random() > 0.5 ? "❤️" : "✨",
    vy: -randRange(0.3, 0.9),
  });
}

let lastTrailTime = 0;
window.addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastTrailTime < 60) return; // throttle
  lastTrailTime = now;
  addTrailParticle(e.clientX, e.clientY);
});

function renderTrail() {
  trailCtx.clearRect(
    0,
    0,
    dom.cursorTrailCanvas.width,
    dom.cursorTrailCanvas.height,
  );
  trailParticles.forEach((p) => {
    p.life -= 0.02;
    p.y += p.vy;
    trailCtx.globalAlpha = Math.max(p.life, 0);
    trailCtx.font = `${p.size}px sans-serif`;
    trailCtx.fillText(p.symbol, p.x, p.y);
  });
  trailParticles = trailParticles.filter((p) => p.life > 0);
  trailCtx.globalAlpha = 1;
  requestAnimationFrame(renderTrail);
}
requestAnimationFrame(renderTrail);

/* =========================================================================
   RIPPLE CLICK EFFECT (delegated to any .btn)
   ========================================================================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = e.clientX - rect.left - size / 2 + "px";
  ripple.style.top = e.clientY - rect.top - size / 2 + "px";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 620);
});

/* =========================================================================
   CONFETTI / HEART RAIN / SPARKLE PARTICLE SYSTEM (effectsCanvas)
   ========================================================================= */
const effectsCtx = dom.effectsCanvas.getContext("2d");
let effectParticles = [];
let effectsLoopRunning = false;

const CONFETTI_COLORS = ["#d9b77d", "#e8a5c4", "#ffd9e8", "#f0dcb3", "#6b2049"];

function spawnConfetti(count = 60, originX = null, originY = null) {
  const ox = originX ?? window.innerWidth / 2;
  const oy = originY ?? window.innerHeight / 2;
  for (let i = 0; i < count; i++) {
    effectParticles.push({
      type: "confetti",
      x: ox,
      y: oy,
      vx: randRange(-6, 6),
      vy: randRange(-9, -2),
      gravity: 0.22,
      rot: randRange(0, 360),
      rotSpeed: randRange(-10, 10),
      size: randRange(6, 11),
      color: randomFrom(CONFETTI_COLORS),
      life: 1,
      decay: randRange(0.006, 0.012),
    });
  }
  runEffectsLoop();
}

function spawnHeartRain(count = 45) {
  for (let i = 0; i < count; i++) {
    effectParticles.push({
      type: "heart",
      x: randRange(0, window.innerWidth),
      y: randRange(-120, -10),
      vx: randRange(-0.6, 0.6),
      vy: randRange(1.5, 3.2),
      gravity: 0.01,
      rot: 0,
      rotSpeed: randRange(-2, 2),
      size: randRange(14, 26),
      symbol: Math.random() > 0.5 ? "❤️" : "💕",
      life: 1,
      decay: 0.0035,
    });
  }
  runEffectsLoop();
}

function spawnSparkles(count = 30, originX = null, originY = null) {
  const ox = originX ?? window.innerWidth / 2;
  const oy = originY ?? window.innerHeight / 2;
  for (let i = 0; i < count; i++) {
    effectParticles.push({
      type: "sparkle",
      x: ox + randRange(-60, 60),
      y: oy + randRange(-60, 60),
      vx: randRange(-1, 1),
      vy: randRange(-2, -0.5),
      gravity: -0.01,
      rot: 0,
      rotSpeed: 0,
      size: randRange(10, 18),
      life: 1,
      decay: randRange(0.012, 0.02),
    });
  }
  runEffectsLoop();
}

function runEffectsLoop() {
  if (effectsLoopRunning) return;
  effectsLoopRunning = true;
  requestAnimationFrame(effectsTick);
}

function effectsTick() {
  effectsCtx.clearRect(0, 0, dom.effectsCanvas.width, dom.effectsCanvas.height);

  effectParticles.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpeed;
    p.life -= p.decay;

    effectsCtx.save();
    effectsCtx.globalAlpha = Math.max(p.life, 0);
    effectsCtx.translate(p.x, p.y);
    effectsCtx.rotate((p.rot * Math.PI) / 180);

    if (p.type === "confetti") {
      effectsCtx.fillStyle = p.color;
      effectsCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
    } else if (p.type === "heart") {
      effectsCtx.font = `${p.size}px sans-serif`;
      effectsCtx.textAlign = "center";
      effectsCtx.fillText(p.symbol, 0, 0);
    } else if (p.type === "sparkle") {
      effectsCtx.font = `${p.size}px sans-serif`;
      effectsCtx.textAlign = "center";
      effectsCtx.fillText("✨", 0, 0);
    }
    effectsCtx.restore();
  });

  effectParticles = effectParticles.filter(
    (p) => p.life > 0 && p.y < dom.effectsCanvas.height + 60,
  );

  if (effectParticles.length > 0) {
    requestAnimationFrame(effectsTick);
  } else {
    effectsLoopRunning = false;
    effectsCtx.clearRect(
      0,
      0,
      dom.effectsCanvas.width,
      dom.effectsCanvas.height,
    );
  }
}

/* =========================================================================
   NAME SCREEN
   ========================================================================= */
function populateStaticTexts() {
  dom.loadingText.textContent = CONFIG.texts.loading;

  dom.nameTitle.textContent = CONFIG.texts.namePage.title;
  dom.nameSubtitle.textContent = CONFIG.texts.namePage.subtitle;
  dom.nameInput.placeholder = CONFIG.texts.namePage.placeholder;
  dom.nameError.textContent = CONFIG.texts.namePage.errorEmpty;
  dom.startBtn.textContent = CONFIG.texts.namePage.button;

  dom.renameFixedBtn.textContent = CONFIG.texts.renameLabel;
  dom.audioUnlockText.textContent = CONFIG.texts.audioUnlockText;

  dom.scene1Next.textContent = CONFIG.texts.buttons.next;
  dom.timelineTitle.textContent = CONFIG.texts.timelineTitle;
  dom.scene2Next.textContent = CONFIG.texts.buttons.nextHeart;
  dom.scene3Next.textContent = CONFIG.texts.buttons.nextHeart;

  dom.questionText.textContent = CONFIG.texts.question.heading;
  dom.yesBtn.textContent = CONFIG.texts.question.yesLabel;
  dom.noBtn.textContent = CONFIG.texts.question.noLabel;
  dom.noPopupText.innerHTML = CONFIG.texts.question.popupText;

  dom.celebrationTitle.textContent = CONFIG.texts.celebration.title;
  dom.waBtn.textContent = CONFIG.texts.buttons.sendWhatsapp;
  dom.restartBtn.textContent = CONFIG.texts.buttons.restart;
}

function showNameError() {
  dom.nameError.classList.remove("hidden");
  dom.nameCard.classList.remove("shake");
  void dom.nameCard.offsetWidth;
  dom.nameCard.classList.add("shake");
}

function validateName(value) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && trimmed.length <= 30;
}

function handleStart() {
  const value = dom.nameInput.value;
  if (!validateName(value)) {
    showNameError();
    return;
  }
  dom.nameError.classList.add("hidden");
  currentName = value.trim();
  saveName(currentName);
  beginJourney(true); // true = this call is inside a direct user gesture (click)
}

function handleRename() {
  clearName();
  currentName = "";
  stopMusic();
  dom.nameInput.value = "";
  dom.renameFixedBtn.classList.add("hidden");
  showScreen(dom.nameScreen);
  dom.nameInput.focus();
}

/* =========================================================================
   SCENE 1 — OPENING
   ========================================================================= */
async function runScene1() {
  dom.scene1Next.classList.add("hidden");
  showScreen(dom.scene1);
  await playTypewriterSequence(dom.typewriter1, CONFIG.texts.opening);
  dom.scene1Next.classList.remove("hidden");
}

/* =========================================================================
   SCENE 2 — TIMELINE
   ========================================================================= */
async function runScene2() {
  dom.scene2Next.classList.add("hidden");
  dom.timeline.innerHTML = "";
  showScreen(dom.scene2);

  CONFIG.texts.timeline.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `<span class="t-icon">${item.icon}</span><span class="t-label">${item.label}</span>`;
    dom.timeline.appendChild(el);
  });

  const items = dom.timeline.querySelectorAll(".timeline-item");
  for (const item of items) {
    item.classList.add("visible");
    await sleep(420);
  }
  await sleep(300);
  dom.scene2Next.classList.remove("hidden");
}

/* =========================================================================
   SCENE 3 — CONFESSION
   ========================================================================= */
async function runScene3() {
  dom.scene3Next.classList.add("hidden");
  showScreen(dom.scene3);
  await playTypewriterSequence(dom.typewriter3, CONFIG.texts.confession);

  spawnConfetti(35, window.innerWidth / 2, window.innerHeight / 2);
  await sleep(400);
  dom.scene3Next.classList.remove("hidden");
}

/* =========================================================================
   SCENE 4 — THE QUESTION (with the evasive "Tidak" button)
   ========================================================================= */
let dodgeCount = 0;
let dodgeCooldown = false;
let mouseMoveHandler = null;

function getSafeRandomPosition(el) {
  const w = el.offsetWidth || 140;
  const h = el.offsetHeight || 50;
  const pad = 16;
  const maxX = Math.max(pad, window.innerWidth - w - pad);
  const maxY = Math.max(pad, window.innerHeight - h - pad);
  return {
    x: randRange(pad, maxX),
    y: randRange(pad, maxY),
  };
}

function growYesButton() {
  dodgeCount = Math.min(dodgeCount + 1, 10);
  const scale = 1 + dodgeCount * 0.05;
  dom.yesBtn.style.transform = `scale(${scale})`;
}

function dodgeNoButton() {
  if (dodgeCooldown) return;
  dodgeCooldown = true;
  setTimeout(() => {
    dodgeCooldown = false;
  }, 150);

  dom.noBtn.classList.add("dodging");
  const pos = getSafeRandomPosition(dom.noBtn);
  dom.noBtn.style.left = pos.x + "px";
  dom.noBtn.style.top = pos.y + "px";
  dom.noBtn.style.transform = `rotate(${randRange(-25, 25)}deg) scale(${randRange(0.85, 1.2)})`;
  dom.noBtn.textContent = randomFrom(CONFIG.texts.question.noEvasiveTexts);

  growYesButton();
}

function resetNoButton() {
  dom.noBtn.classList.remove("dodging");
  dom.noBtn.style.left = "";
  dom.noBtn.style.top = "";
  dom.noBtn.style.transform = "";
  dom.noBtn.textContent = CONFIG.texts.question.noLabel;
  dom.yesBtn.style.transform = "";
  dodgeCount = 0;
}

function startNoButtonEvasion() {
  const PROXIMITY = 110;
  mouseMoveHandler = (e) => {
    const rect = dom.noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < PROXIMITY) dodgeNoButton();
  };
  window.addEventListener("mousemove", mouseMoveHandler);

  // touch devices: dodge immediately on touch and cancel the tap so it
  // never registers as a real click on "Tidak"
  dom.noBtn.addEventListener("touchstart", onNoButtonTouch, { passive: false });
}

function stopNoButtonEvasion() {
  if (mouseMoveHandler)
    window.removeEventListener("mousemove", mouseMoveHandler);
  dom.noBtn.removeEventListener("touchstart", onNoButtonTouch);
}

function onNoButtonTouch(e) {
  e.preventDefault();
  dodgeNoButton();
}

function showNoPopup() {
  dom.noPopup.classList.remove("hidden");
  setTimeout(() => dom.noPopup.classList.add("hidden"), 2200);
}

async function runScene4() {
  resetNoButton();
  dom.scene4Name.textContent = replaceName("{nama}...");
  showScreen(dom.scene4);
  startNoButtonEvasion();
}

function handleNoClick() {
  // Only reachable in the rare case a real click slips through evasion.
  showNoPopup();
  dodgeNoButton();
}

async function handleYesClick() {
  stopNoButtonEvasion();
  dom.yesBtn.disabled = true;
  await runCelebration();
}

/* =========================================================================
   SCENE 5 — CELEBRATION / FINAL
   ========================================================================= */
async function runCelebration() {
  // Big multi-effect celebration burst
  dom.bgGradient.classList.add("celebrate");
  spawnConfetti(90, window.innerWidth / 2, window.innerHeight * 0.35);
  spawnHeartRain(50);
  spawnSparkles(40, window.innerWidth / 2, window.innerHeight * 0.4);

  await sleep(500);

  dom.celebrationLines.innerHTML = "";
  CONFIG.texts.celebration.lines.forEach((line) => {
    const p = document.createElement("p");
    p.className = "celebration-text";
    p.textContent = replaceName(line);
    dom.celebrationLines.appendChild(p);
  });

  const waMessage = replaceName(CONFIG.texts.whatsappMessage);
  dom.waBtn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  showScreen(dom.scene5);

  // a gentle secondary sparkle wave shortly after arriving on the scene
  setTimeout(() => spawnSparkles(20), 900);
}

function handleRestart() {
  dom.bgGradient.classList.remove("celebrate");
  dom.yesBtn.disabled = false;
  restartMusic();
  runScene1();
}

/* =========================================================================
   JOURNEY ORCHESTRATION
   ========================================================================= */
async function beginJourney(fromUserGesture) {
  dom.renameFixedBtn.classList.remove("hidden");

  if (fromUserGesture) {
    // We are inside a genuine click handler right now, so autoplay is
    // very likely to be allowed by the browser.
    await ensureMusicPlaying();
  } else {
    // Returning visitor: no fresh gesture this session, autoplay may be
    // blocked, the tap-to-start overlay will catch that case.
    await ensureMusicPlaying();
  }

  await runScene1();
}

/* =========================================================================
   INIT
   ========================================================================= */
function wireEvents() {
  dom.startBtn.addEventListener("click", handleStart);
  dom.nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleStart();
  });
  dom.renameFixedBtn.addEventListener("click", handleRename);

  dom.scene1Next.addEventListener("click", runScene2);
  dom.scene2Next.addEventListener("click", runScene3);
  dom.scene3Next.addEventListener("click", runScene4);

  dom.yesBtn.addEventListener("click", handleYesClick);
  dom.noBtn.addEventListener("click", handleNoClick);

  dom.restartBtn.addEventListener("click", handleRestart);
}

async function init() {
  populateStaticTexts();
  initAudio();
  wireEvents();
  startFloatingAmbience();

  showScreen(dom.loadingScreen);
  await sleep(3000);

  const savedName = loadName();

  if (savedName) {
    currentName = savedName;
    dom.nameInput.value = savedName;
    // Returning visitor — skip straight into the journey.
    showScreen(dom.scene1);
    await beginJourney(false);
  } else {
    showScreen(dom.nameScreen);
    dom.nameInput.focus();
  }
}

document.addEventListener("DOMContentLoaded", init);
