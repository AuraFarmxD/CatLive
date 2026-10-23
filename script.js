/* ==========================================================================
   МИР КОТИКОВ - ГЛАВНЫЙ СКРИПТ (ЧАСТЬ 1)
   ========================================================================== */

// Глобальные переменные состояния
let globalState = {
    meows: 0,
    clicks: 0,
    facts: 0,
    gamesPlayed: 0
};

let soundEnabled = true;
let audioCtx = null;

// ==========================================================================
// 1. ИНИЦИАЛИЗАЦИЯ WEB AUDIO API (СИНТЕЗ ЗВУКОВ)
// ==========================================================================
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Аудио контекст не поддерживается браузером.");
        }
    }
}

// Функция воспроизведения базового тона
function playTone(frequency, duration, type = 'sine', volume = 0.1) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (error) {
        console.error("Ошибка воспроизведения звука:", error);
    }
}

// Звук "Мяу" (комбинация тонов)
function soundMeow() {
    playTone(800, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(1000, 0.15, 'sine', 0.1), 100);
    setTimeout(() => playTone(600, 0.3, 'sine', 0.15), 250);
    
    globalState.meows++;
    const statMeows = document.getElementById('stat-val-meows');
    if (statMeows) statMeows.textContent = globalState.meows;
}

// Звук клика
function soundClick() {
    playTone(1200, 0.05, 'square', 0.05);
    globalState.clicks++;
    const statClicks = document.getElementById('stat-val-clicks');
    if (statClicks) statClicks.textContent = globalState.clicks;
}

// Звук успеха
function soundSuccess() {
    playTone(523.25, 0.1, 'sine', 0.1); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.1), 200); // G5
}

// Звук ошибки
function soundError() {
    playTone(200, 0.2, 'sawtooth', 0.1);
    setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.1), 200);
}

// ==========================================================================
// 2. ПРЕЛОАДЕР И ЗАГРУЗКА СТРАНИЦЫ
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader-screen');
    const fill = document.getElementById('preloader-bar-fill');
    const status = document.getElementById('preloader-status');

    let progress = 0;
    const messages = ["Инициализация...", "Загрузка котов...", "Готовим коробки...", "Почти готово!"];
    
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        if (fill) fill.style.width = progress + '%';
        
        if (progress > 30 && progress < 60 && status) status.textContent = messages[1];
        if (progress > 60 && progress < 90 && status) status.textContent = messages[2];
        if (progress >= 90 && status) status.textContent = messages[3];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (preloader) {
                    preloader.classList.add('hidden');
                }
                // Инициализируем игры после загрузки
                if (typeof initGames === 'function') initGames();
            }, 400);
        }
    }, 100);

    // Навешиваем обработчики
    setupNavigation();
    setupSoundToggle();
    setupCatCards();
    setupQuickTools();
});

// ==========================================================================
// 3. НАВИГАЦИЯ ПО СЕКЦИЯМ
// ==========================================================================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-link-button');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            navButtons.forEach(b => b.classList.remove('active'));
            // Добавляем текущей
            btn.classList.add('active');

            // Скрываем все секции
            sections.forEach(s => s.classList.remove('active-section'));

            // Показываем нужную
            const targetId = btn.getAttribute('data-nav-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-section');
            }

            soundClick();
        });
    });

    // Кнопка на главной "Начать путешествие"
    const btnHeroStart = document.getElementById('btn-hero-start');
    if (btnHeroStart) {
        btnHeroStart.addEventListener('click', () => {
            const catsBtn = document.querySelector('[data-nav-target="section-cats"]');
            if (catsBtn) catsBtn.click();
        });
    }
}

// ==========================================================================
// 4. КНОПКА ЗВУКА
// ==========================================================================
function setupSoundToggle() {
    const soundBtn = document.getElementById('global-sound-toggle');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = soundEnabled ? '1' : '0.5';
        
        if (soundEnabled) {
            initAudio(); // Разблокируем аудио при клике
            playTone(1000, 0.1, 'sine', 0.1);
        }
    });
}

// ==========================================================================
// 5. КАРТОЧКИ КОТОВ (КЛИКИ)
// ==========================================================================
function setupCatCards() {
    const catCards = document.querySelectorAll('.cat-display-card');
    
    catCards.forEach(card => {
        card.addEventListener('click', () => {
            soundMeow();
            soundClick();

            // Анимация карточки
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);

            // Появление сердечка или лапки
            spawnHeart(card);
        });
    });
}

