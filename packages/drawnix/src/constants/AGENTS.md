# constants

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/constants`
> 🏷️ 类型：**Module**（常量表）

---

## 概览

两个纯数据文件：`color.ts`（调色板与特殊色标记）、`freehand.ts`（画笔工具项与预设 id）。

注意：另有 `src/constants.ts`（单文件，非目录）存放 `EVENT`/`MIME_TYPES`/`VERSIONS`，不要与本目录混淆。

## 相关概念

- **特殊色是"哨兵字符串"而非 `null`**：`TRANSPARENT = 'TRANSPARENT'`、`NO_COLOR = 'NO_COLOR'`、`WHITE = '#FFFFFF'`。它们会进入元素数据并持久化，因此**不能随意改字面量**，否则旧文件里的值会失去语义。
- **`CLASSIC_COLORS` 是 `{ name, value }` 数组**：`name` 是 i18n 键后缀（如 `color.red`），`value` 是十六进制。`plugins/freehand/presets.ts` 通过 `find(item => item.name === 'color.red')` 取值，因此**改 name 会让预设颜色静默回退到下标默认值**。
- **`FREEHAND_PRESET_IDS` 是元组常量**：`as const` 提供字面量类型 `FreehandPresetId`，与 `FREEHANDS` 数组顺序无关（后者是工具项，不是预设）。

## 测试用例覆盖

- [x] 无专属测试
- [x] 间接覆盖：`plugins/freehand/*.spec.ts` 会用到预设宽度常量
- [ ] 特殊色语义（`isNoColor`、`isTransparent`）在 `utils/color` 有测试覆盖缺失

## 相关概念（数值契约）

- `FREEHAND_STROKE_WIDTH` 相关常量（`DEFAULT/MIN/MAX/STEP`）实际定义在 `plugins/freehand/presets.ts`，本目录的 `freehand.ts` 通过 `export ... from '../plugins/freehand/presets'` 再导出；修改要改上游文件。

## Props 定义

无（非组件）。


## 状态管理

无状态（纯常量）。读取方式有两种：直接 `import`（组件/工具），或通过 `constants/freehand.ts` 的再导出（工具栏）。常量一旦写入元素数据（如颜色值），就不能随意修改字面量。

## 功能页面

无。本目录不渲染任何 UI。
## 渲染逻辑

无。

## 数据结构

- `CLASSIC_COLORS: Array<{ name: string; value: string }>`。
- `FREEHANDS: FreehandToolItem[]`，每项含 `pointer`（`FreehandShape`）、`icon`、`titleKey`。
- `FreehandPresetId = 'preset-1' | 'preset-2' | 'preset-3'`。

## API 和服务

无。

## 模块结构

```
constants/
├── color.ts     # TRANSPARENT / NO_COLOR / WHITE / CLASSIC_COLORS
└── freehand.ts  # FREEHAND_PRESET_IDS / FREEHANDS
```

## 交互和事件

无。

## 复用说明

- 新增颜色：追加到 `CLASSIC_COLORS`（保持 `name` 为 `color.xxx` 且补 5 语言文案）。新增画笔类型：追加到 `FREEHANDS` 并在 `FreehandShape` 枚举中先定义 pointer。

## 依赖关系

- 上游：`plugins/freehand/{type,presets}`（再导出）、`components/icons`（图标）。
- 下游：`color-picker`、`freehand-panel`、`transforms/property`、`utils/color`。

## 关联文档

- [../AGENTS.md](../AGENTS.md) — 库总览
- [../plugins/freehand/AGENTS.md](../plugins/freehand/AGENTS.md) — 画笔预设的真实来源
- [../utils/AGENTS.md](../utils/AGENTS.md) — 特殊色的判定函数

## 技术栈

- TypeScript `as const` 字面量类型


## 常见改动指引

| 需求 | 改动位置 |
| --- | --- |
| 新增调色板颜色 | `color.ts` 的 `CLASSIC_COLORS`（`name` 补 `color.*` 文案） |
| 新增画笔工具 | `freehand.ts` 的 `FREEHANDS` + `FreehandShape` 枚举 |
| 新增文件格式 | `../constants.ts` 的 `MIME_TYPES` / `VERSIONS` |

## 易错点与约束

- `TRANSPARENT`/`NO_COLOR` 会随元素数据持久化，改字面量会导致旧文件语义丢失。
- `CLASSIC_COLORS` 的 `name` 被 `presets.ts` 按字符串查找，改名会让预设颜色静默回退。
<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
