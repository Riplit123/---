
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const context = canvas.getContext('2d');

  // Размеры игрового поля
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;

  // Масштабируем холст в соответствии с размерами блоков
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
  // Переменные для арены и игрока
  let arena = createMatrix(COLS, ROWS);
  let score = 0;

  // Переменные для управления падением фигур
  let dropCounter = 0;
  let dropInterval = 1000;

  let lastTime = 0;
  let animationId;

  // Игрок
  const player = {
    pos: { x: 0, y: 0 },
    matrix: null
  };

  // Функция создания матрицы
  function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
      matrix.push(new Array(width).fill(0));
    }
    return matrix;
  }

  // Функция создания фигур
  function createPiece(type) {
    switch (type) {
      case 'T':
        return [
          [0, 1, 0],
          [1, 1, 1]
        ];
      case 'Y':
        return [
          [1, 1, 1],
          [0, 1, 0]
        ];
      case 'O':
        return [
          [2, 2],
          [2, 2]
        ];
      case 'L':
        return [
          [0, 0, 3],
          [3, 3, 3]
        ];
      case 'J':
        return [
          [4, 0, 0],
          [4, 4, 4]
        ];
      case 'I':
        return [
          [0, 0, 0, 0],
          [5, 5, 5, 5],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ];
      case 'S':
        return [
          [0, 6, 6],
          [6, 6, 0]
        ];
      case 'Z':
        return [
          [7, 7, 0],
          [0, 7, 7]
        ];
      default:
        return [
          [0]
        ];
    }
  }

  // Отрисовка игры
  function draw() {
    context.fillStyle = '#111';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
  }

  // Отрисовка матрицы
  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // Создаем градиент для каждого блока
          const gradient = context.createLinearGradient(0, 0, BLOCK_SIZE, BLOCK_SIZE);

          if (value === 1) {
            gradient.addColorStop(0, '#ff00cc');
            gradient.addColorStop(1, '#3333ff');
          } else if (value === 2) {
            gradient.addColorStop(0, '#33ccff');
            gradient.addColorStop(1, '#ff66ff');
          } else if (value === 3) {
            gradient.addColorStop(0, '#ccff33');
            gradient.addColorStop(1, '#ff33cc');
          } else if (value === 4) {
            gradient.addColorStop(0, '#ff9933');
            gradient.addColorStop(1, '#33ccff');
          } else if (value === 5) {
            gradient.addColorStop(0, '#66ff66');
            gradient.addColorStop(1, '#ff0066');
          } else if (value === 6) {
            gradient.addColorStop(0, '#ff3300');
            gradient.addColorStop(1, '#66ff99');
          } else if (value === 7) {
            gradient.addColorStop(0, '#ffcc00');
            gradient.addColorStop(1, '#66ccff');
          }

          context.fillStyle = gradient;
          context.fillRect(
            (x + offset.x) * BLOCK_SIZE,
            (y + offset.y) * BLOCK_SIZE,
            BLOCK_SIZE, BLOCK_SIZE
          );

          // Рисуем контур блока
          context.strokeStyle = '#000';
          context.strokeRect(
            (x + offset.x) * BLOCK_SIZE,
            (y + offset.y) * BLOCK_SIZE,
            BLOCK_SIZE, BLOCK_SIZE
          );
        }
      });
    });
  }

  // Функция для сброса игрока (создание новой фигуры)
  function playerReset() {
    const pieces = 'TJLOSZIY';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
      arena.forEach(row => row.fill(0));
      score = 0;
      updateScore();
    }
  }

  // Проверка на столкновение
  function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
            arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
    }

  // Объединение фигуры с ареной после столкновения
  function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }

  // Очистка заполненных линий
  function arenaSweep() {
    outer: for (let y = arena.length -1; y > 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }

      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;

      score++;
      updateScore();

      // Проверяем условие победы после обновления счёта
      checkWinCondition();
    }
  }

  // Проверка условия победы
  function checkWinCondition() {
    if (score >= 7) { // Снизили требуемые очки до 15
      // Останавливаем игру
      cancelAnimationFrame(animationId);

      // Переходим на новую страницу
      window.location.href = 'end.html'; // Замените на нужный вам URL
    }
  }

  // Обновление игры
  function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }

    draw();
    animationId = requestAnimationFrame(update);
  }

  // Падение фигуры вниз
  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
    }
    dropCounter = 0;
  }

  // Перемещение фигуры влево/вправо
  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;
    }
  }

  // Вращение фигуры
  function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.matrix[0].length) {
        rotate(player.matrix, -dir);
        player.pos.x = pos;
        return;
      }
    }
  }

  // Функция для вращения матрицы фигуры
  function rotate(matrix, dir) {
    // Транспонирование матрицы
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    // Реверс строк или столбцов в зависимости от направления вращения
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  // Обработка нажатий клавиш
  document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
      // Стрелка влево
      playerMove(-1);
    } else if (event.keyCode === 39) {
      // Стрелка вправо
      playerMove(1);
    } else if (event.keyCode === 40) {
      // Стрелка вниз
      playerDrop();
    } else if (event.keyCode === 32) {
      // Пробел (вращение)
      playerRotate(1);
    }
  });

  // Обновление счёта
  function updateScore() {
    document.getElementById('score').innerText = `Очки: ${score}`;
  }

  // Инициализация игры
  playerReset();
  updateScore();
  update();
});