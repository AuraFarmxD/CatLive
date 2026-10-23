// ==========================================================================
// МИР КОТИКОВ - ПОЛНЫЙ СКРИПТ (ВСЁ В ОДНОМ ФАЙЛЕ)
// ==========================================================================

let globalState = { meows: 0, clicks: 0, facts: 0 };
let soundEnabled = true;
let audioCtx = null;

// --- 1. ЗВУКИ (Web Audio API) ---
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { console.warn("Аудио не поддерживается"); }
    }
}

function playTone(freq, dur, type = 'sine', vol = 0.1) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
}

function soundMeow() {
    playTone(800, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(1000, 0.15, 'sine', 0.1), 100);
    setTimeout(() => playTone(600, 0.3, 'sine', 0.15), 250);
    globalState.meows++;
    const stat = document.getElementById('stat-val-meows');
    if (stat) stat.textContent = globalState.meows;
}

function soundClick() {
    playTone(1200, 0.05, 'square', 0.05);
    globalState.clicks++;
    const stat = document.getElementById('stat-val-clicks');
    if (stat) stat.textContent = globalState.clicks;
}

function soundSuccess() {
    playTone(523.25, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.1), 200);
}

function soundError() {
    playTone(200, 0.2, 'sawtooth', 0.1);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.1), 200);
}

// --- 2. УВЕДОМЛЕНИЯ ---
function showToast(msg, dur = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = msg;
    toast.style.cssText = `background:#333; color:#fff; padding:12px 24px; border-radius:10px; margin-top:10px; font-weight:bold; box-shadow:0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s; opacity:0; transform:translateY(20px);`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateY(20px)'; 
        setTimeout(() => toast.remove(), 300); 
    }, dur);
}

// --- 3. НАВИГАЦИЯ ---
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-link-button');
    const sections = document.querySelectorAll('.content-section');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active-section'));
            const target = document.getElementById(btn.getAttribute('data-nav-target'));
            if (target) target.classList.add('active-section');
            soundClick();
        });
    });
    const startBtn = document.getElementById('btn-hero-start');
    if (startBtn) startBtn.addEventListener('click', () => document.querySelector('[data-nav-target="section-cats"]')?.click());
}

// --- 4. КОТЫ ---
function setupCatCards() {
    const cards = document.querySelectorAll('.cat-display-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            soundMeow();
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);
            
            const rect = card.getBoundingClientRect();
            const heart = document.createElement('div');
            heart.textContent = ['❤️', '🐾', '🐟', '✨'][Math.floor(Math.random() * 4)];
            heart.style.cssText = `position:fixed; left:${rect.left + rect.width/2}px; top:${rect.top + rect.height/2}px; font-size:30px; pointer-events:none; transition:all 1s; z-index:9999;`;
            document.body.appendChild(heart);
            
            requestAnimationFrame(() => { 
                heart.style.transform = `translateY(-100px) scale(1.5) rotate(${Math.random()*90-45}deg)`; 
                heart.style.opacity = '0'; 
            });
            setTimeout(() => heart.remove(), 1000);
        });
    });
}

// --- 5. ИНСТРУМЕНТЫ ---
function setupQuickTools() {
    const tools = { 
        'tool-btn-settings': 'modal-settings', 
        'tool-btn-achievements': 'modal-achievements', 
        'tool-btn-help': 'modal-help' 
    };
    
    Object.keys(tools).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => {
            const modal = document.getElementById(tools[btnId]);
            if (modal) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
            soundClick();
        });
    });
    
    const topBtn = document.getElementById('tool-btn-scroll-top');
    if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}

