# SLIP-44 Chain ID 策略

## 📋 参考标准

- **官方 SLIP-44 标准**: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- **官方文档**: https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html

---

## ✅ 使用官方 SLIP-44 ID 的链

这些链在 SLIP-44 标准中有明确定义：

| 链名称 | Native Chain ID | SLIP-44 ID | 来源 |
|--------|----------------|------------|------|
| Ethereum | 1 | 60 | [官方](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Tron | 195 | 195 | [官方](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| BSC (Binance Chain) | 56 | 714 | [官方](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Solana | mainnet-beta | 501 | [官方](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Avalanche C-Chain | 43114 | 9000 | [官方](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |

---

## 🔧 自定义 SLIP-44 ID 策略

### 问题

许多链（尤其是 Layer 2 链）在官方 SLIP-44 标准中**没有定义**：
- ❌ Polygon (Matic)
- ❌ Arbitrum One
- ❌ Optimism
- ❌ Base
- ❌ zkSync Era
- ❌ 其他 EVM 兼容的 Layer 2

### 为什么不能都用 Ethereum 的 SLIP-44 (60)？

如果多个链使用相同的 SLIP-44 ID，会导致：

```typescript
// ❌ 问题示例
slip44ToNative(60)  // 返回什么？
// → Ethereum (1)?
// → Arbitrum (42161)?
// → Optimism (10)?
// → 无法区分！
```

**结果**：
- ❌ 反向查询冲突
- ❌ Universal Address 无法唯一标识链
- ❌ 跨链操作混乱

### 解决方案：自定义 SLIP-44 范围

为没有官方 SLIP-44 的链分配**唯一的自定义 ID**：

```
自定义 SLIP-44 ID = 1000000 + Native Chain ID
```

**范围**：`1000000 - 1999999`
- ✅ 避免与官方 SLIP-44 冲突（官方最大: 314159 [Pi Network]）
- ✅ 确保每个链都有唯一 ID
- ✅ 算法简单，易于计算
- ✅ 支持未来扩展

---

## 🔢 自定义 SLIP-44 ID 映射表

| 链名称 | Native Chain ID | 自定义 SLIP-44 | 计算 |
|--------|----------------|---------------|------|
| Polygon | 137 | 1000137 | 1000000 + 137 |
| Arbitrum One | 42161 | 1042161 | 1000000 + 42161 |
| Optimism | 10 | 1000010 | 1000000 + 10 |
| Base | 8453 | 1008453 | 1000000 + 8453 |
| zkSync Era | 324 | 1000324 | 1000000 + 324 |

---

## 🎯 完整映射表

### 官方 SLIP-44 ID

```typescript
const OFFICIAL_SLIP44 = {
  60: 'Ethereum',       // Native: 1
  195: 'Tron',          // Native: 195
  714: 'BSC',           // Native: 56
  501: 'Solana',        // Native: mainnet-beta
  9000: 'Avalanche',    // Native: 43114
  // ... 其他官方定义的链
}
```

### 自定义 SLIP-44 ID

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

## 📝 添加新链的规则

### 1. 检查官方 SLIP-44 标准

首先查询链是否在官方列表中：
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md

### 2. 如果有官方 SLIP-44

```typescript
// 使用官方 ID
registerChain({
  nativeChainId: <chainId>,
  slip44: <官方 SLIP-44 ID>,
  name: '<链名称>',
  chainType: ChainType.EVM,
  symbol: '<代币符号>',
})
```

### 3. 如果没有官方 SLIP-44

```typescript
// 使用自定义 ID (1000000 + nativeChainId)
registerChain({
  nativeChainId: <chainId>,
  slip44: 1000000 + <chainId>,
  name: '<链名称>',
  chainType: ChainType.EVM,
  symbol: '<代币符号>',
})
```

---

## 🔄 双向转换保证

使用这个策略，我们可以保证：

```typescript
// ✅ Native → SLIP-44 → Native（往返转换）
nativeToSlip44(42161)          // → 1042161
slip44ToNative(1042161)        // → 42161

// ✅ 每个链都有唯一的 SLIP-44 ID
encodeUniversalAddress(1042161, '0x...')  // Arbitrum
encodeUniversalAddress(1000010, '0x...')  // Optimism
// 两个地址不会冲突！

// ✅ 反向查询明确
decodeUniversalAddress(bytes)
// → { slip44: 1042161, nativeChainId: 42161, nativeAddress: '0x...' }
```

---

## ⚠️ 注意事项

1. **自定义 ID 仅用于 Enclave 生态系统**
   - 这些 ID 不是官方标准
   - 不应该用于与其他钱包的兼容性层

2. **官方 SLIP-44 优先**
   - 如果链后续获得官方 SLIP-44 ID，应该迁移到官方 ID

3. **范围限制**
   - 自定义 ID 范围：1000000 - 1999999
   - Native Chain ID 不应超过 999999（实际上链 ID 不会这么大）

4. **文档化**
   - 所有使用自定义 SLIP-44 的链都应该在文档中明确标注

---

## 📚 参考资料

- [SLIP-0044 官方标准](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [BIP-0044 (HD Wallets)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [bip-utils SLIP-44 文档](https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html)


