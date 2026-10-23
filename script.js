/* =========================================
   🐱 МУРЧАЩИЙ МИР — main script
   ========================================= */

/* ---------- ЗВУК (Web Audio API) ---------- */
let soundEnabled = true;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Генерируем "мяу" через осцилляторы
function playMeow(pitch = 1) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Скользящий тон — похоже на "мяу"
    osc.frequency.setValueAtTime(500 * pitch, now);
    osc.frequency.linearRampToValueAtTime(900 * pitch, now + 0.15);
    osc.frequency.linearRampToValueAtTime(400 * pitch, now + 0.45);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) { /* ignore */ }
}

// Короткий "пик" при клике
function playPop() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
}

document.getElementById('sound-toggle').addEventListener('click', (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? '🔊 Звук вкл' : '🔇 Звук выкл';
  if (soundEnabled) playPop();
});

/* ---------- КОТЫ ---------- */
const cats = [
  { emoji: '🐱', name: 'Мурзик',    desc: 'Любит спать на клавиатуре' },
  { emoji: '🐈', name: 'Барсик',    desc: 'Царь дивана' },
  { emoji: '🐈‍⬛', name: 'Пушок',   desc: 'Ночной охотник' },
  { emoji: '😺', name: 'Соня',      desc: 'Спит 20 часов в сутки' },
  { emoji: '😸', name: 'Рыжик',     desc: 'Профессиональный попрошайка' },
  { emoji: '😻', name: 'Ласка',     desc: 'Любит обнимашки' },
  { emoji: '😼', name: 'Хитрец',    desc: 'Знает, где лежит еда' },
  { emoji: '😽', name: 'Неженка',   desc: 'Мурчит громче пылесоса' },
  { emoji: '🙀', name: 'Трусишка',  desc: 'Боится огурцов' },
  { emoji: '😿', name: 'Грустик',   desc: 'Хочет ещё вкусняшку' },
  { emoji: '😾', name: 'Ворчун',    desc: 'Не доволен всем' },
  { emoji: '🐾', name: 'Следопыт',  desc: 'Оставляет следы везде' },
];

const grid = document.getElementById('cats-grid');
cats.forEach((cat, i) => {
  const card = document.createElement('div');
  card.className = 'cat-card';
  card.innerHTML = `
    <span class="cat-emoji">${cat.emoji}</span>
    <div class="cat-name">${cat.name}</div>
    <div class="cat-desc">${cat.desc}</div>
  `;
  card.addEventListener('click', (e) => {
    playMeow(0.7 + Math.random() * 0.7);
    spawnConfetti(e.clientX, e.clientY, ['🐾', '❤️', '✨', '🐟']);
  });
  grid.appendChild(card);
});

/* ---------- КОНФЕТТИ ---------- */
function spawnConfetti(x, y, symbols = ['✨']) {
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `translate(${Math.random() * 100 - 50}px, 0)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ---------- ФАКТЫ ---------- */
const facts = [
  'Коты спят 12–16 часов в сутки — почти 70% жизни! 😴',
  'У кошек 32 мышцы в каждом ухе. Они могут поворачивать уши на 180°. 👂',
  'Мурлыканье (25–150 Гц) помогает котам восстанавливаться после травм. 🎵',
  'Коты не чувствуют сладкий вкус — у них нет нужного рецептора. 🍬',
  'Нос кота уникален, как отпечаток пальца у человека. 👃',
  'Кошки могут издавать около 100 разных звуков, собаки — только 10. 🗣️',
  'У взрослых котов 30 зубов, у котят — 26 молочных. 🦷',
  'Кот не потеет — охлаждается через подушечки лап. 🐾',
  'Сердце кота бьётся в 2 раза быстрее человеческого — 150–220 уд/мин. ❤️',
  'Кошки видят в темноте в 6 раз лучше людей. 🌙',
  'Кот трётся о ноги не из любви, а чтобы пометить тебя своим запахом. 😼',
  'Самый старый кот прожил 38 лет и 3 дня — Creme Puff из Техаса. 🎂',
  'Коты не любят воду, но некоторые породы (турецкий ван) обожают плавать. 🏊',
  'Мурчание может ускорять заживление костей. 🦴',
  'Кошки различают красный и зелёный цвета хуже, чем синий и жёлтый. 🎨',
];

const factText = document.getElementById('fact-text');
let lastFact = -1;

document.getElementById('new-fact').addEventListener('click', () => {
  let idx;
  do { idx = Math.floor(Math.random() * facts.length); } while (idx === lastFact);
  lastFact = idx;
  factText.textContent = facts[idx];
  playPop();
});

/* ---------- ИГРА 1: ПОЙМАЙ КОТА ---------- */
const catchArea = document.getElementById('catch-area');
const catchTimerEl = document.getElementById('catch-timer');
const catchScoreEl = document.getElementById('catch-score');
const catchStartBtn = document.getElementById('catch-start');

let catchScore = 0;
let catchTimeLeft = 20;
let catchInterval = null;
let catchS
