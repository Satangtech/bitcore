# Test case Explorer

## Address

- `/api/FIRO/:network/:address/detail` get detail of address

```bash
{
  balance: 4051999999900000,
  tokens: [
    {
      _id: '64115d1f5ed29c6fe8f7b6c2',
      contractAddress: 'b6944e8ed578d301aba8a4827d963f5f15212bef',
      balance: '9999999999999999999990',
      name: 'Gold',
      symbol: 'GLD',
      decimal: 18
    }, ...],
  transactionNativeCount: 2031,
  transactionEVMCount: 4,
  transactionTotalCount: 2031
}
```

- `/api/FIRO/:network/:address/detail/tx` get detail tx of address

```bash
[{
  _id: '64115d1f5ed29c6fe8f7b75c',
  txid: '92b9f02d0b2db03d0598f2ae6eb3c608970a9f4668f45223e8fb0ffa8f1267aa',
  network: 'testnet',
  chain: 'FIRO',
  blockHeight: 2026,
  blockHash: '000062ad19e810886b0b0dd3980c87098b7392a9d0188ab7d46debc51f88195c',
  blockTime: '2023-03-15T05:52:29.000Z',
  blockTimeNormalized: '2023-03-15T05:52:29.000Z',
  coinbase: false,
  locktime: -1,
  inputCount: 1,
  outputCount: 2,
  size: 225,
  fee: 106000,
  value: 1999999894000,
  weight: 900,
  vsize: 225,
  receipt: []
}, ...]
```

- `/api/FIRO/:network/:address/detail/tx?contractAddress=:contractAddress` get detail tx of address by contract address

```bash
[
  {
    _id: '641162245ed29c6fe8fb0ec6',
    txid: 'd7cb740a62259a298906cc4e74cd7604dedc54f72d7b382e38e1a3912ef51a50',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2029,
    blockHash: '0000739834c2ce4c0333ab81fd442e1cb3dedc7462feba66b708e1f963888a09',
    blockTime: '2023-03-15T06:13:50.000Z',
    blockTimeNormalized: '2023-03-15T06:13:50.000Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 299,
    fee: 4218540,
    value: 1999995781460,
    weight: 1196,
    vsize: 299,
    receipt: [
      {
        blockHash: '0000739834c2ce4c0333ab81fd442e1cb3dedc7462feba66b708e1f963888a09',
        blockNumber: 2029,
        transactionHash: 'd7cb740a62259a298906cc4e74cd7604dedc54f72d7b382e38e1a3912ef51a50',
        transactionIndex: 1,
        outputIndex: 0,
        from: 'b118e03f6575aa270673c8d86d6dcb07eb2d9221',
        to: 'c71f7f479b72b8c953d697e69ead9008e6225845',
        cumulativeGasUsed: 52308,
        gasUsed: 52308,
        contractAddress: 'c71f7f479b72b8c953d697e69ead9008e6225845',
        excepted: 'None',
        exceptedMessage: '',
        bloom: '0000000110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000200c000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000',
        stateRoot: '295fed64df75fa87d0f0f1549141824834669c99d2b5b402f49a91fe75b1dd5c',
        utxoRoot: '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        log: [
          {
            address: 'c71f7f479b72b8c953d697e69ead9008e6225845',
            topics: [
              'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '000000000000000000000000b118e03f6575aa270673c8d86d6dcb07eb2d9221',
              '000000000000000000000000ecd971253154038c3cfb372e89c905e9db935375'
            ],
            data: '000000000000000000000000000000000000000000000000000000000000000a'
          }
        ],
        decodedLogs: {
          '0': {
            name: 'Transfer',
            events: [
              {
                name: '_from',
                type: 'address',
                value: '0xb118e03f6575aa270673c8d86d6dcb07eb2d9221'
              },
              {
                name: '_to',
                type: 'address',
                value: '0xecd971253154038c3cfb372e89c905e9db935375'
              },
              { name: '_value', type: 'uint256', value: '10' }
            ],
            address: '0xc71f7f479b72b8c953d697e69ead9008e6225845'
          },
          type: 'ERC20'
        },
        tokenDetails: [
          {
            txid: '2e7b9f9ebeb2bc78804e9d69cd4a2ad1df6dd6e7cdb0f89f04cd2b28ec477f14',
            contractAddress: 'c71f7f479b72b8c953d697e69ead9008e6225845',
            decimals: 18,
            name: 'Gold',
            symbol: 'GLD'
          }
        ],
        callData: 'a9059cbb000000000000000000000000ecd971253154038c3cfb372e89c905e9db935375000000000000000000000000000000000000000000000000000000000000000a',
        decodedCallData: {
          type: 'ERC20',
          name: 'transfer',
          params: [
            {
              name: '_to',
              value: '0xecd971253154038c3cfb372e89c905e9db935375',
              type: 'address'
            },
            { name: '_value', value: '10', type: 'uint256' }
          ]
        }
      }
    ]
  }
]
```

