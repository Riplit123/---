// level7js.js — исправленный вариант (нормализация связей, увеличение радиуса клика)

// === Масштаб страницы 70% ===
const SCALE = 0.8;
document.body.style.transformOrigin = '0 0';
document.body.style.transform = `scale(${SCALE})`;
document.body.style.zoom = `${SCALE}`;

// Получаем элементы
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const signalValueSpan = document.getElementById('signal-value');
const resetButton = document.getElementById('reset-button');

let currentSignal = 5;
let nodeHistory = [];

// Радиус ноды для клика (увеличен для удобства)
const NODE_RADIUS = 28;

// Определение узлов (как было)
const nodes = [
    // Начальный узел 
{ id: 'start', x: 50, y: 400, value: 5, operation: null, connectedTo: ['n1', 'n2'], visited: true }, 

// Первый уровень узлов 
{ id: 'n1', x: 150, y: 250, value: 4, operation: '+', connectedTo: ['n3', 'n4', 'n2'], visited: false }, 
{ id: 'n2', x: 150, y: 550, value: 2, operation: '-', connectedTo: ['n4', 'n5', 'n1'], visited: false }, 

// Второй уровень узлов 
{ id: 'n3', x: 300, y: 150, value: 5, operation: '-', connectedTo: ['n6', 'n7', 'n20'], visited: false }, 
{ id: 'n4', x: 300, y: 400, value: 3, operation: '+', connectedTo: ['n6', 'n7', 'n8'], visited: false }, 
{ id: 'n5', x: 300, y: 650, value: 7, operation: '-', connectedTo: ['n7', 'n8', 'n21'], visited: false }, 

// Третий уровень узлов 
{ id: 'n6', x: 450, y: 100, value: 2, operation: '+', connectedTo: ['n9', 'n10', 'n20'], visited: false }, 
{ id: 'n7', x: 450, y: 400, value: 4, operation: '-', connectedTo: ['n9', 'n10', 'n11', 'n22', 'n4'], visited: false }, 
{ id: 'n8', x: 450, y: 700, value: 1, operation: '+', connectedTo: ['n11', 'nTrap2', 'n23', 'n26'], visited: false }, 

// Четвёртый уровень узлов 
{ id: 'n9', x: 600, y: 150, value: 3, operation: '+', connectedTo: ['n12', 'n13', 'n24'], visited: false }, 
{ id: 'n10', x: 600, y: 400, value: 2, operation: '-', connectedTo: ['n12', 'n13', 'n25', 'n26', 'n27', 'n28'], visited: false }, 
{ id: 'n11', x: 600, y: 650, value: 6, operation: '+', connectedTo: ['n13', 'n14', 'n26', 'n7'], visited: false }, 

// Пятый уровень узлов 
{ id: 'n12', x: 750, y: 100, value: 4, operation: '-', connectedTo: ['n15', 'n16', 'n27'], visited: false }, 
{ id: 'n13', x: 750, y: 400, value: 3, operation: '+', connectedTo: ['n15', 'n16', 'n17', 'n27'], visited: false }, 
{ id: 'n14', x: 750, y: 700, value: 3, operation: '-', connectedTo: ['n16', 'n17', 'n28', 'n25'], visited: false }, 

// Узлы-ловушки 
{ id: 'nTrap2', x: 500, y: 750, value: 5, operation: '+', connectedTo: ['n14'], visited: false }, 

// Шестой уровень узлов 
{ id: 'n15', x: 900, y: 200, value: 6, operation: '+', connectedTo: ['n18', 'n29', 'n12', 'n27'], visited: false }, 
{ id: 'n16', x: 900, y: 400, value: 2, operation: '-', connectedTo: ['n18', 'n30'], visited: false }, 
{ id: 'n17', x: 900, y: 600, value: 1, operation: '+', connectedTo: ['n18', 'n31'], visited: false }, 

// Седьмой уровень узлов (новые) 
{ id: 'n20', x: 250, y: 250, value: 3, operation: '+', connectedTo: ['n6', 'n22'], visited: false }, 
{ id: 'n21', x: 250, y: 550, value: 2, operation: '-', connectedTo: ['n7', 'n23'], visited: false }, 
{ id: 'n22', x: 400, y: 250, value: 2, operation: '-', connectedTo: ['n9', 'n24'], visited: false }, 
{ id: 'n23', x: 400, y: 550, value: 1, operation: '+', connectedTo: ['n10', 'n25'], visited: false }, 
{ id: 'n24', x: 550, y: 100, value: 4, operation: '+', connectedTo: ['n12', 'n27'], visited: false }, 
{ id: 'n25', x: 550, y: 700, value: 3, operation: '-', connectedTo: ['n14', 'n23', 'n28'], visited: false }, 
{ id: 'n26', x: 550, y: 500, value: 2, operation: '+', connectedTo: ['n13', 'n10', 'n11', 'n8'], visited: false }, 
{ id: 'n27', x: 700, y: 200, value: 1, operation: '+', connectedTo: ['n15', 'n29'], visited: false }, 
{ id: 'n28', x: 700, y: 600, value: 2, operation: '-', connectedTo: ['n16', 'n30'], visited: false }, 
{ id: 'n29', x: 850, y: 150, value: 3, operation: '-', connectedTo: ['n15', 'n18'], visited: false }, 
{ id: 'n30', x: 850, y: 500, value: 4, operation: '+', connectedTo: ['n18'], visited: false }, 
{ id: 'n31', x: 850, y: 650, value: 5, operation: '-', connectedTo: ['n18'], visited: false }, 

// Предфинишный узел 
{ id: 'n18', x: 1000, y: 400, value: 8, operation: '-', connectedTo: ['end'], visited: false }, 

// Финишный узел 
{ id: 'end', x: 1100, y: 400, value: null, operation: null, connectedTo: [], visited: false }, ];

