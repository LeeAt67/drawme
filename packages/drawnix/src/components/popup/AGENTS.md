# popup

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/components/popup`
> 🏷️ 类型：**Module**（跟随型浮层容器目录）

---

## 概览

`popup/` 是"跟随某个画布元素定位的浮层"的父目录，本身不含代码，只有一个子目录 `link-popup/`。

命名区分（容易混淆）：

- `components/popover/` — 相对 trigger 元素的**通用弹出层**。
- `components/popup/` — 相对**画布元素**（选区/链接文本）定位的浮层。
- `components/toolbar/popup-toolbar/` — 选中态属性浮层，虽然也叫 popup，但属于工具栏体系。

## 相关概念

- **画布坐标 vs 屏幕坐标**：跟随元素的浮层必须用 `toScreenPointFromHostPoint` 之类的转换得到屏幕坐标，再交给 floating-ui。直接用元素矩形会偏移。

## 测试用例覆盖

- [x] 本目录无独立测试，实际覆盖见 `link-popup/`
- [ ] 建议在 E2E 中验证"选中文本链接后浮层出现"

## 相关概念（子目录）

- [link-popup/AGENTS.md](link-popup/AGENTS.md) — 链接编辑浮层


## 状态管理

本目录自身无状态；`LinkPopup` 的唯一状态源是 `appState.linkState`（由 `with-text-link` 写入），加上输入框的本地 `url` 草稿值。

## 功能页面

不是页面。当前只有一个浮层：链接编辑（`link-popup/`），在 hover 链接或点击工具栏链接按钮时出现。

## 模块结构

```
popup/
└── link-popup/     # 链接编辑浮层（组件 + 样式）
```
## 渲染逻辑

无（纯目录聚合）。

## 数据结构

无。

## API 和服务

无。

## 交互和事件

无。

## 复用说明

- 新增"跟随元素"的浮层时放在本目录，并保持 `xxx-popup` 命名。

## 依赖关系

- 下游：`drawnix.tsx` 渲染 `LinkPopup`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [link-popup/AGENTS.md](link-popup/AGENTS.md)

## 技术栈

- 见子目录


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 新增跟随元素的浮层 | 在本目录新建 `xxx-popup/`，用 `toScreenPointFromHostPoint` 换算锚点 |
| 链接浮层样式 | `link-popup/link-popup.scss` |
| 链接数据来源 | `plugins/with-text-link.tsx`（不要在浮层内自己找 DOM） |

## 易错点与约束

- 浮层锚点必须用画布坐标转换，直接用 `getBoundingClientRect` 会在缩放后偏移。

## 变更检查清单

- [ ] 新浮层是否使用 `Island` 而不是自写阴影容器。
- [ ] 锚点是否经坐标转换（缩放/滚动后仍正确）。
- [ ] 关闭条件是否与 `appState` 单一来源一致。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
