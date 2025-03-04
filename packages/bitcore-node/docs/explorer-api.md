# Explorer API

## Home page

### Get blocks

GET `/api/FIRO/regtest/block?sinceBlock=n&limit=n`

<details>
<summary><b>Response</b></summary>
<br>

<b>Use Curl command in terminal to get a response</b>

```sh
curl -v localhost:3000/api/FIRO/regtest/block?limit=2
```

```json
[
   {
      "_id":"621e60b996fce3621a8e7118",
      "chain":"FIRO",
      "network":"regtest",
      "hash":"0fa068b0f902793a0951ce952bf89bdc8e8d71cb8c7b988f260977cb778ba55b",
      "height":230423,
      "version":536870912,
      "size":353,
      "merkleRoot":"dc4b6de63eff4a4fd72543659b2d25a62883b813297c692eeda6a1d4b4808f93",
      "time":"2022-01-11T05:54:04.000Z",
      "timeNormalized":"2022-01-11T05:54:04.000Z",
      "nonce":null,
      "bits":null,
      "previousBlockHash":"1b4bfe83dd548f15b68938588fc1e9f64ca174b68d4ccc777a0973256a88b543",
      "nextBlockHash":"",
      "reward":10000000000,
      "transactionCount":1
   },
   {
      "_id":"621e60b996fce3621a8e7106",
      "chain":"FIRO",
      "network":"regtest",
      "hash":"1b4bfe83dd548f15b68938588fc1e9f64ca174b68d4ccc777a0973256a88b543",
      "height":230422,
      "version":536870912,
      "size":353,
      "merkleRoot":"983f30520ad1b491151bbe0e68a1b2db861349cf52aef01e71ef0c232017a584",
      "time":"2022-01-11T05:53:52.000Z",
      "timeNormalized":"2022-01-11T05:53:52.000Z",
      "nonce":null,
      "bits":null,
      "previousBlockHash":"f4e8a34da517b5df205b9274994e2decd1e1ea6853a97dc77a3b68421055a770",
      "nextBlockHash":"0fa068b0f902793a0951ce952bf89bdc8e8d71cb8c7b988f260977cb778ba55b",
      "reward":10000000000,
      "transactionCount":1
   }
]
```

</details>


### Get transactions

GET `/api/FIRO/regtest/tx?blockHeight=n&blockHash=...&limit=n`

<details>
<summary><b>Response</b></summary>
<br>

<b>Use Curl command in terminal to get a response</b>

#### EVM transaction
```sh
curl -v https://api-devnet2.satangtech.xyz/api/FIRO/regtest/tx?limit=1&native=false
```