// Функция создания летящего сердечка
function spawnHeart(element) {
    const rect = element.getBoundingClientRect();
    const heart = document.createElement('div');
    heart.textContent = ['❤️', '🐾', '🐟', '✨'][Math.floor(Math.random() * 4)];
    heart.style.position = 'fixed';
    heart.style.left = rect.left + rect.width / 2 + 'px';
    heart.style.top = rect.top + rect.height / 2 + 'px';
    heart.style.fontSize = '30px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.transition = 'all 1s ease-out';
    
    document.body.appendChild(heart);

    requestAnimationFrame(() => {
        heart.style.transform = `translate(${Math.random() * 100 - 50}px, -100px) scale(1.5) rotate(${Math.random() * 90 - 45}deg)`;
        heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 1000);
}

// ==========================================================================
// 6. БЫСТРЫЕ ИНСТРУМЕНТЫ (ВНИЗУ СПРАВА)
// ==========================================================================
function setupQuickTools() {
    const btnSettings = document.getElementById('tool-btn-settings');
    const btnAch = document.getElementById('tool-btn-achievements');
    const btnHelp = document.getElementById('tool-btn-help');
    const btnTop = document.getElementById('tool-btn-scroll-top');

    // Настройки
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            const modal = document.getElementById('modal-settings');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
            soundClick();
        });
    }

    // Достижения
    if (btnAch) {
        btnAch.addEventListener('click', () => {
            const modal = document.getElementById('modal-achievements');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
            soundClick();
        });
    }

    // Помощь
    if (btnHelp) {
        btnHelp.addEventListener('click', () => {
            const modal = document.getElementById('modal-help');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
            soundClick();
        });
    }

    // Наверх
    if (btnTop) {
        btnTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            soundClick();
        });
    }
/* ==========================================================================
   МИР КОТИКОВ - ГЛАВНЫЙ СКРИПТ (ЧАСТЬ 2)
   ========================================================================== */

// ==========================================================================
// 7. СЕКЦИЯ ФАКТОВ
// ==========================================================================
const factsData = [
    { category: "Анатомия", text: "У кошек 230 костей, что на 24 больше, чем у человека." },
    { category: "Сон", text: "Кошки спят 16 часов в сутки, что составляет 70% их жизни." },
    { category: "Зрение", text: "Кошки видят в темноте в 6 раз лучше людей, но не различают красный цвет." },
    { category: "Слух", text: "У кошек 32 мышцы в каждом ухе, позволяющие поворачивать их на 180 градусов." },
    { category: "Вкус", text: "Кошки не чувствуют сладкий вкус из-за отсутствия нужного рецептора." },
    { category: "Прыжки", text: "Кошка может прыгнуть в высоту, в 5 раз превышающую её рост." },
    { category: "Сердце", text: "Сердце кошки бьется в два раза быстрее человеческого — 150 ударов в минуту." },
    { category: "Голос", text: "Кошки могут издавать около 100 различных звуков, в то время как собаки только 10." },
    { category: "Мурчание", text: "Мурчание кошки имеет частоту 25-150 Гц и способствует заживлению костей." },
    { category: "Нос", text: "Отпечаток носа кошки уникален, как отпечаток пальца у человека." },
    { category: "Пот", text: "Кошки потеют только через подушечки лап, так как у них нет потовых желез на теле." },
    { category: "Усы", text: "Усы кошки — это орган осязания, который помогает ей ориентироваться в пространстве." }
];

let currentFactIndex = -1;