// --- 6. ПОИСК (ПАСХАЛКИ) ---
function setupSearchEasterEgg() {
    const input = document.getElementById('main-search-input');
    const btn = document.getElementById('main-search-btn');
    const sugg = document.getElementById('search-suggestions');
    if (!input || !btn) return;

    const doSearch = () => {
        const q = input.value.trim().toUpperCase();
        
        // ПАСХАЛКА: БОЙЦОВСКИЙ КЛУБ
        if (q === 'DOTL' || q === 'DONL.NET') {
            soundSuccess();
            const modal = document.createElement('div');
            modal.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,0.95); color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:99999; font-family:monospace; text-align:center; padding:20px;`;
            modal.innerHTML = `
                <h1 style="font-size:3rem; margin-bottom:20px; color:#ff0000; letter-spacing:2px;">ПРАВИЛО 1:</h1>
                <p style="font-size:1.8rem; max-width:600px; margin-bottom:20px;">Никому не рассказывать о Бойцовском клубе.</p>
                <h1 style="font-size:3rem; margin-bottom:20px; color:#ff0000; letter-spacing:2px;">ПРАВИЛО 2:</h1>
                <p style="font-size:1.8rem; max-width:600px;">Никому не рассказывать о Бойцовском клубе.</p>
                <p style="font-size:1rem; margin-top:40px; color:#aaa;">(Секретный переход через 3 секунды...)</p>
            `;
            document.body.appendChild(modal);
            setTimeout(() => { window.location.href = 'secret.html'; }, 3000);
        } 
        // ПАСХАЛКА: МЯУ
        else if (q === 'МЯУ' || q === 'MEOW') {
            soundMeow();
            showToast("Мяу-мяу! 🐾 Ты нашел кошачий код!");
            if (sugg) { 
                sugg.style.display = 'block'; 
                sugg.innerHTML = `<div style="padding:15px; text-align:center; color:#ff6b9d; font-weight:bold;">🐱 Мяу! Секретный кот доволен!</div>`; 
            }
        } 
        // НЕТ РЕЗУЛЬТАТОВ
        else if (q.length > 0) {
            soundError();
            if (sugg) { 
                sugg.style.display = 'block'; 
                sugg.innerHTML = `<div style="padding:15px; text-align:center; color:#ff6b6b;">Ничего не найдено по запросу "${input.value}" 🙀</div>`; 
            }
        }
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-container') && sugg) sugg.style.display = 'none'; });
}

// --- 7. ПАСХАЛКА НА ЗАГОЛОВОК ---
let titleClicks = 0;
function setupTitleEgg() {
    const title = document.getElementById('main-title-text');
    if (!title) return;
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
        titleClicks++;
        playTone(400 + titleClicks * 100, 0.1);
        if (titleClicks >= 5) {
            soundSuccess();
            showToast("Секретный режим активирован! 🕵️");
            titleClicks = 0;
        }
    });
}

// --- 8. ЛАПКИ ЗА МЫШКОЙ ---
let lastTime = 0;
function setupMouseTrail() {
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 100) return;
        lastTime = now;
        const paw = document.createElement('div');
        paw.textContent = '🐾';
        paw.style.cssText = `position:fixed; left:${e.clientX}px; top:${e.clientY}px; pointer-events:none; opacity:0.6; z-index:9999; transition:all 1s; transform:translate(-50%, -50%); font-size:20px;`;
        document.body.appendChild(paw);
        requestAnimationFrame(() => { paw.style.opacity = '0'; paw.style.transform = 'translate(-50%, 50%) scale(0.5)'; });
        setTimeout(() => paw.remove(), 1000);
    });
}

// --- 9. ИГРА "ПОЙМАЙ МЫШКУ" ---
let catchScore = 0, catchTime = 30, catchInt = null, isCatchRun = false;

function startCatch() {
    if (isCatchRun) return;
    const area = document.getElementById('catch-play-area');
    const btn = document.getElementById('btn-start-catch');
    if (!area) return;
    
    isCatchRun = true; catchScore = 0; catchTime = 30;
    area.innerHTML = ''; 
    document.getElementById('catch-score').textContent = '0';
    document.getElementById('catch-timer').textContent = '30';
    btn.disabled = true; btn.textContent = 'Игра идёт...';
    
    catchInt = setInterval(() => {
        catchTime--; 
        const timer = document.getElementById('catch-timer');
        if (timer) timer.textContent = catchTime;
        if (catchTime <= 0) endCatch();
    }, 1000);

    const spawn = setInterval(() => {
        if (!isCatchRun) { clearInterval(spawn); return; }
        const mouse = document.createElement('div');
        mouse.className = 'flying-mouse'; 
        mouse.textContent = '🐭';
        mouse.style.left = Math.random() * (area.clientWidth - 40) + 'px';
        mouse.style.top = Math.random() * (area.clientHeight - 40) + 'px';
        mouse.onclick = () => { 
            catchScore++; 
            const score = document.getElementById('catch-score');
            if (score) score.textContent = catchScore; 
            soundClick(); 
            mouse.remove(); 
        };
        area.appendChild(mouse);
        setTimeout(() => mouse.remove(), 1000);
    }, 800);
}

function endCatch() {
    clearInterval(catchInt); 
    isCatchRun = false;
    const area = document.getElementById('catch-play-area');
    if (area) area.innerHTML = `<div class="game-placeholder-message" style="color:#ff6b9d;">🎉 Игра окончена!<br>Поймано мышек: <b>${catchScore}</b></div>`;
    const btn = document.getElementById('btn-start-catch');
    if (btn) { btn.disabled = false; btn.textContent = '▶ Играть снова'; }
    soundMeow();
}

// --- 10. ВИКТОРИНА ---
const quizQ = [
    { q: "Самая крупная порода?", a: ["Мейн-кун", "Британец", "Сфинкс"], c: 0 },
    { q: "У какой породы нет шерсти?", a: ["Бенгал", "Сфинкс", "Сиам"], c: 1 },
    { q: "Кошки видят в темноте лучше человека в...", a: ["2 раза", "6 раз", "10 раз"], c: 1 }
];
let qIdx = 0;

function loadQuiz() {
    const qText = document.getElementById('quiz-question-text');
    const opts = document.getElementById('quiz-options-container');
    if (!qText || !opts) return;

    if (qIdx >= quizQ.length) {
        qText.textContent = "Викторина завершена!";
        opts.innerHTML = '<p style="text-align:center; font-weight:bold; color:#51cf66;">Отличная работа! 🏆</p>';
        return;
    }
    
    const q = quizQ[qIdx];
    qText.textContent = q.q;
    opts.innerHTML = '';
    
    q.a.forEach((text, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn'; 
        btn.textContent = text;
        btn.onclick = () => {
            if (i === q.c) { btn.style.background = '#51cf66'; btn.style.color = 'white'; soundSuccess(); }
            else { btn.style.background = '#ff6b6b'; btn.style.color = 'white'; soundError(); }
            opts.querySelectorAll('button').forEach(b => b.disabled = true);
            setTimeout(() => { qIdx++; loadQuiz(); }, 1000);
        };
        opts.appendChild(btn);
    });
}

// --- 11. ИГРА "НАЙДИ ПАРУ" ---
function startMemory() {
    const board = document.getElementById('memory-board');
    if (!board) return;
    
    board.innerHTML = '';
    const emojis = ['🐱', '😺', '😸', '😹', '🐱', '😺', '😸', '😹'].sort(() => Math.random() - 0.5);
    let flipped = [];
    
    emojis.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.textContent = '🐾';
        card.style.cursor = 'pointer';
        
        card.onclick = () => {
            if (card.classList.contains('flipped') || flipped.length >= 2) return;
            
            card.classList.add('flipped'); 
            card.textContent = emoji; 
            card.style.background = '#fff';
            flipped.push(card);
            
            if (flipped.length === 2) {
                if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                    soundSuccess(); 
                    flipped = [];
                } else {
                    soundError();
                    setTimeout(() => {
                        flipped.forEach(c => { 
                            c.classList.remove('flipped'); 
                            c.textContent = '🐾'; 
                            c.style.background = ''; 
                        });
                        flipped = [];
                    }, 1000);
                }
            }
        };
        board.appendChild(card);
    });
}

// --- 12. ЗАПУСК ---
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader-screen');
    if (preloader) setTimeout(() => preloader.classList.add('hidden'), 1500);

    setupNavigation();
    setupCatCards();
    setupQuickTools();
    setupSearchEasterEgg();
    setupTitleEgg();
    setupMouseTrail();
    
    loadQuiz();
    const btnCatch = document.getElementById('btn-start-catch');
    if (btnCatch) btnCatch.addEventListener('click', startCatch);
    
    const btnMem = document.getElementById('btn-start-memory');
    if (btnMem) btnMem.addEventListener('click', startMemory);

    console.log("%c🐱 Мяу! Код работает без ошибок!", "color: #51cf66; font-size: 20px; font-weight: bold;");
});// ==========================================================================
// МИР КОТИКОВ - ЧАСТЬ 2 (РАСШИРЕННЫЕ ФУНКЦИИ)
// ==========================================================================

// --- 13. СИСТЕМА ДОСТИЖЕНИЙ И СОХРАНЕНИЯ ---

// Глобальный объект для хранения прогресса
let playerProgress = {
    meows: 0,
    clicks: 0,
    facts: 0,
    gamesPlayed: 0,
    achievements: [],
    highScores: {
        catchMouse: 0,
        memoryMoves: 999
    }
};

// Загрузка прогресса из LocalStorage при старте
function loadProgress() {
    const savedData = localStorage.getItem('catWorldProgress');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed) {
                playerProgress = { ...playerProgress, ...parsed };
                console.log("Прогресс успешно загружен из LocalStorage.");
            }
        } catch (e) {
            console.warn("Ошибка при загрузке прогресса: данные повреждены.");
        }
    } else {
        console.log("Сохраненный прогресс не найден. Начинаем с чистого листа.");
    }
}

// Сохранение прогресса
function saveProgress() {
    try {
        localStorage.setItem('catWorldProgress', JSON.stringify(playerProgress));
        console.log("Прогресс сохранен.");
    } catch (e) {
        console.warn("Не удалось сохранить прогресс (возможно, переполнено хранилище).");
    }
}

// Массив всех доступных достижений
const allAchievements = [
    { id: 'first_step', title: 'Первый шаг', desc: 'Зайти на сайт', icon: '👣', unlocked: false },
    { id: 'meow_5', title: 'Мурчатель', desc: 'Погладить 5 котов', icon: '🐾', unlocked: false },
    { id: 'meow_20', title: 'Кошатник', desc: 'Погладить 20 котов', icon: '❤️', unlocked: false },
    { id: 'fact_5', title: 'Почемучка', desc: 'Прочитать 5 фактов', icon: '❓', unlocked: false },
    { id: 'fact_15', title: 'Эрудит', desc: 'Прочитать 15 фактов', icon: '🧠', unlocked: false },
    { id: 'game_catch', title: 'Ловец', desc: 'Поиграть в "Поймай мышку"', icon: '🐭', unlocked: false },
    { id: 'game_memory', title: 'Картежник', desc: 'Поиграть в "Найди пару"', icon: '🎴', unlocked: false },
    { id: 'game_feed', title: 'Заботливый', desc: 'Покормить кота', icon: '🍣', unlocked: false },
    { id: 'secret_found', title: 'Секретный агент', desc: 'Найти пасхалку', icon: '🕵️', unlocked: false }
];

// Синхронизация массива достижений с сохраненным прогрессом
function syncAchievements() {
    if (playerProgress.achievements && playerProgress.achievements.length > 0) {
        allAchievements.forEach(ach => {
            if (playerProgress.achievements.includes(ach.id)) {
                ach.unlocked = true;
            }
        });
    }
}

// Открытие достижения
function unlockAchievement(achId) {
    const ach = allAchievements.find(a => a.id === achId);
    if (!ach || ach.unlocked) return;

    ach.unlocked = true;
    if (!playerProgress.achievements.includes(achId)) {
        playerProgress.achievements.push(achId);
    }
    
    saveProgress();
    soundSuccess();
    showToast(`🏆 Достижение: ${ach.title}!`);
}

// Проверка условий для достижений
function checkAllAchievements() {
    if (playerProgress.meows >= 5) unlockAchievement('meow_5');
    if (playerProgress.meows >= 20) unlockAchievement('meow_20');
    if (playerProgress.facts >= 5) unlockAchievement('fact_5');
    if (playerProgress.facts >= 15) unlockAchievement('fact_15');
}

// --- 14. РАСШИРЕННАЯ ИГРА "ПОЙМАЙ МЫШКУ" ---

let catchGameState = {
    isRunning: false,
    score: 0,
    timeLeft: 30,
    spawnTimer: null,
    countdownTimer: null,
    difficultLevel: 1 // 1 - легко, 2 - средне, 3 - сложно
};

function startCatchGameExtended() {
    if (catchGameState.isRunning) return;

    // Сброс состояния
    catchGameState.isRunning = true;
    catchGameState.score = 0;
    catchGameState.timeLeft = 30;
    
    const area = document.getElementById('catch-play-area');
    const btn = document.getElementById('btn-start-catch');
    const scoreEl = document.getElementById('catch-score');
    const timerEl = document.getElementById('catch-timer');

    if (area) area.innerHTML = '';
    if (scoreEl) scoreEl.textContent = '0';
    if (timerEl) timerEl.textContent = '30';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Игра идёт...';
        btn.style.opacity = '0.5';
    }

    soundSuccess();
    unlockAchievement('game_catch');

    // Таймер обратного отсчета
    catchGameState.countdownTimer = setInterval(() => {
        catchGameState.timeLeft--;
        if (timerEl) timerEl.textContent = catchGameState.timeLeft;
        
        if (catchGameState.timeLeft <= 0) {
            stopCatchGame();
        }
    }, 1000);

    // Спавн мышей в зависимости от сложности
    const spawnIntervalTime = catchGameState.difficultLevel === 1 ? 800 : (catchGameState.difficultLevel === 2 ? 600 : 400);
    
    catchGameState.spawnTimer = setInterval(() => {
        if (!catchGameState.isRunning) return;
        spawnFlyingMouse();
    }, spawnIntervalTime);
    
    spawnFlyingMouse(); // Первая мышка сразу
}

function spawnFlyingMouse() {
    const area = document.getElementById('catch-play-area');
    if (!area) return;

    const mouse = document.createElement('div');
    mouse.className = 'flying-mouse';
    mouse.textContent = '🐭';
    
    // Случайная позиция
    const maxX = area.clientWidth - 50;
    const maxY = area.clientHeight - 50;
    mouse.style.left = Math.max(0, Math.random() * maxX) + 'px';
    mouse.style.top = Math.max(0, Math.random() * maxY) + 'px';

    // Обработчик клика
    mouse.onclick = (e) => {
        e.stopPropagation();
        catchGameState.score++;
        const scoreEl = document.getElementById('catch-score');
        if (scoreEl) scoreEl.textContent = catchGameState.score;
        
        soundClick();
        playTone(1500, 0.1, 'sine');
        
        // Анимация исчезновения
        mouse.style.transform = 'scale(1.5)';
        mouse.style.opacity = '0';
        setTimeout(() => mouse.remove(), 150);
    };

    area.appendChild(mouse);

    // Если не поймали - исчезает
    setTimeout(() => {
        if (mouse.parentNode) {
            mouse.style.opacity = '0';
            setTimeout(() => mouse.remove(), 200);
        }
    }, 1200);
}

function stopCatchGame() {
    clearInterval(catchGameState.countdownTimer);
    clearInterval(catchGameState.spawnTimer);
    catchGameState.isRunning = false;

    const area = document.getElementById('catch-play-area');
    const btn = document.getElementById('btn-start-catch');

    if (area) {
        area.innerHTML = `
            <div class="game-placeholder-message" style="color: #ff6b9d;">
                🎉 Игра окончена!<br>
                Поймано мышек: <b>${catchGameState.score}</b>
            </div>
        `;
    }

    if (btn) {
        btn.disabled = false;
        btn.textContent = '▶ Играть снова';
        btn.style.opacity = '1';
    }

    // Проверка рекорда
    if (catchGameState.score > playerProgress.highScores.catchMouse) {
        playerProgress.highScores.catchMouse = catchGameState.score;
        saveProgress();
        showToast(`🏆 Новый рекорд: ${catchGameState.score} мышек!`);
    }

    soundMeow();
}

// --- 15. РАСШИРЕННАЯ ИГРА "НАЙДИ ПАРУ" ---

let memoryState = {
    board: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    isLocked: false,
    totalPairs: 8
};

const memoryEmojisList = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀'];

function startMemoryGameExtended() {
    const boardElement = document.getElementById('memory-board');
    if (!boardElement) return;

    // Сброс
    boardElement.innerHTML = '';
    memoryState.board = [];
    memoryState.flippedCards = [];
    memoryState.matchedPairs = 0;
    memoryState.moves = 0;
    memoryState.isLocked = false;

    updateMemoryUI();
    unlockAchievement('game_memory');

    // Формируем колоду
    const deck = [...memoryEmojisList, ...memoryEmojisList];
    
    // Перемешивание
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    memoryState.board = deck;

    // Отрисовка
    deck.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">🐾</div>
                <div class="memory-card-back">${emoji}</div>
            </div>
        `;

        card.onclick = () => flipMemoryCardExtended(card);
        boardElement.appendChild(card);
    });

    soundSuccess();
}

