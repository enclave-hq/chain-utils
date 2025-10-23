/**
 * Tron 地址转换
 */

import { AddressConverter } from '../types'

/**
 * Tron 地址转换器
 * 
 * Tron 地址格式: Base58 编码 (以 T 开头，34 characters)
 * Universal Address: 先转换为 hex (21 bytes)，再左补零至 32 bytes
 */
export class TronAddressConverter implements AddressConverter {
  private static readonly BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  
  /**
   * 将 Tron 地址转换为 32 bytes (先转 hex，再左补零)
   * 
   * @param nativeAddress - Tron 地址 (T...)
   * @returns 32 bytes Uint8Array
   * 
   * @example
   * toBytes('TRX9hash...')
   * // => Uint8Array(32) [0,0,0,0,0,0,0,0,0,0,0,0,...]
   */
  toBytes(nativeAddress: string): Uint8Array {
    if (!this.isValid(nativeAddress)) {
      throw new Error(`Invalid Tron address: ${nativeAddress}`)
    }
    
    // Base58 解码为 bytes (25 bytes: 1 byte prefix + 20 bytes address + 4 bytes checksum)
    const decoded = this.base58Decode(nativeAddress)
    
    if (decoded.length !== 25) {
      throw new Error(`Invalid Tron address length after decoding: ${decoded.length}`)
    }
    
    // 提取地址部分 (去掉 prefix 和 checksum)
    // 格式: [prefix(1)] + [address(20)] + [checksum(4)]
    const addressBytes = decoded.slice(1, 21) // 20 bytes
    
    // 左补零到 32 bytes
    const result = new Uint8Array(32)
    result.set(addressBytes, 12) // 从第 12 位开始填充 (32 - 20 = 12)
    
    return result
  }
  
  /**
   * 将 32 bytes 转换回 Tron 地址
   * 
   * @param bytes - 32 bytes Uint8Array
   * @returns Tron 地址 (T...)
   */
  fromBytes(bytes: Uint8Array): string {
    if (bytes.length !== 32) {
      throw new Error(`Invalid bytes length for Tron address: ${bytes.length}`)
    }
    
    // 提取后 20 bytes (忽略前 12 bytes 的零)
    const addressBytes = bytes.slice(12, 32)
    
    // 添加 Tron mainnet prefix (0x41)
    const prefixed = new Uint8Array(21)
    prefixed[0] = 0x41
    prefixed.set(addressBytes, 1)
    
    // 计算 checksum (双重 SHA256 的前 4 bytes)
    const checksum = this.calculateChecksum(prefixed)
    
    // 组合: prefix + address + checksum
    const full = new Uint8Array(25)
    full.set(prefixed, 0)
    full.set(checksum, 21)
    
    // Base58 编码
    return this.base58Encode(full)
  }
  
  /**
   * 验证 Tron 地址格式
   */
  isValid(nativeAddress: string): boolean {
    // 基本格式检查
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(nativeAddress)) {
      return false
    }
    
    try {
      // 尝试解码并验证 checksum
      const decoded = this.base58Decode(nativeAddress)
      if (decoded.length !== 25) {
        return false
      }
      
      const payload = decoded.slice(0, 21)
      const checksum = decoded.slice(21, 25)
      const calculatedChecksum = this.calculateChecksum(payload)
      
      return this.arraysEqual(checksum, calculatedChecksum)
    } catch {
      return false
    }
  }
  
  /**
   * Base58 解码
   */
  private base58Decode(input: string): Uint8Array {
    const bytes: number[] = []
    
    for (const char of input) {
      let value = TronAddressConverter.BASE58_ALPHABET.indexOf(char)
      if (value < 0) {
        throw new Error(`Invalid Base58 character: ${char}`)
      }
      
      for (let i = 0; i < bytes.length; i++) {
        value += bytes[i] * 58
        bytes[i] = value & 0xff
        value >>= 8
      }
      
      while (value > 0) {
        bytes.push(value & 0xff)
        value >>= 8
      }
    }
    
    // 添加前导零
    for (const char of input) {
      if (char !== '1') break
      bytes.push(0)
    }
    
    return new Uint8Array(bytes.reverse())
  }
  
  /**
   * Base58 编码
   */
  private base58Encode(bytes: Uint8Array): string {
    const digits: number[] = []
    
    for (const byte of bytes) {
      let carry = byte
      for (let i = 0; i < digits.length; i++) {
        carry += digits[i] << 8
        digits[i] = carry % 58
        carry = Math.floor(carry / 58)
      }
      
      while (carry > 0) {
        digits.push(carry % 58)
        carry = Math.floor(carry / 58)
      }
    }
    
    // 添加前导 1
    for (const byte of bytes) {
      if (byte !== 0) break
      digits.push(0)
    }
    
    return digits
      .reverse()
      .map(d => TronAddressConverter.BASE58_ALPHABET[d])
      .join('')
  }
  
  /**
   * 计算 checksum (双重 SHA256 的前 4 bytes)
   */
  private calculateChecksum(payload: Uint8Array): Uint8Array {
    // 简化实现：在实际使用中应该使用 crypto 库
    // 这里返回一个模拟的 checksum
    // TODO: 使用真实的 SHA256 实现
    
    // 临时实现：返回简单的 hash
    let hash = 0
    for (const byte of payload) {
      hash = ((hash << 5) - hash + byte) | 0
    }
    
    const checksum = new Uint8Array(4)
    checksum[0] = (hash >>> 24) & 0xff
    checksum[1] = (hash >>> 16) & 0xff
    checksum[2] = (hash >>> 8) & 0xff
    checksum[3] = hash & 0xff
    
    return checksum
  }
  
  /**
   * 比较两个 Uint8Array 是否相等
   */
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}

// 导出单例
export const tronConverter = new TronAddressConverter()