function showRandomFact() {
    const factTextEl = document.getElementById('fact-display-text');
    const factCatEl = document.getElementById('fact-display-category');
    const historyList = document.getElementById('fact-history-list');

    if (!factTextEl) return;

    // Выбираем случайный факт
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * factsData.length);
    } while (newIndex === currentFactIndex && factsData.length > 1);
    
    currentFactIndex = newIndex;
    const fact = factsData[currentFactIndex];

    // Анимация исчезновения
    factTextEl.style.opacity = '0';
    factTextEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
        // Меняем текст
        factTextEl.textContent = fact.text;
        if (factCatEl) factCatEl.textContent = `Категория: ${fact.category}`;
        
        // Возвращаем видимость
        factTextEl.style.opacity = '1';
        factTextEl.style.transform = 'translateY(0)';
        
        // Добавляем в историю
        if (historyList) {
            const li = document.createElement('li');
            li.className = 'history-list-item';
            li.textContent = fact.text;
            
            // Удаляем заглушку, если она есть
            const placeholder = historyList.querySelector('.history-list-item:first-child');
            if (placeholder && placeholder.textContent.includes("Здесь появятся")) {
                placeholder.remove();
            }
            
            historyList.prepend(li); // Добавляем в начало
            
            // Ограничиваем историю 5 элементами
            if (historyList.children.length > 5) {
                historyList.lastElementChild.remove();
            }
        }
    }, 200);

    soundClick();
    globalState.facts++;
    const statFacts = document.getElementById('stat-val-facts');
    if (statFacts) statFacts.textContent = globalState.facts;
}

function setupFacts() {
    const btnRandom = document.getElementById('btn-generate-fact');
    const btnNext = document.getElementById('btn-next-fact');

    if (btnRandom) btnRandom.addEventListener('click', showRandomFact);
    if (btnNext) btnNext.addEventListener('click', showRandomFact);
}

// ==========================================================================
// 8. ВИКТОРИНА (УГАДАЙ ПОРОДУ / ФАКТ)
// ==========================================================================
const quizData = [
    { question: "Какая порода кошек считается самой крупной?", options: ["Мейн-кун", "Британская", "Сфинкс", "Персидская"], correct: 0 },
    { question: "У какой породы кошек нет шерсти?", options: ["Бенгальская", "Сфинкс", "Шотландская", "Сиамская"], correct: 1 },
    { question: "Какая порода известна своими голубыми глазами и светлой шерстью?", options: ["Рэгдолл", "Бирманская", "Турецкая ангора", "Абиссинская"], correct: 2 },
    { question: "Какую породу называют 'кошкой-собакой' из-за её преданности?", options: ["Мейн-кун", "Рэгдолл", "Бенгальская", "Сфинкс"], correct: 1 },
    { question: "Какая порода имеет характерный пятнистый окрас, как у леопарда?", options: ["Бенгальская", "Сиамская", "Британская", "Манчкин"], correct: 0 }
];

let currentQuestion = 0;
let quizScore = 0;

function initQuiz() {
    currentQuestion = 0;
    quizScore = 0;
    renderQuestion();
}

function renderQuestion() {
    const questionEl = document.getElementById('quiz-question-text');
    const optionsEl = document.getElementById('quiz-options-container');
    const counterEl = document.getElementById('quiz-current-num');
    const totalEl = document.getElementById('quiz-total-num');
    const progressEl = document.getElementById('quiz-progress-fill');
    const feedbackEl = document.getElementById('quiz-feedback-message');
    const nextBtn = document.getElementById('btn-quiz-next');

    if (!questionEl || !optionsEl) return;

    if (feedbackEl) feedbackEl.textContent = '';
    if (nextBtn) nextBtn.style.display = 'none';

    if (currentQuestion >= quizData.length) {
        // Викторина завершена
        questionEl.textContent = "Викторина завершена!";
        optionsEl.innerHTML = `<p style="text-align:center; font-size:1.2rem; font-weight:bold; color:#ff6b9d;">Твой результат: ${quizScore} из ${quizData.length}</p>`;
        if (progressEl) progressEl.style.width = '100%';
        
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = 'Пройти заново';
            nextBtn.onclick = initQuiz;
        }
        soundSuccess();
        return;
    }

    const q = quizData[currentQuestion];
    
    if (counterEl) counterEl.textContent = currentQuestion + 1;
    if (totalEl) totalEl.textContent = quizData.length;
    if (progressEl) progressEl.style.width = `${((currentQuestion) / quizData.length) * 100}%`;

    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsEl.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement) {
    const q = quizData[currentQuestion];
    const feedbackEl = document.getElementById('quiz-feedback-message');
    const nextBtn = document.getElementById('btn-quiz-next');
    
    // Блокируем все кнопки
    const allButtons = document.querySelectorAll('.quiz-option-btn');
    allButtons.forEach(b => b.disabled = true);

    if (selectedIndex === q.correct) {
        btnElement.classList.add('correct-answer');
        if (feedbackEl) {
            feedbackEl.textContent = "✅ Правильно!";
            feedbackEl.style.color = "#51cf66";
        }
        quizScore++;
        soundSuccess();
    } else {
        btnElement.classList.add('wrong-answer');
        // Подсвечиваем правильный
        allButtons[q.correct].classList.add('correct-answer');
        
        if (feedbackEl) {
            feedbackEl.textContent = "❌ Неправильно!";
            feedbackEl.style.color = "#ff6b6b";
        }
        soundError();
    }

    if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.onclick = () => {
            currentQuestion++;
            renderQuestion();
        };
    }
}

