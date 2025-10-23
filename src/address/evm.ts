/**
 * EVM address conversion
 */

import { AddressConverter } from '../types'

/**
 * EVM address converter
 * 
 * EVM address format: 0x + 40 hex characters (20 bytes)
 * Universal Address: 32 bytes (left-padded to 32 bytes)
 */
export class EVMAddressConverter implements AddressConverter {
  /**
   * Convert EVM address to 32 bytes (left-padded)
   * 
   * @param nativeAddress - EVM address (0x...)
   * @returns 32 bytes Uint8Array
   * 
   * @example
   * toBytes('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
   * // => Uint8Array(32) [0,0,0,0,0,0,0,0,0,0,0,0,116,45,53,204,...]
   */
  toBytes(nativeAddress: string): Uint8Array {
    // Remove 0x prefix
    const cleaned = nativeAddress.toLowerCase().replace(/^0x/, '')
    
    if (cleaned.length !== 40) {
      throw new Error(`Invalid EVM address length: ${nativeAddress}`)
    }
    
    // Convert to bytes (20 bytes)
    const addressBytes = new Uint8Array(20)
    for (let i = 0; i < 20; i++) {
      addressBytes[i] = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16)
    }
    
    // Left-pad with zeros to 32 bytes
    const result = new Uint8Array(32)
    result.set(addressBytes, 12) // Start filling from position 12 (32 - 20 = 12)
    
    return result
  }
  
  /**
   * Convert 32 bytes back to EVM address
   * 
   * @param bytes - 32 bytes Uint8Array
   * @returns EVM address (0x...)
   * 
   * @example
   * fromBytes(new Uint8Array(32))
   * // => '0x742d35cc6634c0532925a3b844bc9e7595f0beb0'
   */
  fromBytes(bytes: Uint8Array): string {
    if (bytes.length !== 32) {
      throw new Error(`Invalid bytes length for EVM address: ${bytes.length}`)
    }
    
    // Extract last 20 bytes (ignore first 12 bytes of zeros)
    const addressBytes = bytes.slice(12, 32)
    
    // Convert to hex
    const hex = Array.from(addressBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return `0x${hex}`
  }
  
  /**
   * Validate EVM address format
   * 
   * @param nativeAddress - EVM address
   * @returns Whether it is valid
   */
  isValid(nativeAddress: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(nativeAddress)
  }
  
  /**
   * Format EVM address (normalize to lowercase)
   */
  format(nativeAddress: string): string {
    if (!this.isValid(nativeAddress)) {
      throw new Error(`Invalid EVM address: ${nativeAddress}`)
    }
    return nativeAddress.toLowerCase()
  }
}

// Export singleton
export const evmConverter = new EVMAddressConverter()