- `/api/FIRO/:network/:address/detail/tokens` get detail tokens of address

```bash
[{
  _id: '64115d1f5ed29c6fe8f7b6c2',
  address: 'b118e03f6575aa270673c8d86d6dcb07eb2d9221',
  contractAddress: 'b6944e8ed578d301aba8a4827d963f5f15212bef',
  chain: 'FIRO',
  network: 'testnet',
  balance: '9999999999999999999990',
  txid: '09adca0b9b87e2c5993f780993a61eec376559b813fdd9d585665cda01ab4a1a',
  name: 'Gold',
  symbol: 'GLD',
  type: 'erc20',
  decimal: 18
}, ...]
```

- `/api/FIRO/:network/:address/detail/tokentransfers`

```bash
[{
  _id: '641162245ed29c6fe8fb0ec6',
  txid: 'd7cb740a62259a298906cc4e74cd7604dedc54f72d7b382e38e1a3912ef51a50',
  network: 'testnet',
  chain: 'FIRO',
  blockHeight: 2029,
  blockHash: '0000739834c2ce4c0333ab81fd442e1cb3dedc7462feba66b708e1f963888a09',
  blockTime: '2023-03-15T06:13:50.000Z',
  blockTimeNormalized: '2023-03-15T06:13:50.000Z',
  coinbase: false,
  locktime: -1,
  inputCount: 1,
  outputCount: 2,
  size: 299,
  fee: 4218540,
  value: 1999995781460,
  weight: 1196,
  vsize: 299,
  receipt: [
    {
      blockHash: '0000739834c2ce4c0333ab81fd442e1cb3dedc7462feba66b708e1f963888a09',
      blockNumber: 2029,
      transactionHash: 'd7cb740a62259a298906cc4e74cd7604dedc54f72d7b382e38e1a3912ef51a50',
      transactionIndex: 1,
      outputIndex: 0,
      from: 'b118e03f6575aa270673c8d86d6dcb07eb2d9221',
      to: 'c71f7f479b72b8c953d697e69ead9008e6225845',
      cumulativeGasUsed: 52308,
      gasUsed: 52308,
      contractAddress: 'c71f7f479b72b8c953d697e69ead9008e6225845',
      excepted: 'None',
      exceptedMessage: '',
      bloom: '0000000110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000200c000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000',
      stateRoot: '295fed64df75fa87d0f0f1549141824834669c99d2b5b402f49a91fe75b1dd5c',
      utxoRoot: '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      log: [
        {
          address: 'c71f7f479b72b8c953d697e69ead9008e6225845',
          topics: [
            'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '000000000000000000000000b118e03f6575aa270673c8d86d6dcb07eb2d9221',
            '000000000000000000000000ecd971253154038c3cfb372e89c905e9db935375'
          ],
          data: '000000000000000000000000000000000000000000000000000000000000000a'
        }
      ],
      decodedLogs: {
        '0': {
          name: 'Transfer',
          events: [
            {
              name: '_from',
              type: 'address',
              value: '0xb118e03f6575aa270673c8d86d6dcb07eb2d9221'
            },
            {
              name: '_to',
              type: 'address',
              value: '0xecd971253154038c3cfb372e89c905e9db935375'
            },
            { name: '_value', type: 'uint256', value: '10' }
          ],
          address: '0xc71f7f479b72b8c953d697e69ead9008e6225845'
        },
        type: 'ERC20'
      },
      tokenDetails: [
        {
          txid: '2e7b9f9ebeb2bc78804e9d69cd4a2ad1df6dd6e7cdb0f89f04cd2b28ec477f14',
          contractAddress: 'c71f7f479b72b8c953d697e69ead9008e6225845',
          decimals: 18,
          name: 'Gold',
          symbol: 'GLD'
        }
      ],
      callData: 'a9059cbb000000000000000000000000ecd971253154038c3cfb372e89c905e9db935375000000000000000000000000000000000000000000000000000000000000000a',
      decodedCallData: {
        type: 'ERC20',
        name: 'transfer',
        params: [
          {
            name: '_to',
            value: '0xecd971253154038c3cfb372e89c905e9db935375',
            type: 'address'
          },
          { name: '_value', value: '10', type: 'uint256' }
        ]
      }
    }
  ]
}, ...]
```

## Block

