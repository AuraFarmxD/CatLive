// ==========================================
// СУПЕР-СКРИПТ ДЛЯ САЙТА "МИР КОТИКОВ" (Big Update)
// Вставь это в файл script.js
// ==========================================

// --- 1. ЗВУКИ (Web Audio API) ---
let audioCtx;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(freq, duration, type = 'sine', vol = 0.1) {
  if (!soundEnabled) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function meow() {
  playSound(800, 0.2, 'sine');
  setTimeout(() => playSound(600, 0.3, 'sine'), 100);
  setTimeout(() => playSound(700, 0.2, 'sine'), 200);
}

function purr() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => playSound(120, 0.1, 'triangle', 0.05), i * 100);
  }
}

function playErrorSound() {
  playSound(200, 0.3, 'sawtooth', 0.1);
}

// Кнопка звука
document.getElementById('sound-toggle')?.addEventListener('click', function() {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? '🔊' : '🔇';
  this.style.opacity = soundEnabled ? '1' : '0.5';
  if (soundEnabled) playSound(1000, 0.1);
});

// --- 2. ПРЕЛОАДЕР ---
window.addEventListener('load', () => {
  const fill = document.getElementById('preloader-fill');
  const preloader = document.getElementById('preloader');
  if (!fill || !preloader) return;
  
  let width = 0;
  const interval = setInterval(() => {
    width += Math.random() * 20; // Рандомная загрузка для реализма
    if (width > 100) width = 100;
    fill.style.width = width + '%';
    
    if (width >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 300);
    }
  }, 100);
});

// --- 3. СТАТИСТИКА ---
let statMeows = 0;
let statClicks = 0;

function addClick() {
  statClicks++;
  const el = document.getElementById('stat-clicks');
  if (el) el.textContent = statClicks;
}

function addMeow() {
  statMeows++;
  const el = document.getElementById('stat-meows');
  if (el) el.textContent = statMeows;
}

// --- 4. НАВИГАЦИЯ ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    btn.classList.add('active');
    const sectionId = 'section-' + btn.dataset.section;
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
    
    addClick();
    playSound(1000, 0.1, 'square');
  });
});

// Кнопка на главной
document.getElementById('start-btn')?.addEventListener('click', () => {
  document.querySelector('[data-section="cats"]')?.click();
});

// --- 5. КОТЫ (ОГРОМНЫЙ СПИСОК) ---
const cats = [
  { emoji: '🐱', name: 'Мурзик', desc: 'Любит спать на клавиатуре' },
  { emoji: '😺', name: 'Барсик', desc: 'Мастер по ловле лазерных точек' },
  { emoji: '😸', name: 'Васька', desc: 'Обожает сметану больше жизни' },
  { emoji: '😹', name: 'Пушок', desc: 'Пушистый до невозможности' },
  { emoji: '😻', name: 'Снежок', desc: 'Белый как первый снег' },
  { emoji: '😼', name: 'Тихон', desc: 'Хитрый, как лиса' },
  { emoji: '😽', name: 'Мурка', desc: 'Самая нежная кошечка' },
  { emoji: '🙀', name: 'Рыжик', desc: 'Всё время удивлён' },
  { emoji: '😾', name: 'Гоша', desc: 'Серьёзный, но добрый' },
  { emoji: '🐈', name: 'Черныш', desc: 'Ночной охотник' },
  { emoji: '🐈‍⬛', name: 'Дымок', desc: 'Пушистый чёрный кот' },
  { emoji: '🐾', name: 'След', desc: 'Оставляет лапки везде' },
  { emoji: '🐈', name: 'Барс', desc: 'Сильный и независимый' },
  { emoji: '🐱', name: 'Клякса', desc: 'Игривый котёнок' },
  { emoji: '😺', name: 'Леопольд', desc: 'Ребята, давайте жить дружно!' },
  { emoji: '😸', name: 'Матроскин', desc: 'Экономный и хозяйственный' },
  { emoji: '😻', name: 'Том', desc: 'Вечно гоняется за Джерри' },
  { emoji: '😼', name: 'Гарфилд', desc: 'Обожает лазанью' },
  { emoji: '😽', name: 'Кот Бегемот', desc: 'Умеет разговаривать' },
  { emoji: '🙀', name: 'Саймон', desc: 'Очень голодный кот' }
];

