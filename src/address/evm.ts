/**
 * EVM 地址转换
 */

import { AddressConverter } from '../types'

/**
 * EVM 地址转换器
 * 
 * EVM 地址格式: 0x + 40 hex characters (20 bytes)
 * Universal Address: 32 bytes (左补零至 32 bytes)
 */
export class EVMAddressConverter implements AddressConverter {
  /**
   * 将 EVM 地址转换为 32 bytes (左补零)
   * 
   * @param nativeAddress - EVM 地址 (0x...)
   * @returns 32 bytes Uint8Array
   * 
   * @example
   * toBytes('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
   * // => Uint8Array(32) [0,0,0,0,0,0,0,0,0,0,0,0,116,45,53,204,...]
   */
  toBytes(nativeAddress: string): Uint8Array {
    // 移除 0x 前缀
    const cleaned = nativeAddress.toLowerCase().replace(/^0x/, '')
    
    if (cleaned.length !== 40) {
      throw new Error(`Invalid EVM address length: ${nativeAddress}`)
    }
    
    // 转换为 bytes (20 bytes)
    const addressBytes = new Uint8Array(20)
    for (let i = 0; i < 20; i++) {
      addressBytes[i] = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16)
    }
    
    // 左补零到 32 bytes
    const result = new Uint8Array(32)
    result.set(addressBytes, 12) // 从第 12 位开始填充 (32 - 20 = 12)
    
    return result
  }
  
  /**
   * 将 32 bytes 转换回 EVM 地址
   * 
   * @param bytes - 32 bytes Uint8Array
   * @returns EVM 地址 (0x...)
   * 
   * @example
   * fromBytes(new Uint8Array(32))
   * // => '0x742d35cc6634c0532925a3b844bc9e7595f0beb0'
   */
  fromBytes(bytes: Uint8Array): string {
    if (bytes.length !== 32) {
      throw new Error(`Invalid bytes length for EVM address: ${bytes.length}`)
    }
    
    // 提取后 20 bytes (忽略前 12 bytes 的零)
    const addressBytes = bytes.slice(12, 32)
    
    // 转换为 hex
    const hex = Array.from(addressBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return `0x${hex}`
  }
  
  /**
   * 验证 EVM 地址格式
   * 
   * @param nativeAddress - EVM 地址
   * @returns 是否有效
   */
  isValid(nativeAddress: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(nativeAddress)
  }
  
  /**
   * 格式化 EVM 地址（统一为小写）
   */
  format(nativeAddress: string): string {
    if (!this.isValid(nativeAddress)) {
      throw new Error(`Invalid EVM address: ${nativeAddress}`)
    }
    return nativeAddress.toLowerCase()
  }
}

// 导出单例
export const evmConverter = new EVMAddressConverter()

