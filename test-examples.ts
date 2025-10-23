/**
 * chain-utils 测试示例
 * 
 * 运行: npx tsx test-examples.ts
 */

import {
  // SLIP-44 转换
  nativeToSlip44,
  slip44ToNative,
  getChainInfoByNative,
  getAllSupportedChains,
  
  // Universal Address
  createUniversalAddress,
  createUniversalAddressHex,
  decodeUniversalAddress,
  bytesToHex,
  hexToBytes,
  
  // 地址转换器
  evmConverter,
  tronConverter,
} from './src/index'

console.log('='.repeat(60))
console.log('🧪 Chain Utils 测试')
console.log('='.repeat(60))

// ==================== SLIP-44 转换测试 ====================
console.log('\n📋 SLIP-44 Chain ID 转换:')
console.log('-'.repeat(60))

const testChains = [
  { name: 'Ethereum', nativeId: 1 },
  { name: 'BSC', nativeId: 56 },
  { name: 'Polygon', nativeId: 137 },
  { name: 'Tron', nativeId: 195 },
  { name: 'Arbitrum', nativeId: 42161 },
  { name: 'Avalanche', nativeId: 43114 },
]

testChains.forEach(({ name, nativeId }) => {
  const slip44 = nativeToSlip44(nativeId)
  const back = slip44 ? slip44ToNative(slip44) : null
  console.log(`${name.padEnd(12)} Native: ${String(nativeId).padEnd(6)} → SLIP-44: ${String(slip44).padEnd(6)} → Back: ${back}`)
})

// ==================== 链信息查询测试 ====================
console.log('\n📋 链信息查询:')
console.log('-'.repeat(60))

const ethInfo = getChainInfoByNative(1)
console.log('Ethereum Info:', JSON.stringify(ethInfo, null, 2))

const bscInfo = getChainInfoByNative(56)
console.log('BSC Info:', JSON.stringify(bscInfo, null, 2))

// ==================== EVM 地址转换测试 ====================
console.log('\n🔷 EVM 地址转换测试:')
console.log('-'.repeat(60))

const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
console.log(`原始地址: ${evmAddress}`)

// 验证
console.log(`地址有效: ${evmConverter.isValid(evmAddress)}`)

// 转换为 28 bytes
const evmBytes = evmConverter.toBytes(evmAddress)
console.log(`转换为 bytes (28):`, evmBytes)
console.log(`Bytes 长度: ${evmBytes.length}`)
console.log(`Bytes (hex): 0x${Array.from(evmBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`)

// 转换回地址
const evmRestored = evmConverter.fromBytes(evmBytes)
console.log(`还原地址: ${evmRestored}`)
console.log(`地址匹配: ${evmRestored.toLowerCase() === evmAddress.toLowerCase()}`)

// ==================== Universal Address 编码测试 ====================
console.log('\n🌐 Universal Address 编码测试 (Ethereum):')
console.log('-'.repeat(60))

// 使用 Native Chain ID
const uaBytes = createUniversalAddress(1, evmAddress)
console.log(`Universal Address (bytes):`, uaBytes)
console.log(`长度: ${uaBytes.length} bytes`)

// 转换为 hex
const uaHex = bytesToHex(uaBytes)
console.log(`Universal Address (hex): ${uaHex}`)

// 解码
const decoded = decodeUniversalAddress(uaBytes)
console.log(`解码结果:`, JSON.stringify(decoded, null, 2))
console.log(`地址匹配: ${decoded.nativeAddress.toLowerCase() === evmAddress.toLowerCase()}`)

// ==================== Universal Address 便捷函数测试 ====================
console.log('\n🌐 Universal Address 便捷函数:')
console.log('-'.repeat(60))

const uaHexDirect = createUniversalAddressHex(1, evmAddress)
console.log(`直接生成 hex: ${uaHexDirect}`)
console.log(`与前面一致: ${uaHexDirect === uaHex}`)

// 从 hex 解码
const bytesFromHex = hexToBytes(uaHexDirect)
const decodedFromHex = decodeUniversalAddress(bytesFromHex)
console.log(`从 hex 解码:`, JSON.stringify(decodedFromHex, null, 2))

// ==================== 多链测试 ====================
console.log('\n🌍 多链 Universal Address 测试:')
console.log('-'.repeat(60))

const addresses = [
  { chain: 'Ethereum', nativeId: 1, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' },
  { chain: 'BSC', nativeId: 56, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' },
  { chain: 'Polygon', nativeId: 137, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' },
]

addresses.forEach(({ chain, nativeId, address }) => {
  const slip44 = nativeToSlip44(nativeId)
  const ua = createUniversalAddressHex(nativeId, address)
  console.log(`\n${chain}:`)
  console.log(`  Native ID: ${nativeId}`)
  console.log(`  SLIP-44: ${slip44}`)
  console.log(`  Universal Address: ${ua}`)
  
  const decoded = decodeUniversalAddress(hexToBytes(ua))
  console.log(`  解码: SLIP-44=${decoded.slip44}, Native=${decoded.nativeChainId}, Address=${decoded.nativeAddress}`)
})

// ==================== Tron 地址测试 (模拟) ====================
console.log('\n🔶 Tron 地址转换测试 (验证格式):')
console.log('-'.repeat(60))

const tronAddress = 'TRX9hash1234567890abcdefghijklmno'
console.log(`Tron 地址: ${tronAddress}`)
console.log(`地址有效: ${tronConverter.isValid(tronAddress)}`)

// 注意：实际的 Tron 地址转换需要正确的 checksum 计算
// 这里的实现是简化版，真实使用需要集成加密库

// ==================== 汇总 ====================
console.log('\n📊 所有支持的链:')
console.log('-'.repeat(60))

const allChains = getAllSupportedChains()
console.table(allChains.map(chain => ({
  '链名称': chain.name,
  'Native ID': chain.nativeChainId,
  'SLIP-44': chain.slip44,
  '类型': chain.chainType,
  '符号': chain.symbol,
})))

console.log('\n' + '='.repeat(60))
console.log('✅ 测试完成！')
console.log('='.repeat(60))