function flipMemoryCardExtended(card) {
    if (memoryState.isLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    soundClick();
    memoryState.flippedCards.push(card);

    if (memoryState.flippedCards.length === 2) {
        memoryState.moves++;
        updateMemoryUI();
        checkMemoryMatchExtended();
    }
}

function checkMemoryMatchExtended() {
    memoryState.isLocked = true;
    const [card1, card2] = memoryState.flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        // Совпадение
        soundSuccess();
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            memoryState.matchedPairs++;
            updateMemoryUI();
            
            memoryState.flippedCards = [];
            memoryState.isLocked = false;

            if (memoryState.matchedPairs === memoryState.totalPairs) {
                setTimeout(() => {
                    alert(`🎉 Победа! Все пары найдены за ${memoryState.moves} ходов.`);
                }, 300);
            }
        }, 500);
    } else {
        // Ошибка
        soundError();
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            memoryState.flippedCards = [];
            memoryState.isLocked = false;
        }, 1000);
    }
}

function updateMemoryUI() {
    const movesEl = document.getElementById('memory-moves');
    const pairsEl = document.getElementById('memory-pairs');
    if (movesEl) movesEl.textContent = memoryState.moves;
    if (pairsEl) pairsEl.textContent = `${memoryState.matchedPairs}/${memoryState.totalPairs}`;
}

