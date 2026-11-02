import { Translations } from '../types';

const arTranslations: Translations = {
  // Toolbar items
  'toolbar.hand': 'اليد — H',
  'toolbar.selection': 'التحديد — V',
  'toolbar.mind': 'خريطة ذهنية — M',
  'toolbar.eraser': 'ممحاة — E',
  'toolbar.text': 'نص — T',
  'toolbar.pen': 'قلم — P',
  'toolbar.arrow': 'سهم — A',
  'toolbar.shape': 'أشكال',
  'toolbar.image': 'صورة — Cmd+U',
  'toolbar.extraTools': 'أدوات إضافية',
  'toolbar.collapse': 'طي شريط الأدوات',
  'toolbar.expand': 'توسيع شريط الأدوات',

  'toolbar.arrow.straight': 'سهم مستقيم',
  'toolbar.arrow.elbow': 'سهم بزوايا',
  'toolbar.arrow.curve': 'سهم منحني',

  'toolbar.shape.rectangle': 'مستطيل — R',
  'toolbar.shape.ellipse': 'بيضاوي — O',
  'toolbar.shape.triangle': 'مثلث',
  'toolbar.shape.terminal': 'نهائي',
  'toolbar.shape.noteCurlyLeft': 'ملاحظة معقوفة — يسار',
  'toolbar.shape.noteCurlyRight': 'ملاحظة معقوفة — يمين',
  'toolbar.shape.diamond': 'معين',
  'toolbar.shape.parallelogram': 'متوازي أضلاع',
  'toolbar.shape.roundRectangle': 'مستطيل دائري الحواف',

  // Zoom controls
  'zoom.in': 'تكبير — Cmd++',
  'zoom.out': 'تصغير — Cmd+-',
  'zoom.fit': 'ملاءمة الشاشة',
  'zoom.100': 'تكبير إلى 100%',

  // Themes
  'theme.default': 'افتراضي',
  'theme.colorful': 'ملون',
  'theme.soft': 'ناعم',
  'theme.retro': 'كلاسيكي',
  'theme.dark': 'داكن',
  'theme.starry': 'ليلي',

  // Colors
  'color.none': 'لون الموضوع',
  'color.unknown': 'لون آخر',
  'color.default': 'أسود أساسي',
  'color.white': 'أبيض',
  'color.gray': 'رمادي',
  'color.deepBlue': 'أزرق غامق',
  'color.red': 'أحمر',
  'color.green': 'أخضر',
  'color.yellow': 'أصفر',
  'color.purple': 'بنفسجي',
  'color.orange': 'برتقالي',
  'color.pastelPink': 'وردي فاتح',
  'color.cyan': 'سماوي',
  'color.brown': 'بني',
  'color.forestGreen': 'أخضر غامق (غابة)',
  'color.lightGray': 'رمادي فاتح',

  // General
  'general.undo': 'تراجع',
  'general.redo': 'إعادة',
  'general.menu': 'قائمة التطبيق',
  'general.moreOptions': 'خيارات إضافية',
  'general.duplicate': 'تكرار',
  'general.delete': 'حذف',

  // Language
  'language.switcher': 'اللغة',
  'language.chinese': '中文',
  'language.english': 'English',
  'language.russian': 'Русский',
  'language.arabic': 'عربي',
  'language.vietnamese': 'Tiếng Việt',
  'general.copyToClipboard': 'نسخ إلى الحافظة',
  'general.copyToClipboard.svg': 'SVG',
  'general.copyToClipboard.png': 'PNG',
  'general.copyToClipboard.transparent': 'خلفية شفافة',
  'toast.copyToClipboard.svg': 'تم نسخ العناصر المحددة كـ SVG إلى الحافظة',
  'toast.copyToClipboard.png': 'تم نسخ العناصر المحددة كـ PNG إلى الحافظة',
  'toast.copyToClipboard.mode.transparent': '(خلفية شفافة)',

  // Menu items
  'menu.open': 'فتح',
  'menu.saveFile': 'حفظ إلى الملف الحالي',
  'menu.saveAsFile': 'حفظ باسم',
  'menu.exportImage': 'تصدير صورة',
  'menu.exportImage.svg': 'SVG',
  'menu.exportImage.png': 'PNG',
  'menu.exportImage.jpg': 'JPG',
  'menu.cleanBoard': 'مسح اللوحة',
  'menu.github': 'غيت هب',

  // Dialog translations
  'dialog.mermaid.title': 'من Mermaid إلى DrawMe',
  'dialog.mermaid.description': 'يدعم حاليًا',
  'dialog.mermaid.flowchart': 'المخططات الانسيابية',
  'dialog.mermaid.sequence': 'مخططات التسلسل',
  'dialog.mermaid.class': 'مخططات الفئات',
  'dialog.mermaid.otherTypes': '، وأنواع أخرى من المخططات (تُعرض كصور).',
  'dialog.mermaid.syntax': 'صيغة Mermaid',
  'dialog.mermaid.placeholder': 'اكتب تعريف المخطط هنا...',
  'dialog.mermaid.preview': 'معاينة',
  'dialog.mermaid.insert': 'إدراج',
  'dialog.markdown.description': 'يدعم التحويل التلقائي من Markdown إلى خريطة ذهنية.',
  'dialog.markdown.syntax': 'صيغة Markdown',
  'dialog.markdown.placeholder': 'اكتب نص Markdown هنا...',
  'dialog.markdown.preview': 'معاينة',
  'dialog.markdown.insert': 'إدراج',
  'dialog.error.loadMermaid': 'فشل في تحميل مكتبة Mermaid',

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': 'من Mermaid إلى DrawMe',
  'extraTools.markdownToDrawnix': 'من Markdown إلى DrawMe',

  // Clean confirm dialog
  'cleanConfirm.title': 'مسح اللوحة',
  'cleanConfirm.description': 'سيؤدي هذا إلى مسح اللوحة بالكامل. هل تريد المتابعة؟',
  'cleanConfirm.cancel': 'إلغاء',
  'cleanConfirm.ok': 'موافق',

  // Link popup items
  'popupLink.delLink': 'حذف الرابط',

  // Tool popup items
  'popupToolbar.fillColor': 'لون التعبئة',
  'popupToolbar.fontSize': 'حجم الخط',
  'popupToolbar.fontColor': 'لون الخط',
  'popupToolbar.link': 'إدراج رابط',
  'popupToolbar.stroke': 'الحد',
  'popupToolbar.opacity': 'مستوى شفافية',

  // Text placeholders
  'textPlaceholders.link': 'رابط',
  'textPlaceholders.text': 'نص',

  // Line tool
  'line.source': 'بداية',
  'line.target': 'نهاية',
  'line.arrow': 'سهم',
  'line.none': 'لا شيء',

  // Stroke style
  'stroke.solid': 'صلب',
  'stroke.dashed': 'متقطع',
  'stroke.dotted': 'منقط',

  //markdown example
  //   "markdown.example": "# لقد بدأت\n\n- دعني أرى من تسبب بهذا الخطأ 🕵️ ♂️ 🔍\n  - 😯 💣\n    - اتضح أنه أنا 👈 🎯 💘\n\n- بشكل غير متوقع، لا يعمل؛ لماذا 🚫 ⚙️ ❓\n  - بشكل غير متوقع، أصبح يعمل الآن؛ لماذا؟ 🎢 ✨\n    - 🤯 ⚡ ➡️ 🎉\n\n- ما الذي يمكن تشغيله 🐞 🚀\n  - إذًا لا تلمسه 🛑 ✋\n    - 👾 💥 🏹 🎯\n\n## ولد أم بنت 👶 ❓ 🤷 ♂️ ♀️\n\n### مرحبًا بالعالم 👋 🌍 ✨ 💻\n\n#### واو، مبرمج 🤯 ⌨️ 💡 👩 💻",
  'markdown.example': `# I have started

  - دعني أرى من تسبب بهذا الخطأ  🕵️ ♂️ 🔍
    - 😯 💣
      - اتضح أنه أنا 👈 🎯 💘

  - بشكل غير متوقع، لا يعمل؛ لماذا  🚫 ⚙️ ❓
    - بشكل غير متوقع، أصبح يعمل الآن؛ لماذا؟ 🎢 ✨
      - 🤯 ⚡ ➡️ 🎉

  - ما الذي يمكن تشغيله 🐞 🚀
    - إذًا لا تلمسه 🛑 ✋
      - 👾 💥 🏹 🎯

  ## ولد أم بنت  👶 ❓ 🤷 ♂️ ♀️

  ### Hello world 👋 🌍 ✨ 💻

  #### Wow, a programmer 🤯 ⌨️ 💡 👩 💻`,

  // Draw elements text
  'draw.lineText': 'نص',
  'draw.geometryText': 'نص',

  // Mind map elements text
  'mind.centralText': 'الموضوع المركزي',
  'mind.abstractNodeText': 'ملخص',

  // DrawMe Agent
  'agent.open': 'فتح DrawMe Agent',
  'agent.title': 'DrawMe Agent',
  'agent.subtitle': 'ارسم باللغة الطبيعية',
  'agent.close': 'إغلاق Agent',
  'agent.settings': 'إعدادات النموذج',
  'agent.settings.title': 'خدمة النموذج',
  'agent.settings.description':
    'تمر طلبات Agent عبر وكيل DrawMe API، لذا لا يصل مفتاح النموذج إلى المتصفح.',
  'agent.settings.model': 'النموذج',
  'agent.settings.configured': 'متصل',
  'agent.settings.notConfigured': 'غير مُهيأ',
  'agent.settings.loading': 'جارٍ فحص حالة الخدمة…',
  'agent.settings.refresh': 'تحديث',
  'agent.settings.close': 'إغلاق',
  'agent.settings.serverManaged': 'يُحفظ مفتاح API في متغيرات بيئة الخادم فقط.',
  'agent.settings.unconfiguredHint': 'عيّن AGENT_API_KEY على الخادم ثم أعد تشغيل خدمة API.',
  'agent.auth.title': 'تسجيل الدخول إلى DrawMe',
  'agent.auth.description': 'سجّل الدخول بحساب مساحة العمل لاستخدام الوكيل.',
  'agent.auth.email': 'البريد الإلكتروني',
  'agent.auth.password': 'كلمة المرور',
  'agent.auth.error': 'فشل تسجيل الدخول',
  'agent.auth.signingIn': 'جارٍ تسجيل الدخول…',
  'agent.auth.signIn': 'تسجيل الدخول',
  'agent.auth.signedInAs': 'مسجّل الدخول باسم',
  'agent.auth.signOut': 'تسجيل الخروج',
  'agent.auth.sessionExpired': 'انتهت جلستك. يرجى تسجيل الدخول مجددًا.',
  'auth.account': 'الحساب',
  'auth.signIn': 'تسجيل الدخول',
  'auth.signOut': 'تسجيل الخروج',
  'auth.signedOut': 'تم تسجيل الخروج',
  'auth.signedInAs': 'مسجّل الدخول باسم',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.error': 'تعذّر تسجيل الدخول',
  'auth.signingIn': 'جارٍ تسجيل الدخول…',
  'auth.or': 'أو',
  'auth.dialog.title': 'تسجيل الدخول إلى DrawMe',
  'auth.dialog.description': 'حساب واحد يزامن لوحاتك مع السحابة ويفعّل الوكيل.',
  'auth.dialog.close': 'إغلاق',
  'auth.dialog.note': 'يبقى مفتاح API في متغيرات بيئة الخادم ولا يصل إلى المتصفح.',
  'auth.dialog.signedInTitle': 'أنت مسجّل الدخول',
  'auth.dialog.signedInDescription': 'استخدم قائمة الحساب أعلى اليمين لتسجيل الخروج.',
  'auth.agentRequiredTitle': 'سجّل الدخول لاستخدام الوكيل',
  'auth.agentRequiredDescription':
    'يستخدم الوكيل حساب المشروع نفسه الخاص بالمزامنة السحابية. سجّل الدخول من الزر أدناه أو من أعلى اليمين.',
  'auth.signOutHint': 'لتسجيل الخروج، استخدم قائمة الحساب أعلى اليمين.',
  'agent.empty.title': 'ماذا نرسم؟',
  'agent.empty.description': 'صِف تدفقًا أو بنية أو فكرة وسيرسمها Agent على اللوحة.',
  'agent.placeholder': 'مثال: ارسم تدفق تسجيل المستخدم كمخطط انسيابي…',
  'agent.composer.hint': 'Enter للإرسال · Shift+Enter لسطر جديد',
  'agent.send': 'إرسال',
  'agent.stop': 'إيقاف',
  'agent.thinking': 'جارٍ التفكير…',
  'agent.tool.inserting': 'جارٍ إدراج المخطط…',
  'agent.tool.generating': 'جارٍ إنشاء المخطط…',
  'agent.tool.inspected': 'تمت قراءة اللوحة',
  'agent.tool.inserted': 'تم إدراج المخطط',
  'agent.tool.failed': 'فشل إدراج المخطط',
  'agent.toast.inserted': 'أدرج Agent مخططًا في اللوحة',
  'agent.error.request': 'فشل طلب Agent',
  'agent.error.aborted': 'تم إيقاف الإنشاء.',
  'agent.annotate': 'تحديد منطقة',
  'agent.annotate.hint': 'اسحب لتحديد منطقة على اللوحة، واضغط Esc للإلغاء',
  'agent.annotation.title': 'تعليق على المنطقة',
  'agent.annotation.elements': '{count} عناصر',
  'agent.annotation.empty': 'منطقة فارغة',
  'agent.annotation.region': '{width} × {height}',
  'agent.annotation.remove': 'إزالة التعليق',
  'agent.annotation.defaultPrompt': 'اشرح محتوى هذه المنطقة',
  'agent.message.you': 'أنت',
  'agent.message.agent': 'Agent',
  'agent.suggestion.flow': 'ارسم تدفق تسجيل المستخدم كمخطط انسيابي',
  'agent.suggestion.architecture': 'نظّم بنية منتج SaaS في خريطة ذهنية',
  'agent.suggestion.retro': 'ارسم مخططًا انسيابيًا لعناصر عمل المراجعة',

  'tutorial.title': 'DrawMe',
  'tutorial.description':
    'سبورة شاملة تتضمن الخرائط الذهنية والمخططات الانسيابية والرسم الحر وغير ذلك',
  'tutorial.dataDescription': 'تُحفظ جميع البيانات محليًا في متصفحك',
  'tutorial.appToolbar': 'تصدير، إعدادات اللغة، ...',
  'tutorial.creationToolbar': 'اختر أداة لبدء الإنشاء',
  'tutorial.themeDescription': 'التبديل بين السمة الفاتحة والداكنة',

  'layout.untitled': 'لوحة بدون عنوان',
  'layout.file': 'ملف',
  'layout.layers': 'الطبقات',
  'layout.assets': 'الأصول',
  'layout.agent': 'الوكيل',
  'layout.settings': 'الإعدادات',
  'layout.properties': 'الخصائص',
  'layout.collapsePanel': 'طي اللوحة',
  'layout.resizePanel': 'تغيير عرض اللوحة',
  'layout.expandPanel': 'توسيع اللوحة',
  'layout.toggleUi': 'إخفاء الواجهة',
  'layout.exitZen': 'الخروج من وضع Zen',
  'layout.zenHint': 'اضغط {shortcut} للخروج من وضع Zen',
  'layout.save.local': 'محلي فقط',
  'layout.save.saving': 'جارٍ الحفظ…',
  'layout.save.saved': 'تم الحفظ',
  'layout.save.conflict': 'تم التحديث في مكان آخر',
  'layout.save.error': 'فشل الحفظ',
  'layout.pages': 'الصفحات',
  'layout.page.default': 'الصفحة 1',
  'layout.pages.new': 'صفحة جديدة',
  'layout.pages.comingSoon': 'دعم صفحات متعددة قريبًا',
  'layout.layers.empty': 'لا توجد طبقات بعد',
  'layout.layer.unnamed': 'طبقة بدون اسم',
  'layout.assets.empty': 'مكتبة الأصول قريبًا',
  'layout.properties.empty': 'حدّد عنصرًا لتعديل خصائصه',
  'layout.properties.multi': 'تم تحديد {count} عناصر',
  'layout.properties.fill': 'التعبئة',
  'layout.properties.stroke': 'الحد',
  'layout.properties.text': 'النص',
  'layout.properties.size': 'حجم الخط',
  'layout.properties.link': 'الرابط',
  'layout.share': 'مشاركة',
  'layout.share.copied': 'تم نسخ الرابط',
  'layout.share.failed': 'تعذّر نسخ الرابط. انسخه من شريط العنوان.',
  'layout.account': 'الحساب',
};

export default arTranslations;
