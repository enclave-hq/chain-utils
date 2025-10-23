# SLIP-44 체인 ID 전략

## 📋 참조 표준

- **공식 SLIP-44 표준**: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
- **공식 문서**: https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html

---

## ✅ 공식 SLIP-44 ID를 사용하는 체인

이러한 체인은 SLIP-44 표준에서 명확하게 정의되어 있습니다:

| 체인 이름 | 네이티브 체인 ID | SLIP-44 ID | 출처 |
|----------|-----------------|------------|------|
| Ethereum | 1 | 60 | [공식](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Tron | 195 | 195 | [공식](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| BSC (Binance Chain) | 56 | 714 | [공식](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Solana | mainnet-beta | 501 | [공식](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |
| Avalanche C-Chain | 43114 | 9000 | [공식](https://github.com/satoshilabs/slips/blob/master/slip-0044.md) |

---

## 🔧 커스텀 SLIP-44 ID 전략

### 문제점

많은 체인(특히 레이어 2 체인)이 공식 SLIP-44 표준에서 **정의되지 않았습니다**:
- ❌ Polygon (Matic)
- ❌ Arbitrum One
- ❌ Optimism
- ❌ Base
- ❌ zkSync Era
- ❌ 기타 EVM 호환 레이어 2

### 왜 모두 Ethereum의 SLIP-44 (60)를 사용할 수 없나요?

여러 체인이 동일한 SLIP-44 ID를 사용하면 다음과 같은 문제가 발생합니다:

```typescript
// ❌ 문제 예시
slip44ToNative(60)  // 무엇을 반환해야 할까요?
// → Ethereum (1)?
// → Arbitrum (42161)?
// → Optimism (10)?
// → 구별할 수 없습니다!
```

**결과**:
- ❌ 역방향 조회 충돌
- ❌ Universal Address로 체인을 고유하게 식별할 수 없음
- ❌ 크로스체인 작업이 혼란스러워짐

### 해결책: 커스텀 SLIP-44 범위

공식 SLIP-44가 없는 체인에 **고유한 커스텀 ID**를 할당합니다:

```
커스텀 SLIP-44 ID = 1000000 + 네이티브 체인 ID
```

**범위**: `1000000 - 1999999`
- ✅ 공식 SLIP-44와 충돌 방지 (공식 최대값: 314159 [Pi Network])
- ✅ 각 체인이 고유한 ID를 갖도록 보장
- ✅ 간단한 알고리즘, 계산하기 쉬움
- ✅ 향후 확장 지원

---

## 🔢 커스텀 SLIP-44 ID 매핑 테이블

| 체인 이름 | 네이티브 체인 ID | 커스텀 SLIP-44 | 계산 |
|----------|-----------------|---------------|------|
| Polygon | 137 | 1000137 | 1000000 + 137 |
| Arbitrum One | 42161 | 1042161 | 1000000 + 42161 |
| Optimism | 10 | 1000010 | 1000000 + 10 |
| Base | 8453 | 1008453 | 1000000 + 8453 |
| zkSync Era | 324 | 1000324 | 1000000 + 324 |

---

## 🎯 완전한 매핑 테이블

### 공식 SLIP-44 ID

```typescript
const OFFICIAL_SLIP44 = {
  60: 'Ethereum',       // Native: 1
  195: 'Tron',          // Native: 195
  714: 'BSC',           // Native: 56
  501: 'Solana',        // Native: mainnet-beta
  9000: 'Avalanche',    // Native: 43114
  // ... 기타 공식 정의 체인
}
```

### 커스텀 SLIP-44 ID

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

## 📝 새 체인 추가 규칙

### 1. 공식 SLIP-44 표준 확인

먼저 체인이 공식 목록에 있는지 확인합니다:
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md

### 2. 공식 SLIP-44가 존재하는 경우

```typescript
// 공식 ID 사용
registerChain({
  nativeChainId: <chainId>,
  slip44: <공식 SLIP-44 ID>,
  name: '<체인 이름>',
  chainType: ChainType.EVM,
  symbol: '<토큰 심볼>',
})
```

### 3. 공식 SLIP-44가 없는 경우

```typescript
// 커스텀 ID 사용 (1000000 + nativeChainId)
registerChain({
  nativeChainId: <chainId>,
  slip44: 1000000 + <chainId>,
  name: '<체인 이름>',
  chainType: ChainType.EVM,
  symbol: '<토큰 심볼>',
})
```

---

## 🔄 양방향 변환 보장

이 전략을 사용하면 다음을 보장할 수 있습니다:

```typescript
// ✅ Native → SLIP-44 → Native (왕복 변환)
nativeToSlip44(42161)          // → 1042161
slip44ToNative(1042161)        // → 42161

// ✅ 각 체인은 고유한 SLIP-44 ID를 가짐
encodeUniversalAddress(1042161, '0x...')  // Arbitrum
encodeUniversalAddress(1000010, '0x...')  // Optimism
// 두 주소는 충돌하지 않습니다!

// ✅ 역방향 조회가 명확함
decodeUniversalAddress(bytes)
// → { slip44: 1042161, nativeChainId: 42161, nativeAddress: '0x...' }
```

---

## ⚠️ 주의사항

1. **커스텀 ID는 Enclave 생태계 전용**
   - 이러한 ID는 공식 표준이 아닙니다
   - 다른 지갑과의 호환성 레이어에 사용하면 안 됩니다

2. **공식 SLIP-44 우선**
   - 체인이 나중에 공식 SLIP-44 ID를 받으면 공식 ID로 마이그레이션해야 합니다

3. **범위 제한**
   - 커스텀 ID 범위: 1000000 - 1999999
   - 네이티브 체인 ID는 999999를 초과하지 않아야 함 (실제로 체인 ID는 그렇게 크지 않습니다)

4. **문서화**
   - 커스텀 SLIP-44를 사용하는 모든 체인은 문서에서 명확하게 표시해야 합니다

---

## 📚 참고 자료

- [SLIP-0044 공식 표준](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [BIP-0044 (HD Wallets)](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [bip-utils SLIP-44 문서](https://bip-utils.readthedocs.io/en/stable/bip_utils/slip/slip44/slip44.html)

