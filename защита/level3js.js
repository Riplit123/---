// Зашифрованные сообщения и их расшифровки
const messages = [
    {
        id: 1,
        encrypted: "ДЗКСТГФРЮМ ЛРХЗУРЗХ",
        original: "БЕЗОПАСНЫЙ ИНТЕРНЕТ",
        correctShift: 3 // Март - 3 месяц
    },
    {
        id: 2,
        encrypted: "ИРЦФМЪШРЯМЩТРС ПЗФЦТ",
        original: "БИОМЕТРИЧЕСКИЙ ЗАМОК",
        correctShift: 8 
    }
];

// Загадка из второго сообщения
const riddle = "Он попадает в компьютер без спроса, мешает ему работать и может украсть твои данные. Что это?";

// Ответ на загадку
const correctPassword = "вирус";

// Элементы DOM
const cipherTextElements = {
    1: document.getElementById('cipher-text-1'),
    2: document.getElementById('cipher-text-2')
};

const shiftInputs = {
    1: document.getElementById('shift-value-1'),
    2: document.getElementById('shift-value-2')
};

const applyShiftButtons = document.querySelectorAll('.apply-shift');
const plainTextElements = {
    1: document.getElementById('plain-text-1'),
    2: document.getElementById('plain-text-2')
};

const userSolutionInputs = {
    1: document.getElementById('user-solution-1'),
    2: document.getElementById('user-solution-2')
};

const checkSolutionButtons = document.querySelectorAll('.check-solution');
const resultElements = {
    1: document.getElementById('result-1'),
    2: document.getElementById('result-2')
};

const secondMessageSection = document.getElementById('second-message-section');
const passwordSection = document.getElementById('password-section');
const passwordInput = document.getElementById('password-input');
const submitPasswordButton = document.getElementById('submit-password');
const resultPasswordElement = document.getElementById('result-password');

// Отображаем зашифрованные сообщения
cipherTextElements[1].textContent = messages[0].encrypted;

// Функция для шифрования/дешифрования сообщения
function caesarCipher(str, shift) {
    const alphabetLower = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    const alphabetUpper = alphabetLower.toUpperCase();
    let result = '';

    for (let char of str) {
        if (alphabetLower.includes(char)) {
            let index = alphabetLower.indexOf(char);
            let newIndex = (index + shift + 33) % 33;
            result += alphabetLower[newIndex];
        } else if (alphabetUpper.includes(char)) {
            let index = alphabetUpper.indexOf(char);
            let newIndex = (index + shift + 33) % 33;
            result += alphabetUpper[newIndex];
        } else {
            result += char;
        }
    }
    return result;
}

// Обработчик для кнопок "Проверить"
checkSolutionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const messageId = button.getAttribute('data-message');
        const userAnswer = userSolutionInputs[messageId].value.trim().toUpperCase();
        const originalMessage = messages[messageId - 1].original;
        const resultElement = resultElements[messageId];

        if (userAnswer === originalMessage) {
            resultElement.textContent = 'Сообщение успешно расшифровано!';
            resultElement.classList.remove('error');
            resultElement.classList.add('success');

            if (messageId == 1) {
                // Открываем доступ ко второму сообщению
                cipherTextElements[2].textContent = messages[1].encrypted;
                secondMessageSection.classList.remove('hidden');
                resultElement.scrollIntoView({ behavior: 'smooth' });
            } else if (messageId == 2) {
                // Показываем загадку из расшифрованного сообщения
                showPasswordSection();
            }
        } else {
            resultElement.textContent = 'Неверно. Попробуйте снова.';
            resultElement.classList.remove('success');
            resultElement.classList.add('error');
        }
    });
});

// Функция для отображения раздела с паролем
function showPasswordSection() {
    passwordSection.classList.remove('hidden');
    // Отображаем загадку
    const passwordPrompt = document.querySelector('.password-prompt');
    passwordPrompt.innerHTML = `<p><strong>Запись разработчика:</strong> ${riddle}</p>`;
    passwordPrompt.scrollIntoView({ behavior: 'smooth' });
}

// Обработчик для проверки пароля
submitPasswordButton.addEventListener('click', () => {
    const userPassword = passwordInput.value.trim().toLowerCase();
    if (userPassword === correctPassword) {
        resultPasswordElement.textContent = 'Восстановление антивирусной защиты успешно завершено!';
        resultPasswordElement.classList.remove('error');
        resultPasswordElement.classList.add('success');

        // Переходим на новую страницу
        setTimeout(() => {
            window.location.href = 'startpart2.html'; // Укажите путь к следующей странице
        }, 2000);
    } else {
        resultPasswordElement.textContent = 'Неверно. Попробуйте снова.';
        resultPasswordElement.classList.remove('success');
        resultPasswordElement.classList.add('error');
    }
});