- `/api/FIRO/:network/block` return last 10 blocks

```bash
[{
  _id: '64114add5ed29c6fe8eb82d4',
  chain: 'FIRO',
  network: 'testnet',
  hash: '000084ad6b373335565cf0237d82c2bf7edcb9cb788c4d8eda545835d6e4bc06',
  height: 2020,
  version: 536870916,
  size: 319,
  merkleRoot: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
  time: '2023-01-05T03:56:44.000Z',
  timeNormalized: '2023-01-05T03:56:44.002Z',
  nonce: null,
  bits: null,
  previousBlockHash: '0000cb85bfaf7f99a54686ae37e1a5de4cb14f1fde9476f7697af42c5d503473',
  nextBlockHash: '',
  reward: 2000000000000,
  transactionCount: 1
}, ...]
```

- `/api/FIRO/:network/block/:blockhash` return block detail

```bash
{
  _id: '64114add5ed29c6fe8eb82d4',
  chain: 'FIRO',
  network: 'testnet',
  hash: '000084ad6b373335565cf0237d82c2bf7edcb9cb788c4d8eda545835d6e4bc06',
  height: 2020,
  version: 536870916,
  size: 319,
  merkleRoot: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
  time: '2023-01-05T03:56:44.000Z',
  timeNormalized: '2023-01-05T03:56:44.002Z',
  nonce: null,
  bits: null,
  previousBlockHash: '0000cb85bfaf7f99a54686ae37e1a5de4cb14f1fde9476f7697af42c5d503473',
  nextBlockHash: '',
  reward: 2000000000000,
  transactionCount: 1,
  confirmations: 1,
  gasUsed: '0',
  gasLimit: '0'
}
```

- `/api/FIRO/:network/block/tip` return last block

```bash
{
  _id: '64114add5ed29c6fe8eb82d4',
  chain: 'FIRO',
  hash: '000084ad6b373335565cf0237d82c2bf7edcb9cb788c4d8eda545835d6e4bc06',
  network: 'testnet',
  bits: null,
  height: 2020,
  merkleRoot: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
  nextBlockHash: '',
  nonce: null,
  previousBlockHash: '0000cb85bfaf7f99a54686ae37e1a5de4cb14f1fde9476f7697af42c5d503473',
  processed: true,
  reward: 2000000000000,
  size: 319,
  time: '2023-01-05T03:56:44.000Z',
  timeNormalized: '2023-01-05T03:56:44.002Z',
  transactionCount: 1,
  version: 536870916
}
```

## Contract

- `/api/FIRO/:network/contract/:contractAddress` get detail of contract

```bash
{
  _id: '641181895ed29c6fe8100ede',
  chain: 'FIRO',
  network: 'testnet',
  txid: '2369bb015204b81e73dc0b5c2addb4510b89863ff6fefd7c03abf3b37a3e9e0e',
  contractAddress: '70ad414b746a418eaaf8d2a02fb41178084314af',
  from: 'b118e03f6575aa270673c8d86d6dcb07eb2d9221',
  gasUsed: '52308',
  name: '',
  balance: 0,
  transactions: 1,
  transfers: 1,
  tokens: []
}
```

- `/api/FIRO/:network/contract/1234` test get contract not found

```bash
{
  message: 'The requested contract address 123 could not be found.'
}
```

- `POST /api/FIRO/:network/contract` verify contract

```bash
# Request Body
{
  file: 'GLDToken.sol',
  version: 'v0.8.17+commit.8df45f5f'
}
```

```bash
{
  chain: 'FIRO',
  network: 'testnet',
  contractName: 'GLDToken'
}
```

- `/api/FIRO/:network/contract/code` get code from verified contract

```sol
// OpenZeppelin Contracts v4.4.0 (utils/Context.sol)

pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
...
```

- `/api/FIRO/:network/contract/abi` get api from verified contract

```bash
[
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [ [Object], [Object], [Object] ],
    name: 'Approval',
    type: 'event'
  },
  ...
]
```

- `/api/FIRO/:network/contract/abi` get event from contract

```bash
[
  {
    _id: '641181895ed29c6fe8100f28',
    txid: '30cb1ee0454b2191ed17a65f569766aecc641b95271105fb9eebbb43b6cabe0a',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2037,
    blockHash: '00001208c0eeb0fd31772f750cc6f2a6a2b65e587a1a7d92faf159808ca15c02',
    blockTime: '2023-03-15T08:27:50.000Z',
    blockTimeNormalized: '2023-03-15T08:27:50.001Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 300,
    fee: 4218540,
    value: 1999995781460,
    weight: 1200,
    vsize: 300,
    receipt: [ [Object] ]
  }
]
```

