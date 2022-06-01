# FVM Change Log

## Add field token details to API `/tx/:txId` (2022-05-26)

```json

{
    ...
    "receipt": [
        {
            ...
            "tokenDetails": [
                {
                    "_id": "628eff86a65623032e1b3c40",
                    "chain": "FIRO",
                    "network": "regtest",
                    "txid": "145418237f0ff8afcf465372f655276a545c281141c3e01147d84b19e33fc597",
                    "contractAddress": "f36f1d52db910d635ad9be501c23d870b129a826",
                    "decimals": 18,
                    "name": "Gold",
                    "symbol": "GLD",
                    "totalSupply": "100000000000000000000",
                    "officialSite": "",
                    "socialProfiles": "",
                    "price": "-1"
                }
            ]
        }
    ],
}
```

## Add PKScript (2022-05-25)

- Add field `asm` and `scriptSig` to response `tx/:txid/coins`

```json
{
  "inputs": [
    {   
        ...
        "asm": "OP_DUP OP_HASH160 d70fcf2b7fd2aa68e0a97ecf38b6f4133d666132 OP_EQUALVERIFY OP_CHECKSIG",
        "scriptSig": "483045022100d18486a874cb341321ce9925e511731e7c1d192c76aa6e48c5312691048ee8b4022063c1d51e961ffa4912ab9fe5e11d2760251b3ac2a9985a93eb3b36cbc12fa881012102146a439bb0b9e68c6087aa50117c5035f5c1025be2f5dff9293c70924eaa6edc"
    }
  ],
  "outputs": [
    {
        ...
        "asm": "04 90d003 28 d09de08a 95aebb35d67d9ac2357b1e5398913d4b0b43f044 OP_CALL"
    }
  ]
}
```

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
