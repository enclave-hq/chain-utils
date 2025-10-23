# SLIP-44 チェーン ID 戦略

## 📋 参考標準

- **公式 SLIP-44 標準**: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- **公式ドキュメント**: https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html

---

## ✅ 公式 SLIP-44 ID を使用するチェーン

これらのチェーンは SLIP-44 標準で明確に定義されています：

| チェーン名 | ネイティブチェーン ID | SLIP-44 ID | ソース |
|-----------|---------------------|------------|--------|
| Ethereum | 1 | 60 | [公式](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Tron | 195 | 195 | [公式](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| BSC (Binance Chain) | 56 | 714 | [公式](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Solana | mainnet-beta | 501 | [公式](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Avalanche C-Chain | 43114 | 9000 | [公式](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |

---

## 🔧 カスタム SLIP-44 ID 戦略

### 問題点

多くのチェーン（特にレイヤー2チェーン）は、公式 SLIP-44 標準で**定義されていません**：
- ❌ Polygon (Matic)
- ❌ Arbitrum One
- ❌ Optimism
- ❌ Base
- ❌ zkSync Era
- ❌ その他の EVM 互換レイヤー2

### なぜすべて Ethereum の SLIP-44 (60) を使用できないのか？

複数のチェーンが同じ SLIP-44 ID を使用すると、次のような問題が発生します：

```typescript
// ❌ 問題の例
slip44ToNative(60)  // 何を返すべきか？
// → Ethereum (1)?
// → Arbitrum (42161)?
// → Optimism (10)?
// → 区別できない！
```

**結果**：
- ❌ 逆引き検索の競合
- ❌ Universal Address でチェーンを一意に識別できない
- ❌ クロスチェーン操作が混乱

### 解決策：カスタム SLIP-44 範囲

公式 SLIP-44 がないチェーンに**一意のカスタム ID** を割り当てます：

```
カスタム SLIP-44 ID = 1000000 + ネイティブチェーン ID
```

**範囲**: `1000000 - 1999999`
- ✅ 公式 SLIP-44 との競合を回避（公式の最大値: 314159 [Pi Network]）
- ✅ 各チェーンが一意の ID を持つことを保証
- ✅ シンプルなアルゴリズム、計算が容易
- ✅ 将来の拡張をサポート

---

## 🔢 カスタム SLIP-44 ID マッピング表

| チェーン名 | ネイティブチェーン ID | カスタム SLIP-44 | 計算 |
|-----------|---------------------|----------------|------|
| Polygon | 137 | 1000137 | 1000000 + 137 |
| Arbitrum One | 42161 | 1042161 | 1000000 + 42161 |
| Optimism | 10 | 1000010 | 1000000 + 10 |
| Base | 8453 | 1008453 | 1000000 + 8453 |
| zkSync Era | 324 | 1000324 | 1000000 + 324 |

---

## 🎯 完全なマッピング表

### 公式 SLIP-44 ID

```typescript
const OFFICIAL_SLIP44 = {
  60: 'Ethereum',       // Native: 1
  195: 'Tron',          // Native: 195
  714: 'BSC',           // Native: 56
  501: 'Solana',        // Native: mainnet-beta
  9000: 'Avalanche',    // Native: 43114
  // ... その他の公式定義チェーン
}
```

### カスタム SLIP-44 ID

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

## 📝 新しいチェーンを追加するルール

### 1. 公式 SLIP-44 標準を確認

まず、チェーンが公式リストにあるかを確認します：
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md

### 2. 公式 SLIP-44 が存在する場合

```typescript
// 公式 ID を使用
registerChain({
  nativeChainId: <chainId>,
  slip44: <公式 SLIP-44 ID>,
  name: '<チェーン名>',
  chainType: ChainType.EVM,
  symbol: '<トークンシンボル>',
})
```

### 3. 公式 SLIP-44 が存在しない場合

```typescript
// カスタム ID を使用 (1000000 + nativeChainId)
registerChain({
  nativeChainId: <chainId>,
  slip44: 1000000 + <chainId>,
  name: '<チェーン名>',
  chainType: ChainType.EVM,
  symbol: '<トークンシンボル>',
})
```

---

## 🔄 双方向変換の保証

この戦略により、以下を保証できます：

```typescript
// ✅ Native → SLIP-44 → Native（往復変換）
nativeToSlip44(42161)          // → 1042161
slip44ToNative(1042161)        // → 42161

// ✅ 各チェーンは一意の SLIP-44 ID を持つ
encodeUniversalAddress(1042161, '0x...')  // Arbitrum
encodeUniversalAddress(1000010, '0x...')  // Optimism
// 2つのアドレスは競合しません！

// ✅ 逆引き検索が明確
decodeUniversalAddress(bytes)
// → { slip44: 1042161, nativeChainId: 42161, nativeAddress: '0x...' }
```

---

## ⚠️ 注意事項

1. **カスタム ID は Enclave エコシステム専用**
   - これらの ID は公式標準ではありません
   - 他のウォレットとの互換性レイヤーには使用しないでください

2. **公式 SLIP-44 が優先**
   - チェーンが後に公式 SLIP-44 ID を取得した場合、公式 ID に移行すべきです

3. **範囲制限**
   - カスタム ID 範囲: 1000000 - 1999999
   - ネイティブチェーン ID は 999999 を超えないこと（実際にはチェーン ID はそこまで大きくなりません）

4. **ドキュメント化**
   - カスタム SLIP-44 を使用するすべてのチェーンは、ドキュメントで明確にマークすべきです

---

## 📚 参考資料

- [SLIP-0044 公式標準](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [BIP-0044 (HD Wallets)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [bip-utils SLIP-44 ドキュメント](https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html)

