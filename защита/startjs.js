// Получаем элементы
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const overlay = document.getElementById('overlay');
const introVideo = document.getElementById('intro-video');

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

// Обработчик нажатия на кнопку "Начать"
startButton.addEventListener('click', () => {
    
window.location.href = 'main.html';
});

// Обновляем размер канваса при изменении размера окна
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