// --- 16. РАСШИРЕННАЯ ИГРА "ПОКОРМИ КОТА" ---

let feedGameState = {
    hunger: 50,
    interval: null,
    isRunning: false
};

function startFeedGameExtended() {
    if (feedGameState.interval) clearInterval(feedGameState.interval);
    
    feedGameState.hunger = 50;
    feedGameState.isRunning = true;
    updateFeedUI();
    unlockAchievement('game_feed');

    feedGameState.interval = setInterval(() => {
        if (!feedGameState.isRunning) return;
        
        feedGameState.hunger += 2;
        if (feedGameState.hunger > 100) feedGameState.hunger = 100;
        updateFeedUI();
    }, 1000);
}

function feedCatExtended() {
    feedGameState.hunger -= 15;
    if (feedGameState.hunger < 0) feedGameState.hunger = 0;
    updateFeedUI();
    soundMeow();

    const cat = document.getElementById('feed-cat-character');
    if (cat) {
        cat.style.transform = 'scale(1.2)';
        setTimeout(() => cat.style.transform = 'scale(1)', 200);
    }
}

function updateFeedUI() {
    const fill = document.getElementById('hunger-fill');
    const text = document.getElementById('hunger-percent');
    const cat = document.getElementById('feed-cat-character');

    if (fill) {
        fill.style.width = feedGameState.hunger + '%';
        
        if (feedGameState.hunger > 80) {
            fill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4757)';
        } else if (feedGameState.hunger > 50) {
            fill.style.background = 'linear-gradient(90deg, #ffa94d, #ff9233)';
        } else {
            fill.style.background = 'linear-gradient(90deg, #51cf66, #94d82d)';
        }
    }

    if (text) text.textContent = Math.round(feedGameState.hunger) + '%';

    if (cat) {
        if (feedGameState.hunger > 80) cat.textContent = '😿';
        else if (feedGameState.hunger < 30) cat.textContent = '😻';
        else cat.textContent = '🐈';
    }
}

