// mainjs_modified.js
// Модифицированный JavaScript для игры — изменения затрагивают поведение установщика: вместо установки запускается 30-секундный скрипт,
// затем показывается кнопка "Начать", после чего открывается мини-игра с набором чисел (соответствие: 1=А ... 33=Я).

document.addEventListener('DOMContentLoaded', function() {
    const desktop = document.getElementById('desktop');
    const windowsContainer = document.getElementById('windows');
    const taskbarWindows = document.getElementById('taskbar-windows');
    const clockTime = document.getElementById('clock-time');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');

    // Список иконок на рабочем столе
    let desktopIcons = [
        { name: 'Установка вирусного ПО', app: 'installer' },
        { name: 'Документы', app: 'documents' },
        { name: 'Projects', app: 'projects' },
        { name: 'Корзина', app: 'trash' },
    ];

    // Генерируем дополнительные иконки чтобы получить 80 иконок
    const iconNames = [];
    const extensions = ['txt', 'doc', 'pdf', 'jpg', 'png', 'exe', 'mp3', 'mp4', 'zip', 'rar', 'html', 'css', 'js', 'py', 'java', 'c', 'cpp', 'md'];
    const baseNames = ['File', 'Document', 'Image', 'Video', 'Music', 'Archive', 'Code', 'Script', 'Note', 'Report', 'Presentation', 'Slide', 'Photo', 'Project', 'Data', 'Backup', 'Config', 'Sample'];

    let iconCount = 80 - desktopIcons.length;
    for (let i = 1; i <= iconCount; i++) {
        let baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
        let extension = extensions[Math.floor(Math.random() * extensions.length)];
        let name = `${baseName}_${i}.${extension}`;
        iconNames.push({ name: name, app: 'textFile' });
    }

    // Объединяем все иконки и перемешиваем
    desktopIcons = desktopIcons.concat(iconNames);
    shuffleArray(desktopIcons);

    // Располагаем иконки по сетке, слева направо
    let iconX = 20;
    let iconY = 20;
    desktopIcons.forEach((icon, index) => {
        icon.x = iconX;
        icon.y = iconY;
        iconX += 100;
        if (iconX > window.innerWidth - 120) {
            iconX = 20;
            iconY += 100;
        }
    });

    // Создаем иконки на рабочем столе
    desktopIcons.forEach(icon => {
        createDesktopIcon(icon);
    });

    function shuffleArray(array) {
        // Функция перемешивания массива
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createDesktopIcon(icon) {
        const iconElement = document.createElement('div');
        iconElement.classList.add('icon');
        iconElement.style.left = icon.x + 'px';
        iconElement.style.top = icon.y + 'px';
        iconElement.setAttribute('data-app', icon.app);
        iconElement.setAttribute('data-name', icon.name);

        const img = document.createElement('img');
        img.src = getIconForApp(icon.app, icon.name);
        img.alt = icon.name;

        const span = document.createElement('span');
        span.textContent = icon.name;

        iconElement.appendChild(img);
        iconElement.appendChild(span);

        iconElement.addEventListener('dblclick', function() {
            openWindow(icon.app, icon.name);
        });

        desktop.appendChild(iconElement);
    }

    // Обработка кнопки "Пуск"
    startButton.addEventListener('click', function() {
        startMenu.classList.toggle('hidden');
    });
  
    // Обработка выбора пункта в меню "Пуск"
    startMenu.addEventListener('click', function(event) {
        const app = event.target.getAttribute('data-app');
      if (app) {
            openWindow(app);
            startMenu.classList.add('hidden');
        }
    });

    // Закрытие меню "Пуск" при клике вне его
    document.addEventListener('click', function(event) {
        if (!startMenu.contains(event.target) && event.target !== startButton) {
            startMenu.classList.add('hidden');
        }
    });
  
     // Обновление часов
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        if (minutes < 10) minutes = '0' + minutes;
        clockTime.textContent = hours + ':' + minutes;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Функция открытия окна
    function openWindow(app, titleOverride) {
        let windowElement = createWindow(app, titleOverride);
        windowsContainer.appendChild(windowElement);
        createTaskbarButton(windowElement, app, titleOverride);
    }

    // Функция создания окна
    function createWindow(app, titleOverride) {
        const windowElement = document.createElement('div');
        windowElement.classList.add('window');
        windowElement.style.top = '100px';
        windowElement.style.left = '100px';

        const windowId = 'window-' + Math.random().toString(36).substr(2, 9);
        windowElement.setAttribute('data-window-id', windowId);

        const titleBar = document.createElement('div');
        titleBar.classList.add('title-bar');
        const title = document.createElement('div');
        title.classList.add('window-title');
        title.textContent = titleOverride || getAppName(app);
        const controls = document.createElement('div');
        controls.classList.add('window-controls');

        const minimizeButton = document.createElement('button');
        minimizeButton.textContent = '_';
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        controls.appendChild(minimizeButton);
        controls.appendChild(closeButton);
        titleBar.appendChild(title);
        titleBar.appendChild(controls);

        const content = document.createElement('div');
        content.classList.add('content');
        content.innerHTML = getAppContent(app, windowId, titleOverride);

        windowElement.appendChild(titleBar);
        windowElement.appendChild(content);

        closeButton.addEventListener('click', function() {
            windowElement.remove();
            removeTaskbarButton(windowId);
        });

        minimizeButton.addEventListener('click', function() {
            windowElement.classList.add('hidden');
        });

        titleBar.addEventListener('mousedown', function(e) {
            let shiftX = e.clientX - windowElement.getBoundingClientRect().left;
            let shiftY = e.clientY - windowElement.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                windowElement.style.left = pageX - shiftX + 'px';
                windowElement.style.top = pageY - shiftY + 'px';
            }

            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        titleBar.addEventListener('dragstart', function() {
            return false;
        });

        return windowElement;
    }

    // Функция создания кнопки на панели задач
    function createTaskbarButton(windowElement, app, titleOverride) {
        const windowId = windowElement.getAttribute('data-window-id');
        const button = document.createElement('div');
        button.classList.add('taskbar-item');
        button.textContent = titleOverride || getAppName(app);
        button.setAttribute('data-window-id', windowId);
        taskbarWindows.appendChild(button);

        button.addEventListener('click', function() {
            if (windowElement.classList.contains('hidden')) {
                windowElement.classList.remove('hidden');
            } else {
                windowElement.classList.add('hidden');
            }
        });
    }
  
    // Функция удаления кнопки с панели задач
    function removeTaskbarButton(windowId) {
        const buttons = taskbarWindows.querySelectorAll('.taskbar-item');
        buttons.forEach(button => {
            if (button.getAttribute('data-window-id') === windowId) {
                button.remove();
            }
        });
    }

    // Функция получения названия приложения
    function getAppName(app) {
        switch(app) {
            case 'installer':
                return 'Установщик программы';
            case 'documents':
                return 'Документы';
            case 'projects':
                return 'Projects';
            case 'trash':
                return 'Корзина';
            case 'settings':
                return 'Настройки';
            case 'explorer':
                return 'Проводник';
            case 'downloads':
                return 'Загрузки';
            case 'gallery':
                return 'Галерея';
            case 'account':
                return 'Аккаунт';
            case 'myApp':
                return 'MyApp';
            default:
                return app || 'Файл';
        }
    }
  
     // Функция получения иконки для приложения или файла
    function getIconForApp(app, fileName = '') {
        if (app === 'textFile') {
            const extension = fileName.split('.').pop().toLowerCase();
            switch (extension) {
                case 'txt':
                    return 'icons/txt.png';
                case 'doc':
                      return 'icons/document.png';
                case 'docx':
                case 'md':
                       return 'icons/internet.png';
                case 'pdf':
                    return 'icons/file.png';
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    return 'icons/image.png';
                case 'mp4':
                case 'avi':
                case 'mkv':
                    return 'icons/video.png';
                case 'mp3':
                case 'wav':
                    return 'icons/music.png';
                case 'zip':
                      return 'icons/archive.png';
                case 'rar':
                    return 'icons/rar.png';
                case 'js':
                     return 'icons/node.png';
                case 'py':
                      return 'icons/python.png';
                case 'java':
                       return 'icons/java.png';
                case 'c':
                     return 'icons/visual-studio.png';
                case 'cpp':
                case 'html':
                     return 'icons/html.png';
                case 'css':
                    return 'icons/code.png';
                case 'exe':
                case 'apk':
                    return 'icons/program.png';
                default:
                    return 'assets/icons/default.png';
            }
        }
      
        switch(app) {
            case 'installer':
                return 'icons/virus.png';
            case 'documents':
                return 'icons/document.png';
            case 'projects':
                return 'icons/folder.png';
            case 'trash':
                return 'icons/trash.png';
            case 'myApp':
                return 'icons/stumbleupon.png';
            default:
                return 'assets/icons/default.png';
        }
    }
  
    // Функция получения содержимого приложения
    function getAppContent(app, windowId, titleOverride) {
        switch(app) {
            case 'installer':
                return getInstallerContent();
            case 'documents':
                return getFolderContent('documents');
            case 'projects':
                return getFolderContent('projects');
            case 'downloads':
                return getFolderContent('downloads');
            case 'secret':
                return getSecretContent(windowId);
            case 'trash':
                return getTrashContent();
            case 'textFile':
                return getTextFileContent(titleOverride);
            case 'settings':
                return getSettingsContent();
            case 'explorer':
                return getExplorerContent();
            case 'gallery':
                return getGalleryContent();
            case 'account':
                return getAccountContent();
            case 'myApp':
                return getMyAppContent(windowId);
            default:
                return '<p>Приложение не найдено.</p>';
        }
    }

    // Содержимое папок
    function getFolderContent(folderName) {
        let files = [];
        switch(folderName) {
            case 'documents':
                files = ['Отчет.doc', 'Заметки.txt', 'Безымянный.txt'];
                break;
            case 'projects':
                files = ['project1.js', 'algorithm.py', 'README.md'];
                break;
            case 'downloads':
                files = ['Инструкция.pdf', 'Update.zip', 'unknown.exe'];
                break;
            case 'secret':
                files = ['LoginInfo.txt', 'пароли.txt'];
                break;
            default:
                files = [];
        }

        files = files.concat(['temp.tmp', 'old_version.bak', 'log.txt']);

        let content = `<h2>${getAppName(folderName)}</h2><ul>`;
        files.forEach(file => {
            content += `<li><a href="#" onclick="openFile('${file}')">${file}</a></li>`;
        });
        content += '</ul><div id="folder-content"></div>';
        return content;
    }

    // Содержимое текстовых файлов
    function getTextFileContent(fileName) {
        let content = '';

        switch(fileName) {
            case 'Заметки.txt':
                content = '<pre>Памятка:\n- Найти установщик вируса на рабочем столе\n- Открыть его\n- Запустить внедрение вредоносного ПО\n</pre>';
                break;
            case 'Notes.txt':
                content = '<pre>Reminder:\n- Update antivirus\n- Check email\n- Backup data\n</pre>';
                break;
            case 'README.txt':
            case 'Readme.txt':
                content = '<p>Добро пожаловать! Здесь вы найдете различные файлы и документы.</p>';
                break;
            case 'project1.js':
                content = '<pre>function helloWorld() {\n    console.log("Hello, world!");\n}\n</pre>';
                break;
            case 'algorithm.py':
                content = '<pre>def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)\n</pre>';
                break;
            case 'Инструкция.pdf':
            case 'Manual.pdf':
                content = '<p>Содержимое инструкции...</p>';
                break;
            case 'Отчет.doc':
            case 'Report.doc':
                content = '<p>Отчет об успешном сборе данных в обработке...</p>';
                break;
            case 'unknown.exe':
                content = '<p>Неизвестное исполнение.</p>';
                break;
            case 'LoginInfo.txt':
                content = '<pre>Логин: user123\nПароль: pass456\n</pre>';
                break;
            case 'пароли.txt':
                content = '<pre>Логин: user123\nПароль: pass456\n</pre>';
                break;
            default:
                content = `<p>Содержимое файла ${fileName}</p>`;
        }

        return `<h2>${fileName}</h2>${content}`;
    }

    // Обработчик открытия файлов
    window.openFile = function(fileName) {
        openWindow('textFile', fileName);
    };
  
     // Содержимое "Секретно"
    function getSecretContent(windowId) {
        return `
            <div class="password-prompt">
                <h2>Доступ к папке "Секретно"</h2>
                <p>Доступа нет</p>
                <input type="password" id="secret-password-${windowId}" placeholder="Введите пароль">
                <button onclick="checkSecretPassword('${windowId}')">ОК</button>
            </div>
        `;
    }
  
   // Проверка пароля для папки "Секретно"
    window.checkSecretPassword = function(windowId) {
        const input = document.getElementById('secret-password-' + windowId);
        const password = input.value;
        if (password === '2018') {
            const windowElement = document.querySelector(`.window[data-window-id="${windowId}"] .content`);
            windowElement.innerHTML = getFolderContent('secret');
        } else {
            alert('Неверный пароль. Попробуйте снова.');
        }
    };

    // Содержимое корзины
    function getTrashContent() {
        return '<h2>Корзина</h2><p>Корзина пуста.</p>';
    }

    // Содержимое "Настройки"
    function getSettingsContent() {
        return `
            <h2>Настройки</h2>
            <p>Здесь вы можете изменить настройки системы.</p>
            <ul>
                <li><button onclick="changeWallpaper()">Изменить обои</button></li>
                <li><button onclick="toggleHiddenFiles()">Показать/Скрыть скрытые файлы</button></li>
            </ul>
        `;
    }

    // Функции настроек
    window.changeWallpaper = function() {
        alert('Функция смены обоев временно недоступна.');
    };

    window.toggleHiddenFiles = function() {
        alert('Функция отображения скрытых файлов временно недоступна.');
    };

    // Содержимое "Проводника"
    function getExplorerContent() {
        return `
            <h2>Проводник</h2>
            <p>Выберите папку для просмотра:</p>
            <ul>
                <li><a href="#" onclick="openWindow('documents')">Документы</a></li>
                <li><a href="#" onclick="openWindow('projects')">Projects</a></li>
                <li><a href="#" onclick="openWindow('downloads')">Загрузки</a></li>
            </ul>
        `;
    }

    // Содержимое "Галереи"
    function getGalleryContent() {
        return `
            <h2>Галерея</h2>
            <p>Галерея изображений.</p>
            <img src="assets/images/image1.jpg" alt="Изображение 1" style="width: 100%; max-width: 500px;">
        `;
    }

    // Содержимое "Аккаунт"
    function getAccountContent() {
        return `
            <h2>Аккаунт</h2>
            <p>Информация об аккаунте пользователя.</p>
            <p>Имя пользователя: KvantHack</p>
            <p>Электронная почта: attack@trojan.com</p>
        `;
    }
  
   // МОДИФИЦИРОВАННОЕ: Содержимое "Установщика программы"
    function getInstallerContent() {
        return `
            <div id="installer">
                <div class="installer-step" id="step-1">
                    <h2>Программа активации и внедрения вирусного файла</h2>
                    <p>Мастер запуска вредоносного ПО.</p>
                    <div class="installer-buttons">
                        <button onclick="nextStep(1)">Начать</button>
                    </div>
                </div>
                <div class="installer-step hidden" id="step-2">
                    <h2>Внимание! Запуск нижеуказанного скрипта требует вашего подтверждения.</h2>
                    <p>Найдите в скрипте указание на то, какую необходимо нажать кнопку для его подтверждения.</p>
                    <textarea rows="10" cols="50">  "Запуск эмулятора выполнения скрипта (симуляция)...",
  "Инициализация виртуального окружения (эмуляция)...",
  "Загрузка модулей: core, io, ui (тестовый режим)...",
  "Проверка контрольных сумм (эмуляция проверки целостности)...",
  "Выделение временных буферов и ресурсов (безопасная эмуляция)...",
  "Подготовка заглушек и загружаемых тестовых модулей...",
  "Генерация тестовых ключей (симулируется) и протоколов обмена...",
  "Развёртывание изолированного контейнера для тестирования...",
  "Нажать на "ПОДТВЕРДИТЬ" с помощью колесика мышки",
  "Применение имитированной подписи пакета (не использует реальные ключи)...",
  "Запуск тестовой последовательности внедрения (изолированная среда)...",
  "Мониторинг виртуальных потоков и логирование (эмуляция)...",
  "Имитируемая интеграция: вставлена заглушка вместо реального кода.",
  "Выполнение сценария в режиме песочницы — все действия безопасны.",
  "Финализация тестовой сессии, подготовка отчёта (эмуляция)...",
  "Очистка временных следов (логирование только в тестовом файле)...",
  "Скрипт завершил выполнение успешно (симуляция).",
  "Ждите дальнейших инструкций от системы (только игровая подсказка)."</textarea>
                    <div class="installer-buttons">
                        <button id="license-next-button">Подтвердить</button>
                    </div>
                    <div id="license-hint"></div>
                </div>
                <div class="installer-step hidden" id="step-3">
                    <h2>Выбор параметров запуска</h2>
                    <p>Выберите опции для запуска скрипта.</p>
                    <input type="text" value="--safe-mode">
                    <div class="installer-buttons">
                        <button onclick="prevStep(3)">Назад</button>
                        <button onclick="nextStep(3)">Далее</button>
                    </div>
                </div>
                <div class="installer-step hidden" id="step-4">
                    <h2>Запуск скрипта</h2>
                    <p>Идет запуск скрипта. Пожалуйста, дождитесь завершения...</p>
                    <div id="progress-bar">
                        <div id="progress" style="width: 0%; height: 20px; background-color: #61dafb;"></div>
                    </div>
                    <div id="script-status" style="margin-top:10px;"></div>
                    <div class="installer-buttons">
                        <button onclick="prevStep(4)">Назад</button>
                    </div>
                </div>
                <div class="installer-step hidden" id="step-5">
                    <h2>Завершение</h2>
                    <p>Скрипт выполнен.</p>
                    <div class="installer-buttons">
                        <button onclick="closeInstaller()">Готово</button>
                    </div>
                </div>
            </div>
        `;
    }
  
    // Функции установщика / имитации скрипта
    window.nextStep = function(currentStep) {
        const current = document.getElementById('step-' + currentStep);
        const next = document.getElementById('step-' + (currentStep + 1));
        if (current) current.classList.add('hidden');
        if (next) next.classList.remove('hidden');

        if (currentStep + 1 === 4) {
            // Запускаем имитацию выполнения скрипта на ~30 секунд
            startScriptRun();
        }
    };

    window.prevStep = function(currentStep) {
        document.getElementById('step-' + currentStep).classList.add('hidden');
        document.getElementById('step-' + (currentStep - 1)).classList.remove('hidden');
    };

    function startScriptRun() {
        const progress = document.getElementById('progress');
        const status = document.getElementById('script-status');
        let width = 0;
        status.textContent = '';

        // Обновляем прогресс 100 шагов * 300ms = 30000ms (~30s)
        const interval = setInterval(function() {
            if (width >= 100) {
                clearInterval(interval);
                status.innerHTML = '<p><strong>Скрипт завершен.</strong></p>';
                // Появляется уведомление о необходимости активации и внедрения вируса + кнопка "Начать"
                showActivationPrompt();
            } else {
                width += 1;
                progress.style.width = width + '%';
            }
        }, 300);
    }

    function showActivationPrompt() {
        const status = document.getElementById('script-status');
        status.innerHTML += `
            <div id="activation-prompt" style="margin-top:10px;">
                <p>Необходимо выполнить активацию и внедрение вируса.</p>
                <button id="start-mini-game">Начать</button>
            </div>
        `;

        const btn = document.getElementById('start-mini-game');
        btn.addEventListener('click', function() {
            startMiniGame();
        });
    }

    // Мини-игра: числа -> буквы (1=А ... 33=Я)
    function startMiniGame() {
        const activation = document.getElementById('activation-prompt');
        if (activation) activation.remove();

        const status = document.getElementById('script-status');
        // Последовательность, переданная пользователем
        const sequence = '20-18-16-33-15-19-12-10-11 12-16-15-30';

        status.innerHTML += `
            <div id="mini-game" style="margin-top:10px;">
                <p>Необходимо декодировать тип внедряемого вируса: <strong>${sequence}</strong></p>
                <p>Подсказка: (1=А, 2=Б, ..., 33=Я). Запишите ответ в поле ниже на русском языке без тире между буквами.</p>
                <input type="text" id="mini-answer" placeholder="Введите расшифровку">
                <button id="mini-submit">Проверить</button>
                <div id="mini-feedback" style="margin-top:8px;"></div>
            </div>
        `;

        document.getElementById('mini-submit').addEventListener('click', checkMiniGameAnswer);
        // И также возможность отправить Enter
        const input = document.getElementById('mini-answer');
        input.addEventListener('keydown', function(e){ if(e.key === 'Enter') checkMiniGameAnswer(); });
    }

    function normalizeRussianText(text) {
        // Убираем лишние пробелы, приводим к нижнему регистру, заменяем ё на е для устойчивости
        return text.trim().toLowerCase().replace(/ё/g, 'ё');
    }

    function checkMiniGameAnswer() {
        const answerEl = document.getElementById('mini-answer');
        const feedback = document.getElementById('mini-feedback');
        if (!answerEl) return;
        const user = answerEl.value;
        const normalized = user.replace(/\s+/g, ' ').trim().toLowerCase();

        // Допускаем варианты с/без пробела, с ё/е одинаково (но в нашем эталоне есть буква "ь" — мягкий знак).
        const targetVariants = ['троянский конь', 'троянскийконь'];
        const userNormalizedForCompare = normalized.replace(/ё/g, 'ё');

        if (targetVariants.includes(userNormalizedForCompare)) {
            feedback.innerHTML = '<span style="color: #7fff7f;"><strong>Вирус активирован.</strong></span>';
            // Показываем кнопку Продолжить
            feedback.innerHTML += '<div style="margin-top:8px;"><button id="continue-button">Продолжить</button></div>';
            document.getElementById('continue-button').addEventListener('click', function() {
                // Открываем новую страницу
                window.location.href = 'level2.html';
            });
        } else {
            feedback.innerHTML = '<span style="color: #ff8b8b;">Неверно. Попробуйте ещё раз.</span>';
        }
    }

    window.closeInstaller = function() {
        // Закрываем окно установщика и создаём иконку MyApp, как и раньше
        const installerWindow = document.querySelector('.window .window-title').parentNode.parentNode;
        if (installerWindow) installerWindow.remove();
        const appIcon = {
            name: 'MyApp',
            app: 'myApp',
            x: 20,
            y: window.innerHeight - 120
        };
        createDesktopIcon(appIcon);
        openWindow('myApp');
    };

    // Доработка для лицензионного соглашения (как было)
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (target && target.id === 'license-next-button') {
            event.preventDefault();
            // Нажата правая кнопка мыши
            if (event.button === 2) {
                const hint = document.getElementById('license-hint');
                if (hint) hint.textContent = 'Стоит прочитать лицензионное соглашение до конца :)';
            }
        }
    });

    document.addEventListener('mouseup', function(event) {
        const target = event.target;
        if (target && target.id === 'license-next-button') {
            // Нажата средняя кнопка мыши (колесико)
            if (event.button === 1) {
                nextStep(2);
            }
        }
    });
  
    // Отключаем контекстное меню для кнопки "Далее" в лицензионном соглашении
    document.addEventListener('contextmenu', function(event) {
        const target = event.target;
        if (target && target.id === 'license-next-button') {
            event.preventDefault();
        }
    });

    // Содержимое установленного приложения "MyApp"
    function getMyAppContent(windowId) {
        return `
            <div id="myapp">
                <div id="auto-login">
                    <p>Выполняется автоматическая авторизация...</p>
                    <div class="loader"></div>
                </div>
                <div id="login-error" class="hidden">
                    <p>Автоматическая авторизация не удалась. Пожалуйста, найдите логин и пароль в папках на рабочем столе и введите их ниже:</p>
                    <form id="login-form">
                        <label for="username">Логин:</label>
                        <input type="text" id="username" name="username"><br><br>
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password"><br><br>
                        <button type="submit">Войти</button>
                    </form>
                </div>
                <div id="app-content" class="hidden">
                    <h2>Добро пожаловать!</h2>
                    <p>Вы успешно вошли в систему.</p>
                </div>
            </div>
        `;
    }

    // Функция автоматической авторизации
    function simulateAutoLogin(windowElement) {
        const autoLoginDiv = windowElement.querySelector('#auto-login');
        const loginErrorDiv = windowElement.querySelector('#login-error');
        const loginForm = windowElement.querySelector('#login-form');
        const appContentDiv = windowElement.querySelector('#app-content');

        setTimeout(function() {
            autoLoginDiv.classList.add('hidden');
            loginErrorDiv.classList.remove('hidden');

            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const usernameInput = loginForm.querySelector('#username').value;
                const passwordInput = loginForm.querySelector('#password').value;

                if (usernameInput === 'user123' && passwordInput === 'pass456') {
                    loginErrorDiv.classList.add('hidden');
                    appContentDiv.classList.remove('hidden');

                    // После успешной авторизации показываем загрузку
                    setTimeout(function() {
                        alert('Файлы приложения повреждены. Необходимо исправить код, чтобы продолжить.');
                        // Переход на страницу второго уровня
                        window.location.href = 'level2.html';
                    }, 2000);
                } else {
                    alert('Неверный логин или пароль. Попробуйте еще раз.');
                }
            });
        }, 5000);
    }
});