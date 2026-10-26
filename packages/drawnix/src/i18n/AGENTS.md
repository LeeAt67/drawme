# i18n

> 📅 生成于：2026-10-27
> 📂 路径：`packages/drawnix/src/i18n`
> 🏷️ 类型：**State**（多语言上下文）

---

## 概览

提供 5 种语言（`zh` / `en` / `ru` / `ar` / `vi`）的文案解析，两套入口：

1. **React 入口** `useI18n()`：`{ language, setLanguage, t }`，供组件使用。
2. **非 React 入口** `i18nInsidePlaitHook(board)`：`{ t, language }`，供插件/工具函数使用（它们拿不到 React 上下文）。

## 相关概念

- **语言是"board 级"的**：`setBoardLanguage(board, language)` 把语言存进 `WeakMap<object, Language>`，`i18nInsidePlaitHook` 再从 `board` 反查。**因此每个 board 可以有自己的语言**，且不依赖组件树。
- **默认值 `zh`**：`DEFAULT_LANGUAGE = 'zh'`。未注册语言的 board 一律回退中文——这就是为什么插件里的文案在英文界面下仍可能是中文。
- **回退策略**：`t(key)` 取 `translations[language][key] || key`。缺键时**显示键名本身**（如 `agent.title`），这是最快的"漏翻译"信号。
- **键类型强约束**：`keyof Translations`（`i18n/types.ts`）。新增文案必须先加到 `Translations`，否则 `t('new.key')` 直接编译失败。

## 测试用例覆盖

- [x] `index.spec.ts` — 语言切换、缺省回退、`setBoardLanguage` + `i18nInsidePlaitHook` 的 board 级解析
- [ ] `I18nProvider` 缺失时的抛错无覆盖

## 相关概念（三种使用场景）

| 场景 | 写法 | 注意 |
| --- | --- | --- |
| React 组件 | `const { t, language } = useI18n()` | 必须在 `<I18nProvider>` 内 |
| 插件 / 工具函数 | `const { t } = i18nInsidePlaitHook(board)` | 需先 `setBoardLanguage(board, lang)` |
| 宿主回调 | `onLanguageChange(lang)` → 宿主持久化 | 库不存语言 |

## Props 定义

`I18nProviderProps`：`children`、`defaultLanguage`、`initialLanguage`、`onLanguageChange`。`initialLanguage` 优先于 `defaultLanguage`。

## 渲染逻辑

```
I18nProvider(initialLanguage)
 ├─ useState(language)
 ├─ setLanguage → setState + onLanguageChange
 ├─ t = useCallback(key => translations[language][key] || key, [language])
 └─ value = useMemo({language,setLanguage,t})

drawnix.tsx:
  onLanguageChange → lastKnownLanguageRef + setBoardLanguage(board, lang)
```

## 数据结构

- `Language = 'zh' | 'en' | 'ru' | 'ar' | 'vi'`。
- `Translations`：所有文案键的联合类型（`types.ts`，约 200+ 键）。
- `I18nContextType`：`{ language, setLanguage, t }`。

## API 和服务

- `setBoardLanguage(board, language)` / `i18nInsidePlaitHook(board?)`。

## 文件结构

```
i18n/
├── index.tsx         # Provider / useI18n / i18nInsidePlaitHook
├── types.ts          # Language / Translations / I18nContextType
├── index.spec.ts
└── translations/     # 5 语言字典 + index
```

## 交互和事件

- 切换语言通过 `language-switcher-menu.tsx` → `setLanguage` → `onLanguageChange` → 宿主持久化 + `setBoardLanguage`。三步缺一会导致"界面变了但插件文案没变"。

## 复用说明

新增文案的标准流程：

1. `i18n/types.ts` 的 `Translations` 加键。
2. 5 个 `translations/*.ts` 全部补齐（TypeScript 会因缺键报错，这是有意的）。
3. 组件里用 `t('your.key')`。
4. 若是插件内使用，确认该 board 已 `setBoardLanguage`。

## 依赖关系

- 上游：`i18n/translations`。
- 下游：几乎所有组件、`plugins/with-common.tsx`（`getI18nValue` 映射 Plait 内置文案）。

## 关联文档

- [translations/AGENTS.md](translations/AGENTS.md)
- [../AGENTS.md](../AGENTS.md)
- [../plugins/AGENTS.md](../plugins/AGENTS.md) — `getI18nValue` 桥接

## 技术栈

- React Context、`WeakMap`、TypeScript 索引类型

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
