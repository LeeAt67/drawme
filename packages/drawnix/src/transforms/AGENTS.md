# transforms

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/transforms`
> 🏷️ 类型：**State**（属性变换）

---

## 概览

对 `PropertyTransforms` 的封装层，负责"把 UI 上的属性修改安全地写进元素"。目前只有 `property.ts`，核心是带透明度处理的填充色修改。

## 相关概念

- **透明度与颜色合并存储**：填充色是"hex + alpha"（8 位 hex 或 `rgba`），因此设置透明度时不能只改 alpha 字段，而要 `applyOpacityToHex(当前颜色, opacity)`。读取时反向 `hexAlphaToOpacity`。
- **闭合判断前置**：`setFillColorOpacity` 先调 `isClosedElement(board, element)`，非闭合元素（连线、文本）直接 `return`。这就是"填充按钮对某些元素无反应"的原因。
- **`getMemorizeKey`**：`@plait/draw` 提供，作为 `PropertyTransforms` 的记忆键，保证连续修改同一属性合并为一次历史记录（撤销粒度）。
- **`isValidColor` 守卫**：颜色可能是 `NO_COLOR` / `TRANSPARENT` 哨兵值，非法颜色必须跳过，否则会写入无效 hex。

## 测试用例覆盖

- [x] 无本目录专属测试
- [x] 间接覆盖：`utils/color.spec`（如存在）覆盖 hex 与透明度互转；本目录逻辑依赖它
- [ ] 建议补充：非闭合元素调用 `setFillColorOpacity` 应无副作用

## 相关概念（调用方）

- `components/toolbar/popup-toolbar/fill-button.tsx` 与 `stroke-button.tsx`。
- 任何新的属性面板都应调用本目录，而不是直接 `Transforms.setNode`。

## Props 定义

非组件。导出函数：

- `setFillColorOpacity(board, fillOpacity: number): void`

（其余能力以源码为准，新增时按同一模式：判类型 → 取当前值 → 合并 → `PropertyTransforms`。）

## 渲染逻辑

```
setFillColorOpacity(board, opacity)
 ├─ PropertyTransforms.setFillColor(board, null, { getMemorizeKey, callback })
 ├─ callback(element, path):
 │    ├─ !isClosedElement → return
 │    ├─ currentFill = getCurrentFill(board, element)
 │    ├─ !isValidColor → return
 │    ├─ 若透明度已满 100 → 移除 alpha（removeHexAlpha）
 │    └─ 否则 → applyOpacityToHex(currentFill, opacity/100)
 └─ 写入 path
```

## 数据结构

- 颜色字符串格式：`#RRGGBB`、`#RRGGBBAA`、`rgba(...)`；哨兵 `NO_COLOR`、`TRANSPARENT`。

## API 和服务

- `@plait/common` 的 `PropertyTransforms`、`@plait/core` 的 `Transforms`/`Path`、`utils/{color,property}`。

## 文件结构

```
transforms/
└── property.ts   # 填充色透明度等属性变换
```

## 交互和事件

- 无直接交互；由 popup-toolbar 触发。

## 复用说明

- 新增属性（如边框虚线）时：先看 `@plait/*` 是否已有 transform，有则薄封装以统一 `getMemorizeKey` 与校验逻辑。

## 依赖关系

- 上游：`utils/color`、`utils/property`、`@plait/common|core|draw|text-plugins`。
- 下游：`components/toolbar/popup-toolbar/*`。

## 关联文档

- [../utils/AGENTS.md](../utils/AGENTS.md) — 颜色工具
- [../components/toolbar/popup-toolbar/AGENTS.md](../components/toolbar/popup-toolbar/AGENTS.md) — 调用方
- [../AGENTS.md](../AGENTS.md)

## 技术栈

- `@plait/common` `PropertyTransforms`


## 易错点与约束

- 写颜色时必须保留 alpha，否则用户设置过的半透明会丢失。
- 不要绕过 `PropertyTransforms` 直接改元素字段，否则撤销粒度与历史记录会异常。

## 变更检查清单

- [ ] 是否保留了颜色 alpha。
- [ ] 是否走 `PropertyTransforms` 以维持撤销粒度。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
