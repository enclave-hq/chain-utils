/**
 * SLIP-44 Chain ID mapping and conversion
 * 
 * SLIP-44 Standard: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */

import { ChainType, ChainInfo } from '../types'

/**
 * SLIP-44 to chain information mapping table
 * 
 * Extensible design: Add new chains by adding mappings here
 */
const SLIP44_CHAIN_MAP: Record<number, ChainInfo> = {
  // Ethereum (SLIP-44: 60)
  60: {
    nativeChainId: 1,
    slip44: 60,
    name: 'Ethereum Mainnet',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // Tron (SLIP-44: 195)
  195: {
    nativeChainId: 195,
    slip44: 195,
    name: 'Tron Mainnet',
    chainType: ChainType.TRON,
    symbol: 'TRX',
  },
  
  // BSC (SLIP-44: 714)
  714: {
    nativeChainId: 56,
    slip44: 714,
    name: 'BNB Smart Chain',
    chainType: ChainType.EVM,
    symbol: 'BNB',
  },
  
  // Polygon (SLIP-44: 966)
  966: {
    nativeChainId: 137,
    slip44: 966,
    name: 'Polygon Mainnet',
    chainType: ChainType.EVM,
    symbol: 'MATIC',
  },
  
  // Solana (SLIP-44: 501) - Reserved
  501: {
    nativeChainId: 'mainnet-beta', // Solana uses string ID
    slip44: 501,
    name: 'Solana Mainnet',
    chainType: ChainType.SOLANA,
    symbol: 'SOL',
  },
  
  // Avalanche C-Chain (SLIP-44: 9000)
  9000: {
    nativeChainId: 43114,
    slip44: 9000,
    name: 'Avalanche C-Chain',
    chainType: ChainType.EVM,
    symbol: 'AVAX',
  },
  
  // === Custom SLIP-44 IDs (Layer 2 and chains without official SLIP-44) ===
  // Range: 1000000-1999999 (avoids conflicts with official SLIP-44)
  // Rule: 1000000 + nativeChainId
  
  // Arbitrum One (Custom SLIP-44: 1042161)
  1042161: {
    nativeChainId: 42161,
    slip44: 1042161,
    name: 'Arbitrum One',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // Optimism (Custom SLIP-44: 1000010)
  1000010: {
    nativeChainId: 10,
    slip44: 1000010,
    name: 'Optimism',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // Base (Custom SLIP-44: 1008453)
  1008453: {
    nativeChainId: 8453,
    slip44: 1008453,
    name: 'Base',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // zkSync Era (Custom SLIP-44: 1000324)
  1000324: {
    nativeChainId: 324,
    slip44: 1000324,
    name: 'zkSync Era',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
}

/**
 * Reverse mapping from Native Chain ID to SLIP-44
 * Automatically generated from SLIP44_CHAIN_MAP
 */
const NATIVE_TO_SLIP44_MAP: Map<string, number> = new Map(
  Object.entries(SLIP44_CHAIN_MAP).map(([slip44, info]) => [
    String(info.nativeChainId),
    Number(slip44)
  ])
)

/**
 * Convert Native Chain ID to SLIP-44 ID
 * 
 * @param nativeChainId - Native chain ID (e.g., 1, 56, 137 in MetaMask)
 * @returns SLIP-44 ID, or null if not found
 * 
 * @example
 * nativeToSlip44(1)   // => 60 (Ethereum)
 * nativeToSlip44(56)  // => 714 (BSC)
 * nativeToSlip44(137) // => 966 (Polygon)
 */
export function nativeToSlip44(nativeChainId: number | string): number | null {
  return NATIVE_TO_SLIP44_MAP.get(String(nativeChainId)) ?? null
}

/**
 * Convert SLIP-44 ID to Native Chain ID
 * 
 * @param slip44 - SLIP-44 Chain ID
 * @returns Native Chain ID, or null if not found
 * 
 * @example
 * slip44ToNative(60)  // => 1 (Ethereum)
 * slip44ToNative(714) // => 56 (BSC)
 * slip44ToNative(966) // => 137 (Polygon)
 */
export function slip44ToNative(slip44: number): number | string | null {
  const info = SLIP44_CHAIN_MAP[slip44]
  return info ? info.nativeChainId : null
}

/**
 * Get chain information (by SLIP-44 ID)
 */
export function getChainInfoBySlip44(slip44: number): ChainInfo | null {
  return SLIP44_CHAIN_MAP[slip44] ?? null
}

/**
 * Get chain information (by Native Chain ID)
 */
export function getChainInfoByNative(nativeChainId: number | string): ChainInfo | null {
  const slip44 = nativeToSlip44(nativeChainId)
  return slip44 ? getChainInfoBySlip44(slip44) : null
}

/**
 * Get chain type (by SLIP-44 ID)
 */
export function getChainType(slip44: number): ChainType | null {
  return SLIP44_CHAIN_MAP[slip44]?.chainType ?? null
}

/**
 * Check if the chain is supported
 */
export function isSupportedChain(nativeChainId: number | string): boolean {
  return NATIVE_TO_SLIP44_MAP.has(String(nativeChainId))
}

/**
 * Check if the SLIP-44 ID is supported
 */
export function isSupportedSlip44(slip44: number): boolean {
  return slip44 in SLIP44_CHAIN_MAP
}

/**
 * Register a new chain (extensible API)
 * 
 * @param chainInfo - Chain information
 * 
 * @example
 * registerChain({
 *   nativeChainId: 250,
 *   slip44: 60, // Fantom also uses Ethereum's SLIP-44
 *   name: 'Fantom Opera',
 *   chainType: ChainType.EVM,
 *   symbol: 'FTM',
 * })
 */
export function registerChain(chainInfo: ChainInfo): void {
  SLIP44_CHAIN_MAP[chainInfo.slip44] = chainInfo
  NATIVE_TO_SLIP44_MAP.set(String(chainInfo.nativeChainId), chainInfo.slip44)
}

/**
 * Get all supported chains
 */
export function getAllSupportedChains(): ChainInfo[] {
  return Object.values(SLIP44_CHAIN_MAP)
}

/**
 * Get all supported SLIP-44 IDs
 */
export function getAllSupportedSlip44s(): number[] {
  return Object.keys(SLIP44_CHAIN_MAP).map(Number)
}

