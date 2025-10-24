// Инициализация переменных
let gameArea;
let progressBar;
let timeRemainingText;
let endScreen;

let score = 0;
const totalTargets = 25; // Общее количество мишеней (изменено для 1 минуты)
let timeRemaining = 60; // 1 минута в секундах
let targetTimeout = 1000; // Начальное время появления мишени в миллисекундах

let timerInterval;

function startGame() {
  // Инициализируем переменные DOM
  gameArea = document.getElementById('game-area');
  progressBar = document.getElementById('progress-bar');
  timeRemainingText = document.getElementById('time-remaining');
  endScreen = document.getElementById('end-screen');

  // Обновляем отображение времени
  timeRemainingText.textContent = '01:00';

  // Сбрасываем параметры игры
  score = 0;
  timeRemaining = 60;
  targetTimeout = 1000;
  progressBar.style.width = '0%';
  gameArea.innerHTML = '';
  endScreen.innerHTML = '';
  endScreen.classList.add('hidden');

  // Запускаем таймер игры
  timerInterval = setInterval(updateTimer, 1000);
  spawnTarget();
}

function updateTimer() {
  timeRemaining--;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timeRemainingText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (timeRemaining <= 0) {
    // Время вышло - перезапускаем уровень
    clearInterval(timerInterval);
    alert('Время вышло! Попробуйте снова.');
    resetGame();
  }
}

function spawnTarget() {
  // Создаем мишень
  const target = document.createElement('div');
  target.classList.add('target');

  // Случайный размер мишени
  const size = Math.random() * 50 + 30; // от 30 до 80 пикселей
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  // Случайное положение мишени внутри игровой области
  const areaRect = gameArea.getBoundingClientRect();
  const x = Math.random() * (areaRect.width - size);
  const y = Math.random() * (areaRect.height - size);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  // Добавляем мишень в игровую область
  gameArea.appendChild(target);

  // Обработчик клика по мишени
  target.addEventListener('click', () => {
    score++;
    updateProgressBar();
    gameArea.removeChild(target);

    // Уменьшаем время появления мишени при попадании
    if (targetTimeout > 200) {
      targetTimeout -= 30;
    }

    checkWinCondition();
    spawnNextTarget();
  });

  // Удаляем мишень через определенное время
  setTimeout(() => {
    if (gameArea.contains(target)) {
      gameArea.removeChild(target);

      // Увеличиваем время появления мишени при промахе
      if (targetTimeout < 1200) {
        targetTimeout += 30;
      }

      spawnNextTarget();
    }
  }, targetTimeout);
}

function spawnNextTarget() {
  // Ждем небольшую задержку перед появлением следующей мишени
  setTimeout(spawnTarget, 300);
}

function updateProgressBar() {
  const progress = (score / totalTargets) * 100;
  progressBar.style.width = `${progress}%`;
}

function checkWinCondition() {
  if (score >= totalTargets) {
    // Останавливаем игру
    clearInterval(timerInterval);
    gameArea.innerHTML = '';
    showEndScreen();
  }
}

function resetGame() {
  // Перезапускаем игру
  startGame();
}

function showEndScreen() {
  endScreen.classList.remove('hidden');
  startEndScreenAnimation();

  // Переход на новую страницу после заставки
  setTimeout(() => {
    window.location.href = 'level6.html'; // Замените на ваш URL новой страницы
  }, 5000); // Длительность заставки 5 секунд
}

function startEndScreenAnimation() {
  // Создаем анимацию падающих зеленых цифр (эффект "Матрицы")
  const columns = Math.floor(window.innerWidth / 20);
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = 0;
  }

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  endScreen.appendChild(canvas);

  const context = canvas.getContext('2d');

  function drawMatrix() {
    context.fillStyle = 'rgba(0, 0, 0, 0.05)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#0f0';
    context.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = Math.floor(Math.random() * 10);
      context.fillText(text, i * 20, drops[i] * 20);

      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  setInterval(drawMatrix, 33);
}

// Запускаем игру после загрузки страницы
window.onload = startGame;
