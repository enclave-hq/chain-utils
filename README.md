# @enclave-hq/chain-utils

Multi-chain utilities for Enclave - SLIP-44 mappings, universal address encoding, and chain conversions.

## Features

- ✅ **SLIP-44 Chain ID** mappings and conversions
- ✅ **Universal Address** encoding (36 bytes format: SLIP-44 + 32 bytes address)
- ✅ **EVM address** conversion (20 bytes → 32 bytes padded)
- ✅ **Tron address** conversion (Base58 → hex → 32 bytes padded)
- ✅ **Extensible** design for adding new chains (Solana, Cosmos, etc.)
- ✅ **TypeScript** first with full type safety
- ✅ **Zero dependencies** (pure TypeScript implementation)

## Installation

```bash
npm install @enclave-hq/chain-utils
```

## Quick Start

### SLIP-44 Chain ID Conversion

```typescript
import { nativeToSlip44, slip44ToNative } from '@enclave-hq/chain-utils'

// Native Chain ID → SLIP-44 ID
nativeToSlip44(1)   // => 60 (Ethereum)
nativeToSlip44(56)  // => 714 (BSC)
nativeToSlip44(137) // => 966 (Polygon)
nativeToSlip44(195) // => 195 (Tron)

// SLIP-44 ID → Native Chain ID
slip44ToNative(60)  // => 1 (Ethereum)
slip44ToNative(714) // => 56 (BSC)
slip44ToNative(966) // => 137 (Polygon)
```

### Universal Address Encoding

```typescript
import { 
  createUniversalAddress, 
  createUniversalAddressHex,
  decodeUniversalAddress,
} from '@enclave-hq/chain-utils'

// Encode address → 36 bytes
const bytes = createUniversalAddress(
  1, // Ethereum mainnet
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
)
// => Uint8Array(36) [0,0,0,60, 0,0,..., 116,45,53,...]

// Encode address → hex string
const hex = createUniversalAddressHex(
  1,
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
)
// => '0x0000003c000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0'

// Decode 36 bytes → address
const decoded = decodeUniversalAddress(bytes)
// => {
//   slip44: 60,
//   nativeAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
//   nativeChainId: 1
// }
```

### Chain-Specific Converters

```typescript
import { evmConverter, tronConverter } from '@enclave-hq/chain-utils'

// EVM Address
const evmBytes = evmConverter.toBytes('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
// => Uint8Array(32) [0,0,0,0,0,0,0,0,0,0,0,0, 116,45,53,204,...]

const evmAddress = evmConverter.fromBytes(evmBytes)
// => '0x742d35cc6634c0532925a3b844bc9e7595f0beb0'

// Tron Address
const tronBytes = tronConverter.toBytes('TRX9hash...')
// => Uint8Array(32) [0,0,0,0,0,0,0,0,0,0,0,0, ...]

const tronAddress = tronConverter.fromBytes(tronBytes)
// => 'TRX9hash...'
```

## Supported Chains

| Chain | Native ID | SLIP-44 | Type |
|-------|-----------|---------|------|
| Ethereum | 1 | 60 | EVM |
| BSC | 56 | 714 | EVM |
| Polygon | 137 | 966 | EVM |
| Tron | 195 | 195 | TRON |
| Arbitrum | 42161 | 60 | EVM |
| Optimism | 10 | 60 | EVM |
| Avalanche | 43114 | 9000 | EVM |
| Solana | mainnet-beta | 501 | SOLANA (coming soon) |

## Extending with New Chains

```typescript
import { registerChain, ChainType } from '@enclave-hq/chain-utils'

registerChain({
  nativeChainId: 250,
  slip44: 60, // Fantom uses Ethereum's SLIP-44
  name: 'Fantom Opera',
  chainType: ChainType.EVM,
  symbol: 'FTM',
})
```

## Universal Address Format

```
Total: 36 bytes
├─ SLIP-44 Chain ID: 4 bytes (big-endian)
└─ Address: 32 bytes (left-padded)
   ├─ EVM: 20 bytes address + 12 bytes padding (left)
   ├─ Tron: 20 bytes address + 12 bytes padding (left)
   └─ Solana: 32 bytes address (no padding)
```

### Example

```
Ethereum address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
SLIP-44: 60 (0x0000003C)

Universal Address (hex): 72 characters (36 bytes)
0x 0000003C 000000000000000000000000 742d35cc6634c0532925a3b844bc9e7595f0beb0
   ^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   SLIP-44  Padding (12 bytes)       EVM Address (20 bytes)
```

## API Reference

### SLIP-44 Functions

- `nativeToSlip44(chainId)` - Convert native chain ID to SLIP-44
- `slip44ToNative(slip44)` - Convert SLIP-44 to native chain ID
- `getChainInfoBySlip44(slip44)` - Get chain info by SLIP-44 ID
- `getChainInfoByNative(chainId)` - Get chain info by native ID
- `isSupportedChain(chainId)` - Check if chain is supported
- `registerChain(chainInfo)` - Register a new chain

### Universal Address Functions

- `createUniversalAddress(chainId, address)` - Create 36 bytes address
- `createUniversalAddressHex(chainId, address)` - Create hex address (72 chars)
- `encodeUniversalAddress(slip44, address)` - Encode with SLIP-44
- `decodeUniversalAddress(bytes)` - Decode 36 bytes address
- `bytesToHex(bytes)` - Convert bytes to hex string
- `hexToBytes(hex)` - Convert hex string to bytes
- `isValidUniversalAddress(address)` - Validate format

### Address Converters

- `evmConverter.toBytes(address)` - EVM address → 32 bytes
- `evmConverter.fromBytes(bytes)` - 32 bytes → EVM address
- `evmConverter.isValid(address)` - Validate EVM address
- `tronConverter.toBytes(address)` - Tron address → 32 bytes
- `tronConverter.fromBytes(bytes)` - 32 bytes → Tron address
- `tronConverter.isValid(address)` - Validate Tron address

## License

MIT © Enclave Team

# chain-utils
