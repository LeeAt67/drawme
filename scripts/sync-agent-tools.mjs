#!/usr/bin/env node
/**
 * 从 packages/drawnix/src/agent/tools/registry.ts 生成服务端的 tools 数组。
 * 运行：npm run sync:agent-tools
 * 生成结果供 apps/api 注入到 /chat/completions 的 tools 字段。
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = resolve(rootDir, 'packages/drawnix/src/agent/tools/registry.ts');
const outputPath = resolve(rootDir, 'apps/api/src/modules/agent/tool-definitions.generated.ts');

const registryModule = await import(pathToFileURL(registryPath).href);
const registry = registryModule.default ?? registryModule;

if (!Array.isArray(registry.AGENT_TOOL_DEFINITIONS)) {
  throw new Error('AGENT_TOOL_DEFINITIONS was not exported by the agent tool registry.');
}

const banner = [
  '/**',
  ' * AUTO-GENERATED FILE. Do not edit by hand.',
  ' * Source: packages/drawnix/src/agent/tools/registry.ts',
  ' * Regenerate: npm run sync:agent-tools',
  ' */',
  '',
].join('\n');

const body = `export const AGENT_TOOL_DEFINITIONS = ${JSON.stringify(
  registry.AGENT_TOOL_DEFINITIONS,
  null,
  2
)} as const;\n`;

writeFileSync(outputPath, banner + body, 'utf8');

try {
  execFileSync(process.execPath, [resolve(rootDir, 'node_modules/oxfmt/bin/oxfmt'), outputPath], {
    stdio: 'ignore',
  });
} catch {
  console.warn('oxfmt not available; generated file left unformatted.');
}

console.log(`wrote ${outputPath} (${registry.AGENT_TOOL_DEFINITIONS.length} tools)`);
