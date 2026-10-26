import { Translations } from '../types';

const enTranslations: Translations = {
  // Toolbar items
  'toolbar.hand': 'Hand — H',
  'toolbar.selection': 'Selection — V',
  'toolbar.mind': 'Mind — M',
  'toolbar.text': 'Text — T',
  'toolbar.arrow': 'Arrow — A',
  'toolbar.shape': 'Shape',
  'toolbar.image': 'Image — Cmd+U',
  'toolbar.extraTools': 'Extra Tools',

  'toolbar.pen': 'Pen — P',
  'toolbar.eraser': 'Eraser — E',

  'toolbar.arrow.straight': 'Straight Arrow Line',
  'toolbar.arrow.elbow': 'Elbow Arrow Line',
  'toolbar.arrow.curve': 'Curve Arrow Line',

  'toolbar.shape.rectangle': 'Rectangle — R',
  'toolbar.shape.ellipse': 'Ellipse — O',
  'toolbar.shape.triangle': 'Triangle',
  'toolbar.shape.terminal': 'Terminal',
  'toolbar.shape.noteCurlyLeft': 'Curly Note — Left',
  'toolbar.shape.noteCurlyRight': 'Curly Note — Right',
  'toolbar.shape.diamond': 'Diamond',
  'toolbar.shape.parallelogram': 'Parallelogram',
  'toolbar.shape.roundRectangle': 'Round Rectangle',

  // Zoom controls
  'zoom.in': 'Zoom In — Cmd++',
  'zoom.out': 'Zoom Out — Cmd+-',
  'zoom.fit': 'Fit to Screen',
  'zoom.100': 'Zoom to 100%',

  // Themes
  'theme.default': 'Default',
  'theme.colorful': 'Colorful',
  'theme.soft': 'Soft',
  'theme.retro': 'Retro',
  'theme.dark': 'Dark',
  'theme.starry': 'Starry',

  // Colors
  'color.none': 'Topic Color',
  'color.unknown': 'Other Color',
  'color.default': 'Basic Black',
  'color.white': 'White',
  'color.gray': 'Grey',
  'color.deepBlue': 'Deep Blue',
  'color.red': 'Red',
  'color.green': 'Green',
  'color.yellow': 'Yellow',
  'color.purple': 'Purple',
  'color.orange': 'Orange',
  'color.pastelPink': 'Paster Pink',
  'color.cyan': 'Cyan',
  'color.brown': 'Brown',
  'color.forestGreen': 'Forest Green',
  'color.lightGray': 'Light Grey',

  // General
  'general.undo': 'Undo',
  'general.redo': 'Redo',
  'general.menu': 'App Menu',
  'general.moreOptions': 'More Options',
  'general.duplicate': 'Duplicate',
  'general.delete': 'Delete',
  'general.copyToClipboard': 'Copy to Clipboard',
  'general.copyToClipboard.svg': 'SVG',
  'general.copyToClipboard.png': 'PNG',
  'general.copyToClipboard.transparent': 'Transparent',
  'toast.copyToClipboard.svg': 'Copied selected items as SVG to clipboard',
  'toast.copyToClipboard.png': 'Copied selected items as PNG to clipboard',
  'toast.copyToClipboard.mode.transparent': '(Transparent background)',
  // Language
  'language.switcher': 'Language',
  'language.chinese': '中文',
  'language.english': 'English',
  'language.russian': 'Русский',
  'language.arabic': 'عربي',
  'language.vietnamese': 'Tiếng Việt',
  // Menu items
  'menu.open': 'Open',
  'menu.saveFile': 'Save to current file',
  'menu.saveAsFile': 'Save As',
  'menu.exportImage': 'Export Image',
  'menu.exportImage.svg': 'SVG',
  'menu.exportImage.png': 'PNG',
  'menu.exportImage.jpg': 'JPG',
  'menu.cleanBoard': 'Clear Board',
  'menu.github': 'GitHub',

  // Dialog translations
  'dialog.mermaid.title': 'Mermaid to DrawMe',
  'dialog.mermaid.description': 'Currently supports',
  'dialog.mermaid.flowchart': 'flowcharts',
  'dialog.mermaid.sequence': 'sequence diagrams',
  'dialog.mermaid.class': 'class diagrams',
  'dialog.mermaid.otherTypes': ', and other diagram types (rendered as images).',
  'dialog.mermaid.syntax': 'Mermaid Syntax',
  'dialog.mermaid.placeholder': 'Write your Mermaid chart definition here…',
  'dialog.mermaid.preview': 'Preview',
  'dialog.mermaid.insert': 'Insert',
  'dialog.markdown.description': 'Supports automatic conversion of Markdown syntax to mind map.',
  'dialog.markdown.syntax': 'Markdown Syntax',
  'dialog.markdown.placeholder': 'Write your Markdown text definition here...',
  'dialog.markdown.preview': 'Preview',
  'dialog.markdown.insert': 'Insert',
  'dialog.error.loadMermaid': 'Failed to load Mermaid library',

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': 'Mermaid to DrawMe',
  'extraTools.markdownToDrawnix': 'Markdown to DrawMe',

  // Clean confirm dialog
  'cleanConfirm.title': 'Clear Board',
  'cleanConfirm.description': 'This will clear the entire board. Do you want to continue?',
  'cleanConfirm.cancel': 'Cancel',
  'cleanConfirm.ok': 'OK',

  // Link popup items
  'popupLink.delLink': 'Delete Link',

  // Tool popup items
  'popupToolbar.fillColor': 'Fill Color',
  'popupToolbar.fontSize': 'Font Size',
  'popupToolbar.fontColor': 'Font Color',
  'popupToolbar.link': 'Insert Link',
  'popupToolbar.stroke': 'Stroke',
  'popupToolbar.opacity': 'Opacity',

  // Text placeholders
  'textPlaceholders.link': 'Link',
  'textPlaceholders.text': 'Text',

  // Line tool
  'line.source': 'Start',
  'line.target': 'End',
  'line.arrow': 'Arrow',
  'line.none': 'None',

  // Stroke style
  'stroke.solid': 'Solid',
  'stroke.dashed': 'Dashed',
  'stroke.dotted': 'Dotted',

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
  'draw.lineText': 'Text',
  'draw.geometryText': 'Text',

  // Mind map elements text
  'mind.centralText': 'Central Topic',
  'mind.abstractNodeText': 'Summary',

  // DrawMe Agent
  'agent.open': 'Open DrawMe Agent',
  'agent.title': 'DrawMe Agent',
  'agent.subtitle': 'Draw with natural language',
  'agent.close': 'Close Agent',
  'agent.settings': 'Model settings',
  'agent.settings.title': 'Model connection',
  'agent.settings.description':
    'Works with OpenAI-compatible endpoints. The key is stored only in this browser local storage.',
  'agent.settings.presets': 'Quick fill',
  'agent.settings.baseUrl': 'API URL',
  'agent.settings.model': 'Model',
  'agent.settings.apiKey': 'API key',
  'agent.settings.apiKeyPlaceholder': 'Optional for local models',
  'agent.settings.invalid': 'Enter an API URL and model name.',
  'agent.settings.save': 'Save settings',
  'agent.settings.cancel': 'Cancel',
  'agent.settings.saved': 'Agent settings saved',
  'agent.empty.title': 'What should we draw?',
  'agent.empty.description':
    'Describe a flow, structure or idea and the agent will draw it on the board.',
  'agent.placeholder': 'For example: draw the user sign-up flow as a flowchart…',
  'agent.composer.hint': 'Enter to send · Shift+Enter for a new line',
  'agent.send': 'Send',
  'agent.stop': 'Stop',
  'agent.thinking': 'Thinking…',
  'agent.tool.inserting': 'Inserting diagram…',
  'agent.tool.inserted': 'Diagram inserted',
  'agent.tool.failed': 'Diagram insertion failed',
  'agent.toast.inserted': 'The agent inserted a diagram into the canvas',
  'agent.error.request': 'Agent request failed',
  'agent.error.aborted': 'Generation stopped.',
  'agent.message.you': 'You',
  'agent.message.agent': 'Agent',
  'agent.suggestion.flow': 'Draw the user sign-up flow as a flowchart',
  'agent.suggestion.architecture': 'Map a SaaS product architecture as a mind map',
  'agent.suggestion.retro': 'Draw a flowchart for retrospective action items',

  'tutorial.title': 'DrawMe',
  'tutorial.description':
    'All-in-one whiteboard, including mind maps, flowcharts, free drawing, and more',
  'tutorial.dataDescription': 'All data is stored locally in your browser',
  'tutorial.appToolbar': 'Export, language settings, ...',
  'tutorial.creationToolbar': 'Select a tool to start your creation',
  'tutorial.themeDescription': 'Switch between light and dark themes',
};

export default enTranslations;