```json
[
   {
      "_id":"62997ca005370d5166cca809",
      "txid":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":405,
      "blockHash":"b13c99bbaa6d925b3fc4505c368d481aa1b4bdbb16af7c6dc637a42e730481f9",
      "blockTime":"2022-04-23T07:57:23.000Z",
      "blockTimeNormalized":"2022-04-23T07:57:23.000Z",
      "coinbase":false,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":299,
      "fee":20033900,
      "value":999999979966100,
      "weight":1196,
      "vsize":299,
      "receipt":[
         {
            "blockHash":"b13c99bbaa6d925b3fc4505c368d481aa1b4bdbb16af7c6dc637a42e730481f9",
            "blockNumber":405,
            "transactionHash":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
            "transactionIndex":1,
            "outputIndex":0,
            "from":"80e04a7781cbb417da95fd401e901663262efbe3",
            "to":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
            "cumulativeGasUsed":51935,
            "gasUsed":51935,
            "contractAddress":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000800000000000000000000000000000800000000000000000000000000000000000000000000000008000000000010000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000002000000000400000000000000000002000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000",
            "stateRoot":"a6a27be32ffcdc411d356dfe4f4d81f78cf1bbe0d30dd6825c7a2fc080a59277",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "00000000000000000000000080e04a7781cbb417da95fd401e901663262efbe3",
                     "000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b"
                  ],
                  "data":"00000000000000000000000000000000000000000000000000000000000186a0"
               }
            ],
            "events":[
               {
                  "type":"transfer",
                  "from":"80e04a7781cbb417da95fd401e901663262efbe3",
                  "to":"c852a211b2712dbddda0be6e51aaed73af28d74b",
                  "value":"100000"
               }
            ],
            "decodedLogs":{
               "0":{
                  "name":"Transfer",
                  "events":[
                     {
                        "name":"_from",
                        "type":"address",
                        "value":"0x80e04a7781cbb417da95fd401e901663262efbe3"
                     },
                     {
                        "name":"_to",
                        "type":"address",
                        "value":"0xc852a211b2712dbddda0be6e51aaed73af28d74b"
                     },
                     {
                        "name":"_value",
                        "type":"uint256",
                        "value":"100000"
                     }
                  ],
                  "address":"0xef4a286fe474f39c0411872e90e0bfedf80da47d"
               },
               "type":"ERC20"
            },
            "tokenDetails":[
               {
                  "txid":"84d64d4acc1202f1c33dee083974cebe301e6e077a6ce6f44629862076304ded",
                  "contractAddress":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
                  "decimals":18,
                  "name":"Wrapped ETH",
                  "symbol":"WETH"
               }
            ],
            "callData":"a9059cbb000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b00000000000000000000000000000000000000000000000000000000000186a0",
            "decodedCallData":{
               "type":"ERC20",
               "name":"transfer",
               "params":[
                  {
                     "name":"_to",
                     "value":"0xc852a211b2712dbddda0be6e51aaed73af28d74b",
                     "type":"address"
                  },
                  {
                     "name":"_value",
                     "value":"100000",
                     "type":"uint256"
                  }
               ]
            }
         }
      ],
      "confirmations":1900
   }
]
```
  
#### Native transaction
  
```sh
curl -v localhost:3000/api/FIRO/regtest/tx?limit=1&native=true
```

```json
[
   {
      "_id":"6232e4ff6e26dcc631f984b3",
      "txid":"709847efaa7429bdde405c78bf8a5b893046e438dd8d4c88eb92b76ea5743828",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":1662,
      "blockHash":"e4036e830cd408220387077ff25f4a2b120e6567b3bcc226e60abb721bb5f3e2",
      "blockTime":"2022-03-17T01:22:00.000Z",
      "blockTimeNormalized":"2022-03-17T01:22:00.000Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":136,
      "fee":-1,
      "value":100000000000000,
      "weight":580,
      "vsize":145,
      "receipt":[
         
      ],
      "confirmations":1
   }
]
```
 
#### Pagination
  
 ```sh
curl -v localhost:3000/api/FIRO/regtest/tx?skip=100&limit=2
```

```json
[
   {
      "_id":"6232e4fe6e26dcc631f97e37",
      "txid":"caf81e754c2ab8963287ebd2f584515152081971daafce91d3e0614d66c24b31",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":1585,
      "blockHash":"1f4df8d6baa50448be86cdff783393ae169b2a0a417f829cdd21eb46ec645e3c",
      "blockTime":"2022-03-09T19:05:07.000Z",
      "blockTimeNormalized":"2022-03-09T19:05:07.000Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":136,
      "fee":-1,
      "value":100000000000000,
      "weight":580,
      "vsize":145,
      "receipt":[
         
      ],
      "confirmations":78
   },
   {
      "_id":"6232e4fe6e26dcc631f97e23",
      "txid":"5247df3200489d8210b2c71f390b0eb3e5f75584290bd84fc7f1be491c38cbc0",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":1584,
      "blockHash":"def29a8bf76e262685ceae38c033519655e4f94d6a2b864ac573840440dcb161",
      "blockTime":"2022-03-09T19:05:06.000Z",
      "blockTimeNormalized":"2022-03-09T19:05:06.005Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":136,
      "fee":-1,
      "value":100000000000000,
      "weight":580,
      "vsize":145,
      "receipt":[
         
      ],
      "confirmations":79
   }
]
```
  
</details>