## Price

- `/api/FIRO/:network/prices` get price of token

```bash
{
  NXC: 330000000,
  FVM: 2000000000
}
```

## Sol-Versions

- `/api/FIRO/:network/solc-versions` get sol-versions for verify code

```bash
[
  'v0.8.17+commit.8df45f5f',
  'v0.8.16+commit.07a7930e',
  'v0.8.15+commit.e14f2714',
  'v0.8.14+commit.80d49f37',
  ... 103 more items
]
```

## Stats

- `/api/FIRO/:network/stats` (block time, total transactions, total blocks)

```bash
{
  block_time: 2953.81,
  total_txns: 2022,
  total_blocks: 2021,
  wallet_address: 0
}
```

- `/api/FIRO/:network/gashistory` return array of gas history

```bash
[ { t: '2023-03-15T05:15:00.000Z', a: 40 } ]
```

- `/api/FIRO/:network/txnshistory` return array of transaction history

```bash
[
  { t: '2023-01-05T00:00:00.000Z', c: 2020 },
  { t: '2023-03-15T00:00:00.000Z', c: 3 }
]
```

## Token

- `/api/FIRO/:network/token` get token list

```bash
[
  {
    _id: '6411842b5ed29c6fe811d6dc',
    chain: 'FIRO',
    network: 'testnet',
    txid: '473354568a8ed52a7dc4a32fecee215f18e9c9eb770d14d651fb67b9e43817c7',
    contractAddress: 'e869eb17746128b2f4ba917c3ce20dc1dc9f0670',
    decimals: 18,
    name: 'Gold',
    symbol: 'GLD',
    totalSupply: '10000000000000000000000',
    officialSite: '',
    socialProfiles: '',
    price: '-1',
    holders: 2
  },
  ...
]
```

- `/api/FIRO/:network/token/:contractAddress` get token by address

```bash
{
  _id: '6411842b5ed29c6fe811d6dc',
  chain: 'FIRO',
  network: 'testnet',
  txid: '473354568a8ed52a7dc4a32fecee215f18e9c9eb770d14d651fb67b9e43817c7',
  contractAddress: 'e869eb17746128b2f4ba917c3ce20dc1dc9f0670',
  decimals: 18,
  name: 'Gold',
  officialSite: '',
  price: '-1',
  socialProfiles: '',
  symbol: 'GLD',
  totalSupply: '10000000000000000000000',
  transfers: 1,
  holders: 2,
  byteCode: '020000000'... 3898 more characters
}
```

- `/api/FIRO/:network/token/:contractAddress/tx` get transaction token by address

```bash
[
  {
    _id: '6411842c5ed29c6fe811d7c1',
    txid: '57c68c7d0b5167a5cd4dd5b272bc41d6ac1d8b246bd922d54393fe161f051466',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2049,
    blockHash: '000097b0b592cb6dbe0d22d4b48eff4d9283f91a3b93e5d175283a1298720901',
    blockTime: '2023-03-15T08:39:06.000Z',
    blockTimeNormalized: '2023-03-15T08:39:06.000Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 299,
    fee: 4218540,
    value: 1999995781460,
    weight: 1196,
    vsize: 299,
    receipt: [ [Object] ]
  },
  {
    _id: '6411842b5ed29c6fe811d6bf',
    txid: '473354568a8ed52a7dc4a32fecee215f18e9c9eb770d14d651fb67b9e43817c7',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2047,
    blockHash: '000096cb5bcb4ba7a4c788ef2f9c434c30bb43169ce68a1a8d816ca195662040',
    blockTime: '2023-03-15T08:39:03.000Z',
    blockTimeNormalized: '2023-03-15T08:39:03.000Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 6949,
    fee: 800698700,
    value: 1999199301300,
    weight: 27796,
    vsize: 6949,
    receipt: [ [Object] ]
  }
]
```

- `/api/FIRO/:network/token/:contractAddress/tokentransfers` get transafer token by address