// --- 17. ИНИЦИАЛИЗАЦИЯ ВСЕГО (ПЕРЕЗАПИСЬ) ---
// Мы перезаписываем обработчик, чтобы подключить расширенные игры

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем прогресс
    loadProgress();
    syncAchievements();

    // Выдаем ачивку за вход
    setTimeout(() => unlockAchievement('first_step'), 1000);

    // Переопределяем кнопки для расширенных игр
    const btnCatch = document.getElementById('btn-start-catch');
    if (btnCatch) {
        btnCatch.onclick = null; // Снимаем старый
        btnCatch.addEventListener('click', startCatchGameExtended);
    }
    
    const btnMem = document.getElementById('btn-start-memory');
    if (btnMem) {
        btnMem.onclick = null;
        btnMem.addEventListener('click', startMemoryGameExtended);
    }

    const btnFeed = document.getElementById('btn-feed-cat');
    if (btnFeed) {
        btnFeed.onclick = null;
        btnFeed.addEventListener('click', feedCatExtended);
    }

    // Запускаем кормление, когда открыта вкладка
    const gameTabs = document.querySelectorAll('.game-tab-button');
    gameTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.getAttribute('data-game-target') === 'game-feed-panel') {
                startFeedGameExtended();
            }
        });
    });

    // Проверка достижений каждые 3 секунды
    setInterval(checkAllAchievements, 3000);
});// ==========================================================================
// МИР КОТИКОВ - ЧАСТЬ 3 (НАСТРОЙКИ И ЗАВЕРШЕНИЕ)
// ==========================================================================

// --- 18. СИСТЕМА НАСТРОЕК И ТЕМ ---

function initSettingsSystem() {
    const btnSave = document.getElementById('btn-save-settings');
    const checkDark = document.getElementById('setting-dark');
    const checkSound = document.getElementById('setting-sound');

    // 1. Загрузка сохраненных настроек при старте
    const isDarkSaved = localStorage.getItem('catThemeDark') === 'true';
    const isSoundSaved = localStorage.getItem('catSoundEnabled') !== 'false';

    if (isDarkSaved) {
        document.body.classList.add('theme-dark');
        if (checkDark) checkDark.checked = true;
    }
    
    if (!isSoundSaved) {
        soundEnabled = false;
        if (checkSound) checkSound.checked = false;
        const soundBtn = document.getElementById('global-sound-toggle');
        if (soundBtn) {
            soundBtn.textContent = '🔇';
            soundBtn.style.opacity = '0.5';
        }
    }

    // 2. Сохранение настроек
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            // Тема
            if (checkDark && checkDark.checked) {
                document.body.classList.add('theme-dark');
                localStorage.setItem('catThemeDark', 'true');
            } else {
                document.body.classList.remove('theme-dark');
                localStorage.setItem('catThemeDark', 'false');
            }

            // Звук
            if (checkSound) {
                soundEnabled = checkSound.checked;
                localStorage.setItem('catSoundEnabled', soundEnabled);
                
                const soundBtn = document.getElementById('global-sound-toggle');
                if (soundBtn) {
                    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
                    soundBtn.style.opacity = soundEnabled ? '1' : '0.5';
                }
            }

            soundClick();
            showToast("Настройки успешно сохранены! ⚙️");
            
            // Закрываем модалку
            const modal = document.getElementById('modal-settings');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        });
    }

    // 3. Кнопка глобального звука (верхний правый угол)
    const globalSoundBtn = document.getElementById('global-sound-toggle');
    if (globalSoundBtn) {
        globalSoundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('catSoundEnabled', soundEnabled);
            
            globalSoundBtn.textContent = soundEnabled ? '🔊' : '🔇';
            globalSoundBtn.style.opacity = soundEnabled ? '1' : '0.5';
            
            if (checkSound) checkSound.checked = soundEnabled;

            if (soundEnabled) {
                initAudio();
                playTone(1000, 0.1, 'sine', 0.1);
            }
        });
    }
}

// --- 19. ОБРАБОТКА ОШИБОК (ЧТОБЫ САЙТ НЕ ПАДАЛ) ---

window.addEventListener('error', function(event) {
    // Ловим ошибки и пишем их в консоль, чтобы сайт продолжал работать
    console.warn("Перехвачена ошибка:", event.message);
    return true; // Не даем браузеру показать страшный экран
});

// --- 20. СЕКРЕТНЫЙ РЕЖИМ (МАТРИЦА) ---

let secretCodeBuffer = [];
const secretCode = ['m', 'e', 'o', 'w'];

document.addEventListener('keydown', (e) => {
    // Если пользователь нажимает клавиши, добавляем их в буфер
    secretCodeBuffer.push(e.key.toLowerCase());
    
    // Оставляем только последние 4 нажатия
    if (secretCodeBuffer.length > 4) {
        secretCodeBuffer.shift();
    }

    // Проверяем, совпадает ли с секретным кодом
    if (secretCodeBuffer.join('') === secretCode.join('')) {
        activateMatrixMode();
        secretCodeBuffer = []; // Сбрасываем
    }
});

function activateMatrixMode() {
    soundSuccess();
    showToast("🐱 СЕКРЕТНЫЙ РЕЖИМ 'МЯУ' АКТИВИРОВАН!");
    
    // Меняем фон на матричный
    document.body.style.background = 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)';
    document.body.style.color = '#00ff41';
    
    // Красим карточки в зеленый
    const cards = document.querySelectorAll('.cat-display-card, .feature-item-card, .content-section');
    cards.forEach(card => {
        card.style.background = 'rgba(0, 255, 65, 0.1)';
        card.style.border = '1px solid #00ff41';
        card.style.color = '#00ff41';
    });

    // Возвращаем всё обратно через 10 секунд
    setTimeout(() => {
        document.body.style.background = '';
        document.body.style.color = '';
        cards.forEach(card => {
            card.style.background = '';
            card.style.border = '';
            card.style.color = '';
        });
        showToast("Режим 'Мяу' деактивирован. Возвращаем цвета! 🎨");
    }, 10000);
}

// --- 21. ФИНАЛЬНЫЙ ЗАПУСК ---

// Этот блок гарантирует, что все системы включатся после загрузки
window.addEventListener('load', () => {
    // Инициализируем настройки
    initSettingsSystem();
    
    // Приветственное сообщение в консоли
    console.log("%c---------------------------------------", "color: #ff6b9d;");
    console.log("%c🐾 Мир Котиков успешно загружен! 🐾", "color: #ff6b9d; font-size: 16px; font-weight: bold;");
    console.log("%cВсе системы работают в штатном режиме.", "color: #7a5c3e; font-style: italic;");
    console.log("%cПопробуй ввести 'meow' на клавиатуре... 😉", "color: #51cf66; font-weight: bold;");
    console.log("%c---------------------------------------", "color: #ff6b9d;");

    // Проверяем, есть ли контейнер для тостов (создаем, если нет)
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 99999; display: flex; flex-direction: column; align-items: center;';
        document.body.appendChild(container);
    }
});// ==========================================================================
// МИР КОТИКОВ - ЧАСТЬ 4 (ЧАТ, ГЕНЕРАТОР И ДОП. ФИЧИ)
// ==========================================================================

