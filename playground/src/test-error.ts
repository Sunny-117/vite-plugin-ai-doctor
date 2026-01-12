/**
 * 测试构建错误
 * 
 * 在 main.ts 中取消注释导入语句来触发构建错误
 */

// 取消下面的注释来测试构建错误
import { something } from './non-existent-file'

export const testError = 'Uncomment the import above to test build errors'

