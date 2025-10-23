/**
 * SLIP-44 Chain ID 映射和转换
 * 
 * SLIP-44 标准: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */

import { ChainType, ChainInfo } from '../types'

/**
 * SLIP-44 到链信息的映射表
 * 
 * 可扩展设计：添加新链只需在这里添加映射
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
  
  // Solana (SLIP-44: 501) - 预留
  501: {
    nativeChainId: 'mainnet-beta', // Solana 使用字符串 ID
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
  
  // === 自定义 SLIP-44 ID (Layer 2 和其他没有官方 SLIP-44 的链) ===
  // 使用范围: 1000000-1999999 (避免与官方 SLIP-44 冲突)
  // 规则: 1000000 + nativeChainId
  
  // Arbitrum One (自定义 SLIP-44: 1042161)
  1042161: {
    nativeChainId: 42161,
    slip44: 1042161,
    name: 'Arbitrum One',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // Optimism (自定义 SLIP-44: 1000010)
  1000010: {
    nativeChainId: 10,
    slip44: 1000010,
    name: 'Optimism',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // Base (自定义 SLIP-44: 1008453)
  1008453: {
    nativeChainId: 8453,
    slip44: 1008453,
    name: 'Base',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
  
  // zkSync Era (自定义 SLIP-44: 1000324)
  1000324: {
    nativeChainId: 324,
    slip44: 1000324,
    name: 'zkSync Era',
    chainType: ChainType.EVM,
    symbol: 'ETH',
  },
}

/**
 * Native Chain ID 到 SLIP-44 的反向映射
 * 自动从 SLIP44_CHAIN_MAP 生成
 */
const NATIVE_TO_SLIP44_MAP: Map<string, number> = new Map(
  Object.entries(SLIP44_CHAIN_MAP).map(([slip44, info]) => [
    String(info.nativeChainId),
    Number(slip44)
  ])
)

/**
 * 将 Native Chain ID 转换为 SLIP-44 ID
 * 
 * @param nativeChainId - 原生链 ID（如 MetaMask 中的 1, 56, 137）
 * @returns SLIP-44 ID，如果未找到则返回 null
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
 * 将 SLIP-44 ID 转换为 Native Chain ID
 * 
 * @param slip44 - SLIP-44 Chain ID
 * @returns Native Chain ID，如果未找到则返回 null
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
 * 获取链信息（通过 SLIP-44 ID）
 */
export function getChainInfoBySlip44(slip44: number): ChainInfo | null {
  return SLIP44_CHAIN_MAP[slip44] ?? null
}

/**
 * 获取链信息（通过 Native Chain ID）
 */
export function getChainInfoByNative(nativeChainId: number | string): ChainInfo | null {
  const slip44 = nativeToSlip44(nativeChainId)
  return slip44 ? getChainInfoBySlip44(slip44) : null
}

/**
 * 获取链类型（通过 SLIP-44 ID）
 */
export function getChainType(slip44: number): ChainType | null {
  return SLIP44_CHAIN_MAP[slip44]?.chainType ?? null
}

/**
 * 检查是否为支持的链
 */
export function isSupportedChain(nativeChainId: number | string): boolean {
  return NATIVE_TO_SLIP44_MAP.has(String(nativeChainId))
}

/**
 * 检查是否为支持的 SLIP-44 ID
 */
export function isSupportedSlip44(slip44: number): boolean {
  return slip44 in SLIP44_CHAIN_MAP
}

/**
 * 注册新的链（可扩展 API）
 * 
 * @param chainInfo - 链信息
 * 
 * @example
 * registerChain({
 *   nativeChainId: 250,
 *   slip44: 60, // Fantom 也使用 Ethereum 的 SLIP-44
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
 * 获取所有支持的链
 */
export function getAllSupportedChains(): ChainInfo[] {
  return Object.values(SLIP44_CHAIN_MAP)
}

/**
 * 获取所有支持的 SLIP-44 ID
 */
export function getAllSupportedSlip44s(): number[] {
  return Object.keys(SLIP44_CHAIN_MAP).map(Number)
}

