<template>
  <div class="app">
    <header>
      <h1>🚨 Vite Plugin AI Doctor - Playground</h1>
      <p>测试 AI 诊断插件的 playground</p>
    </header>
    <main>
      <div class="info">
        <h2>测试说明</h2>
        <p>这个 playground 用于测试 <code>vite-plugin-ai-doctor</code> 插件。</p>
        <p>运行 <code>pnpm build</code> 来触发构建，如果构建失败，插件会自动调用 AI 进行诊断。</p>
      </div>
      <div class="test-cases">
        <h2>测试用例</h2>
        <ul>
          <li>✅ 正常构建测试</li>
          <li>❌ 构建错误测试（见下方说明）</li>
        </ul>
      </div>
      <div class="error-examples">
        <h2>错误示例</h2>
        <p>要测试构建错误，可以：</p>
        <ol>
          <li>在 <code>src/error.ts</code> 中引入不存在的模块</li>
          <li>在 <code>vite.config.ts</code> 中配置错误的选项</li>
          <li>使用 TypeScript 类型错误</li>
        </ol>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// 正常代码，不会导致构建错误
console.log('Vite Plugin AI Doctor Playground')
import {num} from './error-exampl1e'
console.log(num)
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  color: #42b983;
  margin-bottom: 0.5rem;
}

main {
  line-height: 1.6;
}

.info,
.test-cases,
.error-examples {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

code {
  background: #e8e8e8;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

ul, ol {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>

