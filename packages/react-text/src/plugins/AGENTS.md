# react-text/src/plugins

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-text/src/plugins`
> 🏷️ 类型：**Module**（Slate 编辑器插件）

---

## 概览

两个 Slate editor 增强 + 聚合入口：

- `with-text.ts`：换行与粘贴清洗。
- `with-link.tsx`：内联链接（渲染组件 + URL 自动成链）。
- `index.ts`：`export * from './with-text'; export * from './with-link';`

## 相关概念

- **`insertBreak` 被重写为插入 `\n`**：文本节点是单段多行（不是 Slate 的 block 拆分），这样 Plait 的定量文本框高度计算才成立。改成默认 block 行为会导致换行后元素高度异常。
- **粘贴清洗**：`insertData` 优先看 `application/x-slate-fragment`；没有时取 `text/plain`，去掉末尾 `\n`、tab 转空格、trim。不清洗会把外部 HTML 的缩进与空行带进画布。
- **链接自动成链**：`insertText` / `insertData` 中 `isUrl(text)` 为真时直接 `LinkEditor.wrapLink`，因此"粘贴一个 URL"与"输入一个 URL"都能变成链接。
- **`isInline` 覆盖**：只有 `type === 'link'` 被视为内联，其余交给原实现——保证其它自定义元素仍按 block/内联默认规则处理。
- **`InlineChromiumBugfix`**：在 `<a>` 前后插入零宽不换行空格（`\u00A0`，`fontSize:0`），修复 Chromium 光标无法停在链接边缘的问题。删掉会导致"链接前后点不进去"。

## 测试用例覆盖

- [ ] 无本目录专属测试
- [ ] 建议补充：`withInlineLink` 的 `isInline`、URL 输入成链、`withText.insertData` 的清洗结果
- [ ] `LinkComponent` 的 DOM 结构（含 bugfix 节点）可用 Testing Library 快照

## 相关概念（两个插件的边界）

| 关注点 | `withText` | `withInlineLink` |
| --- | --- | --- |
| 换行 | ✅ `insertBreak`/`insertSoftBreak` | — |
| 粘贴清洗 | ✅ `insertData` | ✅ 仅 URL 分支 |
| 链接语义 | — | ✅ `isInline` / `wrapLink` |

两者都覆盖了 `insertData`，顺序是 `withInlineLink(withText(...))`，即**链接插件在外层**：URL 粘贴先被链接插件处理，非 URL 再落到 `withText`。

## Props 定义

- `withText<T extends ReactEditor>(editor: T): T`
- `withInlineLink(editor: CustomEditor): CustomEditor`
- `LinkComponent({ attributes, children, element }: RenderElementPropsFor<LinkElement>)`


## 状态管理

无独立状态。两个插件都以闭包方式包装 editor 方法，状态（选区、历史）仍由 Slate editor 持有。

## 功能页面

无。
## 渲染逻辑

```
withText(editor)
 ├─ insertBreak / insertSoftBreak → insertText('\n')
 └─ insertData(data)
      ├─ plaitData = data.getData('application/x-slate-fragment')
      ├─ 无 plaitData 且有 text → 清洗后 insertText，return
      └─ 否则 insertData(data)

withInlineLink(editor)
 ├─ isInline(element) → type==='link' || 原实现
 ├─ insertText(text) → isUrl ? wrapLink : insertText
 └─ insertData(data) → text/plain 是 URL ? wrapLink : insertData

LinkComponent → <a data-url class="plait-board-link"> [bugfix] {children} [bugfix] </a>
```

## 数据结构

- `LinkElement`（`@plait/common`）：`{ type:'link', url, children }`。
- `CustomEditor`（`../custom-types`）。

## API 和服务

- `LinkEditor.wrapLink(editor, url, text)`、`isUrl`（`@plait/text-plugins`）。

## 模块结构

```
plugins/
├── index.ts        # 聚合导出
├── with-text.ts
└── with-link.tsx   # withInlineLink + LinkComponent + InlineChromiumBugfix
```

## 交互和事件

- 链接渲染带 `className="plait-board-link"`，`with-text-link`（drawnix 侧）靠这个类名做 hover 命中，**改名会让链接浮层失效**。
- `data-url` 属性也被链接浮层读取。

## 复用说明

- 新增内联语义（如标签）时，仿 `withInlineLink` 增加 `isInline` 分支与渲染组件，并确认 `plait-board-link` 之类的外部依赖类名不冲突。

## 依赖关系

- 上游：`@plait/common`、`@plait/text-plugins`、`slate`。
- 下游：`../text.tsx`（组合 editor）。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../drawnix/src/plugins/AGENTS.md](../../drawnix/src/plugins/AGENTS.md) — `with-text-link` 消费 `.plait-board-link`

## 技术栈

- Slate、slate-react

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