#### NOTE: to evaluate status
1. native - have no receipt
2. create contracts 
  - contract address is shown in field `contractAddress`
  - to is 0000000000000000000000000000000000000000
  - excepted is None
3. call contracts 
  - excepted is None
  - to isn't 0000000000000000000000000000000000000000
4. fail to call/create contracts - excepted is not None

### Get a transaction by id

```
curl -v https://api-devnet2.satangtech.xyz/api/FIRO/regtest/tx/419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3
```

```json
{
   "_id":"62997ca005370d5166cca809",
   "txid":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
   "network":"regtest",
   "chain":"FIRO",
   "blockHeight":405,
   "blockHash":"b13c99bbaa6d925b3fc4505c368d481aa1b4bdbb16af7c6dc637a42e730481f9",
   "blockTime":"2022-04-23T07:57:23.000Z",
   "blockTimeNormalized":"2022-04-23T07:57:23.000Z",
   "coinbase":false,
   "locktime":-1,
   "inputCount":1,
   "outputCount":2,
   "size":299,
   "fee":20033900,
   "value":999999979966100,
   "weight":1196,
   "vsize":299,
   "receipt":[
      {
         "blockHash":"b13c99bbaa6d925b3fc4505c368d481aa1b4bdbb16af7c6dc637a42e730481f9",
         "blockNumber":405,
         "transactionHash":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
         "transactionIndex":1,
         "outputIndex":0,
         "from":"80e04a7781cbb417da95fd401e901663262efbe3",
         "to":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
         "cumulativeGasUsed":51935,
         "gasUsed":51935,
         "contractAddress":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
         "excepted":"None",
         "exceptedMessage":"",
         "bloom":"00000800000000000000000000000000000800000000000000000000000000000000000000000000000008000000000010000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000002000000000400000000000000000002000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000",
         "stateRoot":"a6a27be32ffcdc411d356dfe4f4d81f78cf1bbe0d30dd6825c7a2fc080a59277",
         "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
         "log":[
            {
               "address":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
               "topics":[
                  "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                  "00000000000000000000000080e04a7781cbb417da95fd401e901663262efbe3",
                  "000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b"
               ],
               "data":"00000000000000000000000000000000000000000000000000000000000186a0"
            }
         ],
         "events":[
            {
               "type":"transfer",
               "from":"80e04a7781cbb417da95fd401e901663262efbe3",
               "to":"c852a211b2712dbddda0be6e51aaed73af28d74b",
               "value":"100000"
            }
         ],
         "decodedLogs":{
            "0":{
               "name":"Transfer",
               "events":[
                  {
                     "name":"_from",
                     "type":"address",
                     "value":"0x80e04a7781cbb417da95fd401e901663262efbe3"
                  },
                  {
                     "name":"_to",
                     "type":"address",
                     "value":"0xc852a211b2712dbddda0be6e51aaed73af28d74b"
                  },
                  {
                     "name":"_value",
                     "type":"uint256",
                     "value":"100000"
                  }
               ],
               "address":"0xef4a286fe474f39c0411872e90e0bfedf80da47d"
            },
            "type":"ERC20"
         },
         "tokenDetails":[
            {
               "txid":"84d64d4acc1202f1c33dee083974cebe301e6e077a6ce6f44629862076304ded",
               "contractAddress":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
               "decimals":18,
               "name":"Wrapped ETH",
               "symbol":"WETH"
            }
         ],
         "callData":"a9059cbb000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b00000000000000000000000000000000000000000000000000000000000186a0",
         "decodedCallData":{
            "type":"ERC20",
            "name":"transfer",
            "params":[
               {
                  "name":"_to",
                  "value":"0xc852a211b2712dbddda0be6e51aaed73af28d74b",
                  "type":"address"
               },
               {
                  "name":"_value",
                  "value":"100000",
                  "type":"uint256"
               }
            ]
         },
         "gasLimit":"250000",
         "gasPrice":"40"
      }
   ],
   "confirmations":1901
}
```

### Transactions inputs/output

