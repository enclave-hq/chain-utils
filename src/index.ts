/**
 * @enclave-hq/chain-utils
 * 
 * Multi-chain utilities for Enclave ecosystem
 * - SLIP-44 Chain ID mappings and conversions
 * - Universal Address encoding/decoding (32 bytes)
 * - Chain-specific address conversions (EVM, Tron, Solana)
 */

// Types
export * from './types'

// SLIP-44 chain mappings and conversions
export {
  nativeToSlip44,
  slip44ToNative,
  getChainInfoBySlip44,
  getChainInfoByNative,
  getChainType,
  isSupportedChain,
  isSupportedSlip44,
  registerChain,
  getAllSupportedChains,
  getAllSupportedSlip44s,
} from './chain/slip44'

// Universal Address (32 bytes)
export {
  encodeUniversalAddress,
  decodeUniversalAddress,
  createUniversalAddress,
  createUniversalAddressHex,
  bytesToHex,
  hexToBytes,
  isValidUniversalAddress,
} from './address/universal-address'

// Chain-specific address converters
export { evmConverter, EVMAddressConverter } from './address/evm'
export { tronConverter, TronAddressConverter } from './address/tron'

