# FVM Change Log

## Search Bar (2022-05-24)

- Add lower case for search hex address [d31987a5b907748873a3bdcc679885b6c94253ab](https://github.com/Satangtech/bitcore/commit/d31987a5b907748873a3bdcc679885b6c94253ab)

- Update api response

```json
{
    type: 'account',
    hex: 'hexAddress',
    native: 'nativeAddress',
}

{
    type: 'contract',
    address: 'contractAddress',
}

{
    type: 'block',
    blockId: 'blockHash',
}

{
    type: 'txid',
}

{
    type: 'token',
    result: [{
        address: 'tokenAddress',
        name: 'tokenName',
        symbol: 'tokenSymbol',
    }],
}
```

## Search Bar (2022-05-23)

- Add api for search bar [0be22c96](https://github.com/Satangtech/bitcore/commit/0be22c96de7abe8582b788e40065764513215e61)
