import { Translations } from '../types';

const ruTranslations: Translations = {
  // Toolbar items
  'toolbar.hand': 'Рука — H',
  'toolbar.selection': 'Выделение — V',
  'toolbar.mind': 'Mind-карта — M',
  'toolbar.text': 'Текст — T',
  'toolbar.arrow': 'Стрелка — A',
  'toolbar.shape': 'Фигуры',
  'toolbar.image': 'Изображение — Cmd+U',
  'toolbar.extraTools': 'Дополнительно',
  'toolbar.collapse': 'Свернуть панель',
  'toolbar.expand': 'Развернуть панель',

  'toolbar.pen': 'Карандаш — P',
  'toolbar.eraser': 'Ластик — E',

  'toolbar.arrow.straight': 'Прямая стрелка',
  'toolbar.arrow.elbow': 'Ломаная стрелка',
  'toolbar.arrow.curve': 'Кривая стрелка',

  'toolbar.shape.rectangle': 'Прямоугольник — R',
  'toolbar.shape.ellipse': 'Эллипс — O',
  'toolbar.shape.triangle': 'Треугольник',
  'toolbar.shape.terminal': 'Останов',
  'toolbar.shape.noteCurlyLeft': 'Фигурная заметка — слева',
  'toolbar.shape.noteCurlyRight': 'Фигурная заметка — справа',
  'toolbar.shape.diamond': 'Ромб',
  'toolbar.shape.parallelogram': 'Параллелограмм',
  'toolbar.shape.roundRectangle': 'Скруглённый прямоугольник',

  // Zoom controls
  'zoom.in': 'Увеличить — Cmd++',
  'zoom.out': 'Уменьшить — Cmd+-',
  'zoom.fit': 'По размеру экрана',
  'zoom.100': 'Сбросить к 100%',

  // Themes
  'theme.default': 'Стандартная',
  'theme.colorful': 'Красочная',
  'theme.soft': 'Мягкая',
  'theme.retro': 'Старинная',
  'theme.dark': 'Тёмная',
  'theme.starry': 'Звёздная',

  // Colors
  'color.none': 'Автоматически',
  'color.unknown': 'Другой цвет',
  'color.default': 'Чёрный',
  'color.white': 'Белый',
  'color.gray': 'Серый',
  'color.deepBlue': 'Голубой',
  'color.red': 'Красный',
  'color.green': 'Зелёный',
  'color.yellow': 'Жёлтый',
  'color.purple': 'Фиолетовый',
  'color.orange': 'Оранжевый',
  'color.pastelPink': 'Розовый',
  'color.cyan': 'Лиловый',
  'color.brown': 'Коричневый',
  'color.forestGreen': 'Сосновный',
  'color.lightGray': 'Светло-серый',

  // General
  'general.undo': 'Отменить',
  'general.redo': 'Вернуть',
  'general.menu': 'Меню приложения',
  'general.moreOptions': 'Дополнительно',
  'general.duplicate': 'Дублировать',
  'general.delete': 'Удалить',

  'general.copyToClipboard': 'Копировать в буфер обмена',
  'general.copyToClipboard.svg': 'SVG',
  'general.copyToClipboard.png': 'PNG',
  'general.copyToClipboard.transparent': 'Прозрачный фон',
  'toast.copyToClipboard.svg': 'Выбранные элементы скопированы в буфер обмена как SVG',
  'toast.copyToClipboard.png': 'Выбранные элементы скопированы в буфер обмена как PNG',
  'toast.copyToClipboard.mode.transparent': '(Прозрачный фон)',
  // Language
  'language.switcher': 'Language',
  'language.chinese': '中文',
  'language.english': 'English',
  'language.russian': 'Русский',
  'language.arabic': 'عربي',
  'language.vietnamese': 'Tiếng Việt',

  // Menu items
  'menu.open': 'Открыть',
  'menu.saveFile': 'Сохранить в текущий файл',
  'menu.saveAsFile': 'Сохранить как',
  'menu.exportImage': 'Экспортировать',
  'menu.exportImage.svg': 'SVG',
  'menu.exportImage.png': 'PNG',
  'menu.exportImage.jpg': 'JPG',
  'menu.cleanBoard': 'Очистить доску',
  'menu.github': 'GitHub',

  // Dialog translations
  'dialog.mermaid.title': 'Mermaid в DrawMe',
  'dialog.mermaid.description': 'Поддерживаются',
  'dialog.mermaid.flowchart': 'блок-схемы',
  'dialog.mermaid.sequence': 'диаграммы последовательностей',
  'dialog.mermaid.class': 'диаграммы классов',
  'dialog.mermaid.otherTypes': ' и другие диаграммы (преобразуются в изображения).',
  'dialog.mermaid.syntax': 'Синтаксис Mermaid',
  'dialog.mermaid.placeholder': 'Введите сюда описание вашей Mermaid-диаграммы…',
  'dialog.mermaid.preview': 'Предпросмотр',
  'dialog.mermaid.insert': 'Вставить',
  'dialog.markdown.description':
    'Поддерживается автоматическое преобразование синтаксиса Markdown в mind-карты.',
  'dialog.markdown.syntax': 'Синтаксис Markdown',
  'dialog.markdown.placeholder': 'Введите сюда описание вашего текста Markdown…',
  'dialog.markdown.preview': 'Предпросмотр',
  'dialog.markdown.insert': 'Вставить',
  'dialog.error.loadMermaid': 'Не удалось загрузить библотеку Mermaid',

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': 'Mermaid в DrawMe',
  'extraTools.markdownToDrawnix': 'Markdown в DrawMe',

  // Clean confirm dialog
  'cleanConfirm.title': 'Очистить доску',
  'cleanConfirm.description': 'Это удалит всё содержимое доски. Вы хотите продолжить?',
  'cleanConfirm.cancel': 'Отмена',
  'cleanConfirm.ok': 'ОК',

  // Link popup items
  'popupLink.delLink': 'Удалить ссылку',

  // Tool popup items
  'popupToolbar.fillColor': 'Цвет заливки',
  'popupToolbar.fontSize': 'Размер шрифта',
  'popupToolbar.fontColor': 'Цвет текста',
  'popupToolbar.link': 'Вставить ссылку',
  'popupToolbar.stroke': 'Контур',
  'popupToolbar.opacity': 'Прозрачность',

  // Text placeholders
  'textPlaceholders.link': 'Ссылка',
  'textPlaceholders.text': 'Текст',

  // Line tool
  'line.source': 'Начало',
  'line.target': 'Конец',
  'line.arrow': 'Стрелка',
  'line.none': 'Нет',

  // Stroke style
  'stroke.solid': 'Сплошной',
  'stroke.dashed': 'Штриховой',
  'stroke.dotted': 'Пунктирный',

  //markdown example
  'markdown.example': `# I have started

  - Let me see who made this bug 🕵️ ♂️ 🔍
    - 😯 💣
      - Turns out it was me 👈 🎯 💘

  - Unexpectedly, it cannot run; why is that 🚫 ⚙️ ❓
    - Unexpectedly, it can run now; why is that? 🎢 ✨
      - 🤯 ⚡ ➡️ 🎉

  - What can run 🐞 🚀
    - then do not touch it 🛑 ✋
      - 👾 💥 🏹 🎯

  ## Boy or girl 👶 ❓ 🤷 ♂️ ♀️

  ### Hello world 👋 🌍 ✨ 💻

  #### Wow, a programmer 🤯 ⌨️ 💡 👩 💻`,

  // Draw elements text
  'draw.lineText': 'Текст',
  'draw.geometryText': 'Текст',

  // Mind map elements text
  'mind.centralText': 'Центральная тема',
  'mind.abstractNodeText': 'Резюме',

  // DrawMe Agent
  'agent.open': 'Открыть DrawMe Agent',
  'agent.title': 'DrawMe Agent',
  'agent.subtitle': 'Рисуйте с помощью естественного языка',
  'agent.close': 'Закрыть Agent',
  'agent.settings': 'Настройки модели',
  'agent.settings.title': 'Сервис модели',
  'agent.settings.description':
    'Запросы Agent идут через прокси DrawMe API, поэтому браузер не получает ключ модели.',
  'agent.settings.model': 'Модель',
  'agent.settings.configured': 'Подключено',
  'agent.settings.notConfigured': 'Не настроено',
  'agent.settings.loading': 'Проверка состояния сервиса…',
  'agent.settings.refresh': 'Обновить',
  'agent.settings.close': 'Закрыть',
  'agent.settings.serverManaged': 'API-ключ хранится только в переменных окружения сервера.',
  'agent.settings.unconfiguredHint': 'Задайте AGENT_API_KEY на сервере и перезапустите API.',
  'agent.auth.title': 'Вход в DrawMe',
  'agent.auth.description':
    'Войдите с учётной записью рабочего пространства, чтобы использовать агент.',
  'agent.auth.email': 'Эл. почта',
  'agent.auth.password': 'Пароль',
  'agent.auth.error': 'Не удалось войти',
  'agent.auth.signingIn': 'Вход…',
  'agent.auth.signIn': 'Войти',
  'agent.auth.signedInAs': 'Вы вошли как',
  'agent.auth.signOut': 'Выйти',
  'agent.auth.sessionExpired': 'Сеанс истёк. Войдите снова.',
  'auth.account': 'Аккаунт',
  'auth.signIn': 'Войти',
  'auth.signOut': 'Выйти',
  'auth.signedOut': 'Вы вышли из аккаунта',
  'auth.signedInAs': 'Вы вошли как',
  'auth.email': 'Эл. почта',
  'auth.password': 'Пароль',
  'auth.error': 'Не удалось войти',
  'auth.signingIn': 'Вход…',
  'auth.or': 'или',
  'auth.dialog.title': 'Вход в DrawMe',
  'auth.dialog.description': 'Один аккаунт синхронизирует доски с облаком и открывает агента.',
  'auth.dialog.close': 'Закрыть',
  'auth.dialog.note':
    'API-ключ хранится только в переменных окружения сервера и не попадает в браузер.',
  'auth.dialog.signedInTitle': 'Вы вошли',
  'auth.dialog.signedInDescription':
    'Чтобы выйти, используйте меню аккаунта в правом верхнем углу.',
  'auth.agentRequiredTitle': 'Войдите, чтобы использовать агента',
  'auth.agentRequiredDescription':
    'Агент использует тот же аккаунт, что и облачная синхронизация. Войдите кнопкой ниже или в правом верхнем углу.',
  'auth.signOutHint': 'Чтобы выйти, используйте меню аккаунта в правом верхнем углу.',
  'agent.empty.title': 'Что нарисуем?',
  'agent.empty.description': 'Опишите процесс, структуру или идею — Agent нарисует это на доске.',
  'agent.placeholder': 'Например: нарисуй процесс регистрации как блок-схему…',
  'agent.composer.hint': 'Enter — отправить · Shift+Enter — новая строка',
  'agent.send': 'Отправить',
  'agent.stop': 'Остановить',
  'agent.thinking': 'Думаю…',
  'agent.tool.inserting': 'Вставляю диаграмму…',
  'agent.tool.generating': 'Создаю диаграмму…',
  'agent.tool.inspected': 'Доска прочитана',
  'agent.tool.inserted': 'Диаграмма вставлена',
  'agent.tool.failed': 'Не удалось вставить диаграмму',
  'agent.toast.inserted': 'Agent вставил диаграмму на холст',
  'agent.error.request': 'Ошибка запроса Agent',
  'agent.error.aborted': 'Генерация остановлена.',
  'agent.annotate': 'Выделить область',
  'agent.annotate.hint': 'Обведите область на холсте, Esc — отмена',
  'agent.annotation.title': 'Аннотация области',
  'agent.annotation.elements': 'Элементов: {count}',
  'agent.annotation.empty': 'Пустая область',
  'agent.annotation.region': '{width} × {height}',
  'agent.annotation.remove': 'Удалить аннотацию',
  'agent.annotation.defaultPrompt': 'Объясни, что находится в этой области',
  'agent.message.you': 'Вы',
  'agent.message.agent': 'Agent',
  'agent.suggestion.flow': 'Нарисуй процесс регистрации как блок-схему',
  'agent.suggestion.architecture': 'Структурируй архитектуру SaaS-продукта как mind map',
  'agent.suggestion.retro': 'Нарисуй блок-схему действий по итогам ретроспективы',

  'tutorial.title': 'DrawMe',
  'tutorial.description':
    'Универсальная доска: майнд-карты, блок-схемы, свободное рисование и многое другое',
  'tutorial.dataDescription': 'Все данные хранятся локально в вашем браузере',
  'tutorial.appToolbar': 'Экспорт, настройки языка, ...',
  'tutorial.creationToolbar': 'Выберите инструмент, чтобы начать творить',
  'tutorial.themeDescription': 'Переключение между светлой и тёмной темами',

  'layout.untitled': 'Без названия',
  'layout.file': 'Файл',
  'layout.layers': 'Слои',
  'layout.assets': 'Материалы',
  'layout.agent': 'Агент',
  'layout.settings': 'Настройки',
  'layout.properties': 'Свойства',
  'layout.collapsePanel': 'Свернуть панель',
  'layout.resizePanel': 'Изменить ширину панели',
  'layout.expandPanel': 'Развернуть панель',
  'layout.toggleUi': 'Скрыть интерфейс',
  'layout.exitZen': 'Выйти из режима Zen',
  'layout.zenHint': 'Нажмите {shortcut}, чтобы выйти из режима Zen',
  'layout.save.local': 'Только локально',
  'layout.save.saving': 'Сохранение…',
  'layout.save.saved': 'Сохранено',
  'layout.save.conflict': 'Обновлено в другом месте',
  'layout.save.error': 'Не удалось сохранить',
  'layout.pages': 'Страницы',
  'layout.page.default': 'Страница 1',
  'layout.pages.new': 'Новая страница',
  'layout.pages.comingSoon': 'Поддержка нескольких страниц скоро появится',
  'layout.layers.empty': 'Слоёв пока нет',
  'layout.layer.unnamed': 'Слой без названия',
  'layout.assets.empty': 'Библиотека материалов скоро появится',
  'layout.properties.empty': 'Выберите элемент, чтобы изменить свойства',
  'layout.properties.multi': 'Выбрано элементов: {count}',
  'layout.properties.fill': 'Заливка',
  'layout.properties.stroke': 'Обводка',
  'layout.properties.text': 'Текст',
  'layout.properties.size': 'Размер шрифта',
  'layout.properties.link': 'Ссылка',
  'layout.share': 'Поделиться',
  'layout.share.copied': 'Ссылка скопирована',
  'layout.share.failed': 'Не удалось скопировать ссылку. Скопируйте адрес из адресной строки.',
  'layout.account': 'Аккаунт',
};

export default ruTranslations;
