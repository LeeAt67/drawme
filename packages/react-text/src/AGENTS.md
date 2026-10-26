# react-text/src

> 📅 生成于：2026-10-27
> 📂 路径：`packages/react-text/src`
> 🏷️ 类型：**Module**（文本层源码）

---

## 概览

`Text` 组件与其类型定义所在的源码根。导出面只有两个文件（`index.ts`）：

```
export * from './text';          // Text 组件
export * from './custom-types';  // CustomEditor / RenderElementPropsFor
```

## 相关概念

- **`text.tsx` 内同时定义了渲染器**（`Element`/`Leaf`）与 `Text` 本身，因此修改渲染（如加粗、颜色）只需改这一个文件。
- **`custom-types.ts` 是类型适配层**：把 Slate 的 `Editor`/`RenderElementProps` 与 `@plait/common` 的 `CustomElement`/`LinkElement` 对齐，避免每个使用点都做类型断言。

## 相关概念（文件职责）

| 文件 | 职责 |
| --- | --- |
| `text.tsx` | `Text` 组件、`Leaf`/`Element` 渲染、键盘修正、editor 生命周期 |
| `custom-types.ts` | `CustomEditor`、`RenderElementPropsFor<T>` |
| `plugins/` | 换行/粘贴（`with-text`）、内联链接（`with-link`） |
| `styles/` | 可编辑区样式 |

## 测试用例覆盖

- [x] `text.spec.tsx` — 渲染冒烟
- [ ] 建议补充：`text` prop 更新、链接内联行为、只读模式不可编辑

## Props 定义

见 [../AGENTS.md](../AGENTS.md) 的 `TextComponentProps`。


## 状态管理

见 `../AGENTS.md`：editor 实例是组件内状态，Slate 自管选区与历史；`text` prop 是唯一输入源。

## 功能页面

无。
## 渲染逻辑

本目录不新增逻辑说明，详见 [../AGENTS.md](../AGENTS.md)（`Text` 的 editor 生命周期与键盘修正）。

## 数据结构

- `CustomElement` / `CustomText` / `LinkElement`（`@plait/common`）。
- `CustomEditor = ReactEditor & BaseEditor`（以源码为准）。

## API 和服务

- 无服务调用。

## 模块结构

```
src/
├── index.ts
├── text.tsx
├── custom-types.ts
├── text.spec.tsx
├── plugins/
└── styles/
```

## 交互和事件

- 键盘与输入法事件在 `text.tsx` 内部处理后再上抛，详见 [../AGENTS.md](../AGENTS.md)。

## 复用说明

- 修改对外类型时同步 `custom-types.ts`，并在 `index.ts` 确认是否需要导出。

## 依赖关系

- 上游：Slate 系列、`@plait/common|text-plugins`。
- 下游：`@drawme/react-board`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [plugins/AGENTS.md](plugins/AGENTS.md)
- [styles/AGENTS.md](styles/AGENTS.md)

## 技术栈

- React 19、Slate 0.116


## 易错点与约束

- `index.ts` 只导出 `text` 与 `custom-types`，新增公开 API 必须在此补一行。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