```sh
curl -v https://api-devnet2.satangtech.xyz/api/FIRO/regtest/tx/419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3/coins
```

```json
{
   "inputs":[
      {
         "_id":"62997c9a05370d5166cc9e03",
         "chain":"FIRO",
         "network":"regtest",
         "coinbase":true,
         "mintIndex":0,
         "spentTxid":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
         "mintTxid":"ce4fa40c046e0c42f7b79cb124cafc75855e52e77200104e4414a97986fe3846",
         "mintHeight":297,
         "spentHeight":405,
         "address":"TMieBckic9jNeZ32qAqsG2beqHoXuL2hQW",
         "script":"76a91480e04a7781cbb417da95fd401e901663262efbe388ac",
         "value":1000000000000000,
         "confirmations":-1,
         "sequenceNumber":4294967295,
         "asm":"OP_DUP OP_HASH160 80e04a7781cbb417da95fd401e901663262efbe3 OP_EQUALVERIFY OP_CHECKSIG",
         "vinScriptSig":"4730440220796ca1cee00460ad845266e8231073fa45b9c92db78ac8d8b9368d6b553abbc502204c6c528cd216928be298e1187214d2ee0e1df44c1620c291ae1126404017948c012103997a7f12dbfdcdb186efb7f14cd90e2bc31725532864c82315a5af1c515071e0"
      }
   ],
   "outputs":[
      {
         "_id":"62997ca005370d5166cca7f7",
         "chain":"FIRO",
         "network":"regtest",
         "coinbase":false,
         "mintIndex":0,
         "spentTxid":"",
         "mintTxid":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
         "mintHeight":405,
         "spentHeight":-2,
         "address":"false",
         "script":"01040390d003012844a9059cbb000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b00000000000000000000000000000000000000000000000000000000000186a014ef4a286fe474f39c0411872e90e0bfedf80da47dc2",
         "value":0,
         "confirmations":-1,
         "asm":"04 90d003 28 a9059cbb000000000000000000000000c852a211b2712dbddda0be6e51aaed73af28d74b00000000000000000000000000000000000000000000000000000000000186a0 ef4a286fe474f39c0411872e90e0bfedf80da47d OP_CALL",
         "vinScriptSig":""
      },
      {
         "_id":"62997ca005370d5166cca7f9",
         "chain":"FIRO",
         "network":"regtest",
         "coinbase":false,
         "mintIndex":1,
         "spentTxid":"",
         "mintTxid":"419dce521f9d90b29c95560f298498596cbda0deda103fb3dd4ceafc3e91d5f3",
         "mintHeight":405,
         "spentHeight":-2,
         "address":"TMieBckic9jNeZ32qAqsG2beqHoXuL2hQW",
         "script":"76a91480e04a7781cbb417da95fd401e901663262efbe388ac",
         "value":999999979966100,
         "confirmations":-1,
         "asm":"OP_DUP OP_HASH160 80e04a7781cbb417da95fd401e901663262efbe3 OP_EQUALVERIFY OP_CHECKSIG",
         "vinScriptSig":""
      }
   ]
}
```

### Tokens

#### List tokens

```sh
curl -v localhost:3000/api/FIRO/regtest/token
```

TODO: Update large number fields
```json
[
   {
      "_id":"623ec8d796e1189094ec9172",
      "txid":"0a44d795597f43b5434ce9069ea1eb4c4e09e67c18eccf0741021d118505abbd",
      "balances":{
         "19f1aa2ec701fcca7fd20229e007bd6a9973b0fd":9.999999969999999e+26,
         "6483966749330323562ca015d7135831de4760a8":3000000000000000000
      },
      "chain":"FIRO",
      "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
      "decimals":18,
      "name":"Wrapped ETH",
      "network":"regtest",
      "symbol":"WETH",
      "totalSupply":1e+27,
      "price": "-1",
      "holders":2
   }
]
```

#### Get a token

```sh
curl -v localhost:3000/api/FIRO/regtest/token/a4a8254a1b510c68cb4493e59c5b8cda0791256e
```

