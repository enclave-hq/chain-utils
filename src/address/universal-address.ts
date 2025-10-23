/**
 * Universal Address (36 bytes) 转换
 * 
 * 格式: SLIP-44 ChainID (4 bytes) + Address (32 bytes)
 */

import { UniversalAddress, UniversalAddressBytes, UniversalAddressHex, ChainType } from '../types'
import { slip44ToNative, nativeToSlip44, getChainType } from '../chain/slip44'
import { evmConverter } from './evm'
import { tronConverter } from './tron'

/**
 * 将原生地址编码为 Universal Address (36 bytes)
 * 
 * @param slip44 - SLIP-44 Chain ID
 * @param nativeAddress - 原生地址格式 (EVM: 0x..., Tron: T...)
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
  
  // 选择合适的转换器
  let addressBytes: Uint8Array
  switch (chainType) {
    case ChainType.EVM:
      addressBytes = evmConverter.toBytes(nativeAddress)
      break
    case ChainType.TRON:
      addressBytes = tronConverter.toBytes(nativeAddress)
      break
    case ChainType.SOLANA:
      // TODO: 实现 Solana 地址转换
      throw new Error('Solana address conversion not implemented yet')
    default:
      throw new Error(`Unsupported chain type: ${chainType}`)
  }
  
  // 组合: SLIP-44 (4 bytes) + Address (32 bytes)
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
 * 从 Universal Address 解码原生地址
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
  
  // 提取 SLIP-44 (前 4 bytes, big-endian)
  const slip44 = (
    (universalAddress[0] << 24) |
    (universalAddress[1] << 16) |
    (universalAddress[2] << 8) |
    universalAddress[3]
  ) >>> 0 // 确保是无符号整数
  
  const chainType = getChainType(slip44)
  if (!chainType) {
    throw new Error(`Unknown SLIP-44 ID: ${slip44}`)
  }
  
  // 提取地址 (后 32 bytes)
  const addressBytes = universalAddress.slice(4, 36)
  
  // 选择合适的转换器
  let nativeAddress: string
  switch (chainType) {
    case ChainType.EVM:
      nativeAddress = evmConverter.fromBytes(addressBytes)
      break
    case ChainType.TRON:
      nativeAddress = tronConverter.fromBytes(addressBytes)
      break
    case ChainType.SOLANA:
      // TODO: 实现 Solana 地址转换
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
 * 将 Universal Address bytes 转换为 hex 字符串
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
 * 将 hex 字符串转换为 Universal Address bytes
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
 * 便捷函数：从 Native Chain ID + Address 创建 Universal Address
 * 
 * @param nativeChainId - Native Chain ID
 * @param nativeAddress - 原生地址
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
 * 便捷函数：创建并返回 hex 格式的 Universal Address
 */
export function createUniversalAddressHex(
  nativeChainId: number | string,
  nativeAddress: string
): UniversalAddressHex {
  const bytes = createUniversalAddress(nativeChainId, nativeAddress)
  return bytesToHex(bytes)
}

/**
 * 验证 Universal Address 格式
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

