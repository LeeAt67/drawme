# react-text

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-text`
> 🏷️ 类型：**Module**（Slate 文本渲染）

---

## 概览

基于 Slate 的文本编辑组件 `Text`，供 board 通过 `renderText` 挂载到每个文本 foreignObject 内。它只负责"把 Plait 的 text 节点渲染成可编辑内容"，不参与布局计算。

对外导出（`src/index.ts` 只有两行）：`./text` 与 `./custom-types`，即 `Text`、`TextComponentProps`、`CustomEditor`、`RenderElementPropsFor`。`withInlineLink` / `LinkComponent` 未在根入口导出，只能从 `src/plugins/with-link` 直接引用。

## 相关概念

- **每个文本节点一个 Slate editor**：`useState(() => withInlineLink(withText(withHistory(withReact(createEditor())))))`。editor 在组件生命周期内复用，`text` prop 变化时直接替换 `editor.children[0]` 并 `onChange()`，**不是**重建 editor（否则会丢失撤销历史与选区）。
- **插件顺序固定**：`withReact` 必须最内层（Slate 官方要求），再 `withHistory`、`withText`（自定义换行/粘贴）、`withInlineLink`（链接）。
- **`afterInit` 上抛 editor**：`board.renderText` 需要拿到 `ReactEditor` 实例做 DOM↔节点反查（链接浮层依赖它）。
- **左右方向键改 `unit:'offset'`**：为了让光标能进出内联链接（而非整段跳过），这是 Slate 内联元素的常见修正。
- **只读/可编辑由 `readonly` 控制**：由 Plait 传入，不是应用态。

## 相关概念（与 `@plait/text-plugins` 的关系）

- `withInlineLink` 调用 `LinkEditor.wrapLink(editor, text, text)`：输入或粘贴 URL 时自动包成链接。
- 元素/叶子渲染使用 `@plait/common` 的 `CustomElement` / `CustomText` 类型与 `LinkElement`。

## 测试用例覆盖

- [x] `src/text.spec.tsx` — 渲染冒烟
- [ ] 建议补充：输入 URL 自动成链、粘贴时 `text/plain` 去尾换行、`text` prop 变化后内容同步
- [ ] 现有 `text.spec.tsx` 内容较少，改动本包时建议手工验证编辑与链接

## Props 定义

`TextComponentProps`（= `TextProps`，来自 `@plait/common`）：

- `text`：Slate `Descendant`（通常是 paragraph）。
- `readonly`：是否只读。
- `onChange`：内容变化回调（回写 board）。
- `onComposition`：输入法组合事件回调。
- `afterInit(editor)`：初始化后上抛 editor。


## 状态管理

每个 `Text` 实例持有一个 Slate editor（`useState` 惰性创建），并在 `text` prop 变化时同步 `editor.children`。选区、撤销栈都由 Slate 内部维护，不上抛到 React 状态。

## 功能页面

无。它是文本编辑能力，出现在任何含文本节点的画布元素内部。

## 模块结构

```
react-text/
├── src/
│   ├── index.ts        # 导出 text + custom-types
│   ├── text.tsx        # Text 组件
│   ├── custom-types.ts
│   ├── plugins/
│   └── styles/
├── vite.config.ts
└── tsconfig*.json
```
## 渲染逻辑

```
Text(props)
 ├─ editor = useState(createEditor + withReact + withHistory + withText + withInlineLink)
 ├─ afterInit?.(editor)
 ├─ text 变化 → editor.children = [text]; editor.onChange()
 ├─ onKeyDown: 左右键 → Transforms.move(unit:'offset')
 └─ <Slate editor initialValue onChange>
       <Editable renderElement renderLeaf onKeyDown />
```

## 数据结构

- `CustomElement`、`CustomText`、`LinkElement`、`ParagraphElement`（`@plait/common`）。
- `CustomEditor`、`RenderElementPropsFor<T>`（本包 `custom-types.ts`）。

## API 和服务

- `withText`：`insertBreak`/`insertSoftBreak` 插入 `\n`；`insertData` 对纯文本做去尾换行、tab→空格、trim。
- `withInlineLink`：`isInline` 识别 `type:'link'`；`insertText`/`insertData` 命中 URL 时包装链接。

## 交互和事件

- 输入法组合：`onComposition` 上抛给 Plait，避免组合期间触发 board 快捷键。
- 链接：`InlineChromiumBugfix` 在 `<a>` 首尾插入不可见字符，绕过 Chromium 的 contenteditable bug；删掉会导致光标无法定位到链接边缘。
- 粘贴：非 Slate fragment 的纯文本会被清理后插入，避免带入外部样式。

## 复用说明

- 替换编辑器内核时，保持 `afterInit` 与 `onChange` 契约，board 侧无需改动。
- 新增内联类型（如 @提及）参照 `withInlineLink` 的 `isInline` + 包装逻辑。

## 依赖关系

- 上游：`slate`、`slate-react`、`slate-history`、`is-hotkey`、`@plait/common`、`@plait/text-plugins`。
- 下游：`@drawme/react-board` 的 `with-react.tsx`。

## 关联文档

- [src/AGENTS.md](src/AGENTS.md)
- [../react-board/src/plugins/AGENTS.md](../react-board/src/plugins/AGENTS.md) — 挂载方
- [../drawnix/src/components/popup/link-popup/AGENTS.md](../drawnix/src/components/popup/link-popup/AGENTS.md) — 链接编辑方

## 技术栈

- Slate 0.116、slate-react、slate-history、`@plait/text-plugins`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