TODO: Update large number fields
```json
{
   "_id":"623ec8d796e1189094ec9172",
   "txid":"0a44d795597f43b5434ce9069ea1eb4c4e09e67c18eccf0741021d118505abbd",
   "balances":{
      "19f1aa2ec701fcca7fd20229e007bd6a9973b0fd":9.999999969999999e+26,
      "6483966749330323562ca015d7135831de4760a8":3000000000000000000
   },
   "chain":"FIRO",
   "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
   "decimals":18,
   "name":"Wrapped ETH",
   "network":"regtest",
   "symbol":"WETH",
   "totalSupply":1e+27,
   "transfers":3,
   "holders":2,
   "price": "-1"
}
```

#### Transactions by token contract

```sh
curl -v localhost:3000/api/FIRO/regtest/token/a4a8254a1b510c68cb4493e59c5b8cda0791256e/tx
```

```json
[
   {
      "_id":"623ec8d796e1189094ec9168",
      "chain":"FIRO",
      "network":"regtest",
      "txid":"7ce6cbbc24890c734fc387884d3ccafdefddc7ef30458bd5ad45c4ea5de8be47",
      "blockHash":"17e98995b0de4333963465f71b1afb17cb757ee2b941dd6cca5cdfb3f4ad0d0f",
      "blockHeight":1650,
      "blockTime":"2022-03-09T19:12:42.000Z",
      "blockTimeNormalized":"2022-03-09T19:12:42.000Z",
      "coinbase":false,
      "fee":17179875660,
      "inputCount":1,
      "locktime":1649,
      "outputCount":2,
      "size":433,
      "value":99982820124340,
      "wallets":[
         
      ],
      "vsize":433,
      "weight":1732,
      "receipt":[
         {
            "blockHash":"17e98995b0de4333963465f71b1afb17cb757ee2b941dd6cca5cdfb3f4ad0d0f",
            "blockNumber":1650,
            "transactionHash":"7ce6cbbc24890c734fc387884d3ccafdefddc7ef30458bd5ad45c4ea5de8be47",
            "transactionIndex":1,
            "outputIndex":1,
            "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
            "to":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "cumulativeGasUsed":51971,
            "gasUsed":51971,
            "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000004000000000000000000000000000000000004080000000000000040000000000000000000000000000000010800000000000000000000000002000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000",
            "stateRoot":"fff8d906af6176bf1d55ecf57c76ef84fa0c225ffd3eb00a774f4170d226156a",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "00000000000000000000000019f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                     "0000000000000000000000006483966749330323562ca015d7135831de4760a8"
                  ],
                  "data":"0000000000000000000000000000000000000000000000000de0b6b3a7640000"
               }
            ],
            "events":[
               {
                  "type":"transfer",
                  "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                  "to":"6483966749330323562ca015d7135831de4760a8",
                  "value":1000000000000000000
               }
            ]
         }
      ]
   }
]
```
#### Token-transfering transactions by token contract

```sh
curl -v localhost:3000/api/FIRO/regtest/token/a4a8254a1b510c68cb4493e59c5b8cda0791256e/tokentransfers
```

