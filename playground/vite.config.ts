import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vitePluginAiDoctor from '../src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vitePluginAiDoctor({
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