// --- 22. КОШАЧИЙ ЧАТ (БОТ) ---

const botResponses = [
    "Мяу! 🐾",
    "Муррр... 😺",
    "Дай рыбку! 🐟",
    "Я тебя люблю! ❤️",
    "Почеши за ушком...",
    "Мяу-мяу!",
    "*уронил кружку* 🙀",
    "Хочу спать... 😴",
    "Где моя коробка?",
    "Давай играть!",
    "Я сегодня очень пушистый!",
    "А ты меня покормил?",
    "Мурчание активировано.",
    "Я слежу за тобой... 👀",
    "Оставь меня в покое, я сплю."
];

function initCatChat() {
    const sendBtn = document.getElementById('chat-send-btn');
    const inputField = document.getElementById('chat-input-field');
    const messagesBox = document.getElementById('chat-messages-box');

    if (!sendBtn || !inputField || !messagesBox) return;

    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        // 1. Сообщение пользователя
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.style.cssText = "background-color: #4dabf7; color: white; padding: 10px 15px; border-radius: 15px; border-bottom-right-radius: 0; margin-bottom: 10px; align-self: flex-end; max-width: 80%; font-size: 0.95rem;";
        userMsg.textContent = text;
        messagesBox.appendChild(userMsg);
        
        inputField.value = '';
        messagesBox.scrollTop = messagesBox.scrollHeight;
        soundClick();

        // 2. Ответ кота (с задержкой)
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-msg bot';
            botMsg.style.cssText = "background-color: #ff6b9d; color: white; padding: 10px 15px; border-radius: 15px; border-bottom-left-radius: 0; margin-bottom: 10px; align-self: flex-start; max-width: 80%; font-size: 0.95rem;";
            
            // Выбираем случайный ответ
            botMsg.textContent = botResponses[Math.floor(Math.random() * botResponses.length)];
            
            messagesBox.appendChild(botMsg);
            messagesBox.scrollTop = messagesBox.scrollHeight;
            soundMeow();
        }, 1000);
    };

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') sendMessage(); 
    });
}

// --- 23. ГЕНЕРАТОР СЛУЧАЙНЫХ ИМЕН КОТОВ ---

const catNamesList = [
    "Мурзик", "Барсик", "Васька", "Пушок", "Снежок", "Тихон", "Мурка", "Рыжик",
    "Гоша", "Черныш", "Дымок", "След", "Клякса", "Барс", "Леопольд", "Матроскин",
    "Том", "Гарфилд", "Бегемот", "Саймон", "Соня", "Ласка", "Облачко", "Неженка",
    "Ворчун", "Уголёк", "Тигр", "Следопыт", "Сметанка", "Кузя", "Маркиз", "Персик"
];

function generateRandomCatName() {
    const randomIndex = Math.floor(Math.random() * catNamesList.length);
    const name = catNamesList[randomIndex];
    showToast(`Новое имя для кота: ${name}! 🐾`);
    soundMeow();
}

// --- 24. СЛУЧАЙНЫЕ ФРАЗЫ ПРИ БЕЗДЕЙСТВИИ ---

let idleTimer;
const idleMessages = [
    "Ты тут? 🐾",
    "Погладь кота...",
    "Хочешь узнать новый факт?",
    "Сыграем в игру?",
    "Мяу?",
    "Я уже 5 минут жду, когда меня покормят.",
    "Не забудь проверить вкладку 'Факты'!"
];

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        showToast(msg);
    }, 30000); // 30 секунд
}

// Сброс таймера при любом действии пользователя
document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
document.addEventListener('click', resetIdleTimer);

// --- 25. ПАСХАЛКА: СЕКРЕТНЫЙ КОТ В УГЛУ ---

function initSecretCat() {
    // Ищем секретного кота в HTML (он у нас скрыт по умолчанию)
    const secretCat = document.getElementById('secret-cat-easter-egg');
    if (!secretCat) return;

    // Делаем его видимым через 10 секунд после загрузки
    setTimeout(() => {
        secretCat.style.display = 'block';
        secretCat.style.cursor = 'pointer';
        secretCat.style.transition = 'transform 0.3s';
        
        // При клике на него...
        secretCat.addEventListener('click', () => {
            soundSuccess();
            secretCat.style.transform = 'scale(1.5) rotate(15deg)';
            
            // Выдаем достижение
            unlockAchievement('secret_found');
            
            // Показываем чат
            const chatModal = document.getElementById('cat-chat-modal');
            if (chatModal) {
                chatModal.classList.remove('hidden');
                chatModal.style.display = 'flex';
            }
            
            showToast("Секретный кот найден! 🐈‍⬛");
            
            // Прячем его обратно
            setTimeout(() => {
                secretCat.style.display = 'none';
            }, 2000);
        });
    }, 10000);
}

// --- 26. ГЛОБАЛЬНЫЙ ЗАПУСК ВСЕХ НОВЫХ ФИЧ ---

// Ждем загрузки страницы, чтобы все элементы точно были на месте
document.addEventListener('DOMContentLoaded', () => {
    // Запускаем чат
    initCatChat();
    
    // Запускаем секретного кота
    initSecretCat();
    
    // Запускаем таймер бездействия
    resetIdleTimer();

    // Добавляем кнопку генерации имени (создаем ее программно, чтобы не трогать HTML)
    const factControls = document.querySelector('.fact-controls-wrapper');
    if (factControls) {
        const nameBtn = document.createElement('button');
        nameBtn.className = 'secondary-action-button';
        nameBtn.textContent = '🐾 Случайное имя';
        nameBtn.style.marginLeft = '10px';
        nameBtn.onclick = generateRandomCatName;
        factControls.appendChild(nameBtn);
    }
});// ==========================================================================
// МИР КОТИКОВ - ЧАСТЬ 5 (ГОРОСКОП, ЭФФЕКТЫ, УМНЫЙ ПОИСК)
// ==========================================================================