```json
[
   {
      "_id":"623ec8d796e1189094ec9168",
      "chain":"FIRO",
      "network":"regtest",
      "txid":"7ce6cbbc24890c734fc387884d3ccafdefddc7ef30458bd5ad45c4ea5de8be47",
      "blockHash":"17e98995b0de4333963465f71b1afb17cb757ee2b941dd6cca5cdfb3f4ad0d0f",
      "blockHeight":1650,
      "blockTime":"2022-03-09T19:12:42.000Z",
      "blockTimeNormalized":"2022-03-09T19:12:42.000Z",
      "coinbase":false,
      "fee":17179875660,
      "inputCount":1,
      "locktime":1649,
      "outputCount":2,
      "size":433,
      "value":99982820124340,
      "wallets":[
         
      ],
      "vsize":433,
      "weight":1732,
      "receipt":[
         {
            "blockHash":"17e98995b0de4333963465f71b1afb17cb757ee2b941dd6cca5cdfb3f4ad0d0f",
            "blockNumber":1650,
            "transactionHash":"7ce6cbbc24890c734fc387884d3ccafdefddc7ef30458bd5ad45c4ea5de8be47",
            "transactionIndex":1,
            "outputIndex":1,
            "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
            "to":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "cumulativeGasUsed":51971,
            "gasUsed":51971,
            "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000004000000000000000000000000000000000004080000000000000040000000000000000000000000000000010800000000000000000000000002000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000",
            "stateRoot":"fff8d906af6176bf1d55ecf57c76ef84fa0c225ffd3eb00a774f4170d226156a",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "00000000000000000000000019f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                     "0000000000000000000000006483966749330323562ca015d7135831de4760a8"
                  ],
                  "data":"0000000000000000000000000000000000000000000000000de0b6b3a7640000"
               }
            ],
            "events":[
               {
                  "type":"transfer",
                  "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                  "to":"6483966749330323562ca015d7135831de4760a8",
                  "value":1000000000000000000
               }
            ]
         }
      ]
   }
]
```

#### List token holders

```sh
curl -v localhost:3000/api/FIRO/regtest/token/a4a8254a1b510c68cb4493e59c5b8cda0791256e/tokenholder
```

TODO: use string instead of node interger
```json
{"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd":9.999999969999999e+26,"6483966749330323562ca015d7135831de4760a8":3000000000000000000}
```

### Listen to new block and tx via ws

You can connect via ws following the guide below. Also you can check tx and block object from the section above.

```nodejs
const io = require('socket.io-client');
const socket = io.connect('http://139.180.136.224:3000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Connected to socket');
  // console.log(socket.id);
  socket.emit('room', '/FIRO/regtest/inv');
});

socket.on('block', block => {
  console.log('block');
  console.log(block);
  console.log('\n');
});

socket.on('tx', sanitizedTx => {
  console.log('tx');
  console.log(sanitizedTx);
  console.log('\n');
});

socket.on('TYAckFZ2HgaQGpB698hoVhAa6G6hVtwiVb', sanitizedCoin => {
  console.log('sanitizedCoin');
  console.log(sanitizedCoin);
  console.log('\n');
});

socket.on('disconnect', () => {
  console.log('disconnect');
});
```

## Address

### Get address detail

https://localhost:3000/api/FIRO/regtest/address/19f1aa2ec701fcca7fd20229e007bd6a9973b0fd/detail

```json
{
   "balance":9799982820124340,
   "tokens":[
      {
         "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
         // NOTE: this field should be just "0"
         "balance":{
            "$numberDecimal":"0"
         },
         "symbol":"WETH",
         "name":"Wrapped ETH"
      }
   ],
   "transactionNativeCount": 128,
   "transactionEVMCount": 1,
   "transactionTotalCount": 129  
}
```

### Get transactions

https://api-devnet2.satangtech.xyz/api/FIRO/regtest/address/0x80E04a7781CBb417DA95fd401e901663262efbE3/detail/tx

```json
[
   {
      "_id":"6263b1639b38282cd4c37b11",
      "txid":"ef38843b28cd9351e9e04b6b45ecd613889f4c7eb0cec5dfddfec4d2a9fe16cd",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":405,
      "blockHash":"b13c99bbaa6d925b3fc4505c368d481aa1b4bdbb16af7c6dc637a42e730481f9",
      "blockTime":"2022-04-23T07:57:23.000Z",
      "blockTimeNormalized":"2022-04-23T07:57:23.000Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":4,
      "size":204,
      "fee":-1,
      "value":1000000000000,
      "weight":852,
      "vsize":213,
      "receipt":[
      ]
   }
]
```

### Get holding tokens

https://localhost:3000/api/FIRO/regtest/address/19f1aa2ec701fcca7fd20229e007bd6a9973b0fd/detail/tokens

