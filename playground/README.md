# Vite Plugin AI Doctor - Playground

这是用于测试 `vite-plugin-ai-doctor` 插件的 playground 项目。

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

### 测试构建（正常情况）

```bash
pnpm build
```

### 测试构建错误

要测试插件的错误诊断功能，可以：

1. **导入不存在的模块**
   
   编辑 `src/error-example.ts`，取消注释：
   ```ts
   import { nonExistentModule } from './non-existent-module'
   ```
   
   然后在 `src/App.vue` 或 `src/main.ts` 中导入：
   ```ts
   import './error-example'
   ```

2. **TypeScript 类型错误**
   
   编辑 `src/error-example.ts`，取消注释：
   ```ts
   const num: number = 'this is a string'
   ```

3. **语法错误**
   
   编辑 `src/error-example.ts`，取消注释：
   ```ts
   const invalid = { // 缺少闭合括号
   ```

4. **配置错误**
   
   编辑 `vite.config.ts`，添加错误的配置：
   ```ts
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           // 错误的配置
           format: 'invalid-format',
         },
       },
     },
   })
   ```

## 配置模型

在 `vite.config.ts` 中配置你选择的模型。推荐使用智谱AI（无需额外依赖）：

### 使用智谱AI（推荐）

1. 在 [智谱开放平台](https://open.bigmodel.cn/) 注册并获取 API Key
2. 设置环境变量：
   ```bash
   export ZHIPUAI_API_KEY=your-api-key
   ```
3. 在 `vite.config.ts` 中已配置好智谱AI（默认配置）

### 使用其他模型

参考主项目 README 配置 OpenAI 或 Ollama。

## 测试步骤

1. 确保已配置好 LLM 模型（推荐使用智谱AI）
2. 创建一个会导致构建错误的代码
3. 运行 `pnpm build`
4. 观察插件是否自动触发 AI 诊断

## 预期行为

当构建失败时，插件应该：

1. 显示红色 Banner："🚨 智能报错诊断系统启动"
2. 显示黄色提示："🤖 AI 正在分析构建错误，请稍候..."
3. 调用 AI 进行错误诊断
4. 以打字机效果输出诊断建议

## 注意事项

- **智谱AI**：无需额外依赖，只需配置 API Key 即可使用
- **Ollama**：需要安装 `@langchain/ollama` 并启动本地服务
- **OpenAI**：需要安装 `@langchain/openai` 并配置 API Key
- 如果 AI 调用失败，插件会显示友好的错误提示
- 插件不会影响正常的构建流程
- 建议使用环境变量存储 API Key，不要硬编码在配置文件中

