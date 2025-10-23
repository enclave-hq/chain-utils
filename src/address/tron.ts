/**
 * Tron address conversion
 */

import { AddressConverter } from '../types'

/**
 * Tron address converter
 * 
 * Tron address format: Base58 encoded (starts with T, 34 characters)
 * Universal Address: First convert to hex (21 bytes), then left-pad to 32 bytes
 */
export class TronAddressConverter implements AddressConverter {
  private static readonly BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  
  /**
   * Convert Tron address to 32 bytes (first to hex, then left-pad)
   * 
   * @param nativeAddress - Tron address (T...)
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
    
    // Decode Base58 to bytes (25 bytes: 1 byte prefix + 20 bytes address + 4 bytes checksum)
    const decoded = this.base58Decode(nativeAddress)
    
    if (decoded.length !== 25) {
      throw new Error(`Invalid Tron address length after decoding: ${decoded.length}`)
    }
    
    // Extract address part (remove prefix and checksum)
    // Format: [prefix(1)] + [address(20)] + [checksum(4)]
    const addressBytes = decoded.slice(1, 21) // 20 bytes
    
    // Left-pad with zeros to 32 bytes
    const result = new Uint8Array(32)
    result.set(addressBytes, 12) // Start filling from position 12 (32 - 20 = 12)
    
    return result
  }
  
  /**
   * Convert 32 bytes back to Tron address
   * 
   * @param bytes - 32 bytes Uint8Array
   * @returns Tron address (T...)
   */
  fromBytes(bytes: Uint8Array): string {
    if (bytes.length !== 32) {
      throw new Error(`Invalid bytes length for Tron address: ${bytes.length}`)
    }
    
    // Extract last 20 bytes (ignore first 12 bytes of zeros)
    const addressBytes = bytes.slice(12, 32)
    
    // Add Tron mainnet prefix (0x41)
    const prefixed = new Uint8Array(21)
    prefixed[0] = 0x41
    prefixed.set(addressBytes, 1)
    
    // Calculate checksum (first 4 bytes of double SHA256)
    const checksum = this.calculateChecksum(prefixed)
    
    // Combine: prefix + address + checksum
    const full = new Uint8Array(25)
    full.set(prefixed, 0)
    full.set(checksum, 21)
    
    // Base58 encode
    return this.base58Encode(full)
  }
  
  /**
   * Validate Tron address format
   */
  isValid(nativeAddress: string): boolean {
    // Basic format check
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(nativeAddress)) {
      return false
    }
    
    try {
      // Try to decode and verify checksum
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
   * Base58 decode
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
    
    // Add leading zeros
    for (const char of input) {
      if (char !== '1') break
      bytes.push(0)
    }
    
    return new Uint8Array(bytes.reverse())
  }
  
  /**
   * Base58 encode
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
    
    // Add leading 1s
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
   * Calculate checksum (first 4 bytes of double SHA256)
   */
  private calculateChecksum(payload: Uint8Array): Uint8Array {
    // Simplified implementation: should use crypto library in production
    // Returns a mock checksum here
    // TODO: Use real SHA256 implementation
    
    // Temporary implementation: return simple hash
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
   * Compare two Uint8Arrays for equality
   */
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
}

// Export singleton
export const tronConverter = new TronAddressConverter()