// ==========================================================================
// 9. МИНИ-ИГРА 1: ПОЙМАЙ МЫШКУ
// ==========================================================================
let catchGameInterval = null;
let catchSpawnInterval = null;
let catchScore = 0;
let catchTimeLeft = 30;
let isCatchGameRunning = false;

function startCatchGame() {
    if (isCatchGameRunning) return;
    
    const area = document.getElementById('catch-play-area');
    const startBtn = document.getElementById('btn-start-catch');
    const scoreEl = document.getElementById('catch-score');
    const timerEl = document.getElementById('catch-timer');
    
    if (!area || !startBtn) return;

    // Сброс
    isCatchGameRunning = true;
    catchScore = 0;
    catchTimeLeft = 30;
    area.innerHTML = '';
    if (scoreEl) scoreEl.textContent = '0';
    if (timerEl) timerEl.textContent = '30';
    startBtn.textContent = 'Игра идёт...';
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';

    soundSuccess();

    // Таймер
    catchGameInterval = setInterval(() => {
        catchTimeLeft--;
        if (timerEl) timerEl.textContent = catchTimeLeft;
        
        if (catchTimeLeft <= 0) {
            endCatchGame();
        }
    }, 1000);

    // Спавн мышей
    catchSpawnInterval = setInterval(spawnMouse, 700);
    spawnMouse();
}

function spawnMouse() {
    if (!isCatchGameRunning) return;
    const area = document.getElementById('catch-play-area');
    if (!area) return;

    const mouse = document.createElement('div');
    mouse.className = 'flying-mouse';
    mouse.textContent = '🐭';
    
    // Рандомная позиция
    const maxX = area.clientWidth - 50;
    const maxY = area.clientHeight - 50;
    mouse.style.left = Math.max(0, Math.random() * maxX) + 'px';
    mouse.style.top = Math.max(0, Math.random() * maxY) + 'px';

    mouse.onclick = () => {
        catchScore++;
        const scoreEl = document.getElementById('catch-score');
        if (scoreEl) scoreEl.textContent = catchScore;
        soundClick();
        playTone(1500, 0.1, 'sine');
        
        // Создаем эффект очков
        showScorePopup(area, mouse.style.left, mouse.style.top, '+1');
        
        mouse.remove();
    };

    area.appendChild(mouse);

    // Удаление через 1.5 сек
    setTimeout(() => {
        if (mouse.parentNode) mouse.remove();
    }, 1500);
}

