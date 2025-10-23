/**
 * Universal Address (36 bytes) conversion
 * 
 * Format: SLIP-44 ChainID (4 bytes) + Address (32 bytes)
 */

import { UniversalAddress, UniversalAddressBytes, UniversalAddressHex, ChainType } from '../types'
import { slip44ToNative, nativeToSlip44, getChainType } from '../chain/slip44'
import { evmConverter } from './evm'
import { tronConverter } from './tron'

/**
 * Encode native address to Universal Address (36 bytes)
 * 
 * @param slip44 - SLIP-44 Chain ID
 * @param nativeAddress - Native address format (EVM: 0x..., Tron: T...)
 * @returns 36 bytes Uint8Array
 * 
 * @example
 * encodeUniversalAddress(60, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
 * // => Uint8Array(36) [0,0,0,60, 0,0,0,0,0,0,0,0,0,0,0,0, 116,45,35,...]
 */
export function encodeUniversalAddress(
  slip44: number,
  nativeAddress: string
): UniversalAddressBytes {
  const chainType = getChainType(slip44)
  if (!chainType) {
    throw new Error(`Unsupported SLIP-44 ID: ${slip44}`)
  }
  
  // Select appropriate converter
  let addressBytes: Uint8Array
  switch (chainType) {
    case ChainType.EVM:
      addressBytes = evmConverter.toBytes(nativeAddress)
      break
    case ChainType.TRON:
      addressBytes = tronConverter.toBytes(nativeAddress)
      break
    case ChainType.SOLANA:
      // TODO: Implement Solana address conversion
      throw new Error('Solana address conversion not implemented yet')
    default:
      throw new Error(`Unsupported chain type: ${chainType}`)
  }
  
  // Combine: SLIP-44 (4 bytes) + Address (32 bytes)
  const result = new Uint8Array(36)
  
  // SLIP-44 (big-endian, 4 bytes)
  result[0] = (slip44 >>> 24) & 0xff
  result[1] = (slip44 >>> 16) & 0xff
  result[2] = (slip44 >>> 8) & 0xff
  result[3] = slip44 & 0xff
  
  // Address (32 bytes)
  result.set(addressBytes, 4)
  
  return result
}

/**
 * Decode Universal Address to native address
 * 
 * @param universalAddress - 36 bytes Uint8Array
 * @returns { slip44, nativeAddress, nativeChainId }
 * 
 * @example
 * decodeUniversalAddress(bytes36)
 * // => { slip44: 60, nativeAddress: '0x742d...', nativeChainId: 1 }
 */
export function decodeUniversalAddress(universalAddress: UniversalAddressBytes): {
  slip44: number
  nativeAddress: string
  nativeChainId: number | string | null
} {
  if (universalAddress.length !== 36) {
    throw new Error(`Invalid Universal Address length: ${universalAddress.length}`)
  }
  
  // Extract SLIP-44 (first 4 bytes, big-endian)
  const slip44 = (
    (universalAddress[0] << 24) |
    (universalAddress[1] << 16) |
    (universalAddress[2] << 8) |
    universalAddress[3]
  ) >>> 0 // Ensure unsigned integer
  
  const chainType = getChainType(slip44)
  if (!chainType) {
    throw new Error(`Unknown SLIP-44 ID: ${slip44}`)
  }
  
  // Extract address (last 32 bytes)
  const addressBytes = universalAddress.slice(4, 36)
  
  // Select appropriate converter
  let nativeAddress: string
  switch (chainType) {
    case ChainType.EVM:
      nativeAddress = evmConverter.fromBytes(addressBytes)
      break
    case ChainType.TRON:
      nativeAddress = tronConverter.fromBytes(addressBytes)
      break
    case ChainType.SOLANA:
      // TODO: Implement Solana address conversion
      throw new Error('Solana address conversion not implemented yet')
    default:
      throw new Error(`Unsupported chain type: ${chainType}`)
  }
  
  return {
    slip44,
    nativeAddress,
    nativeChainId: slip44ToNative(slip44),
  }
}

/**
 * Convert Universal Address bytes to hex string
 * 
 * @param bytes - 36 bytes Uint8Array
 * @returns 0x + 72 hex characters
 * 
 * @example
 * bytesToHex(new Uint8Array(36))
 * // => '0x0000003c000000000000000000000000...'
 */
export function bytesToHex(bytes: UniversalAddressBytes): UniversalAddressHex {
  if (bytes.length !== 36) {
    throw new Error(`Invalid bytes length: ${bytes.length}`)
  }
  
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `0x${hex}` as UniversalAddressHex
}

/**
 * Convert hex string to Universal Address bytes
 * 
 * @param hex - 0x + 72 hex characters
 * @returns 36 bytes Uint8Array
 * 
 * @example
 * hexToBytes('0x0000003c000000000000000000000000...')
 * // => Uint8Array(36)
 */
export function hexToBytes(hex: UniversalAddressHex | string): UniversalAddressBytes {
  const cleaned = hex.replace(/^0x/, '')
  
  if (cleaned.length !== 72) {
    throw new Error(`Invalid hex length: ${hex}`)
  }
  
  const bytes = new Uint8Array(36)
  for (let i = 0; i < 36; i++) {
    bytes[i] = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16)
  }
  
  return bytes
}

/**
 * Convenience function: Create Universal Address from Native Chain ID + Address
 * 
 * @param nativeChainId - Native Chain ID
 * @param nativeAddress - Native address
 * @returns 36 bytes Uint8Array
 */
export function createUniversalAddress(
  nativeChainId: number | string,
  nativeAddress: string
): UniversalAddressBytes {
  const slip44 = nativeToSlip44(nativeChainId)
  if (slip44 === null) {
    throw new Error(`Unsupported native chain ID: ${nativeChainId}`)
  }
  
  return encodeUniversalAddress(slip44, nativeAddress)
}

/**
 * Convenience function: Create and return hex format Universal Address
 */
export function createUniversalAddressHex(
  nativeChainId: number | string,
  nativeAddress: string
): UniversalAddressHex {
  const bytes = createUniversalAddress(nativeChainId, nativeAddress)
  return bytesToHex(bytes)
}

/**
 * Validate Universal Address format
 */
export function isValidUniversalAddress(address: UniversalAddressBytes | UniversalAddressHex): boolean {
  try {
    const bytes = typeof address === 'string' ? hexToBytes(address) : address
    decodeUniversalAddress(bytes)
    return true
  } catch {
    return false
  }
}

