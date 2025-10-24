const processes = [
    {
        name: "Правильная установка приложения/игры",
        steps: [
            "Открыть официальный магазин",
            "Найти нужное приложение/игру",
            "Прочитать отзывы и рейтинг",
            "Нажать «установить»",
            "Открыть приложение и проверить его работу"
        ]
    },
    {
        name: "Очистить историю браузера",
        steps: [
            "Открыть настройки браузера",
            "Найти «история» или «данные»",
            "Выбрать период удаления",
            "Подтвердить удаление",
            "Перезапустить браузер"
        ]
    },
    {
       name: "Установить антивирус",
        steps: [
            "Открыть браузер и найти сайт антивируса",
            "Скачать установочный файл из официального источника",
            "Запустить установку и следовать инструкциям",
            "Дождаться окончания установки антивируса",
            "Провести первое сканирование компьютера"
        ]
    },
    {
        name: "Создать резервную копию файла",
        steps: [
            "Найти нужный файл в папке",
            "Скопировать нужный файл",
            "Вставить файл в другую папку или на флешку",
            "Переименовать копию (например, «backup»)",
            "Проверить, что копия файла открывается",
        ]
    }
];

let currentLevel = 0; // Текущий уровень (индекс процесса)
let currentProcess = processes[currentLevel];
let draggedStep = null;

// Получение элементов
const processDescription = document.getElementById('process-description');
const stepsContainer = document.getElementById('steps');
const sequenceContainer = document.getElementById('sequence-steps');
const checkButton = document.getElementById('check-button');
const resetButton = document.getElementById('reset-button');
const message = document.getElementById('message');
const gameContainer = document.getElementById('game-container');

function initLevel() {
    currentProcess = processes[currentLevel];
    processDescription.textContent = `Процесс: ${currentProcess.name}`;
    stepsContainer.innerHTML = '';
    sequenceContainer.innerHTML = '';
    message.textContent = '';

    const shuffledSteps = shuffleArray([...currentProcess.steps]);
    shuffledSteps.forEach(stepText => {
        const stepElement = document.createElement('div');
        stepElement.classList.add('step');
        stepElement.textContent = stepText;
        stepElement.setAttribute('draggable', 'true');

        stepElement.addEventListener('dragstart', dragStart);
        stepElement.addEventListener('dragend', dragEnd);

        stepsContainer.appendChild(stepElement);
    });

    // Удаляем старые слушатели и добавляем новые (на повторную инициализацию)
    sequenceContainer.removeEventListener('dragover', dragOver);
    sequenceContainer.removeEventListener('drop', drop);
    sequenceContainer.addEventListener('dragover', dragOver);
    sequenceContainer.addEventListener('drop', drop);
}

function dragStart(e) {
    draggedStep = e.target;
    e.dataTransfer.setData('text/plain', '');
    setTimeout(() => {
        if (e.target) e.target.classList.add('dragging');
    }, 0);
}

function dragEnd(e) {
    if (e.target) e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (draggedStep) {
        const clonedStep = draggedStep.cloneNode(true);
        clonedStep.classList.remove('dragging');
        clonedStep.setAttribute('draggable', 'false');
        sequenceContainer.appendChild(clonedStep);
        if (draggedStep.parentNode) draggedStep.parentNode.removeChild(draggedStep);
        draggedStep = null;
    }
}

checkButton.addEventListener('click', checkSequence);
resetButton.addEventListener('click', initLevel);

function checkSequence() {
    const assembledSteps = Array.from(sequenceContainer.children).map(step => step.textContent.trim());
    if (assembledSteps.length !== currentProcess.steps.length) {
        message.textContent = 'Вы использовали не все шаги. Попробуйте ещё раз.';
        message.style.color = '#ff0000';
        return;
    }

    let isCorrect = true;
    for (let i = 0; i < currentProcess.steps.length; i++) {
        if (assembledSteps[i] !== currentProcess.steps[i]) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        message.textContent = 'Поздравляем! Вы правильно собрали последовательность!';
        message.style.color = '#008800';

        // Если есть следующий процесс в текущем наборе — перейти к нему
        if (currentLevel < processes.length - 1) {
            currentLevel++;
            setTimeout(() => {
                initLevel();
            }, 800); // короткая пауза, чтобы пользователь увидел сообщение
        } else {
            // Это была последняя последовательность — переходим на следующий уровень (страницу)
            openNextLevel();
        }
    } else {
        message.textContent = 'Есть ошибки в последовательности. Попробуйте ещё раз.';
        message.style.color = '#ff0000';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function openNextLevel() {
    // Замените 'level2.html' на нужный путь следующего уровня
    window.location.href = 'end.html';
}

/* -------------------- ТЕХНИЧЕСКАЯ КНОПКА (Tab) --------------------
   Нажатие клавиши Tab в любой момент:
   - предотвращает стандартную навигацию по фокусу
   - автоматически "собирает" правильную последовательность
   - показывает сообщение об успехе и переводит на следующий процесс/уровень
------------------------------------------------------------------*/
document.addEventListener('keydown', function (e) {
    // Проверяем Key или keyCode (для совместимости)
    const isTab = (e.key === 'Tab') || (e.keyCode === 9);
    if (!isTab) return;

    // Перехватываем Tab, чтобы страница не сместила фокус
    e.preventDefault();
    e.stopPropagation();

    // Если уже показываем сообщение об успехе и идёт переход — ничего не делаем
    // (можно добавить флаг ожидания, но для простоты сразу выполняем)
    autoCompleteLevelAndAdvance();
});

function autoCompleteLevelAndAdvance() {
    // Очистим текущую последовательность
    sequenceContainer.innerHTML = '';

    // Добавим правильные шаги в правильном порядке
    currentProcess.steps.forEach(stepText => {
        const stepElement = document.createElement('div');
        stepElement.classList.add('step');
        stepElement.textContent = stepText;
        stepElement.setAttribute('draggable', 'false');
        sequenceContainer.appendChild(stepElement);
    });

    // Показать сообщение успеха
    message.textContent = 'Техническая кнопка: уровень автоматически пройден.';
    message.style.color = '#005500';

    // Подождём очень коротко, чтобы игрок увидел заполнение, и затем перейдём
    setTimeout(() => {
        // Если есть следующий процесс — перейти к нему
        if (currentLevel < processes.length - 1) {
            currentLevel++;
            initLevel();
        } else {
            // Иначе — переход на следующую страницу/уровень
            openNextLevel();
        }
    }, 300); // 300ms — короткая задержка для визуального эффекта
}

// Инициализация
initLevel();