// Нормализация связей (делает все connections двусторонними)
function normalizeConnections() {
    const idToNode = {};
    nodes.forEach(n => idToNode[n.id] = n);

    nodes.forEach(n => {
        n.connectedTo = n.connectedTo.filter(id => !!idToNode[id]); // удаляем несуществующие ссылки
    });

    // Добавляем обратные ссылки, если их нет
    nodes.forEach(n => {
        n.connectedTo.forEach(destId => {
            const dest = idToNode[destId];
            if (dest && !dest.connectedTo.includes(n.id)) {
                dest.connectedTo.push(n.id);
            }
        });
    });
}

// Вызываем нормализацию один раз на старте
normalizeConnections();

let currentNode = nodes.find(node => node.id === 'start');
nodeHistory.push(currentNode.id);

// Отрисовка связей — рисуем каждую пару только один раз
function drawConnections() {
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;

    const drawn = new Set();
    nodes.forEach(node => {
        node.connectedTo.forEach(connId => {
            const key = [node.id, connId].sort().join('|'); // уникальность пары без направления
            if (drawn.has(key)) return;
            const targetNode = nodes.find(n => n.id === connId);
            if (!targetNode) return;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
            drawn.add(key);
        });
    });
}

// Отрисовка узлов
function drawNodes() {
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        if (node.id === currentNode.id) {
            ctx.fillStyle = '#00e6b8';
        } else if (nodeHistory.includes(node.id)) {
            ctx.fillStyle = '#333';
        } else {
            ctx.fillStyle = '#1a1a1a';
        }
        ctx.fill();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (node.operation) {
            ctx.fillStyle = '#00ffcc';
            ctx.font = '16px monospace';
            ctx.fillText(`${node.operation}${node.value}`, node.x - 12, node.y + 6);
        }
        if (node.id === 'start') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px monospace';
            ctx.fillText('Старт', node.x - 25, node.y + 6);
        }
        if (node.id === 'end') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px monospace';
            ctx.fillText('Финиш', node.x - 30, node.y + 6);
        }
    });
}

function updateSignalDisplay() {
    signalValueSpan.textContent = currentSignal;
}

let matrixAnimationInterval = null;

function checkWin() {
    if (currentNode.id === 'end') {
        if (currentSignal === 20) {
            startMatrixAnimation();
        } else {
            alert(`Вы достигли финиша, но ваш сигнал равен ${currentSignal}, а должен быть 20. Попробуйте снова.`);
        }
    }
}

function startMatrixAnimation() {
    resetButton.style.display = 'none';
    canvas.style.backgroundColor = '#000';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const letters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * canvas.height;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    matrixAnimationInterval = setInterval(drawMatrix, 50);

    setTimeout(() => {
        clearInterval(matrixAnimationInterval);
        window.location.href = 'test.html';
    }, 4000);
}

// Обработчик клика по canvas — учитываем масштаб canvas в DOM
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Проходим по всем узлам и ищем тот, на который кликнули
    for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS) {
            // путь разрешён, если current.connectedTo содержит node.id (нормализовано)
            const allowed = currentNode.connectedTo.includes(node.id);
            if (!allowed) {
                // путь запрещён
                // тихо игнорируем или можно дать подсказку
                console.log(`Путь ${currentNode.id} → ${node.id} запрещён.`);
                return;
            }

            if (node.id === currentNode.id) return;

            // если узел с операцией и ещё непройден — применим операцию
            if (node.operation) {
                if (!nodeHistory.includes(node.id)) {
                    if (node.operation === '+') currentSignal += node.value;
                    else if (node.operation === '-') currentSignal -= node.value;
                    node.visited = true;
                } else {
                    // возвращение: сигнал не меняется
                    // можно отображать небольшое сообщение вместо alert
                    // alert('Вы возвращаетесь к ранее посещённому узлу. Значение сигнала не изменится.');
                }
            }

            currentNode = node;
            nodeHistory.push(node.id);
            updateSignalDisplay();
            redraw();
            checkWin();
            return; // обработали клик — выходим
        }
    }
});

// Сброс игры
function resetGame() {
    currentSignal = 5;
    currentNode = nodes.find(node => node.id === 'start');
    nodeHistory = [currentNode.id];
    nodes.forEach(node => node.visited = false);
    updateSignalDisplay();
    redraw();

    if (matrixAnimationInterval) {
        clearInterval(matrixAnimationInterval);
        matrixAnimationInterval = null;
        canvas.style.backgroundColor = '#0d0d0d';
    }
    resetButton.style.display = 'block';
}

resetButton.addEventListener('click', resetGame);

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    drawNodes();
}

window.addEventListener('resize', () => { redraw(); });

// Инициализация
redraw();
updateSignalDisplay();
