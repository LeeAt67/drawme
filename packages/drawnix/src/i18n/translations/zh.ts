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
  'toolbar.collapse': '收起工具栏',
  'toolbar.expand': '展开工具栏',

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
  'agent.settings.title': '模型服务',
  'agent.settings.description': 'Agent 请求经由 DrawMe API 代理转发，浏览器不会接触模型密钥。',
  'agent.settings.model': '模型',
  'agent.settings.configured': '已连接',
  'agent.settings.notConfigured': '未配置',
  'agent.settings.loading': '正在检查服务状态…',
  'agent.settings.refresh': '刷新状态',
  'agent.settings.close': '关闭',
  'agent.settings.serverManaged': 'API Key 只保存在服务端环境变量中，不会下发到浏览器。',
  'agent.settings.unconfiguredHint': '请在服务端设置 AGENT_API_KEY 后重启 API 服务。',
  'agent.auth.title': '登录 DrawMe',
  'agent.auth.description': '使用团队账号登录后即可调用 Agent。',
  'agent.auth.email': '邮箱',
  'agent.auth.password': '密码',
  'agent.auth.error': '登录失败',
  'agent.auth.signingIn': '正在登录…',
  'agent.auth.signIn': '登录',
  'agent.auth.signedInAs': '当前账号',
  'agent.auth.signOut': '退出登录',
  'agent.auth.sessionExpired': '登录已过期，请重新登录。',
  'auth.account': '账户',
  'auth.signIn': '登录',
  'auth.signOut': '退出登录',
  'auth.signedOut': '已退出登录',
  'auth.signedInAs': '当前账号',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'auth.error': '登录失败',
  'auth.signingIn': '正在登录…',
  'auth.or': '或',
  'auth.dialog.title': '登录 DrawMe',
  'auth.dialog.description': '一个账号即可云端同步画布，并使用 Agent 生成图表。',
  'auth.dialog.close': '关闭',
  'auth.dialog.note': 'API Key 只保存在服务端环境变量中，浏览器不会接触。',
  'auth.dialog.signedInTitle': '已登录',
  'auth.dialog.signedInDescription': '你可以在右上角账户菜单中退出登录。',
  'auth.agentRequiredTitle': '登录后使用 Agent',
  'auth.agentRequiredDescription':
    'Agent 与云端同步共用项目账号，请点击下方按钮或右上角账户入口登录。',
  'auth.signOutHint': '需要退出登录？请使用右上角的账户菜单。',
  'agent.empty.title': '想画点什么？',
  'agent.empty.description': '描述流程、结构或想法，Agent 会直接把它画到白板上。',
  'agent.placeholder': '例如：把用户注册流程画成流程图…',
  'agent.composer.hint': 'Enter 发送 · Shift+Enter 换行',
  'agent.send': '发送',
  'agent.stop': '停止',
  'agent.thinking': '正在思考…',
  'agent.tool.inserting': '正在插入图表…',
  'agent.tool.generating': '正在生成图表…',
  'agent.tool.inspected': '已读取画布',
  'agent.tool.inserted': '已插入图表',
  'agent.tool.failed': '图表插入失败',
  'agent.toast.inserted': 'Agent 已将图表插入画布',
  'agent.error.request': 'Agent 请求失败',
  'agent.error.aborted': '已停止生成。',
  'agent.annotate': '批注选区',
  'agent.annotate.hint': '拖动框选画布区域，按 Esc 取消',
  'agent.annotation.title': '区域批注',
  'agent.annotation.elements': '{count} 个元素',
  'agent.annotation.empty': '空白区域',
  'agent.annotation.region': '{width} × {height}',
  'agent.annotation.remove': '移除批注',
  'agent.annotation.defaultPrompt': '解释一下这块区域的内容',
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

  'layout.untitled': '未命名画布',
  'layout.file': '文件',
  'layout.layers': '图层',
  'layout.assets': '素材',
  'layout.agent': 'Agent',
  'layout.settings': '设置',
  'layout.properties': '属性',
  'layout.collapsePanel': '收起面板',
  'layout.resizePanel': '拖拽调整面板宽度',
  'layout.expandPanel': '展开面板',
  'layout.toggleUi': '隐藏界面',
  'layout.exitZen': '退出 Zen 模式',
  'layout.zenHint': '按 {shortcut} 退出 Zen 模式',
  'layout.save.local': '仅保存在本地',
  'layout.save.saving': '保存中…',
  'layout.save.saved': '已保存',
  'layout.save.conflict': '云端已有更新',
  'layout.save.error': '保存失败',
  'layout.pages': '页面',
  'layout.page.default': '页面 1',
  'layout.pages.new': '新建页面',
  'layout.pages.comingSoon': '多页面即将支持',
  'layout.layers.empty': '还没有图层',
  'layout.layer.unnamed': '未命名图层',
  'layout.assets.empty': '素材库即将上线',
  'layout.properties.empty': '选择一个元素以编辑属性',
  'layout.properties.multi': '已选中 {count} 个元素',
  'layout.properties.fill': '填充',
  'layout.properties.stroke': '描边',
  'layout.properties.text': '文本',
  'layout.properties.size': '字号',
  'layout.properties.link': '链接',
  'layout.share': '分享',
  'layout.share.copied': '链接已复制',
  'layout.share.failed': '无法复制链接，请手动复制地址栏',
  'layout.account': '账户',
};

export default zhTranslations;
