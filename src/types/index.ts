/**
 * Chain type enumeration
 */
export enum ChainType {
  EVM = 'evm',
  TRON = 'tron',
  SOLANA = 'solana',
  COSMOS = 'cosmos',
}

/**
 * Chain information interface
 */
export interface ChainInfo {
  /** Native Chain ID (ID used in wallets) */
  nativeChainId: number | string
  
  /** SLIP-44 Chain ID (used in Enclave system) */
  slip44: number
  
  /** Chain name */
  name: string
  
  /** Chain type */
  chainType: ChainType
  
  /** Native token symbol */
  symbol: string
  
  /** Whether it is a testnet */
  isTestnet?: boolean
}

/**
 * Universal Address structure
 */
export interface UniversalAddress {
  /** SLIP-44 Chain ID (4 bytes) */
  slip44: number
  
  /** Address (32 bytes, left-padded) */
  address: Uint8Array
  
  /** Native Chain ID (optional, for reverse lookup) */
  nativeChainId?: number | string
  
  /** Native address format (optional) */
  nativeAddress?: string
}

/**
 * Universal Address serialization format (36 bytes)
 * Format: SLIP-44 (4 bytes) + Address (32 bytes)
 */
export type UniversalAddressBytes = Uint8Array

/**
 * Universal Address hex format
 * Format: 0x + 72 hex characters (36 bytes)
 */
export type UniversalAddressHex = `0x${string}`

/**
 * Address converter interface
 */
export interface AddressConverter {
  /**
   * Convert native address to bytes (32 bytes, left-padded)
   */
  toBytes(nativeAddress: string): Uint8Array
  
  /**
   * Convert bytes back to native address
   */
  fromBytes(bytes: Uint8Array): string
  
  /**
   * Validate native address format
   */
  isValid(nativeAddress: string): boolean
}