const catsGrid = document.getElementById('cats-grid');
if (catsGrid) {
  cats.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    card.innerHTML = `
      <div style="font-size: 4rem;">${cat.emoji}</div>
      <h3 style="margin: 10px 0; color: #5a3e2b;">${cat.name}</h3>
      <p style="color: #7a5c3e; font-size: 0.9rem;">${cat.desc}</p>
    `;
    card.addEventListener('click', () => {
      meow();
      addMeow();
      addClick();
      card.style.transform = 'scale(0.9)';
      setTimeout(() => card.style.transform = '', 150);
    });
    catsGrid.appendChild(card);
  });
}

// --- 6. ФАКТЫ (БОЛЬШОЙ СПИСОК) ---
const facts = [
  "Кошки спят около 16 часов в сутки — это почти 70% их жизни! 😴",
  "Нос кошки уникален, как отпечаток пальца у человека. 🔍",
  "Кошки не чувствуют сладкого вкуса — у них нет нужных рецепторов. 🍭",
  "У кошек около 32 мышц в каждом ухе — они могут поворачивать их на 180°. 👂",
  "Мурчание кошки имеет частоту 25-150 Гц и помогает заживлению костей. 💆",
  "Кошки могут издавать около 100 разных звуков, собаки — только 10. 🎵",
  "В Древнем Египте кошек обожествляли и считали символом богини Бастет. 🏺",
  "Кошки видят в темноте в 6 раз лучше человека. 🌙",
  "Сердце кошки бьётся в 2 раза быстрее человеческого — 110-140 ударов/мин. ❤️",
  "У кошек есть «третий глаз» — мигательная перепонка для защиты глаз. 👁️",
  "Кошки не любят воду, потому что их шерсть плохо сохнет и становится тяжёлой. 💧",
  "Кошка может прыгнуть в высоту до 2 метров — в 5 раз выше своего роста! 🦘",
  "Усы кошки — это орган чувств, помогающий ориентироваться в пространстве. 📏",
  "Кошки мяукают только для людей — между собой они общаются иначе. 🗣️",
  "Самой старой кошке в мире было 38 лет — это почти 170 кошачьих лет! 🎂",
  "Кошки потеют только через подушечки лап. 🐾",
  "Рисунок на носу кошки так же уникален, как отпечаток пальца. 🖌️",
  "Кошка может бежать со скоростью до 48 км/ч на короткие дистанции. 🏃",
  "Около 70% всех кошек имеют характерный рисунок «табби» полосками. 🎨",
  "В Австралии и Антарктиде нет коренных домашних кошек. 🌍",
  "Кошка может поворачивать уши на 180 градусов независимо друг от друга. 👂",
  "У кошек 230 костей, у человека — 206. 🦴",
  "Кошка не может жевать большие куски, так как её челюсть не двигается в стороны. 🍖",
  "Слюна кошки содержит ферменты, помогающие заживлять мелкие ранки. 💦",
  "Кошки любят коробки, потому что они чувствуют себя там в безопасности. 📦"
];

let currentFactIndex = 0;

function showNextFact() {
  const factText = document.getElementById('fact-text');
  if (!factText) return;
  
  currentFactIndex = (currentFactIndex + 1) % facts.length;
  
  factText.style.opacity = 0;
  factText.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    factText.textContent = facts[currentFactIndex];
    factText.style.opacity = 1;
    factText.style.transform = 'translateY(0)';
  }, 200);
  
  meow();
  addClick();
}

document.getElementById('new-fact')?.addEventListener('click', showNextFact);

// --- 7. МИНИ-ИГРА: ПОЙМАЙ МЫШКУ ---
let catchScore = 0;
let catchTimeLeft = 30;
let catchInterval = null;
let mouseInterval = null;
let gameRunning = false;

const catchArea = document.getElementById('catch-area');
const catchScoreEl = document.getElementById('catch-score');
const catchTimerEl = document.getElementById('catch-timer');
const catchStartBtn = document.getElementById('catch-start');

