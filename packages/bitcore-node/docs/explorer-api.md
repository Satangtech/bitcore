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

```sh
curl -v localhost:3000/api/FIRO/regtest/tx?limit=2
```

```json
[
   {
      "_id":"621e668a96fce3621aa78311",
      "txid":"bf10563bb392d24f3253c8437b3944edd4cb71db86c43b5fbf2856bdfe158346",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":333441,
      "blockHash":"e0c103ae6e0fbb723ef5ee9366728f90c1f5b32b773a906c4a733b3240efa4bd",
      "blockTime":"2022-01-25T21:58:15.000Z",
      "blockTimeNormalized":"2022-01-25T21:58:15.000Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":137,
      "fee":-1,
      "value":10000000000,
      "confirmations":1,
      "fee": 1000000,
      "receipt":[
         {
            "blockHash":"3dfefe183440ebd6b46a504af1282109176484182ac2781b14d543d8ccc1ba65",
            "blockNumber":389382,
            "transactionHash":"0895d9f406f257f0a66c870618a03ba5e9af0c30d19882515a1ad5467ff14c7d",
            "transactionIndex":1,
            "outputIndex":0,
            "from":"7f288a70fea402dcf5ddbadd155ae7545af4fae0",
            "to":"a58a3a5afddc4cf57b0bfae6927a6139bc266e90",
            "cumulativeGasUsed":51995,
            "gasUsed":51995,
            "contractAddress":"a58a3a5afddc4cf57b0bfae6927a6139bc266e90",
            "excepted":"None",
            "exceptedMessage":"",
            "bloom":"00000000000000000000001000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110000000000000000000000000000000000000000000000000000000000000000008000000000000000000000010000000008000000000000000000000000000000000000000006002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "stateRoot":"cbc70a3f5c7f8c6f05a447b449cc5108bfa4897636692d4d7690f45428588a24",
            "utxoRoot":"56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            "log":[
               {
                  "address":"a58a3a5afddc4cf57b0bfae6927a6139bc266e90",
                  "topics":[
                     "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                     "0000000000000000000000007f288a70fea402dcf5ddbadd155ae7545af4fae0",
                     "0000000000000000000000003bf7bdb3b6cbf3fa961840cf268f80b1798a7f8e"
                  ],
                  "data":"00000000000000000000000000000000000000000000021e19e0c9bab2400000"
               }
            ]
         }
      ]
   },
   {
      "_id":"621e668a96fce3621aa78302",
      "txid":"038e94a0bdab0139d702494e310cf35a401eabf3663757053b7fa146f370feaf",
      "network":"regtest",
      "chain":"FIRO",
      "blockHeight":333440,
      "blockHash":"181bfd6ab7dda309dab75fdb42782ae073b83195c2cd4f6b73fd08d9684c3b45",
      "blockTime":"2022-01-25T21:58:02.000Z",
      "blockTimeNormalized":"2022-01-25T21:58:02.000Z",
      "coinbase":true,
      "locktime":-1,
      "inputCount":1,
      "outputCount":2,
      "size":137,
      "fee":-1,
      "value":10000000000,
      "confirmations":2,
      "fee": 1000000,
      "receipt":[
         
      ]
   }
]
```
</details>

#### NOTE: to evaluate status
1. native - have to receipt
2. create contracts 
  - contract address is shown in field `contractAddress`
  - to is 0000000000000000000000000000000000000000
  - excepted is None
3. call contracts 
  - excepted is None
  - to isn't 0000000000000000000000000000000000000000
4. fail to call/create contracts - excepted is not None

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