// --- 27. КОШАЧИЙ ГОРОСКОП (ПАСХАЛКА) ---

const horoscopeData = {
    aries: "♈ Овен: Сегодня ты — бенгальский кот. Энергии хоть отбавляй, но не порви все шторы!",
    taurus: "♉ Телец: Ты — британский короткошерстный. Идеальный день для сна и вкусной еды.",
    gemini: "♊ Близнецы: Ты — сиамский кот. Будешь громко мяукать и требовать внимания.",
    cancer: "♋ Рак: Ты — рэгдолл. Тебе нужно много обнимашек и мягкий плед.",
    leo: "♌ Лев: Ты — мейн-кун. Весь день будешь важно расхаживать по квартире.",
    virgo: "♍ Дева: Ты — шотландская вислоухая. Аккуратно сложишь все игрушки в коробку.",
    libra: "♎ Весы: Ты — турецкая ангора. Будешь долго выбирать, с какой стороны кровати лечь.",
    scorpio: "♏ Скорпион: Ты — сфинкс. Загадочный и горячий, как твоя кожа без шерсти.",
    sagittarius: "♐ Стрелец: Ты — абиссинская кошка. Готовься к новым прыжкам на шкаф!",
    capricorn: "♑ Козерог: Ты — персидский кот. Серьезный настрой на весь день.",
    aquarius: "♒ Водолей: Ты — манчкин. Нестандартный подход к ловле мышей.",
    pisces: "♓ Рыбы: Ты — русская голубая. Мечтательный и спокойный."
};

function initHoroscope() {
    const buttons = document.querySelectorAll('.horoscope-btn');
    const resultBox = document.getElementById('horoscope-result');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sign = btn.getAttribute('data-sign');
            if (horoscopeData[sign] && resultBox) {
                resultBox.innerHTML = `<p style="font-weight: bold; color: #ff6b9d; font-size: 1.2rem;">${horoscopeData[sign]}</p>`;
                soundSuccess();
                spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 20);
            }
        });
    });
}

// --- 28. КАСТОМНЫЕ КУРСОРЫ (ЛАПКИ) ---

function initCustomCursors() {
    // Ищем все кнопки и меняем курсор на лапку (в CSS это можно сделать через cursor: url(...), но мы сделаем это визуально)
    const interactiveElements = document.querySelectorAll('button, .cat-display-card, .nav-link-button');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            // Тихий звук при наведении (опционально)
            // playTone(1000, 0.02, 'sine', 0.01);
        });
    });
}

// --- 29. ЭФФЕКТ ТРЯСКИ ПРИ ОШИБКЕ В ВИКТОРИНЕ ---

// Перезаписываем функцию проверки ответа, чтобы добавить тряску
const originalCheckAnswer = window.checkAnswer; // Сохраняем старую (если есть)

// В нашем скрипте функция викторины создается динамически, поэтому мы добавим глобальный слушатель для кнопок викторины
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quiz-option-btn')) {
        // Если кнопка стала красной (неправильный ответ), трясем её
        setTimeout(() => {
            if (e.target.style.background === 'rgb(255, 107, 107)' || e.target.style.background === '#ff6b6b') {
                e.target.classList.add('shake-effect');
                setTimeout(() => e.target.classList.remove('shake-effect'), 500);
            }
        }, 50);
    }
});

// --- 30. УМНЫЙ ПОИСК: ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ ---

// Добавляем команды в поиск, которые мы настраивали в Части 1
// (DOTL - Бойцовский клуб, МЯУ - секретная подсказка)

function setupAdvancedSearch() {
    const input = document.getElementById('main-search-input');
    if (!input) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toUpperCase();
            
            // Дополнительные пасхалки
            if (val === 'КОТ') {
                soundMeow();
                showToast("Мяу! Ты позвал кота! 🐱");
            } else if (val === 'РЫБА') {
                showToast("Где рыба? 🐟 Дайте коту рыбу!");
            } else if (val === 'СПАТЬ') {
                showToast("Кот ушел спать... 😴");
            }
        }
    });
}

// --- 31. ЗАПУСК ВСЕХ НОВЫХ МОДУЛЕЙ ---

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация гороскопа
    initHoroscope();
    
    // Кастомные курсоры
    initCustomCursors();
    
    // Умный поиск (дополнительные команды)
    setupAdvancedSearch();

    // Добавляем пасхалку на клик по футеру
    const footer = document.querySelector('.main-footer-element');
    if (footer) {
        footer.addEventListener('click', () => {
            soundMeow();
            showToast("Спасибо, что посетил Мир Котиков! 🐾❤️");
            spawnConfetti(window.innerWidth / 2, window.innerHeight - 100, 30);
        });
    }

    console.log("%c🐱 Часть 5 успешно загружена! Все пасхалки активны!", "color: #ffa94d; font-size: 14px;");
});// ==========================================================================
// МИР КОТИКОВ - ЧАСТЬ 6 (УРОВНИ, ТЕМЫ, СЕКРЕТНАЯ ЗМЕЙКА)
// ==========================================================================

// --- 32. СИСТЕМА УРОВНЕЙ (XP) ---

let playerLevel = 1;
let playerXP = 0;
const XP_PER_LEVEL = 100;

function addXP(amount) {
    playerXP += amount;
    const statXP = document.getElementById('stat-val-xp');
    
    if (playerXP >= XP_PER_LEVEL) {
        playerLevel++;
        playerXP = playerXP - XP_PER_LEVEL;
        soundSuccess();
        showToast(`🎉 Новый уровень! Теперь ты Level ${playerLevel}!`);
        
        // Эффект при повышении уровня
        spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 50);
    }

    if (statXP) {
        statXP.textContent = `${playerXP} / ${XP_PER_LEVEL} (Lvl ${playerLevel})`;
    }
    
    // Сохраняем прогресс
    localStorage.setItem('catPlayerLevel', playerLevel);
    localStorage.setItem('catPlayerXP', playerXP);
}

function loadXP() {
    const savedLevel = localStorage.getItem('catPlayerLevel');
    const savedXP = localStorage.getItem('catPlayerXP');
    
    if (savedLevel) playerLevel = parseInt(savedLevel);
    if (savedXP) playerXP = parseInt(savedXP);
    
    const statXP = document.getElementById('stat-val-xp');
    if (statXP) {
        statXP.textContent = `${playerXP} / ${XP_PER_LEVEL} (Lvl ${playerLevel})`;
    }
}

