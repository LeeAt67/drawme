# translations

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/i18n/translations`
> 🏷️ 类型：**Module**（语言字典）

---

## 概览

5 个语言字典文件 + 一个聚合 `index.ts`。每个文件导出一个 `Record<Translations>` 常量，键集合必须与 `i18n/types.ts` 的 `Translations` **完全一致**（TS 会强制）。

## 相关概念

- **5 个文件都用 `const xxxTranslations: Translations = {...}` 显式标注类型**：缺键/多键都是编译错误，因此"漏翻译"只会表现为**值为英文/中文**，不会表现为键缺失。
- **键名按功能前缀分组**：`menu.*`、`toolbar.*`、`agent.*`、`theme.*`、`zoom.*`、`toast.*`、`cleanConfirm.*`、`dialog.*`、`extraTools.*`、`general.*`、`tutorial.*`、`draw.*`/`mind.*`（供 Plait 内置文案）。新增功能时沿用对应前缀。
- **`extraTools.mermaidToDrawnix` / `extraTools.markdownToDrawnix` 的键名保留 `Drawnix`**：键是代码标识，不会展示给用户；值已改为 `DrawMe`。改名键需要同步 `components/toolbar/extra-tools/menu-items.tsx`。
- **英文文件用 2 空格缩进、中文文件用 2 空格但键排序略有差异**：不要对整文件跑格式化工具，会产生大规模无意义 diff（曾出现 BOM 与键名被批量替换的问题）。

## 测试用例覆盖

- [x] 间接覆盖：`i18n/index.spec.ts` 会取用部分键验证回退
- [ ] 无"5 语言键集合一致性"测试（目前靠 TS 保证）
- [ ] 无"值非空/非占位"测试

## 相关概念（文件职责）

| 文件 | 语言 | 说明 |
| --- | --- | --- |
| `zh.ts` | 简体中文 | 默认语言，新增文案的"母版" |
| `en.ts` | English | 通常第二顺位更新 |
| `ru.ts` | Русский | 部分文案较长，注意 UI 溢出 |
| `ar.ts` | العربية | **RTL 语言**，但项目未做 `dir="rtl"` 适配；布局问题排查时优先怀疑此项 |
| `vi.ts` | Tiếng Việt | — |
| `index.ts` | — | 聚合并命名导出（`zhTranslations` 等） |

## Props 定义

无（纯数据）。


## 状态管理

无（纯数据）。语言选择由 `i18n/index.tsx` 的 Context 与 `setBoardLanguage` 的 WeakMap 负责，本目录只提供字典。

## 功能页面

无。

## 模块结构

```
translations/
├── index.ts   # 聚合导出
├── zh.ts en.ts ru.ts ar.ts vi.ts
```
## 渲染逻辑

无。

## 数据结构

每个文件形如：

```
// zh.ts
import { Translations } from '../types';

const zhTranslations: Translations = {
  // Toolbar items
  'menu.open': '打开',
  ...
};

export default zhTranslations;
```

用 `const xxxTranslations: Translations` 显式标注类型，因此**缺键或拼错键会在编译期报错**（不是运行期）。

## API 和服务

无。

## 交互和事件

无。

## 复用说明

- 新增键的顺序：`types.ts` → `zh.ts`（定文案）→ `en.ts` → `ru/ar/vi`。可以先用英文占位推送，但**不要**留空字符串（`t()` 会回退成键名，比占位更难定位）。
- 值里包含品牌名时统一写 `DrawMe`，不要写 `Drawnix`。

## 依赖关系

- 上游：`../types.ts`。
- 下游：`../index.tsx`。

## 关联文档

- [../AGENTS.md](../AGENTS.md)
- [../../agent/AGENTS.md](../../agent/AGENTS.md) — `agent.*` 键的主要消费方

## 技术栈

- TypeScript 对象字面量 + 索引类型

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
