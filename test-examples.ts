/**
 * chain-utils test examples
 * 
 * Run: npx tsx test-examples.ts
 */

import {
  // SLIP-44 conversion
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
  
  // Address converters
  evmConverter,
  tronConverter,
} from './src/index'

console.log('='.repeat(60))
console.log('🧪 Chain Utils Tests')
console.log('='.repeat(60))

// ==================== SLIP-44 Conversion Tests ====================
console.log('\n📋 SLIP-44 Chain ID Conversion:')
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

// ==================== Chain Info Query Tests ====================
console.log('\n📋 Chain Info Query:')
console.log('-'.repeat(60))

const ethInfo = getChainInfoByNative(1)
console.log('Ethereum Info:', JSON.stringify(ethInfo, null, 2))

const bscInfo = getChainInfoByNative(56)
console.log('BSC Info:', JSON.stringify(bscInfo, null, 2))

// ==================== EVM Address Conversion Tests ====================
console.log('\n🔷 EVM Address Conversion Tests:')
console.log('-'.repeat(60))

const evmAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
console.log(`Original address: ${evmAddress}`)

// Validate
console.log(`Address valid: ${evmConverter.isValid(evmAddress)}`)

// Convert to 32 bytes
const evmBytes = evmConverter.toBytes(evmAddress)
console.log(`Convert to bytes (32):`, evmBytes)
console.log(`Bytes length: ${evmBytes.length}`)
console.log(`Bytes (hex): 0x${Array.from(evmBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`)

// Convert back to address
const evmRestored = evmConverter.fromBytes(evmBytes)
console.log(`Restored address: ${evmRestored}`)
console.log(`Address match: ${evmRestored.toLowerCase() === evmAddress.toLowerCase()}`)

// ==================== Universal Address Encoding Tests ====================
console.log('\n🌐 Universal Address Encoding Tests (Ethereum):')
console.log('-'.repeat(60))

// Use Native Chain ID
const uaBytes = createUniversalAddress(1, evmAddress)
console.log(`Universal Address (bytes):`, uaBytes)
console.log(`Length: ${uaBytes.length} bytes`)

// Convert to hex
const uaHex = bytesToHex(uaBytes)
console.log(`Universal Address (hex): ${uaHex}`)

// Decode
const decoded = decodeUniversalAddress(uaBytes)
console.log(`Decoded result:`, JSON.stringify(decoded, null, 2))
console.log(`Address match: ${decoded.nativeAddress.toLowerCase() === evmAddress.toLowerCase()}`)

// ==================== Universal Address Convenience Functions ====================
console.log('\n🌐 Universal Address Convenience Functions:')
console.log('-'.repeat(60))

const uaHexDirect = createUniversalAddressHex(1, evmAddress)
console.log(`Direct hex generation: ${uaHexDirect}`)
console.log(`Match with previous: ${uaHexDirect === uaHex}`)

// Decode from hex
const bytesFromHex = hexToBytes(uaHexDirect)
const decodedFromHex = decodeUniversalAddress(bytesFromHex)
console.log(`Decoded from hex:`, JSON.stringify(decodedFromHex, null, 2))

// ==================== Multi-Chain Tests ====================
console.log('\n🌍 Multi-Chain Universal Address Tests:')
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
  console.log(`  Decoded: SLIP-44=${decoded.slip44}, Native=${decoded.nativeChainId}, Address=${decoded.nativeAddress}`)
})

// ==================== Tron Address Tests (Mock) ====================
console.log('\n🔶 Tron Address Conversion Tests (Format Validation):')
console.log('-'.repeat(60))

const tronAddress = 'TRX9hash1234567890abcdefghijklmno'
console.log(`Tron address: ${tronAddress}`)
console.log(`Address valid: ${tronConverter.isValid(tronAddress)}`)

// Note: Real Tron address conversion requires proper checksum calculation
// This implementation is simplified, real usage needs crypto library integration

// ==================== Summary ====================
console.log('\n📊 All Supported Chains:')
console.log('-'.repeat(60))

const allChains = getAllSupportedChains()
console.table(allChains.map(chain => ({
  'Chain Name': chain.name,
  'Native ID': chain.nativeChainId,
  'SLIP-44': chain.slip44,
  'Type': chain.chainType,
  'Symbol': chain.symbol,
})))

console.log('\n' + '='.repeat(60))
console.log('✅ Tests Completed!')
console.log('='.repeat(60))

