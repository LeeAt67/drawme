import { Translations } from '../types';

const viTranslations: Translations = {
  // Toolbar items
  'toolbar.hand': 'Kéo — H',
  'toolbar.selection': 'Chọn — V',
  'toolbar.mind': 'Mind Map — M',
  'toolbar.text': 'Văn bản — T',
  'toolbar.arrow': 'Mũi tên — A',
  'toolbar.shape': 'Hình dạng',
  'toolbar.image': 'Hình ảnh — Cmd+U',
  'toolbar.extraTools': 'Công cụ mở rộng',
  'toolbar.collapse': 'Thu gọn thanh công cụ',
  'toolbar.expand': 'Mở rộng thanh công cụ',

  'toolbar.pen': 'Bút vẽ — P',
  'toolbar.eraser': 'Tẩy — E',

  'toolbar.arrow.straight': 'Mũi tên thẳng',
  'toolbar.arrow.elbow': 'Mũi tên vuông góc',
  'toolbar.arrow.curve': 'Mũi tên cong',

  'toolbar.shape.rectangle': 'Hình chữ nhật — R',
  'toolbar.shape.ellipse': 'Hình elip — O',
  'toolbar.shape.triangle': 'Hình tam giác',
  'toolbar.shape.terminal': 'Terminal',
  'toolbar.shape.noteCurlyLeft': 'Ghi chú ngoặc móc trái',
  'toolbar.shape.noteCurlyRight': 'Ghi chú ngoặc móc phải',
  'toolbar.shape.diamond': 'Hình thoi',
  'toolbar.shape.parallelogram': 'Hình bình hành',
  'toolbar.shape.roundRectangle': 'Hình chữ nhật bo tròn',

  // Zoom controls
  'zoom.in': 'Phóng to — Cmd++',
  'zoom.out': 'Thu nhỏ — Cmd+-',
  'zoom.fit': 'Vừa màn hình',
  'zoom.100': 'Zoom 100%',

  // Themes
  'theme.default': 'Mặc định',
  'theme.colorful': 'Đầy màu sắc',
  'theme.soft': 'Nhẹ nhàng',
  'theme.retro': 'Cổ điển',
  'theme.dark': 'Tối',
  'theme.starry': 'Bầu trời sao',

  // Colors
  'color.none': 'Màu chủ đề',
  'color.unknown': 'Màu khác',
  'color.default': 'Đen cơ bản',
  'color.white': 'Trắng',
  'color.gray': 'Xám',
  'color.deepBlue': 'Xanh đậm',
  'color.red': 'Đỏ',
  'color.green': 'Xanh lá',
  'color.yellow': 'Vàng',
  'color.purple': 'Tím',
  'color.orange': 'Cam',
  'color.pastelPink': 'Hồng phấn',
  'color.cyan': 'Xanh lơ',
  'color.brown': 'Nâu',
  'color.forestGreen': 'Xanh rừng',
  'color.lightGray': 'Xám nhạt',

  // General
  'general.undo': 'Hoàn tác',
  'general.redo': 'Làm lại',
  'general.menu': 'Menu ứng dụng',
  'general.moreOptions': 'Tùy chọn khác',
  'general.duplicate': 'Nhân bản',
  'general.delete': 'Xóa',

  'general.copyToClipboard': 'Sao chép vào bộ nhớ tạm',
  'general.copyToClipboard.svg': 'SVG',
  'general.copyToClipboard.png': 'PNG',
  'general.copyToClipboard.transparent': 'Nền trong suốt',
  'toast.copyToClipboard.svg': 'Đã sao chép các mục đã chọn dưới dạng SVG vào bộ nhớ tạm',
  'toast.copyToClipboard.png': 'Đã sao chép các mục đã chọn dưới dạng PNG vào bộ nhớ tạm',
  'toast.copyToClipboard.mode.transparent': '(Nền trong suốt)',
  // Language
  'language.switcher': 'Ngôn ngữ',
  'language.chinese': '中文',
  'language.english': 'English',
  'language.russian': 'Русский',
  'language.arabic': 'عربي',
  'language.vietnamese': 'Tiếng Việt',

  // Menu items
  'menu.open': 'Mở',
  'menu.saveFile': 'Lưu vào tệp hiện tại',
  'menu.saveAsFile': 'Lưu thành',
  'menu.exportImage': 'Xuất hình ảnh',
  'menu.exportImage.svg': 'SVG',
  'menu.exportImage.png': 'PNG',
  'menu.exportImage.jpg': 'JPG',
  'menu.cleanBoard': 'Xóa bảng',
  'menu.github': 'GitHub',

  // Dialog translations
  'dialog.mermaid.title': 'Mermaid sang DrawMe',
  'dialog.mermaid.description': 'Hiện hỗ trợ',
  'dialog.mermaid.flowchart': 'lưu đồ',
  'dialog.mermaid.sequence': 'biểu đồ tuần tự',
  'dialog.mermaid.class': 'biểu đồ lớp',
  'dialog.mermaid.otherTypes': ', và các loại biểu đồ khác (hiển thị dưới dạng hình ảnh).',
  'dialog.mermaid.syntax': 'Cú pháp Mermaid',
  'dialog.mermaid.placeholder': 'Viết định nghĩa biểu đồ Mermaid của bạn ở đây...',
  'dialog.mermaid.preview': 'Xem trước',
  'dialog.mermaid.insert': 'Chèn',
  'dialog.markdown.description': 'Hỗ trợ tự động chuyển đổi cú pháp Markdown sang sơ đồ tư duy.',
  'dialog.markdown.syntax': 'Cú pháp Markdown',
  'dialog.markdown.placeholder': 'Viết nội dung Markdown của bạn ở đây...',
  'dialog.markdown.preview': 'Xem trước',
  'dialog.markdown.insert': 'Chèn',
  'dialog.error.loadMermaid': 'Không thể tải thư viện Mermaid',

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': 'Mermaid sang DrawMe',
  'extraTools.markdownToDrawnix': 'Markdown sang DrawMe',

  // Clean confirm dialog
  'cleanConfirm.title': 'Xóa bảng',
  'cleanConfirm.description': 'Thao tác này sẽ xóa toàn bộ bảng. Bạn có muốn tiếp tục không?',
  'cleanConfirm.cancel': 'Hủy',
  'cleanConfirm.ok': 'Đồng ý',

  // Link popup items
  'popupLink.delLink': 'Xóa liên kết',

  // Tool popup items
  'popupToolbar.fillColor': 'Màu tô',
  'popupToolbar.fontSize': 'Cỡ chữ',
  'popupToolbar.fontColor': 'Màu chữ',
  'popupToolbar.link': 'Chèn liên kết',
  'popupToolbar.stroke': 'Đường viền',
  'popupToolbar.opacity': 'Độ trong suốt',

  // Text placeholders
  'textPlaceholders.link': 'Liên kết',
  'textPlaceholders.text': 'Văn bản',

  // Line tool
  'line.source': 'Bắt đầu',
  'line.target': 'Kết thúc',
  'line.arrow': 'Mũi tên',
  'line.none': 'Không',

  // Stroke style
  'stroke.solid': 'Nét liền',
  'stroke.dashed': 'Nét đứt',
  'stroke.dotted': 'Nét chấm',

  //markdown example
  'markdown.example': `# Tôi đã bắt đầu

    - Hãy xem ai đã tạo ra lỗi này 🕵️ ♂️ 🔍
      - 😯 💣
        - Hóa ra là tôi 👈 🎯 💘

    - Bất ngờ thay, nó không chạy được; tại sao vậy 🚫 ⚙️ ❓
      - Bất ngờ thay, giờ nó chạy được rồi; tại sao vậy? 🎢 ✨
        - 🤯 ⚡ ➡️ 🎉

    - Cái gì chạy được 🐞 🚀
      - thì đừng chạm vào nó 🛑 ✋
        - 👾 💥 🏹 🎯

    ## Trai hay gái 👶 ❓ 🤷 ♂️ ♀️

    ### Xin chào thế giới 👋 🌍 ✨ 💻

    #### Wow, một lập trình viên 🤯 ⌨️ 💡 👩 💻`,

  // Draw elements text
  'draw.lineText': 'Văn bản',
  'draw.geometryText': 'Văn bản',

  // Mind map elements text
  'mind.centralText': 'Chủ đề trung tâm',
  'mind.abstractNodeText': 'Tóm tắt',

  // DrawMe Agent
  'agent.open': 'Mở DrawMe Agent',
  'agent.title': 'DrawMe Agent',
  'agent.subtitle': 'Vẽ bằng ngôn ngữ tự nhiên',
  'agent.close': 'Đóng Agent',
  'agent.settings': 'Cài đặt mô hình',
  'agent.settings.title': 'Dịch vụ mô hình',
  'agent.settings.description':
    'Yêu cầu của Agent được chuyển qua proxy DrawMe API, trình duyệt không bao giờ nhận khóa mô hình.',
  'agent.settings.model': 'Mô hình',
  'agent.settings.configured': 'Đã kết nối',
  'agent.settings.notConfigured': 'Chưa cấu hình',
  'agent.settings.loading': 'Đang kiểm tra trạng thái dịch vụ…',
  'agent.settings.refresh': 'Làm mới',
  'agent.settings.close': 'Đóng',
  'agent.settings.serverManaged': 'Khóa API chỉ được lưu trong biến môi trường phía máy chủ.',
  'agent.settings.unconfiguredHint':
    'Hãy đặt AGENT_API_KEY trên máy chủ rồi khởi động lại dịch vụ API.',
  'agent.auth.title': 'Đăng nhập DrawMe',
  'agent.auth.description': 'Đăng nhập bằng tài khoản không gian làm việc để dùng trợ lý.',
  'agent.auth.email': 'Email',
  'agent.auth.password': 'Mật khẩu',
  'agent.auth.error': 'Đăng nhập thất bại',
  'agent.auth.signingIn': 'Đang đăng nhập…',
  'agent.auth.signIn': 'Đăng nhập',
  'agent.auth.signedInAs': 'Đang đăng nhập với',
  'agent.auth.signOut': 'Đăng xuất',
  'agent.auth.sessionExpired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'auth.account': 'Tài khoản',
  'auth.signIn': 'Đăng nhập',
  'auth.signOut': 'Đăng xuất',
  'auth.signedOut': 'Đã đăng xuất',
  'auth.signedInAs': 'Đang đăng nhập là',
  'auth.email': 'Email',
  'auth.password': 'Mật khẩu',
  'auth.error': 'Đăng nhập thất bại',
  'auth.signingIn': 'Đang đăng nhập…',
  'auth.or': 'hoặc',
  'auth.dialog.title': 'Đăng nhập DrawMe',
  'auth.dialog.description': 'Một tài khoản đồng bộ bảng vẽ lên đám mây và mở khóa trợ lý.',
  'auth.dialog.close': 'Đóng',
  'auth.dialog.note':
    'API key chỉ nằm trong biến môi trường phía máy chủ và không bao giờ gửi xuống trình duyệt.',
  'auth.dialog.signedInTitle': 'Bạn đã đăng nhập',
  'auth.dialog.signedInDescription': 'Dùng menu tài khoản ở góc trên bên phải để đăng xuất.',
  'auth.agentRequiredTitle': 'Đăng nhập để dùng trợ lý',
  'auth.agentRequiredDescription':
    'Trợ lý dùng chung tài khoản đồng bộ đám mây. Hãy đăng nhập bằng nút bên dưới hoặc ở góc trên bên phải.',
  'auth.signOutHint': 'Để đăng xuất, dùng menu tài khoản ở góc trên bên phải.',
  'agent.empty.title': 'Chúng ta vẽ gì?',
  'agent.empty.description': 'Mô tả quy trình, cấu trúc hoặc ý tưởng và Agent sẽ vẽ lên bảng.',
  'agent.placeholder': 'Ví dụ: vẽ quy trình đăng ký người dùng dưới dạng lưu đồ…',
  'agent.composer.hint': 'Enter để gửi · Shift+Enter để xuống dòng',
  'agent.send': 'Gửi',
  'agent.stop': 'Dừng',
  'agent.thinking': 'Đang suy nghĩ…',
  'agent.tool.inserting': 'Đang chèn sơ đồ…',
  'agent.tool.generating': 'Đang tạo biểu đồ…',
  'agent.tool.inspected': 'Đã đọc bảng vẽ',
  'agent.tool.inserted': 'Đã chèn sơ đồ',
  'agent.tool.failed': 'Chèn sơ đồ thất bại',
  'agent.toast.inserted': 'Agent đã chèn sơ đồ vào bảng vẽ',
  'agent.error.request': 'Yêu cầu Agent thất bại',
  'agent.error.aborted': 'Đã dừng tạo.',
  'agent.annotate': 'Chú thích vùng chọn',
  'agent.annotate.hint': 'Kéo để chọn vùng trên bảng, nhấn Esc để hủy',
  'agent.annotation.title': 'Chú thích vùng',
  'agent.annotation.elements': '{count} phần tử',
  'agent.annotation.empty': 'Vùng trống',
  'agent.annotation.region': '{width} × {height}',
  'agent.annotation.remove': 'Xóa chú thích',
  'agent.annotation.defaultPrompt': 'Giải thích nội dung vùng này',
  'agent.message.you': 'Bạn',
  'agent.message.agent': 'Agent',
  'agent.suggestion.flow': 'Vẽ quy trình đăng ký người dùng dưới dạng lưu đồ',
  'agent.suggestion.architecture': 'Sắp xếp kiến trúc sản phẩm SaaS thành sơ đồ tư duy',
  'agent.suggestion.retro': 'Vẽ lưu đồ cho các hành động sau buổi retrospective',

  'tutorial.title': 'DPIT Draw MindMap',
  'tutorial.description':
    'Bảng trắng tất cả trong một, bao gồm sơ đồ tư duy, lưu đồ, vẽ tự do và hơn thế nữa',
  'tutorial.dataDescription': 'Tất cả dữ liệu được lưu trữ cục bộ trong trình duyệt của bạn',
  'tutorial.appToolbar': 'Xuất, cài đặt ngôn ngữ, ...',
  'tutorial.creationToolbar': 'Chọn một công cụ để bắt đầu sáng tạo',
  'tutorial.themeDescription': 'Chuyển đổi giữa chế độ sáng và tối',

  'layout.untitled': 'Bảng chưa đặt tên',
  'layout.file': 'Tệp',
  'layout.layers': 'Lớp',
  'layout.assets': 'Tài nguyên',
  'layout.agent': 'Trợ lý',
  'layout.settings': 'Cài đặt',
  'layout.properties': 'Thuộc tính',
  'layout.collapsePanel': 'Thu gọn bảng',
  'layout.resizePanel': 'Thay đổi độ rộng bảng',
  'layout.expandPanel': 'Mở rộng bảng',
  'layout.toggleUi': 'Ẩn giao diện',
  'layout.exitZen': 'Thoát chế độ Zen',
  'layout.zenHint': 'Nhấn {shortcut} để thoát chế độ Zen',
  'layout.save.local': 'Chỉ lưu cục bộ',
  'layout.save.saving': 'Đang lưu…',
  'layout.save.saved': 'Đã lưu',
  'layout.save.conflict': 'Đã được cập nhật ở nơi khác',
  'layout.save.error': 'Lưu thất bại',
  'layout.pages': 'Trang',
  'layout.page.default': 'Trang 1',
  'layout.pages.new': 'Trang mới',
  'layout.pages.comingSoon': 'Sắp hỗ trợ nhiều trang',
  'layout.layers.empty': 'Chưa có lớp nào',
  'layout.layer.unnamed': 'Lớp chưa đặt tên',
  'layout.assets.empty': 'Thư viện tài nguyên sắp ra mắt',
  'layout.properties.empty': 'Chọn một phần tử để chỉnh sửa thuộc tính',
  'layout.properties.multi': 'Đã chọn {count} phần tử',
  'layout.properties.fill': 'Tô nền',
  'layout.properties.stroke': 'Viền',
  'layout.properties.text': 'Văn bản',
  'layout.properties.size': 'Cỡ chữ',
  'layout.properties.link': 'Liên kết',
  'layout.share': 'Chia sẻ',
  'layout.share.copied': 'Đã sao chép liên kết',
  'layout.share.failed': 'Không thể sao chép liên kết. Hãy sao chép từ thanh địa chỉ.',
  'layout.account': 'Tài khoản',
};

export default viTranslations;