catchStartBtn?.addEventListener('click', () => {
  if (gameRunning) return;
  
  gameRunning = true;
  catchScore = 0;
  catchTimeLeft = 30;
  catchScoreEl.textContent = '0';
  catchTimerEl.textContent = '30';
  catchArea.innerHTML = '';
  catchStartBtn.textContent = 'Игра идёт...';
  catchStartBtn.disabled = true;
  catchStartBtn.style.opacity = '0.5';
  
  playSound(1200, 0.2);
  addClick();

  catchInterval = setInterval(() => {
    catchTimeLeft--;
    catchTimerEl.textContent = catchTimeLeft;
    if (catchTimeLeft <= 0) endGame();
  }, 1000);

  mouseInterval = setInterval(spawnMouse, 600);
  spawnMouse();
});

function spawnMouse() {
  if (!gameRunning || !catchArea) return;
  
  const mouse = document.createElement('div');
  mouse.className = 'mouse';
  mouse.textContent = '🐭';
  
  const maxX = catchArea.clientWidth - 60;
  const maxY = catchArea.clientHeight - 60;
  mouse.style.left = Math.random() * maxX + 'px';
  mouse.style.top = Math.random() * maxY + 'px';
  
  mouse.addEventListener('click', () => {
    catchScore++;
    catchScoreEl.textContent = catchScore;
    playSound(1500 + Math.random() * 500, 0.1);
    addClick();
    
    // Эффект исчезновения
    mouse.style.transform = 'scale(1.5)';
    mouse.style.opacity = '0';
    setTimeout(() => mouse.remove(), 150);
  });
  
  catchArea.appendChild(mouse);
  
  setTimeout(() => {
    if (mouse.parentNode) {
      mouse.style.opacity = '0';
      setTimeout(() => mouse.remove(), 200);
    }
  }, 1200);
}

function endGame() {
  clearInterval(catchInterval);
  clearInterval(mouseInterval);
  gameRunning = false;
  
  if (catchArea) {
    catchArea.innerHTML = `
      <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; background:rgba(255,255,255,0.9); border-radius:16px;">
        <h2 style="color:#ff6b9d;">🎉 Игра окончена!</h2>
        <p style="font-size:1.5rem; margin-top:10px;">Поймано мышек: <b style="color:#ffa94d;">${catchScore}</b></p>
        <p style="color:#777; margin-top:5px;">${catchScore > 15 ? 'Ты настоящий охотник!' : 'Неплохо, попробуй еще раз!'}</p>
      </div>
    `;
  }
  
  if (catchStartBtn) {
    catchStartBtn.textContent = '▶ Играть снова';
    catchStartBtn.disabled = false;
    catchStartBtn.style.opacity = '1';
  }
  purr();
}

// --- 8. ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ ---
// Пасхалка: если нажать на заголовок 5 раз
let titleClicks = 0;
document.querySelector('.main-title')?.addEventListener('click', () => {
  titleClicks++;
  playSound(400 + titleClicks * 100, 0.1);
  if (titleClicks >= 5) {
    document.body.style.animation = 'rainbow 2s infinite';
    alert('🐱 Секретный уровень активирован! Ты настоящий кошатник!');
    titleClicks = 0;
  }
});

// Следование курсора за мышкой (лапки)
document.addEventListener('mousemove', (e) => {
  if (Math.random() > 0.95) { // Чтобы не лагало, создаем редко
    const paw = document.createElement('div');
    paw.textContent = '🐾';
    paw.style.position = 'fixed';
    paw.style.left = e.clientX + 'px';
    paw.style.top = e.clientY + 'px';
    paw.style.pointerEvents = 'none';
    paw.style.opacity = '0.5';
    paw.style.fontSize = '20px';
    paw.style.transition = 'all 1s ease-out';
    paw.style.zIndex = '9999';
    document.body.appendChild(paw);
    
    setTimeout(() => {
      paw.style.opacity = '0';
      paw.style.transform = 'translateY(20px) scale(0.5)';
    }, 10);
    
    setTimeout(() => paw.remove(), 1000);
  }
});

console.log('🐱 Мир Котиков (Big Update) успешно загружен!');
