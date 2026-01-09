# vite-plugin-ai-doctor

🚨 AI 驱动的 Vite 构建错误诊断插件

## 功能特性

- 🤖 构建失败时自动调用 AI 进行错误诊断
- 💬 打字机效果输出，提升用户体验
- 🎨 ANSI 颜色支持，输出更美观
- 🛡️ 完善的异常处理，不影响构建流程

## 安装

```bash
pnpm add -D vite-plugin-ai-doctor
```

## 配置模型

在 `src/core/llm.ts` 中配置你的本地大模型：

### 使用 Ollama

```ts
import { ChatOllama } from '@langchain/ollama'

export const model = new ChatOllama({
  model: 'llama3',
  baseUrl: 'http://localhost:11434',
})
```

### 使用 OpenAI

```ts
import { ChatOpenAI } from '@langchain/openai'

export const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
})
```

## 使用方法

在 `vite.config.ts` 中引入插件：

```ts
import { defineConfig } from 'vite'
import vitePluginAiDoctor from 'vite-plugin-ai-doctor'

export default defineConfig({
  plugins: [
    vitePluginAiDoctor({
      enabled: true,              // 是否启用插件，默认 true
      typeWriterSpeed: 20,        // 打字机效果速度（毫秒），默认 20
      showOriginalError: true,    // AI 调用失败时是否显示原始错误，默认 true
    }),
  ],
})
```

### 选项说明

- `enabled`: 是否启用插件，默认 `true`
- `typeWriterSpeed`: 打字机效果每个字符的延迟时间（毫秒），默认 `20`
- `showOriginalError`: 当 AI 调用失败时，是否显示原始错误信息，默认 `true`

## 工作原理

1. **触发时机**：使用 `buildEnd(error)` Hook，仅在构建失败时执行
2. **错误捕获**：收集错误信息（message、stack、id）
3. **AI 诊断**：调用本地大模型进行错误分析
4. **结果输出**：以打字机效果输出诊断建议

## 技术细节

### 为什么使用 `buildEnd` 而不是 `transform`？

- `buildEnd` 在构建流程的最后执行，可以捕获所有构建阶段的错误
- `transform` 只在模块转换时触发，无法捕获构建配置、依赖解析等阶段的错误
- `buildEnd` 的 `error` 参数包含了完整的构建错误信息

### 为什么使用 `process.stdout.write`？

- `console.log` 会自动添加换行符，无法精确控制输出
- `process.stdout.write` 可以逐字符输出，实现打字机效果
- 可以保留 ANSI 颜色代码，让输出更美观

### 为什么 `enforce: "post"`？

- 确保在其他插件处理完后再执行，避免干扰构建流程
- 作为后置插件，可以获取到完整的构建结果和错误信息
- 即使构建失败，也能正常执行诊断逻辑

### 为什么 AI 调用要 try/catch 包住？

- 本地模型可能未启动（如 Ollama 未运行）
- 网络问题或模型服务异常
- 避免 AI 调用失败导致插件崩溃，影响构建流程
- 提供友好的错误提示，引导用户检查模型配置

## 示例输出

```
🚨 智能报错诊断系统启动

🤖 AI 正在分析构建错误，请稍候...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 AI 诊断建议：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

根据错误信息，这是一个模块解析问题...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
诊断完成，请根据上述建议修复错误。
```

## 测试 Playground

项目包含一个 playground 目录，用于测试插件功能：

```bash
cd playground
pnpm install
pnpm build  # 正常构建测试
```

要测试错误诊断功能，可以：

1. 编辑 `playground/src/test-error.ts`，取消注释错误代码
2. 在 `playground/src/main.ts` 中导入该文件
3. 运行 `pnpm build` 触发构建错误
4. 观察插件自动调用 AI 进行诊断

详细说明请查看 [playground/README.md](./playground/README.md)

## License

MIT

