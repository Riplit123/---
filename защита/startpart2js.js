// Получаем элементы
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('overlay');
// const introVideo = document.getElementById('intro-video'); // не используется

// Устанавливаем размеры канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Переменные для анимации
const particles = [];
const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
const colors = ['#00ffcc', '#ff00ff', '#ffff00', '#ff0000', '#00ff00', '#00ccff', '#ff9900'];

class Particle {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.char = symbols.charAt(Math.floor(Math.random() * symbols.length));
        this.speed = speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 16 + Math.random() * 10;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.x = Math.random() * canvas.width;
            this.y = -50;
            this.speed = 2 + Math.random() * 3;
            this.char = symbols.charAt(Math.floor(Math.random() * symbols.length));
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = 16 + Math.random() * 10;
        }
    }

    draw() {
        ctx.font = `${this.size}px monospace`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.char, this.x, this.y);
    }
}

// Создаём начальные частицы
for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const speed = 2 + Math.random() * 3;
    particles.push(new Particle(x, y, speed));
}

// Анимация
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

// Запускаем анимацию
animate();

// --- Логика кнопки "НАЧАТЬ" с начальным сообщением ---
/*
  При загрузке:
  - показать текст "РАУНД 1 УСПЕШНО ОКОНЧЕН!" в той же рамке, что и кнопка
  - сделать элемент некликабельным и убрать фокус (tabindex = -1)
  Через 60 секунд:
  - вернуть текст "НАЧАТЬ", сделать кликабельным и доступным по Tab
*/

// Функция, переключающая элемент в режим "сообщение"
function setAsNonClickableMessage(text) {
    // Сохраняем текущие inline-стили, если нужно (необязательно)
    startButton.textContent = text;
    // Отключаем клики
    startButton.disabled = true;
    startButton.style.pointerEvents = 'none';
    startButton.setAttribute('aria-disabled', 'true');
    // Убираем из таб-индекса, чтобы Tab не фокусировал элемент
    startButton.setAttribute('tabindex', '-1');
    // Можно добавить курсор по умолчанию (как на неактивном элементе)
    startButton.style.cursor = 'default';
}

// Функция, включающая кнопку обратно
function setAsClickableButton(text) {
    startButton.textContent = text;
    startButton.disabled = false;
    startButton.style.pointerEvents = ''; // сбрасывает к CSS по умолчанию
    startButton.removeAttribute('aria-disabled');
    // Восстанавливаем таб-индекс для доступности
    startButton.setAttribute('tabindex', '0');
    startButton.style.cursor = 'pointer';
}

// Изначально показываем сообщение, а не кнопку
setAsNonClickableMessage('РАУНД 1 УСПЕШНО ОКОНЧЕН!');

// Устанавливаем таймер на 60 000 ms (1 минута), после которого кнопка станет активной
const READY_TIMEOUT_MS = 60 * 1000;
let readyTimer = setTimeout(() => {
    setAsClickableButton('НАЧАТЬ');
}, READY_TIMEOUT_MS);

// Обработчик клика: срабатывает только если кнопка активна (мы дополнительно проверяем)
startButton.addEventListener('click', () => {
    // Если кнопка всё ещё отключена — игнорируем
    if (startButton.disabled) return;
    // Перейти на основную страницу
    window.location.href = 'labir.html';
});

// Если нужно — при изменении размера окна корректируем canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
