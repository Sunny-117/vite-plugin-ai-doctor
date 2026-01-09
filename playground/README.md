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

## 测试步骤

1. 确保已配置好 LLM 模型（见主项目 README）
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

- 确保本地 LLM 服务已启动（如 Ollama）
- 如果 AI 调用失败，插件会显示友好的错误提示
- 插件不会影响正常的构建流程

