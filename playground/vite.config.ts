import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vitePluginAiDoctor from '../src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginAiDoctor({
      // 模型配置 - 根据你的需求选择一种
      model: {
        // 示例 1: 使用智谱AI（推荐，无需额外依赖）
        provider: 'zhipuai',
        apiKey: process.env.ZHIPUAI_API_KEY || 'your-zhipuai-api-key',
        // 可选模型：'glm-4', 'glm-4.7', 'glm-4.6v' 等
        model: 'glm-4',
        temperature: 0.7,
      },
      
      // 示例 2: 使用 OpenAI（需要安装 @langchain/openai）
      // model: {
      //   provider: 'openai',
      //   apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      //   model: 'gpt-4',
      //   temperature: 0.7,
      // },
      
      // 示例 3: 使用 Ollama（需要安装 @langchain/ollama）
      // model: {
      //   provider: 'ollama',
      //   model: 'llama3',
      //   baseURL: 'http://localhost:11434',
      //   temperature: 0.7,
      // },
      
      enabled: true,
      typeWriterSpeed: 20,
      showOriginalError: true,
    }),
  ],
  build: {
    // 为了测试构建错误，可以在这里配置一些会导致错误的选项
    // 例如：rollupOptions 中的错误配置
  },
})