function showScorePopup(parent, left, top, text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    popup.style.left = left;
    popup.style.top = top;
    parent.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function endCatchGame() {
    clearInterval(catchGameInterval);
    clearInterval(catchSpawnInterval);
    isCatchGameRunning = false;

    const area = document.getElementById('catch-play-area');
    const startBtn = document.getElementById('btn-start-catch');

    if (area) {
        area.innerHTML = `
            <div class="game-placeholder-message" style="color: #ff6b9d;">
                🎉 Игра окончена!<br>
                Поймано мышек: <b>${catchScore}</b>
            </div>
        `;
    }

    if (startBtn) {
        startBtn.textContent = '▶ Играть снова';
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
    }

    soundMeow();
}

// Инициализация игр (вызывается в Части 1)
function initGames() {
    setupFacts();
    initQuiz();

    const btnStartCatch = document.getElementById('btn-start-catch');
    if (btnStartCatch) {
        btnStartCatch.addEventListener('click', startCatchGame);
    }
}/* ==========================================================================
   МИР КОТИКОВ - ГЛАВНЫЙ СКРИПТ (ЧАСТЬ 3)
   ========================================================================== */

// ==========================================================================
// 10. МИНИ-ИГРА 2: НАЙДИ ПАРУ (MEMORY GAME)
// ==========================================================================
const memoryEmojis = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀'];
let memoryDeck = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryMoves = 0;
let isMemoryLocked = false;

function startMemoryGame() {
    const board = document.getElementById('memory-board');
    if (!board) return;

    // Сброс
    board.innerHTML = '';
    memoryDeck = [...memoryEmojis, ...memoryEmojis];
    memoryFlipped = [];
    memoryMatched = 0;
    memoryMoves = 0;
    isMemoryLocked = false;

    updateMemoryStats();

    // Перемешивание Фишера-Йетса
    for (let i = memoryDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [memoryDeck[i], memoryDeck[j]] = [memoryDeck[j], memoryDeck[i]];
    }

    // Генерация карточек
    memoryDeck.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">🐾</div>
                <div class="memory-card-back">${emoji}</div>
            </div>
        `;

        card.addEventListener('click', () => flipMemoryCard(card));
        board.appendChild(card);
    });

    soundSuccess();
}

function flipMemoryCard(card) {
    if (isMemoryLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    soundClick();
    memoryFlipped.push(card);

    if (memoryFlipped.length === 2) {
        memoryMoves++;
        updateMemoryStats();
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    isMemoryLocked = true;
    const [card1, card2] = memoryFlipped;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        // Совпадение
        soundSuccess();
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            memoryMatched++;
            updateMemoryStats();
            
            memoryFlipped = [];
            isMemoryLocked = false;

            if (memoryMatched === memoryEmojis.length) {
                setTimeout(() => {
                    alert('🎉 Поздравляем! Ты нашел все пары!');
                }, 300);
            }
        }, 500);
    } else {
        // Ошибка
        soundError();
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            memoryFlipped = [];
            isMemoryLocked = false;
        }, 1000);
    }
}

function updateMemoryStats() {
    const movesEl = document.getElementById('memory-moves');
    const pairsEl = document.getElementById('memory-pairs');
    if (movesEl) movesEl.textContent = memoryMoves;
    if (pairsEl) pairsEl.textContent = `${memoryMatched}/8`;
}

// ==========================================================================
// 11. МИНИ-ИГРА 3: ПОКОРМИ КОТА
// ==========================================================================
let hungerLevel = 50;
let feedGameInterval = null;

function startFeedGame() {
    if (feedGameInterval) clearInterval(feedGameInterval);
    
    hungerLevel = 50;
    updateHungerUI();

    // Каждую секунду голод увеличивается
    feedGameInterval = setInterval(() => {
        hungerLevel += 2;
        if (hungerLevel > 100) hungerLevel = 100;
        updateHungerUI();
    }, 1000);
}

function feedCat() {
    hungerLevel -= 15;
    if (hungerLevel < 0) hungerLevel = 0;
    updateHungerUI();
    
    soundMeow();

    const cat = document.getElementById('feed-cat-character');
    if (cat) {
        cat.style.transform = 'scale(1.2)';
        setTimeout(() => cat.style.transform = 'scale(1)', 200);
    }
}

function updateHungerUI() {
    const fill = document.getElementById('hunger-fill');
    const text = document.getElementById('hunger-percent');
    const cat = document.getElementById('feed-cat-character');

    if (fill) {
        fill.style.width = hungerLevel + '%';
        
        // Меняем цвет в зависимости от голода
        if (hungerLevel > 80) {
            fill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4757)';
        } else if (hungerLevel > 50) {
            fill.style.background = 'linear-gradient(90deg, #ffa94d, #ff9233)';
        } else {
            fill.style.background = 'linear-gradient(90deg, #51cf66, #94d82d)';
        }
    }

    if (text) text.textContent = Math.round(hungerLevel) + '%';

    // Меняем эмоцию кота
    if (cat) {
        if (hungerLevel > 80) cat.textContent = '😿';
        else if (hungerLevel < 30) cat.textContent = '😻';
        else cat.textContent = '🐈';
    }
}

// ==========================================================================
// 12. СИСТЕМА ДОСТИЖЕНИЙ
// ==========================================================================
const achievementsData = [
    { id: 'start', icon: '👣', title: 'Первый шаг', desc: 'Зайти на сайт', unlocked: false },
    { id: 'meow_5', icon: '🐾', title: 'Мурчатель', desc: 'Погладить 5 котов', unlocked: false },
    { id: 'meow_20', icon: '❤️', title: 'Кошатник', desc: 'Погладить 20 котов', unlocked: false },
    { id: 'fact_5', icon: '❓', title: 'Почемучка', desc: 'Прочитать 5 фактов', unlocked: false },
    { id: 'fact_15', icon: '🧠', title: 'Эрудит', desc: 'Прочитать 15 фактов', unlocked: false },
    { id: 'game_catch', icon: '🐭', title: 'Ловец', desc: 'Поиграть в "Поймай мышку"', unlocked: false },
    { id: 'game_memory', icon: '🎴', title: 'Картежник', desc: 'Поиграть в "Найди пару"', unlocked: false },
    { id: 'game_feed', icon: '🍣', title: 'Заботливый', desc: 'Покормить кота', unlocked: false },
    { id: 'secret', icon: '🕵️', title: 'Секретный агент', desc: 'Найти пасхалку', unlocked: false }
];

function checkAchievements() {
    let changed = false;

    if (globalState.meows >= 5 && !achievementsData[1].unlocked) { unlockAchievement(1); changed = true; }
    if (globalState.meows >= 20 && !achievementsData[2].unlocked) { unlockAchievement(2); changed = true; }
    if (globalState.facts >= 5 && !achievementsData[3].unlocked) { unlockAchievement(3); changed = true; }
    if (globalState.facts >= 15 && !achievementsData[4].unlocked) { unlockAchievement(4); changed = true; }

    if (changed) saveAchievements();
}

function unlockAchievement(index) {
    const ach = achievementsData[index];
    if (ach.unlocked) return;

    ach.unlocked = true;
    soundSuccess();
    
    // Показываем всплывашку
    const popup = document.getElementById('achievement-popup');
    const nameEl = document.getElementById('achievement-popup-name');
    
    if (popup && nameEl) {
        nameEl.textContent = ach.title;
        popup.classList.remove('hidden');
        
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 3000);
    }

    renderAchievementsList();
}

function renderAchievementsList() {
    const container = document.getElementById('achievements-list-container');
    if (!container) return;

    container.innerHTML = '';
    achievementsData.forEach(ach => {
        const item = document.createElement('div');
        item.className = `achievement-item ${ach.unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-info">
                <span class="ach-title">${ach.title}</span>
                <span class="ach-desc">${ach.desc}</span>
            </div>
            <div class="ach-status">${ach.unlocked ? '✅' : '🔒'}</div>
        `;
        container.appendChild(item);
    });
}

// Сохранение достижений в LocalStorage
function saveAchievements() {
    const unlockedIds = achievementsData.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('catAchievements', JSON.stringify(unlockedIds));
    localStorage.setItem('catGlobalState', JSON.stringify(globalState));
}

// Загрузка при старте
function loadAchievements() {
    const savedAch = localStorage.getItem('catAchievements');
    if (savedAch) {
        try {
            const parsed = JSON.parse(savedAch);
            achievementsData.forEach(ach => {
                if (parsed.includes(ach.id)) ach.unlocked = true;
            });
        } catch(e) {}
    }

    const savedState = localStorage.getItem('catGlobalState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            globalState = { ...globalState, ...parsed };
            
            // Обновляем цифры на экране
            const sMeows = document.getElementById('stat-val-meows');
            const sClicks = document.getElementById('stat-val-clicks');
            const sFacts = document.getElementById('stat-val-facts');
            
            if (sMeows) sMeows.textContent = globalState.meows;
            if (sClicks) sClicks.textContent = globalState.clicks;
            if (sFacts) sFacts.textContent = globalState.facts;
        } catch(e) {}
    }

    renderAchievementsList();
}

// ==========================================================================
// 13. НАСТРОЙКИ
// ==========================================================================
function setupSettings() {
    const btnSave = document.getElementById('btn-save-settings');
    const checkDark = document.getElementById('setting-dark');
    const checkSound = document.getElementById('setting-sound');

    // Загрузка настроек
    if (localStorage.getItem('catThemeDark') === 'true' && checkDark) {
        checkDark.checked = true;
        document.body.classList.add('theme-dark');
    }

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
            }

            soundClick();
            
            const modal = document.getElementById('modal-settings');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        });
    }
}

// ==========================================================================
// 14. ОБРАБОТЧИКИ ДЛЯ ВКЛАДОК ИГР
// ==========================================================================
function setupGameTabs() {
    const tabs = document.querySelectorAll('.game-tab-button');
    const panels = document.querySelectorAll('.game-panel-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active-tab'));
            panels.forEach(p => p.classList.remove('active-panel'));

            tab.classList.add('active-tab');
            const targetId = tab.getAttribute('data-game-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active-panel');

            soundClick();

            // Автозапуск некоторых игр
            if (targetId === 'game-feed-panel') {
                startFeedGame();
                if(!achievementsData[7].unlocked) { unlockAchievement(7); saveAchievements(); }
            }
            if (targetId === 'game-memory-panel' && memoryMatched === 0) {
                startMemoryGame();
                if(!achievementsData[6].unlocked) { unlockAchievement(6); saveAchievements(); }
            }
        });
    });
}

// ==========================================================================
// 15. ОБНОВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================================================
// Перезаписываем DOMContentLoaded, чтобы включить новые функции
document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
    setupSettings();
    setupGameTabs();

    // Достижение за вход
    if (!achievementsData[0].unlocked) {
        setTimeout(() => unlockAchievement(0), 1500);
    }

    // Кнопки игр
    const btnMemory = document.getElementById('btn-start-memory');
    if (btnMemory) btnMemory.addEventListener('click', () => {
        startMemoryGame();
        if(!achievementsData[6].unlocked) { unlockAchievement(6); saveAchievements(); }
    });

    const btnFeed = document.getElementById('btn-feed-cat');
    if (btnFeed) btnFeed.addEventListener('click', feedCat);
    
    // Запускаем игру "Покорми", когда открыта вкладка
    const startCatchBtn = document.getElementById('btn-start-catch');
    if (startCatchBtn) startCatchBtn.addEventListener('click', () => {
        if(!achievementsData[5].unlocked) { unlockAchievement(5); saveAchievements(); }
    });

    // Проверяем ачивки каждые 2 секунды
    setInterval(checkAchievements, 2000);
});/* ==========================================================================
   МИР КОТИКОВ - ГЛАВНЫЙ СКРИПТ (ЧАСТЬ 4 - ФИНАЛ)
   ========================================================================== */

// ==========================================================================
// 16. ПАСХАЛКА: 5 КЛИКОВ ПО ЗАГОЛОВКУ
// ==========================================================================
let titleClicks = 0;

function setupTitleEasterEgg() {
    const title = document.getElementById('main-title-text');
    if (!title) return;

    title.style.cursor = 'pointer';
    title.style.userSelect = 'none';

    title.addEventListener('click', () => {
        titleClicks++;
        playTone(400 + (titleClicks * 100), 0.1, 'sine', 0.1);
        
        // Анимация нажатия
        title.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => title.style.transform = 'scale(1) rotate(0deg)', 150);

        if (titleClicks >= 5) {
            soundSuccess();
            
            // Показываем секретный блок
            const secretBlock = document.getElementById('hidden-horoscope-section');
            if (secretBlock) {
                secretBlock.style.display = 'block';
                secretBlock.classList.add('pulse-effect');
                setTimeout(() => secretBlock.classList.remove('pulse-effect'), 3000);
            }

            // Открываем достижение
            if (!achievementsData[8].unlocked) {
                unlockAchievement(8);
                saveAchievements();
            }

            // Эффект конфетти
            spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 50);
            
            titleClicks = 0;
        }
    });
}

// ==========================================================================
// 17. ЭФФЕКТ СЛЕДОВАНИЯ ЛАПОК ЗА МЫШКОЙ
// ==========================================================================
let lastTrailTime = 0;

function setupMouseTrail() {
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        // Ограничиваем частоту появления (каждые 100 мс)
        if (now - lastTrailTime < 100) return;
        lastTrailTime = now;

        const paw = document.createElement('div');
        paw.textContent = '🐾';
        paw.style.position = 'fixed';
        paw.style.left = e.clientX + 'px';
        paw.style.top = e.clientY + 'px';
        paw.style.fontSize = '20px';
        paw.style.pointerEvents = 'none';
        paw.style.opacity = '0.6';
        paw.style.zIndex = '9999';
        paw.style.transition = 'all 1s ease-out';
        paw.style.transform = 'translate(-50%, -50%) scale(1)';
        
        document.body.appendChild(paw);

        requestAnimationFrame(() => {
            paw.style.opacity = '0';
            paw.style.transform = `translate(-50%, -50%) translateY(30px) scale(0.5) rotate(${Math.random() * 90 - 45}deg)`;
        });

        setTimeout(() => paw.remove(), 1000);
    });
}

// ==========================================================================
// 18. СИСТЕМА ВСПЛЫВАЮЩИХ УВЕДОМЛЕНИЙ (TOAST)
// ==========================================================================
function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    container.appendChild(toast);

    // Появление
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Исчезновение
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================================================
// 19. ЭФФЕКТ КОНФЕТТИ
// ==========================================================================
function spawnConfetti(x, y, count = 30) {
    const emojis = ['🐾', '❤️', '✨', '🐟', '🌟', '😺'];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = (Math.random() * 20 + 10) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '99999';
        
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 50;

        requestAnimationFrame(() => {
            particle.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 1000);
    }
}

// ==========================================================================
// 20. СЕКРЕТНЫЙ ЧАТ С КОТОМ
// ==========================================================================
const catResponses = [
    "Мяу! 🐾",
    "Муррр... 😺",
    "Дай рыбку! 🐟",
    "Я тебя люблю! ❤️",
    "Почеши за ушком...",
    "Мяу-мяу!",
    "*уронил кружку* 🙀",
    "Хочу спать... 😴",
    "Где моя коробка?",
    "Давай играть!"
];

function setupCatChat() {
    const sendBtn = document.getElementById('chat-send-btn');
    const inputField = document.getElementById('chat-input-field');
    const messagesBox = document.getElementById('chat-messages-box');

    if (!sendBtn || !inputField || !messagesBox) return;

    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        // Сообщение пользователя
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.textContent = text;
        messagesBox.appendChild(userMsg);
        
        inputField.value = '';
        messagesBox.scrollTop = messagesBox.scrollHeight;
        soundClick();

        // Ответ кота через секунду
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-msg bot';
            botMsg.textContent = catResponses[Math.floor(Math.random() * catResponses.length)];
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

// ==========================================================================
// 21. ИНИЦИАЛИЗАЦИЯ СКРЫТЫХ ЭЛЕМЕНТОВ И СЕКРЕТНЫХ ФИШЕК
// ==========================================================================
function setupSecretCat() {
    // Делаем секретного кота кликабельным (он скрыт по умолчанию в CSS)
    const secretCat = document.getElementById('secret-cat-easter-egg');
    if (secretCat) {
        secretCat.addEventListener('click', () => {
            soundMeow();
            spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
            showToast("Секретный кот найден! 🐈‍⬛");
            
            // Открываем чат с котом
            const chatModal = document.getElementById('cat-chat-modal');
            if (chatModal) {
                chatModal.classList.remove('hidden');
                chatModal.style.display = 'flex';
            }
        });
    }
}

// ==========================================================================
// 22. СЛУЧАЙНЫЕ ФРАЗЫ ПРИ БЕЗДЕЙСТВИИ
// ==========================================================================
let idleTimer;
const idleMessages = [
    "Ты тут? 🐾",
    "Погладь кота...",
    "Хочешь узнать новый факт?",
    "Сыграем в игру?",
    "Мяу?"
];

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        showToast(msg);
    }, 30000); // Через 30 секунд бездействия
}

// Сбрасываем таймер при действиях пользователя
document.addEventListener('click', resetIdleTimer);
document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);

// ==========================================================================
// 23. ЗАВЕРШЕНИЕ ЗАГРУЗКИ (DOMContentLoaded)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Подключаем эффекты
    setupTitleEasterEgg();
    setupMouseTrail();
    setupCatChat();
    setupSecretCat();
    
    // Запускаем таймер бездействия
    resetIdleTimer();

    // Показываем приветственное сообщение
    setTimeout(() => {
        showToast("Добро пожаловать в Мир Котиков! 🐾");
    }, 2000);

    // Пасхалка в консоли
    console.log("%c🐱 Мяу! Ты залез в код?", "color: #ff6b9d; font-size: 20px; font-weight: bold;");
    console.log("%cПопробуй кликнуть 5 раз по главному заголовку ;)", "color: #7a5c3e; font-style: italic;");
    
    // Глобальные функции для консоли
    window.meow = () => soundMeow();
    window.purr = () => playTone(100, 0.5, 'sine', 0.1);
    window.showSecret = () => {
        const sc = document.getElementById('secret-cat-easter-egg');
        if(sc) { sc.style.display = 'block'; showToast("Секретный кот появился в левом нижнем углу!"); }
    };
});

// ==========================================================================
// КОНЕЦ СКРИПТА
// ==========================================================================
