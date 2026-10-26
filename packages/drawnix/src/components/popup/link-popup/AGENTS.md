# link-popup

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/popup/link-popup`
> 🏷️ 类型：**Business Component**（链接编辑浮层）

---

## 概览

当用户 hover 或正在编辑文本中的内联链接时，浮出的小工具条：显示 URL 输入框，提供"编辑/确认"和"删除链接"两个动作。

它由 `appState.linkState` 驱动——`linkState` 由 `plugins/with-text-link.tsx` 在指针移动时维护，本组件只负责展示与写回。

## 相关概念

- **`linkState` 的四个布尔**：`isEditing`（输入框激活）、`isHovering`（鼠标在浮层上，防止移出后立即消失）、`isHoveringOrigin`（鼠标在链接本体上）、以及 `targetDom` / `targetElement` / `editor`。**写入方是插件，读取方是本组件 + `popup-toolbar` 的链接按钮**。
- **Slate 直接操作**：修改链接用 `Transforms.setNodes`（slate）而非 Plait transform，因为链接是文本节点的属性（`LinkElement`）。
- **删除是 unset 而非删除节点**：移除链接属性后文本保留，不能删掉文本内容。
- **`FeltTipPenIcon` 被复用为"编辑"图标**：图标语义与功能不一致但属于既有实现，替换图标不影响逻辑。

## 测试用例覆盖

- [x] 无单测
- [ ] 建议补充：hover 链接出现浮层；提交后 `element.url` 更新；删除后链接标记消失
- [ ] 依赖 `plugins/with-text-link` 的 pointerMove 行为，属集成级测试

## 相关概念（显示条件）

```
显示 = linkState 存在 && (isEditing || isHovering || isHoveringOrigin)
定位 = useFloating(anchor = targetDom, placement:'top', offset(20) + flip())
```

浮层自身维护 `url` 局部状态，并在 `linkState` 变化时用 `useEffect` 同步——不要改成受控于 `linkState`，否则输入过程会被指针移动打断。

## Props 定义

无 Props。依赖：

- `useDrawnix()` → `appState.linkState` / `setAppState`
- `useBoard()` → 触发重渲染与坐标计算
- `useI18n()` → 文案

## 渲染逻辑

```
if (!linkState) return null
<Island(.link-popup) ref={floating}>
  <Stack.Row>
    <input value={url} onChange=...  onKeyDown={Enter=提交, Esc=取消} />
    <ToolButton 编辑/确认 />
    <ToolButton 删除链接 → Transforms.unsetNodes(editor, 'url') />
  </Stack.Row>
</Island>
```

提交后把 `linkState.isEditing` 置回 `false`，浮层随之收起。

## 数据结构

- `LinkState`（`hooks/use-drawnix.tsx`）：`{ targetDom, editor, targetElement, isEditing, isHovering, isHoveringOrigin }`。
- `LinkElement`（`@plait/common`）：`{ type: 'link', url, children }`。

## API 和服务

- `LinkEditor`（`@plait/text-plugins`）：用于包装/更新链接。
- Slate `Transforms` + `ReactEditor`：定位与更新节点。
- `ReactEditor.toSlateNode` 在 `with-text-link` 中把 DOM 反查成 `LinkElement`。

## 文件结构

```
link-popup/
├── link-popup.tsx   # 浮层与编辑逻辑
└── link-popup.scss
```

## 交互和事件

- Enter 提交、Esc 取消（`onKeyDown`）。
- hover 浮层本身时 `isHovering=true`，避免"鼠标移向浮层的过程中链接消失"。
- 点击外部不主动关闭，由 `with-text-link` 的 pointerMove 重新计算 `linkState`。

## 复用说明

- 若要在别处编辑链接，直接复用 `linkState` + 本组件，不要另写一套 hover 检测。

## 依赖关系

- 上游：`island`、`stack`、`tool-button`、`icons`、`hooks/use-drawnix`、`i18n`、`plugins/with-text-link`（数据来源）。
- 下游：`drawnix.tsx` 渲染。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../toolbar/popup-toolbar/AGENTS.md](../../toolbar/popup-toolbar/AGENTS.md) — 链接按钮入口
- [../../../plugins/AGENTS.md](../../../plugins/AGENTS.md) — `with-text-link`

## 技术栈

- Slate / slate-react、`@plait/text-plugins`、`@floating-ui/react`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
