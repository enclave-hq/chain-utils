# SLIP-44 Chain ID Strategy

## 📋 Reference Standards

- **Official SLIP-44 Standard**: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- **Official Documentation**: https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html

---

## ✅ Chains Using Official SLIP-44 IDs

These chains are clearly defined in the SLIP-44 standard:

| Chain Name | Native Chain ID | SLIP-44 ID | Source |
|------------|-----------------|------------|--------|
| Ethereum | 1 | 60 | [Official](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Tron | 195 | 195 | [Official](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| BSC (Binance Chain) | 56 | 714 | [Official](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Solana | mainnet-beta | 501 | [Official](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Avalanche C-Chain | 43114 | 9000 | [Official](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |

---

## 🔧 Custom SLIP-44 ID Strategy

### The Problem

Many chains (especially Layer 2 chains) are **not defined** in the official SLIP-44 standard:
- ❌ Polygon (Matic)
- ❌ Arbitrum One
- ❌ Optimism
- ❌ Base
- ❌ zkSync Era
- ❌ Other EVM-compatible Layer 2 chains

### Why Can't They All Use Ethereum's SLIP-44 (60)?

If multiple chains use the same SLIP-44 ID, it causes:

```typescript
// ❌ Problem Example
slip44ToNative(60)  // What should this return?
// → Ethereum (1)?
// → Arbitrum (42161)?
// → Optimism (10)?
// → Cannot distinguish!
```

**Result**:
- ❌ Reverse lookup conflicts
- ❌ Universal Address cannot uniquely identify chains
- ❌ Cross-chain operations become confusing

### Solution: Custom SLIP-44 Range

Assign **unique custom IDs** for chains without official SLIP-44:

```
Custom SLIP-44 ID = 1000000 + Native Chain ID
```

**Range**: `1000000 - 1999999`
- ✅ Avoids conflicts with official SLIP-44 (official max: 314159 [Pi Network])
- ✅ Ensures each chain has a unique ID
- ✅ Simple algorithm, easy to calculate
- ✅ Supports future expansion

---

## 🔢 Custom SLIP-44 ID Mapping Table

| Chain Name | Native Chain ID | Custom SLIP-44 | Calculation |
|------------|-----------------|----------------|-------------|
| Polygon | 137 | 1000137 | 1000000 + 137 |
| Arbitrum One | 42161 | 1042161 | 1000000 + 42161 |
| Optimism | 10 | 1000010 | 1000000 + 10 |
| Base | 8453 | 1008453 | 1000000 + 8453 |
| zkSync Era | 324 | 1000324 | 1000000 + 324 |

---

## 🎯 Complete Mapping Table

### Official SLIP-44 IDs

```typescript
const OFFICIAL_SLIP44 = {
  60: 'Ethereum',       // Native: 1
  195: 'Tron',          // Native: 195
  714: 'BSC',           // Native: 56
  501: 'Solana',        // Native: mainnet-beta
  9000: 'Avalanche',    // Native: 43114
  // ... other officially defined chains
}
```

### Custom SLIP-44 IDs

```typescript
const CUSTOM_SLIP44 = {
  1000137: 'Polygon',      // Native: 137
  1042161: 'Arbitrum One', // Native: 42161
  1000010: 'Optimism',     // Native: 10
  1008453: 'Base',         // Native: 8453
  1000324: 'zkSync Era',   // Native: 324
}
```

---

## 📝 Rules for Adding New Chains

### 1. Check Official SLIP-44 Standard

First, query if the chain is in the official list:
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md

### 2. If Official SLIP-44 Exists

```typescript
// Use official ID
registerChain({
  nativeChainId: <chainId>,
  slip44: <Official SLIP-44 ID>,
  name: '<Chain Name>',
  chainType: ChainType.EVM,
  symbol: '<Token Symbol>',
})
```

### 3. If No Official SLIP-44

```typescript
// Use custom ID (1000000 + nativeChainId)
registerChain({
  nativeChainId: <chainId>,
  slip44: 1000000 + <chainId>,
  name: '<Chain Name>',
  chainType: ChainType.EVM,
  symbol: '<Token Symbol>',
})
```

---

## 🔄 Bidirectional Conversion Guarantee

Using this strategy, we guarantee:

```typescript
// ✅ Native → SLIP-44 → Native (round-trip conversion)
nativeToSlip44(42161)          // → 1042161
slip44ToNative(1042161)        // → 42161

// ✅ Each chain has a unique SLIP-44 ID
encodeUniversalAddress(1042161, '0x...')  // Arbitrum
encodeUniversalAddress(1000010, '0x...')  // Optimism
// The two addresses will not conflict!

// ✅ Reverse lookup is clear
decodeUniversalAddress(bytes)
// → { slip44: 1042161, nativeChainId: 42161, nativeAddress: '0x...' }
```

---

## ⚠️ Important Notes

1. **Custom IDs are for Enclave Ecosystem Only**
   - These IDs are not official standards
   - Should not be used for compatibility layers with other wallets

2. **Official SLIP-44 Takes Priority**
   - If a chain later receives an official SLIP-44 ID, migrate to the official ID

3. **Range Limitation**
   - Custom ID range: 1000000 - 1999999
   - Native Chain ID should not exceed 999999 (in practice, chain IDs won't be that large)

4. **Documentation**
   - All chains using custom SLIP-44 should be clearly marked in documentation

---

## 📚 References

- [SLIP-0044 Official Standard](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [BIP-0044 (HD Wallets)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [bip-utils SLIP-44 Documentation](https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html)