```json
[
   {
      "_id":"624860352631c4a0b3e2665e",
      "address":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
      "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
      // NOTE: this field should be just "0"
      "balance":{
         "$numberDecimal":"0"
      },
      "chain":"FIRO",
      "network":"regtest",
      "txid":"0a44d795597f43b5434ce9069ea1eb4c4e09e67c18eccf0741021d118505abbd",
      "name":"Wrapped ETH",
      "symbol":"WETH",
      "type":"erc20",
      "decimal":18
   }
]
```

### Get token transfer transactions

https://localhost:3000/api/FIRO/regtest/address/19f1aa2ec701fcca7fd20229e007bd6a9973b0fd/detail/tokentransfers

```json
[
   {
      "_id":"624953712631c4a0b33d786f",
      "chain":"FIRO",
      "network":"regtest",
      "txid":"2bfae40ca006248495b24ca921207e2973b8cd7c49da459c0b1e2155692b9442",
      "blockHash":"45850ad1309fc80edf32d289b6ad04fa94883093b9d806bb86c371fdc08bf75f",
      "blockHeight":2846,
      "blockTime":"2022-04-03T07:57:37.000Z",
      "blockTimeNormalized":"2022-04-03T07:57:37.000Z",
      "coinbase":false,
      "fee":17179875660,
      "inputCount":1,
      "locktime":2845,
      "mempoolTime":"2022-04-03T07:57:37.242Z",
      "outputCount":2,
      "size":433,
      "value":99982820124340,
      "wallets":[
         
      ],
      "receipt":[
         {
            "blockHash":"45850ad1309fc80edf32d289b6ad04fa94883093b9d806bb86c371fdc08bf75f",
            "blockNumber":2846,
            "transactionHash":"2bfae40ca006248495b24ca921207e2973b8cd7c49da459c0b1e2155692b9442",
            "transactionIndex":2,
            "outputIndex":0,
            "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
            "to":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "cumulativeGasUsed":36971,
            "gasUsed":36971,
            "contractAddress":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000004000000000000000000000000000000000004080000000000000040000000000000000000000000000000010800000000000000000000000002000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000",
            "stateRoot":"9bf79090856315125c3942bea535ac988dfed98faaf624a89ce85dfb37a5626b",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"a4a8254a1b510c68cb4493e59c5b8cda0791256e",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "00000000000000000000000019f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                     "0000000000000000000000006483966749330323562ca015d7135831de4760a8"
                  ],
                  "data":"0000000000000000000000000000000000000000000000000de0b6b3a7640000"
               }
            ],
            "events":[
               {
                  "type":"transfer",
                  "from":"19f1aa2ec701fcca7fd20229e007bd6a9973b0fd",
                  "to":"6483966749330323562ca015d7135831de4760a8",
                  "value":1000000000000000000
               }
            ]
         }
      ],
      "vsize":433,
      "weight":1732
   }
]
```

## Contracts

### Get contract detail

https://api-devnet2.satangtech.xyz/api/FIRO/regtest/contract/ef4a286fe474f39c0411872e90e0bfedf80da47d

```json
{
   "_id":"6263addb9b38282cd4c22adb",
   "chain":"FIRO",
   "network":"regtest",
   "txid":"84d64d4acc1202f1c33dee083974cebe301e6e077a6ce6f44629862076304ded",
   "contractAddress":"ef4a286fe474f39c0411872e90e0bfedf80da47d",
   "from":"80e04a7781cbb417da95fd401e901663262efbe3",
   "gasUsed":"43981",
   "balance":0,
   "transactions":2,
   "transfers":1,
   "tokens":[
      
   ]
}
```

### Get events

https://api-devnet3.satangtech.xyz/api/FIRO/regtest/contract/6a7b82ba97574bc647816111365d705898623e0a/event

