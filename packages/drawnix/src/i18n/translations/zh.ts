import { Translations } from '../types';

const zhTranslations: Translations = {
  // Toolbar items
  'toolbar.hand': '手形工具 — H',
  'toolbar.selection': '选择 — V',
  'toolbar.mind': '思维导图 — M',
  'toolbar.text': '文本 — T',
  'toolbar.arrow': '箭头 — A',
  'toolbar.shape': '形状',
  'toolbar.image': '图片 — Cmd+U',
  'toolbar.extraTools': '更多工具',

  'toolbar.pen': '画笔 — P',
  'toolbar.eraser': '橡皮擦 — E',

  'toolbar.arrow.straight': '直线',
  'toolbar.arrow.elbow': '肘线',
  'toolbar.arrow.curve': '曲线',

  'toolbar.shape.rectangle': '长方形 — R',
  'toolbar.shape.ellipse': '圆 — O',
  'toolbar.shape.triangle': '三角形',
  'toolbar.shape.terminal': '开始/结束',
  'toolbar.shape.noteCurlyLeft': '左花括注释',
  'toolbar.shape.noteCurlyRight': '右花括注释',
  'toolbar.shape.diamond': '菱形',
  'toolbar.shape.parallelogram': '平行四边形',
  'toolbar.shape.roundRectangle': '圆角矩形',

  // Zoom controls
  'zoom.in': '放大 — Cmd++',
  'zoom.out': '缩小 — Cmd+-',
  'zoom.fit': '自适应',
  'zoom.100': '缩放至 100%',

  // Themes
  'theme.default': '默认',
  'theme.colorful': '缤纷',
  'theme.soft': '柔和',
  'theme.retro': '复古',
  'theme.dark': '暗夜',
  'theme.starry': '星空',

  // Colors
  'color.none': '主题颜色',
  'color.unknown': '其他颜色',
  'color.default': '黑色',
  'color.white': '白色',
  'color.gray': '灰色',
  'color.deepBlue': '深蓝色',
  'color.red': '红色',
  'color.green': '绿色',
  'color.yellow': '黄色',
  'color.purple': '紫色',
  'color.orange': '橙色',
  'color.pastelPink': '淡粉色',
  'color.cyan': '青色',
  'color.brown': '棕色',
  'color.forestGreen': '森绿色',
  'color.lightGray': '浅灰色',

  // General
  'general.undo': '撤销',
  'general.redo': '重做',
  'general.menu': '应用菜单',
  'general.moreOptions': '更多选项',
  'general.duplicate': '重复',
  'general.delete': '删除',

  'general.copyToClipboard': '复制到剪贴板',
  'general.copyToClipboard.svg': 'SVG',
  'general.copyToClipboard.png': 'PNG',
  'general.copyToClipboard.transparent': '透明背景',
  'toast.copyToClipboard.svg': '已将所选项作为 SVG 复制到剪贴板',
  'toast.copyToClipboard.png': '已将所选项作为 PNG 复制到剪贴板',
  'toast.copyToClipboard.mode.transparent': '（透明背景）',

  // Language
  'language.switcher': 'Language',
  'language.chinese': '中文',
  'language.english': 'English',
  'language.russian': 'Русский',
  'language.arabic': 'عربي',
  'language.vietnamese': 'Tiếng Việt',
  // Menu items
  'menu.open': '打开',
  'menu.saveFile': '保存到当前文件',
  'menu.saveAsFile': '另存为',
  'menu.exportImage': '导出图片',
  'menu.exportImage.svg': 'SVG',
  'menu.exportImage.png': 'PNG',
  'menu.exportImage.jpg': 'JPG',
  'menu.cleanBoard': '清除画布',
  'menu.github': 'GitHub',

  // Dialog translations
  'dialog.mermaid.title': 'Mermaid 转 DrawMe',
  'dialog.mermaid.description': '目前仅支持',
  'dialog.mermaid.flowchart': '流程图',
  'dialog.mermaid.sequence': '序列图',
  'dialog.mermaid.class': '类图',
  'dialog.mermaid.otherTypes': '。其他类型在 DrawMe 中将以图片呈现。',
  'dialog.mermaid.syntax': 'Mermaid 语法',
  'dialog.mermaid.placeholder': '在此处编写 Mermaid 图表定义…',
  'dialog.mermaid.preview': '预览',
  'dialog.mermaid.insert': '插入',
  'dialog.markdown.description': '支持 Markdown 语法自动转换为思维导图。',
  'dialog.markdown.syntax': 'Markdown 语法',
  'dialog.markdown.placeholder': '在此处编写 Markdown 文本定义…',
  'dialog.markdown.preview': '预览',
  'dialog.markdown.insert': '插入',
  'dialog.error.loadMermaid': '加载 Mermaid 库失败',

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': 'Mermaid 到 DrawMe',
  'extraTools.markdownToDrawnix': 'Markdown 到 DrawMe',

  // Clean confirm dialog
  'cleanConfirm.title': '清除画布',
  'cleanConfirm.description': '这将会清除整个画布。你是否要继续?',
  'cleanConfirm.cancel': '取消',
  'cleanConfirm.ok': '确认',

  // Link popup items
  'popupLink.delLink': '移除连结',

  // Tool popup items
  'popupToolbar.fillColor': '填充颜色',
  'popupToolbar.fontSize': '字号',
  'popupToolbar.fontColor': '字体颜色',
  'popupToolbar.link': '链接',
  'popupToolbar.stroke': '边框',
  'popupToolbar.opacity': '不透明度',

  // Text placeholders
  'textPlaceholders.link': '链接',
  'textPlaceholders.text': '文本',

  // Line tool
  'line.source': '起点',
  'line.target': '终点',
  'line.arrow': '箭头',
  'line.none': '无',

  // Stroke style
  'stroke.solid': '实线',
  'stroke.dashed': '虚线',
  'stroke.dotted': '点线',

  // Draw elements text
  'draw.lineText': '文本',
  'draw.geometryText': '文本',

  // Mind map elements text
  'mind.centralText': '中心主题',
  'mind.abstractNodeText': '摘要',

  //markdown example
  'markdown.example': `# 我开始了

  - 让我看看是谁搞出了这个 bug 🕵️ ♂️ 🔍
    - 😯 💣
      - 原来是我 👈 🎯 💘

  - 竟然不可以运行，为什么呢 🚫 ⚙️ ❓
    - 竟然可以运行了，为什么呢？🎢 ✨
      - 🤯 ⚡ ➡️ 🎉

  - 能运行起来的 🐞 🚀
    - 就不要去动它 🛑 ✋
      - 👾 💥 🏹 🎯

  ## 男孩还是女孩 👶 ❓ 🤷 ♂️ ♀️

  ### Hello world 👋 🌍 ✨ 💻

  #### 哇 是个程序员 🤯 ⌨️ 💡 👩 💻`,

  // DrawMe Agent
  'agent.open': '打开 DrawMe Agent',
  'agent.title': 'DrawMe Agent',
  'agent.subtitle': '用自然语言生成白板',
  'agent.close': '关闭 Agent',
  'agent.settings': '模型设置',
  'agent.settings.title': '模型连接',
  'agent.settings.description': '支持 OpenAI 兼容接口。密钥只保存在当前浏览器的 localStorage 中。',
  'agent.settings.presets': '快速填充',
  'agent.settings.baseUrl': 'API 地址',
  'agent.settings.model': '模型',
  'agent.settings.apiKey': 'API Key',
  'agent.settings.apiKeyPlaceholder': '本地模型可留空',
  'agent.settings.invalid': '请填写 API 地址和模型名称',
  'agent.settings.save': '保存设置',
  'agent.settings.cancel': '取消',
  'agent.settings.saved': 'Agent 设置已保存',
  'agent.empty.title': '想画点什么？',
  'agent.empty.description': '描述流程、结构或想法，Agent 会直接把它画到白板上。',
  'agent.placeholder': '例如：把用户注册流程画成流程图…',
  'agent.composer.hint': 'Enter 发送 · Shift+Enter 换行',
  'agent.send': '发送',
  'agent.stop': '停止',
  'agent.thinking': '正在思考…',
  'agent.tool.inserting': '正在插入图表…',
  'agent.tool.inserted': '已插入图表',
  'agent.tool.failed': '图表插入失败',
  'agent.toast.inserted': 'Agent 已将图表插入画布',
  'agent.error.request': 'Agent 请求失败',
  'agent.error.aborted': '已停止生成。',
  'agent.message.you': '你',
  'agent.message.agent': 'Agent',
  'agent.suggestion.flow': '把用户注册流程画成流程图',
  'agent.suggestion.architecture': '用思维导图整理一个 SaaS 产品架构',
  'agent.suggestion.retro': '画一个迭代回顾的行动项流程图',

  'tutorial.title': 'DrawMe',
  'tutorial.description': 'All-in-one 白板，包含思维导图、流程图、自由画笔等',
  'tutorial.dataDescription': '所有数据被存在你的浏览器本地',
  'tutorial.appToolbar': '导出，语言设置，...',
  'tutorial.creationToolbar': '选择一个工具开始你的创作',
  'tutorial.themeDescription': '在明亮和黑暗主题之间切换',
};

export default zhTranslations;