```bash
[
  {
    _id: '6411842c5ed29c6fe811d7c1',
    txid: '57c68c7d0b5167a5cd4dd5b272bc41d6ac1d8b246bd922d54393fe161f051466',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2049,
    blockHash: '000097b0b592cb6dbe0d22d4b48eff4d9283f91a3b93e5d175283a1298720901',
    blockTime: '2023-03-15T08:39:06.000Z',
    blockTimeNormalized: '2023-03-15T08:39:06.000Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 299,
    fee: 4218540,
    value: 1999995781460,
    weight: 1196,
    vsize: 299,
    receipt: [ [Object] ]
  },
  {
    _id: '6411842b5ed29c6fe811d6bf',
    txid: '473354568a8ed52a7dc4a32fecee215f18e9c9eb770d14d651fb67b9e43817c7',
    network: 'testnet',
    chain: 'FIRO',
    blockHeight: 2047,
    blockHash: '000096cb5bcb4ba7a4c788ef2f9c434c30bb43169ce68a1a8d816ca195662040',
    blockTime: '2023-03-15T08:39:03.000Z',
    blockTimeNormalized: '2023-03-15T08:39:03.000Z',
    coinbase: false,
    locktime: -1,
    inputCount: 1,
    outputCount: 2,
    size: 6949,
    fee: 800698700,
    value: 1999199301300,
    weight: 27796,
    vsize: 6949,
    receipt: [ [Object] ]
  }
]
```

- `/api/FIRO/:network/token/:contractAddress/tokenholder` get tokenholder token by address

```bash
[
  {
    _id: '641184355ed29c6fe811de40',
    chain: 'FIRO',
    network: 'testnet',
    contractAddress: 'e869eb17746128b2f4ba917c3ce20dc1dc9f0670',
    address: 'ecd971253154038c3cfb372e89c905e9db935375',
    balance: '10'
  },
  {
    _id: '6411842b5ed29c6fe811d6d5',
    chain: 'FIRO',
    network: 'testnet',
    contractAddress: 'e869eb17746128b2f4ba917c3ce20dc1dc9f0670',
    address: 'b118e03f6575aa270673c8d86d6dcb07eb2d9221',
    balance: '9999999999999999999990'
  }
]
```

## Transaction

- `/api/FIRO/:network/tx` return last 10 transactions

```bash
[{
  _id: '64114add5ed29c6fe8eb82e0',
  txid: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
  network: 'testnet',
  chain: 'FIRO',
  blockHeight: 2020,
  blockHash: '000084ad6b373335565cf0237d82c2bf7edcb9cb788c4d8eda545835d6e4bc06',
  blockTime: '2023-01-05T03:56:44.000Z',
  blockTimeNormalized: '2023-01-05T03:56:44.002Z',
  coinbase: true,
  locktime: -1,
  inputCount: 1,
  outputCount: 2,
  size: 137,
  fee: -1,
  value: 2000000000000,
  weight: 548,
  vsize: 137,
  receipt: [],
  confirmations: 1
}, ...]
```

- `/api/FIRO/:network/tx/:txId` transaction details by transaction id

```bash
{
  _id: '64114add5ed29c6fe8eb82e0',
  txid: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
  network: 'testnet',
  chain: 'FIRO',
  blockHeight: 2020,
  blockHash: '000084ad6b373335565cf0237d82c2bf7edcb9cb788c4d8eda545835d6e4bc06',
  blockTime: '2023-01-05T03:56:44.000Z',
  blockTimeNormalized: '2023-01-05T03:56:44.002Z',
  coinbase: true,
  locktime: -1,
  inputCount: 1,
  outputCount: 2,
  size: 137,
  fee: -1,
  value: 2000000000000,
  weight: 548,
  vsize: 137,
  receipt: [],
  confirmations: 1
}
```

- `/api/FIRO/:network/tx/:txId/coins` input and output of transaction

```bash
{
  inputs: [],
  outputs: [
    {
      _id: '64114add5ed29c6fe8eb82dc',
      chain: 'FIRO',
      network: 'testnet',
      coinbase: true,
      mintIndex: 0,
      spentTxid: '',
      mintTxid: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
      mintHeight: 2020,
      spentHeight: -2,
      address: 'TS7cQRdd6uU1wu2s94CmYsfe3WNUTctNih',
      script: '76a914b118e03f6575aa270673c8d86d6dcb07eb2d922188ac',
      value: 2000000000000,
      confirmations: -1,
      asm: 'OP_DUP OP_HASH160 b118e03f6575aa270673c8d86d6dcb07eb2d9221 OP_EQUALVERIFY OP_CHECKSIG',
      vinScriptSig: ''
    },
    {
      _id: '64114add5ed29c6fe8eb82dd',
      chain: 'FIRO',
      network: 'testnet',
      coinbase: true,
      mintIndex: 1,
      spentTxid: '',
      mintTxid: '0480bfda58a5df0514943476f8021ae0640b8e6ebca3e9ae3e660022c903d175',
      mintHeight: 2020,
      spentHeight: -2,
      address: 'false',
      script: '6a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
      value: 0,
      confirmations: -1,
      asm: 'OP_RETURN aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf9',
      vinScriptSig: ''
    }
  ]
}
```