```json
[
   {
      "_id":"627a88241e456a12460b1281",
      "txid":"20e893574258e29f46f970dd0bb0a05104532675cf35025681f9cf8a287976f6",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":65733,
      "blockHash":"474bfd13435f476c8ada372f72586097c237a4f2a8bb19b55adad814cb75d865",
      "blockTime":"2022-05-10T04:27:11.000Z",
      "blockTimeNormalized":"2022-05-10T04:27:11.000Z",
      "coinbase":false,
      "locktime":-1,
      "inputCount":3,
      "outputCount":2,
      "size":597,
      "fee":62700000,
      "value":99999685014720,
      "weight":2388,
      "vsize":597,
      "receipt":[
         {
            "blockHash":"474bfd13435f476c8ada372f72586097c237a4f2a8bb19b55adad814cb75d865",
            "blockNumber":65733,
            "transactionHash":"20e893574258e29f46f970dd0bb0a05104532675cf35025681f9cf8a287976f6",
            "transactionIndex":1,
            "outputIndex":0,
            "from":"350495e389e41399129ef9bfed6fb8c281c43975",
            "to":"6a7b82ba97574bc647816111365d705898623e0a",
            "cumulativeGasUsed":36941,
            "gasUsed":36941,
            "contractAddress":"6a7b82ba97574bc647816111365d705898623e0a",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000008000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000004000000000000000000000000800000000000000000000000004000000000020000000000000000000000000000000000000000000002000000000000000000000000000000000000000080000000000000000000000002000000000000000000000000000000000000000000000000000000",
            "stateRoot":"805f7e538049c4cd0622381c76115a12d113d7486bab8cabbc08729762d76ec5",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"6a7b82ba97574bc647816111365d705898623e0a",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "000000000000000000000000350495e389e41399129ef9bfed6fb8c281c43975",
                     "000000000000000000000000b2e572dfb084355419f64d71354b058f1327c049"
                  ],
                  "data":"0000000000000000000000000000000000000000000000000000000017d78400"
               }
            ],
            "events":[
               {
                  "type":"transfer",
                  "from":"350495e389e41399129ef9bfed6fb8c281c43975",
                  "to":"b2e572dfb084355419f64d71354b058f1327c049",
                  "value":"400000000"
               }
            ]
         }
      ]
   }
]
```

### Submit contracts code

POST https://api-devnet3.satangtech.xyz/api/FIRO/regtest/contract/6a7b82ba97574bc647816111365d705898623e0a
Content-type: multipart/form-data
fields:
   - file: <sol file to upload>
   - version: <version string from supported list>

Result

```json
{
    "chain": "FIRO",
    "network": "regtest",
    "contractName": "USDTToken"
}
```

### Download code

GET https://api-devnet3.satangtech.xyz/api/FIRO/regtest/contract/6a7b82ba97574bc647816111365d705898623e0a/code

Response
- Content-type: application/octet-stream
- With code

### Download ABI

GET https://api-devnet3.satangtech.xyz/api/FIRO/regtest/contract/6a7b82ba97574bc647816111365d705898623e0a/abi

Response
- Content-type: application/octet-stream
- With abi as json



## Solidity versions

### Get available solidity versions

GET https://api-devnet3.satangtech.xyz/api/FIRO/regtest/solc-versions

```json
[
   "v0.8.13+commit.abaa5c0e",
   "v0.8.12+commit.f00d7308",
   "v0.8.11+commit.d7f03943",
   ...
]
```

## Search

### Search by any content

GET <https://api-devnet3.satangtech.xyz/api/FIRO/regtest/search/:content>

> content is base64-encoded

Result
```
// Account by both native and hex
{
   "type":"account",
   "hex":"350495e389e41399129ef9bfed6fb8c281c43975",
   "native":"TEoYJqEKBVoc4kN6r3kGvRzvEMvEUduYLz"
}
  
// Block number or block hash
{
   "type":"block",
   "blockId":"f522814bc8083a81068d55598d308e9bdbe329fa6608642804a44a1d88e55f3b"
}
  
// txid
{
   "type":"txid"
}
  
// Contract address
{
   "type":"contract",
   "address":"6a7b82ba97574bc647816111365d705898623e0a"
}
  
// Tokens by name or symbol
{
   "type":"token",
   "result":[
      {
         "address":"6a7b82ba97574bc647816111365d705898623e0a",
         "name":"Tether USD",
         "symbol":"USDT"
      }
   ]
}
```
