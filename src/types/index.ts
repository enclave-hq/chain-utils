/**
 * 链类型枚举
 */
export enum ChainType {
  EVM = 'evm',
  TRON = 'tron',
  SOLANA = 'solana',
  COSMOS = 'cosmos',
}

/**
 * 链信息接口
 */
export interface ChainInfo {
  /** Native Chain ID（钱包中使用的 ID） */
  nativeChainId: number | string
  
  /** SLIP-44 Chain ID（Enclave 系统使用） */
  slip44: number
  
  /** 链名称 */
  name: string
  
  /** 链类型 */
  chainType: ChainType
  
  /** 原生代币符号 */
  symbol: string
  
  /** 是否为测试网 */
  isTestnet?: boolean
}

/**
 * Universal Address 结构
 */
export interface UniversalAddress {
  /** SLIP-44 Chain ID (4 bytes) */
  slip44: number
  
  /** 地址 (32 bytes, left-padded) */
  address: Uint8Array
  
  /** Native Chain ID（可选，用于反向查询） */
  nativeChainId?: number | string
  
  /** 原生地址格式（可选） */
  nativeAddress?: string
}

/**
 * Universal Address 序列化格式 (36 bytes)
 * 格式: SLIP-44 (4 bytes) + Address (32 bytes)
 */
export type UniversalAddressBytes = Uint8Array

/**
 * Universal Address hex 格式
 * 格式: 0x + 72 hex characters (36 bytes)
 */
export type UniversalAddressHex = `0x${string}`

/**
 * 地址转换器接口
 */
export interface AddressConverter {
  /**
   * 将原生地址转换为 bytes (32 bytes, left-padded)
   */
  toBytes(nativeAddress: string): Uint8Array
  
  /**
   * 将 bytes 转换回原生地址
   */
  fromBytes(bytes: Uint8Array): string
  
  /**
   * 验证原生地址格式
   */
  isValid(nativeAddress: string): boolean
}