// Начисление XP за действия (переопределяем старые функции)
const originalSoundMeow = soundMeow;
soundMeow = function() {
    originalSoundMeow();
    addXP(5); // +5 XP за мяуканье
};

const originalSoundClick = soundClick;
soundClick = function() {
    originalSoundClick();
    addXP(1); // +1 XP за клик
};

// --- 33. БЫСТРАЯ СМЕНА ТЕМЫ (КОСМИЧЕСКАЯ) ---

function initThemeSwitcher() {
    // Добавляем кнопку смены темы в панель инструментов
    const toolbar = document.getElementById('floating-tools');
    if (!toolbar) return;

    const themeBtn = document.createElement('button');
    themeBtn.className = 'tool-btn';
    themeBtn.innerHTML = '🌙';
    themeBtn.title = 'Сменить тему';
    themeBtn.style.cssText = 'margin-top: 10px; background: #4dabf7; color: white;';

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-dark');
        
        if (document.body.classList.contains('theme-dark')) {
            themeBtn.innerHTML = '☀️';
            themeBtn.style.background = '#ffa94d';
            showToast("Темная тема включена 🌙");
        } else {
            themeBtn.innerHTML = '🌙';
            themeBtn.style.background = '#4dabf7';
            showToast("Светлая тема включена ☀️");
        }
        soundClick();
    });

    toolbar.appendChild(themeBtn);
}

// --- 34. ЗВУКОВЫЕ ЭФФЕКТЫ ПРИ НАВЕДЕНИИ ---

function initHoverSounds() {
    const navBtns = document.querySelectorAll('.nav-link-button, .tool-btn, .primary-action-button');
    
    navBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            // Тихий звук при наведении (не раздражающий)
            if (soundEnabled) {
                playTone(1500, 0.02, 'sine', 0.02);
            }
        });
    });
}

// --- 35. СЕКРЕТНАЯ ИГРА "КОШАЧЬЯ ЗМЕЙКА" (В КОНСОЛИ) ---

function startSecretSnake() {
    console.log("%c🐍 ЗАПУСК КОШАЧЬЕЙ ЗМЕЙКИ...", "color: #51cf66; font-size: 20px; font-weight: bold;");
    console.log("Используй стрелки на клавиатуре, чтобы двигать кота 🐱 и собирать рыбок 🐟.");
    
    let snake = [{x: 10, y: 10}];
    let direction = 'RIGHT';
    let food = {x: 15, y: 10};
    let score = 0;
    
    // Очищаем консоль для игры
    console.clear();
    console.log("🐱 Счет: 0 | Нажми 'q' чтобы выйти.");

    const gameLoop = setInterval(() => {
        // Движение
        let head = { ...snake[0] };
        if (direction === 'RIGHT') head.x++;
        if (direction === 'LEFT') head.x--;
        if (direction === 'UP') head.y--;
        if (direction === 'DOWN') head.y++;

        // Проверка на выход за границы
        if (head.x < 0 || head.x > 20 || head.y < 0 || head.y > 20) {
            clearInterval(gameLoop);
            console.log(`%c💀 Игра окончена! Твой счет: ${score}`, "color: #ff6b6b; font-size: 20px;");
            soundError();
            return;
        }

        // Проверка на поедание рыбы
        if (head.x === food.x && head.y === food.y) {
            score++;
            snake.unshift(head);
            food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
            console.log(`%c🐟 Съедено! Счет: ${score}`, "color: #51cf66; font-size: 16px;");
            soundSuccess();
        } else {
            snake.unshift(head);
            snake.pop();
        }

        // Отрисовка поля
        let board = '';
        for (let y = 0; y <= 20; y++) {
            let row = '';
            for (let x = 0; x <= 20; x++) {
                if (x === snake[0].x && y === snake[0].y) {
                    row += '🐱'; // Голова
                } else if (snake.some(s => s.x === x && s.y === y)) {
                    row += '🐾'; // Тело
                } else if (x === food.x && y === food.y) {
                    row += '🐟'; // Еда
                } else {
                    row += '⬛';
                }
            }
            board += row + '\n';
        }
        console.clear();
        console.log(`🐱 Счет: ${score} | Нажми 'q' чтобы выйти.\n\n${board}`);
    }, 500);

    // Управление
    const keyHandler = (e) => {
        if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
        if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
        if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
        if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
        if (e.key.toLowerCase() === 'q') {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', keyHandler);
            console.clear();
            console.log("Игра закрыта. Мяу! 🐾");
        }
    };
    document.addEventListener('keydown', keyHandler);
    
    // Автоматический запуск через 10 секунд
    setTimeout(() => {
        clearInterval(gameLoop);
        document.removeEventListener('keydown', keyHandler);
        console.log("Змейка закрыта (время вышло).");
    }, 60000);
}

// --- 36. ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ВСЕХ ФИЧ ---

document.addEventListener('DOMContentLoaded', () => {
    loadXP();
    initThemeSwitcher();
    initHoverSounds();

    // Добавляем пасхалку на кнопку "О сайте" (клик 3 раза запускает змейку)
    let aboutClicks = 0;
    const aboutBtn = document.querySelector('[data-nav-target="section-about"]');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            aboutClicks++;
            if (aboutClicks >= 3) {
                aboutClicks = 0;
                startSecretSnake();
            }
        });
    }

    // Обновляем статистику XP в HTML (добавляем элемент в шапку)
    const headerStats = document.querySelector('.header-stats-area');
    if (headerStats) {
        const xpBox = document.createElement('div');
        xpBox.className = 'stat-box-element';
        xpBox.id = 'stat-box-xp';
        xpBox.innerHTML = `
            <span class="stat-box-icon">⭐</span>
            <span class="stat-box-value" id="stat-val-xp">0 / 100 (Lvl 1)</span>
            <span class="stat-box-label">Опыт</span>
        `;
        headerStats.appendChild(xpBox);
        loadXP(); // Загружаем реальные значения
    }

    console.log("%c🎮 Часть 6: Уровни и секретная змейка активированы!", "color: #ffa94d; font-size: 14px;");
});
