# Explorer API

## Home page

### List latest blocks

GET `/api/FIRO/regtest/block?limit=n`

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