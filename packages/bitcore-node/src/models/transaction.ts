import { ObjectID } from 'bson';
import * as lodash from 'lodash';
import _ from 'lodash';
import { Collection, Decimal128 } from 'mongodb';
import { Readable, Transform } from 'stream';
import { LoggifyClass } from '../decorators/Loggify';
import logger from '../logger';
import { ContractStorage, IContract } from '../modules/firocoin/models/contract';
import { EvmDataStorage } from '../modules/firocoin/models/evmData';
import { IToken, TokenStorage } from '../modules/firocoin/models/token';
import { TokenBalanceStorage } from '../modules/firocoin/models/tokenBalance';
import { Libs } from '../providers/libs';
import { AsyncRPC } from '../rpc';
import { Config } from '../services/config';
import { StorageService } from '../services/storage';
import { SpentHeightIndicators } from '../types/Coin';
import { BitcoinTransaction } from '../types/namespaces/Bitcoin';
import { TransactionJSON } from '../types/Transaction';
import { TransformOptions } from '../types/TransformOptions';
import { partition } from '../utils/partition';
import { MongoBound } from './base';
import { BaseTransaction, ITransaction, ITransactionReceipt } from './baseTransaction';
import { CoinStorage, ICoin } from './coin';
import { EventStorage } from './events';
import { IWalletAddress, WalletAddressStorage } from './walletAddress';
import {
  checkIsTransfer,
  convertToSmallUnit,
  decodeLogs,
  decodeMethod,
  getDataEventTransfer,
} from '../modules/firocoin/utils';
import { TxnsStorage } from '../modules/firocoin/models/txns';
import { GasStorage } from '../modules/firocoin/models/gas';

export { ITransaction };

const { onlyWalletEvents } = Config.get().services.event;
function shouldFire(obj: { wallets?: Array<ObjectID> }) {
  return !onlyWalletEvents || (onlyWalletEvents && obj.wallets && obj.wallets.length > 0);
}
const MAX_BATCH_SIZE = 50000;

export type IBtcTransaction = ITransaction & {
  coinbase: boolean;
  locktime: number;
  inputCount: number;
  outputCount: number;
  size: number;
};

export type TaggedBitcoinTx = BitcoinTransaction & { wallets: Array<ObjectID> };

export interface MintOp {
  updateOne: {
    filter: {
      mintTxid: string;
      mintIndex: number;
      chain: string;
      network: string;
    };
    update: {
      $set: {
        chain: string;
        network: string;
        address: string;
        mintHeight: number;
        coinbase: boolean;
        value: number;
        script: Buffer;
        spentTxid?: string;
        spentHeight?: SpentHeightIndicators;
        wallets?: Array<ObjectID>;
      };
      $setOnInsert: {
        spentHeight: SpentHeightIndicators;
        wallets: Array<ObjectID>;
      };
    };
    upsert: true;
    forceServerObjectId: true;
  };
}

export interface SpendOp {
  updateOne: {
    filter: {
      mintTxid: string;
      mintIndex: number;
      spentHeight: { $lt: SpentHeightIndicators };
      chain: string;
      network: string;
    };
    update: { $set: { spentTxid: string; spentHeight: number } };
  };
}

export interface TxOp {
  updateOne: {
    filter: { txid: string; chain: string; network: string };
    update: {
      $set: {
        chain: string;
        network: string;
        blockHeight: number;
        blockHash?: string;
        blockTime?: Date;
        blockTimeNormalized?: Date;
        coinbase: boolean;
        fee: number;
        size: number;
        locktime: number;
        inputCount: number;
        outputCount: number;
        value: number;
        wallets: Array<ObjectID>;
        mempoolTime?: Date;
      };
      $setOnInsert?: TxOp['updateOne']['update']['$set'];
    };
    upsert: true;
    forceServerObjectId: true;
  };
}

const getUpdatedBatchIfMempool = (batch, height) =>
  height >= SpentHeightIndicators.minimum
    ? batch
    : batch.map((op) => TransactionStorage.toMempoolSafeUpsert(op, height));

export class MempoolSafeTransform extends Transform {
  constructor(private height: number) {
    super({ objectMode: true });
  }

  async _transform(
    coinBatch: Array<{ updateOne: { filter: any; update: { $set: any; $setOnInsert?: any } } }>,
    _,
    done
  ) {
    done(null, getUpdatedBatchIfMempool(coinBatch, this.height));
  }
}

export class MempoolCoinEventTransform extends Transform {
  constructor(private height: number) {
    super({ objectMode: true });
  }

  _transform(coinBatch: Array<MintOp>, _, done) {
    if (this.height < SpentHeightIndicators.minimum) {
      const eventPayload = coinBatch
        .map((coinOp) => {
          const coin = {
            ...coinOp.updateOne.update.$set,
            ...coinOp.updateOne.filter,
            ...coinOp.updateOne.update.$setOnInsert,
          };
          const address = coin.address;
          return { address, coin };
        })
        .filter(({ coin }) => shouldFire(coin));
      EventStorage.signalAddressCoins(eventPayload);
    }
    done(null, coinBatch);
  }
}

export class MempoolTxEventTransform extends Transform {
  constructor(private height: number) {
    super({ objectMode: true });
  }

  _transform(txBatch: Array<TxOp>, _, done) {
    if (this.height < SpentHeightIndicators.minimum) {
      const eventPayload = txBatch
        .map((op) => ({ ...op.updateOne.update.$set, ...op.updateOne.filter, ...op.updateOne.update.$setOnInsert }))
        .filter(shouldFire);
      EventStorage.signalTxs(eventPayload);
    }
    done(null, txBatch);
  }
}

export class MongoWriteStream extends Transform {
  constructor(private collection: Collection) {
    super({ objectMode: true });
  }

  async _transform(data: Array<any>, _, done) {
    await Promise.all(
      partition(data, data.length / Config.get().maxPoolSize).map((batch) => this.collection.bulkWrite(batch))
    );
    done(null, data);
  }
}

export class PruneMempoolStream extends Transform {
  constructor(private chain: string, private network: string, private initialSyncComplete: boolean) {
    super({ objectMode: true });
  }

  async _transform(spendOps: Array<SpendOp>, _, done) {
    await TransactionStorage.pruneMempool({
      chain: this.chain,
      network: this.network,
      initialSyncComplete: this.initialSyncComplete,
      spendOps,
    });
    done(null, spendOps);
  }
}

@LoggifyClass
export class TransactionModel extends BaseTransaction<IBtcTransaction> {
  constructor(storage?: StorageService) {
    super(storage);
  }

  async batchImport(params: {
    txs: Array<BitcoinTransaction>;
    height: number;
    mempoolTime?: Date;
    blockTime?: Date;
    blockHash?: string;
    blockTimeNormalized?: Date;
    parentChain?: string;
    forkHeight?: number;
    chain: string;
    network: string;
    initialSyncComplete: boolean;
  }) {
    const { initialSyncComplete, height, chain, network } = params;

    const mintStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const spentStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const txStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const txReceiptStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const tokenStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const contractStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const rawTxStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const evmDataStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const txnsStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    const gasStream = new Readable({
      objectMode: true,
      read: () => {},
    });

    this.streamMintOps({ ...params, mintStream });
    await new Promise((r) =>
      mintStream
        .pipe(new MempoolSafeTransform(height))
        .pipe(new MongoWriteStream(CoinStorage.collection))
        .pipe(new MempoolCoinEventTransform(height))
        .on('finish', r)
    );

    this.streamSpendOps({ ...params, spentStream });
    await new Promise((r) =>
      spentStream
        .pipe(new PruneMempoolStream(chain, network, initialSyncComplete))
        .pipe(new MongoWriteStream(CoinStorage.collection))
        .on('finish', r)
    );

    this.streamTxOps({ ...params, txs: params.txs as TaggedBitcoinTx[], txStream });
    await new Promise((r) =>
      txStream
        .pipe(new MempoolSafeTransform(height))
        .pipe(new MongoWriteStream(TransactionStorage.collection))
        .pipe(new MempoolTxEventTransform(height))
        .on('finish', r)
    );

    this.streamTxReceipt({ ...params, txs: params.txs, tokenStream, contractStream, txReceiptStream });
    await Promise.all([
      new Promise((r) => tokenStream.pipe(new MongoWriteStream(TokenStorage.collection)).on('finish', r)),
      new Promise((r) => txReceiptStream.pipe(new MongoWriteStream(TransactionStorage.collection)).on('finish', r)),
      new Promise((r) => contractStream.pipe(new MongoWriteStream(ContractStorage.collection)).on('finish', r)),
    ]);

    this.streamGetRawTx({ ...params, txs: params.txs, rawTxStream, evmDataStream, txnsStream, gasStream });
    await Promise.all([
      new Promise((r) => rawTxStream.pipe(new MongoWriteStream(TransactionStorage.collection)).on('finish', r)),
      new Promise((r) => evmDataStream.pipe(new MongoWriteStream(EvmDataStorage.collection)).on('finish', r)),
      new Promise((r) => txnsStream.pipe(new MongoWriteStream(TxnsStorage.collection)).on('finish', r)),
      new Promise((r) => gasStream.pipe(new MongoWriteStream(GasStorage.collection)).on('finish', r)),
    ]);
  }

  async streamTxReceipt({ chain, network, txs, tokenStream, contractStream, txReceiptStream }) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { username, password, host, port } = chainConfig.rpc;
    const rpc = new AsyncRPC(username, password, host, port);
    try {
      const tokenStreamData: any = [];
      const contractStreamData: any = [];
      const txReceiptStreamData: any = [];
      await Promise.all(
        txs.map(async (tx) => {
          const txid = tx.hash;
          try {
            const result = await rpc.call('gettransactionreceipt', [txid]);
            const checkCreateContract =
              result.length > 0 &&
              result[0].contractAddress &&
              result[0].to === '0000000000000000000000000000000000000000';
            if (checkCreateContract) {
              const contractAddress = result[0].contractAddress;
              const decimals = await rpc.call('frc20decimals', [contractAddress]);
              const name = await rpc.call('frc20name', [contractAddress]);
              const symbol = await rpc.call('frc20symbol', [contractAddress]);
              let totalSupply = '0';
              try {
                totalSupply = await rpc.call('frc20totalsupply', [contractAddress]);
              } catch (error) {
                if ((error as any).message && (error as any).message !== 'Integer Division by zero.') {
                  throw error;
                }
              }
              const checkIsERC20 = decimals !== 0 && name !== '' && symbol !== '' && totalSupply !== '0';
              if (checkIsERC20) {
                totalSupply = convertToSmallUnit({ amount: totalSupply, decimals });
                const token: IToken = {
                  chain,
                  network,
                  txid,
                  contractAddress,
                  decimals,
                  name,
                  symbol,
                  totalSupply: Decimal128.fromString(totalSupply),
                  officialSite: '',
                  socialProfiles: '',
                  price: '-1',
                };
                tokenStreamData.push({
                  updateOne: {
                    filter: { txid, chain, network },
                    update: {
                      $set: token,
                    },
                    upsert: true,
                    forceServerObjectId: true,
                  },
                });
                result[0].name = name;
                result[0].decimals = decimals;
                result[0].symbol = symbol;
                result[0].totalSupply = totalSupply;
              }
              const contract: IContract = {
                chain,
                network,
                txid,
                contractAddress,
                from: result[0].from,
                gasUsed: '0',
                name: '',
              };
              contractStreamData.push({
                updateOne: {
                  filter: { txid, chain, network },
                  update: {
                    $set: contract,
                  },
                  upsert: true,
                  forceServerObjectId: true,
                },
              });
            }

            const checkCallContract =
              result.length > 0 &&
              result[0].contractAddress &&
              result[0].to !== '0000000000000000000000000000000000000000';
            if (checkCallContract) {
              const contractAddress = result[0].to;
              const contract = await ContractStorage.collection.findOne({ contractAddress, chain, network });
              if (contract) {
                contractStreamData.push({
                  updateOne: {
                    filter: { contractAddress, chain, network },
                    update: {
                      $set: {
                        gasUsed: (BigInt(contract.gasUsed) + BigInt(result[0].gasUsed)).toString(),
                      },
                    },
                    upsert: true,
                    forceServerObjectId: true,
                  },
                });
              }
            }

            const isTransfer = checkIsTransfer(result);
            if (isTransfer) {
              result[0].events = [];
              const { from, to, value, contractAddress } = getDataEventTransfer(result[0]);
              const fromTokenBalance = await TokenBalanceStorage.collection.findOne({ contractAddress, address: from });
              let balanceFrom = Decimal128.fromString('0');
              if (fromTokenBalance && from !== to) {
                const newBalance = BigInt(fromTokenBalance.balance.toString()) - value;
                balanceFrom = Decimal128.fromString(newBalance < 0 ? '0' : newBalance.toString());
              } else {
                balanceFrom = Decimal128.fromString('0');
              }
              TokenBalanceStorage.collection.updateOne(
                { contractAddress, address: from },
                {
                  $set: {
                    chain,
                    network,
                    contractAddress,
                    address: from,
                    balance: balanceFrom,
                  },
                },
                { upsert: true }
              );
              const toTokenBalance = await TokenBalanceStorage.collection.findOne({ contractAddress, address: to });
              let balanceTo = Decimal128.fromString('0');
              if (toTokenBalance && from !== to) {
                const newBalance = BigInt(toTokenBalance.balance.toString()) + value;
                balanceTo = Decimal128.fromString(newBalance.toString());
              } else {
                balanceTo = Decimal128.fromString(value.toString());
              }
              TokenBalanceStorage.collection.updateOne(
                { contractAddress, address: to },
                {
                  $set: {
                    chain,
                    network,
                    contractAddress,
                    address: to,
                    balance: balanceTo,
                  },
                },
                { upsert: true }
              );

              // TODO: Remove this events use decode logs instead
              result[0].events.push({
                type: 'transfer',
                from,
                to,
                value: value.toString(),
              });
            }

            const checkLog = result.length > 0 && result[0].log.length > 0;
            if (checkLog) {
              const logs: any[] = [];
              for (let l of result[0].log) {
                logs.push({
                  address: `0x${l.address}`,
                  topics: l.topics.map((topic) => `0x${topic}`),
                  data: `0x${l.data}`,
                });
              }
              result[0].decodedLogs = await decodeLogs(logs, result[0].contractAddress);
              if (isTransfer) {
                result[0].tokenDetails = [];
                for (const property in result[0].decodedLogs) {
                  let contractAddress = result[0].decodedLogs[property].address;
                  if (contractAddress) {
                    contractAddress = contractAddress.replace('0x', '');
                    const token = await TokenStorage.collection.findOne({ chain, network, contractAddress });
                    if (token) {
                      result[0].tokenDetails.push({
                        txid: token.txid,
                        contractAddress: token.contractAddress,
                        decimals: token.decimals,
                        name: token.name,
                        symbol: token.symbol,
                      });
                    }
                  }
                }
              }
            }

            txReceiptStreamData.push({
              updateOne: {
                filter: { txid, chain, network },
                update: {
                  $set: {
                    receipt: result,
                  },
                },
                upsert: true,
                forceServerObjectId: true,
              },
            });
          } catch (err) {
            console.error({ chain, network, txid });
            console.error(err);
            throw err;
          }
        })
      );
      tokenStream.push(tokenStreamData);
      contractStream.push(contractStreamData);
      txReceiptStream.push(txReceiptStreamData);
    } finally {
      tokenStream.push(null);
      contractStream.push(null);
      txReceiptStream.push(null);
    }
  }

  async streamGetRawTx({ chain, network, txs, rawTxStream, evmDataStream, txnsStream, gasStream }) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { username, password, host, port } = chainConfig.rpc;
    const rpc = new AsyncRPC(username, password, host, port);
    try {
      const txnsStreamData: any = [];
      const evmDataStreamData: any = [];
      const rawTxStreamData: any = [];
      const gasStreamData: any = [];
      await Promise.all(
        txs.map(async (tx) => {
          const txid = tx.hash;
          const transaction = await TransactionStorage.collection.findOne({ txid, chain, network });
          let receipt: Array<ITransactionReceipt> | undefined = [];
          if (transaction) {
            receipt = transaction.receipt;
            txnsStreamData.push({
              insertOne: {
                timestamp: transaction.blockTime!,
                metadata: { txid: transaction.txid },
              },
            });
          }
          try {
            const result = await rpc.call('getrawtransaction', [txid, true]);
            for (let vout of result.vout) {
              const asm = vout.scriptPubKey.asm.split(' ');
              let evmData: any = {};
              if (asm[asm.length - 1] === 'OP_CREATE') {
                evmData = {
                  chain,
                  network,
                  txid,
                  version: asm[asm.length - 5],
                  fvmGasLimit: asm[asm.length - 4],
                  fvmGasPrice: asm[asm.length - 3],
                  callData: asm[asm.length - 2],
                  contract: '',
                  op: 'OP_CREATE',
                  byteCode: result.hex,
                };
              } else if (asm[asm.length - 1] === 'OP_CALL') {
                evmData = {
                  chain,
                  network,
                  txid,
                  version: asm[asm.length - 6],
                  fvmGasLimit: asm[asm.length - 5],
                  fvmGasPrice: asm[asm.length - 4],
                  callData: asm[asm.length - 3],
                  contract: asm[asm.length - 2],
                  op: 'OP_CALL',
                  byteCode: result.hex,
                };
              }
              if (Object.keys(evmData).length !== 0) {
                evmDataStreamData.push({
                  updateOne: {
                    filter: { txid, chain, network },
                    update: {
                      $set: evmData,
                    },
                    upsert: true,
                    forceServerObjectId: true,
                  },
                });
                if (receipt && receipt.length > 0) {
                  receipt[0].callData = evmData.callData;
                  receipt[0].decodedCallData = await decodeMethod(`0x${evmData.callData}`, receipt[0].contractAddress);
                  gasStreamData.push({
                    insertOne: {
                      timestamp: transaction!.blockTime,
                      metadata: { txid: transaction!.txid },
                      gasPrice: Number(evmData.fvmGasPrice),
                    },
                  });
                }
              }
            }
            for (let vin of result.vin) {
              if (vin.scriptSig) {
                CoinStorage.collection.updateOne(
                  {
                    mintTxid: vin.txid,
                    mintIndex: vin.vout,
                    chain,
                    network,
                  },
                  {
                    $set: {
                      vinScriptSig: Buffer.from(vin.scriptSig.hex, 'hex'),
                    },
                  },
                  { upsert: true }
                );
              }
            }
            rawTxStreamData.push({
              updateOne: {
                filter: { txid, chain, network },
                update: {
                  $set: {
                    weight: result.weight,
                    vsize: result.vsize,
                    receipt,
                  },
                },
                upsert: true,
                forceServerObjectId: true,
              },
            });
          } catch (err) {
            console.error({ chain, network, txid });
            console.error(err);
            throw err;
          }
        })
      );
      txnsStream.push(txnsStreamData);
      rawTxStream.push(rawTxStreamData);
      evmDataStream.push(evmDataStreamData);
      gasStream.push(gasStreamData);
    } finally {
      txnsStream.push(null);
      rawTxStream.push(null);
      evmDataStream.push(null);
      gasStream.push(null);
    }
  }

  async streamTxOps(params: {
    txs: Array<TaggedBitcoinTx>;
    height: number;
    blockTime?: Date;
    blockHash?: string;
    blockTimeNormalized?: Date;
    parentChain?: string;
    forkHeight?: number;
    initialSyncComplete: boolean;
    chain: string;
    network: string;
    mempoolTime?: Date;
    txStream: Readable;
  }) {
    let { blockHash, blockTime, blockTimeNormalized, chain, height, network, parentChain, forkHeight, mempoolTime } =
      params;
    if (parentChain && forkHeight && height < forkHeight) {
      const parentTxs = await TransactionStorage.collection
        .find({ blockHeight: height, chain: parentChain, network })
        .toArray();
      params.txStream.push(
        parentTxs.map((parentTx) => {
          return {
            updateOne: {
              filter: { txid: parentTx.txid, chain, network },
              update: {
                $set: {
                  chain,
                  network,
                  blockHeight: height,
                  blockHash,
                  blockTime,
                  blockTimeNormalized,
                  coinbase: parentTx.coinbase,
                  fee: parentTx.fee,
                  size: parentTx.size,
                  locktime: parentTx.locktime,
                  inputCount: parentTx.inputCount,
                  outputCount: parentTx.outputCount,
                  value: parentTx.value,
                  wallets: [],
                  ...(mempoolTime && { mempoolTime }),
                },
              },
              upsert: true,
              forceServerObjectId: true,
            },
          };
        })
      );
    } else {
      let spentQuery;
      if (height > 0) {
        spentQuery = { spentHeight: height, chain, network };
      } else {
        spentQuery = { spentTxid: { $in: params.txs.map((tx) => tx._hash) }, chain, network };
      }
      const spent = await CoinStorage.collection
        .find(spentQuery)
        .project({ spentTxid: 1, value: 1, wallets: 1 })
        .toArray();
      interface CoinGroup {
        [txid: string]: { total: number; wallets: Array<ObjectID> };
      }
      const groupedSpends = spent.reduce<CoinGroup>((agg, coin) => {
        if (!agg[coin.spentTxid]) {
          agg[coin.spentTxid] = {
            total: coin.value,
            wallets: coin.wallets ? [...coin.wallets] : [],
          };
        } else {
          agg[coin.spentTxid].total += coin.value;
          agg[coin.spentTxid].wallets.push(...coin.wallets);
        }
        return agg;
      }, {});

      let txBatch = new Array<TxOp>();
      for (let tx of params.txs) {
        const txid = tx._hash!;
        const spent = groupedSpends[txid] || {};
        const mintedWallets = tx.wallets || [];
        const spentWallets = spent.wallets || [];
        const txWallets = mintedWallets.concat(spentWallets);
        const wallets = lodash.uniqBy(txWallets, (wallet) => wallet.toHexString());
        let fee = 0;
        if (groupedSpends[txid]) {
          // TODO: Fee is negative for mempool txs
          fee = groupedSpends[txid].total - tx.outputAmount;
          if (fee < 0) {
            logger.debug('negative fee', txid, groupedSpends[txid], tx.outputAmount);
          }
        }

        txBatch.push({
          updateOne: {
            filter: { txid, chain, network },
            update: {
              $set: {
                chain,
                network,
                blockHeight: height,
                blockHash,
                blockTime,
                blockTimeNormalized,
                coinbase: tx.isCoinbase(),
                fee,
                size: tx.toBuffer().length,
                locktime: tx.nLockTime,
                inputCount: tx.inputs.length,
                outputCount: tx.outputs.length,
                value: tx.outputAmount,
                wallets,
                ...(mempoolTime && { mempoolTime }),
              },
            },
            upsert: true,
            forceServerObjectId: true,
          },
        });

        if (txBatch.length > MAX_BATCH_SIZE) {
          params.txStream.push(txBatch);
          txBatch = new Array<TxOp>();
        }
      }
      if (txBatch.length) {
        params.txStream.push(txBatch);
      }
      params.txStream.push(null);
    }
  }

  async tagMintBatch(params: {
    chain: string;
    network: string;
    initialSyncComplete: boolean;
    mintBatch: Array<MintOp>;
    txs: Array<BitcoinTransaction>;
  }) {
    const { chain, network, initialSyncComplete, mintBatch } = params;
    const walletConfig = Config.for('api').wallets;
    if (initialSyncComplete || (walletConfig && walletConfig.allowCreationBeforeCompleteSync)) {
      let addressBatch = new Set<string>();
      let wallets: IWalletAddress[] = [];

      const findWalletsForAddresses = async (addresses: Array<string>) => {
        let partialWallets = await WalletAddressStorage.collection
          .find({ address: { $in: addresses }, chain, network }, { batchSize: 100 })
          .project({ wallet: 1, address: 1 })
          .toArray();
        return partialWallets;
      };

      for (let mintOp of mintBatch) {
        addressBatch.add(mintOp.updateOne.update.$set.address);
        if (addressBatch.size >= 1000) {
          const batchWallets = await findWalletsForAddresses(Array.from(addressBatch));
          wallets = wallets.concat(batchWallets);
          addressBatch.clear();
        }
      }
      const remainingBatch = await findWalletsForAddresses(Array.from(addressBatch));
      wallets = wallets.concat(remainingBatch);

      if (wallets.length) {
        for (let mintOp of mintBatch) {
          let transformedWallets = wallets
            .filter((wallet) => wallet.address === mintOp.updateOne.update.$set.address)
            .map((wallet) => wallet.wallet);
          mintOp.updateOne.update.$set.wallets = transformedWallets;
          delete mintOp.updateOne.update.$setOnInsert.wallets;
          if (!Object.keys(mintOp.updateOne.update.$setOnInsert).length) {
            delete mintOp.updateOne.update.$setOnInsert;
          }
        }

        for (let tx of params.txs as Array<TaggedBitcoinTx>) {
          const coinsForTx = mintBatch.filter((mint) => mint.updateOne.filter.mintTxid === tx._hash!);
          tx.wallets = coinsForTx.reduce((wallets, c) => {
            wallets = wallets.concat(c.updateOne.update.$set.wallets!);
            return wallets;
          }, new Array<ObjectID>());
        }
      }
    }
  }

  async streamMintOps(params: {
    txs: Array<BitcoinTransaction>;
    height: number;
    parentChain?: string;
    forkHeight?: number;
    initialSyncComplete: boolean;
    chain: string;
    network: string;
    mintStream: Readable;
  }) {
    let { chain, height, network, parentChain, forkHeight } = params;
    let parentChainCoinsMap = new Map();
    if (parentChain && forkHeight && height < forkHeight) {
      let parentChainCoins = await CoinStorage.collection
        .find({
          chain: parentChain,
          network,
          mintHeight: height,
          $or: [{ spentHeight: { $lt: SpentHeightIndicators.minimum } }, { spentHeight: { $gte: forkHeight } }],
        })
        .project({ mintTxid: 1, mintIndex: 1 })
        .toArray();
      for (let parentChainCoin of parentChainCoins) {
        parentChainCoinsMap.set(`${parentChainCoin.mintTxid}:${parentChainCoin.mintIndex}`, true);
      }
    }
    let mintBatch = new Array<MintOp>();
    for (let tx of params.txs) {
      tx._hash = tx.hash;
      let isCoinbase = tx.isCoinbase();
      for (let [index, output] of tx.outputs.entries()) {
        if (
          parentChain &&
          forkHeight &&
          height < forkHeight &&
          (!parentChainCoinsMap.size || !parentChainCoinsMap.get(`${tx._hash}:${index}`))
        ) {
          continue;
        }
        let address = '';
        if (output.script) {
          address = output.script.toAddress(network).toString(true);
          if (address === 'false' && output.script.classify() === 'Pay to public key') {
            let hash = Libs.get(chain).lib.crypto.Hash.sha256ripemd160(output.script.chunks[0].buf);
            address = Libs.get(chain).lib.Address(hash, network).toString(true);
          }
        }
        mintBatch.push({
          updateOne: {
            filter: {
              mintTxid: tx._hash,
              mintIndex: index,
              chain,
              network,
            },
            update: {
              $set: {
                chain,
                network,
                address,
                mintHeight: height,
                coinbase: isCoinbase,
                value: output.satoshis,
                script: output.script && output.script.toBuffer(),
              },
              $setOnInsert: {
                spentHeight: SpentHeightIndicators.unspent,
                wallets: [],
              },
            },
            upsert: true,
            forceServerObjectId: true,
          },
        });
      }
      if (mintBatch.length >= MAX_BATCH_SIZE) {
        await this.tagMintBatch({ ...params, mintBatch });
        params.mintStream.push(mintBatch);
        mintBatch = new Array<MintOp>();
      }
    }
    if (mintBatch.length) {
      await this.tagMintBatch({ ...params, mintBatch });
      params.mintStream.push(mintBatch);
    }
    params.mintStream.push(null);
    mintBatch = new Array<MintOp>();
  }

  streamSpendOps(params: {
    txs: Array<BitcoinTransaction>;
    height: number;
    parentChain?: string;
    forkHeight?: number;
    chain: string;
    network: string;
    spentStream: Readable;
  }) {
    let { chain, network, height, parentChain, forkHeight } = params;
    if (parentChain && forkHeight && height < forkHeight) {
      params.spentStream.push(null);
      return;
    }
    let spendOpsBatch = new Array<SpendOp>();
    for (let tx of params.txs) {
      if (tx.isCoinbase()) {
        continue;
      }
      for (let input of tx.inputs) {
        let inputObj = input.toObject();
        const updateQuery = {
          updateOne: {
            filter: {
              mintTxid: inputObj.prevTxId,
              mintIndex: inputObj.outputIndex,
              spentHeight: { $lt: SpentHeightIndicators.minimum },
              chain,
              network,
            },
            update: {
              $set: { spentTxid: tx._hash || tx.hash, spentHeight: height, sequenceNumber: inputObj.sequenceNumber },
            },
          },
        };
        spendOpsBatch.push(updateQuery);
      }
      if (spendOpsBatch.length > MAX_BATCH_SIZE) {
        params.spentStream.push(spendOpsBatch);
        spendOpsBatch = new Array<SpendOp>();
      }
    }
    if (spendOpsBatch.length) {
      params.spentStream.push(spendOpsBatch);
    }
    params.spentStream.push(null);
    spendOpsBatch = new Array<SpendOp>();
  }

  async findAllRelatedOutputs(forTx: string) {
    const seen = {};
    const getOutputs = (txid: string) =>
      CoinStorage.collection.find({ mintTxid: txid, mintHeight: { $ne: -3 } }).toArray();
    let batch = await getOutputs(forTx);
    let allRelatedCoins = new Array<ICoin>();
    while (batch.length) {
      allRelatedCoins = allRelatedCoins.concat(batch);
      let newBatch = new Array<ICoin>();
      for (const coin of batch) {
        seen[coin.mintTxid] = true;
        if (coin.spentTxid && !seen[coin.spentTxid]) {
          const outputs = await getOutputs(coin.spentTxid);
          newBatch = newBatch.concat(outputs);
        }
      }
      batch = newBatch;
    }
    return allRelatedCoins;
  }

  async *yieldRelatedOutputs(forTx: string) {
    const seen = {};
    const getOutputs = (txid: string) =>
      CoinStorage.collection.find({ mintTxid: txid, mintHeight: { $ne: -3 } }).toArray();
    let batch = await getOutputs(forTx);
    while (batch.length) {
      for (const coin of batch) {
        seen[coin.mintTxid] = true;
        yield coin;
      }
      let newBatch = new Array<ICoin>();
      for (const coin of batch) {
        if (coin.spentTxid && !seen[coin.spentTxid]) {
          const outputs = await getOutputs(coin.spentTxid);
          seen[coin.spentTxid] = true;
          newBatch = newBatch.concat(outputs);
        }
      }
      batch = newBatch;
    }
  }

  async pruneMempool(params: {
    chain: string;
    network: string;
    spendOps: Array<SpendOp>;
    initialSyncComplete: boolean;
  }) {
    const { chain, network, spendOps, initialSyncComplete } = params;
    if (!initialSyncComplete || !spendOps.length) {
      return;
    }
    let coins = await CoinStorage.collection
      .find({
        chain,
        network,
        spentHeight: SpentHeightIndicators.pending,
        mintTxid: { $in: spendOps.map((s) => s.updateOne.filter.mintTxid) },
      })
      .project({ mintTxid: 1, mintIndex: 1, spentTxid: 1 })
      .toArray();
    coins = coins.filter(
      (c) =>
        spendOps.findIndex(
          (s) =>
            s.updateOne.filter.mintTxid === c.mintTxid &&
            s.updateOne.filter.mintIndex === c.mintIndex &&
            s.updateOne.update.$set.spentTxid !== c.spentTxid
        ) > -1
    );

    const invalidatedTxids = Array.from(new Set(coins.map((c) => c.spentTxid)));

    for (const txid of invalidatedTxids) {
      const allRelatedCoins = await this.findAllRelatedOutputs(txid);
      const spentTxids = new Set(allRelatedCoins.filter((c) => c.spentTxid).map((c) => c.spentTxid));
      const txids = [txid].concat(Array.from(spentTxids));
      await Promise.all([
        this.collection.update(
          { chain, network, txid: { $in: txids } },
          { $set: { blockHeight: SpentHeightIndicators.conflicting } },
          { multi: true }
        ),
        CoinStorage.collection.update(
          { chain, network, mintTxid: { $in: txids } },
          { $set: { mintHeight: SpentHeightIndicators.conflicting } },
          { multi: true }
        ),
      ]);
    }

    return;
  }

  _apiTransform(tx: Partial<MongoBound<IBtcTransaction>>, options?: TransformOptions): TransactionJSON | string {
    const transaction: TransactionJSON = {
      _id: tx._id ? tx._id.toString() : '',
      txid: tx.txid || '',
      network: tx.network || '',
      chain: tx.chain || '',
      blockHeight: tx.blockHeight || -1,
      blockHash: tx.blockHash || '',
      blockTime: tx.blockTime ? tx.blockTime.toISOString() : '',
      blockTimeNormalized: tx.blockTimeNormalized ? tx.blockTimeNormalized.toISOString() : '',
      coinbase: tx.coinbase || false,
      locktime: tx.locktime || -1,
      inputCount: tx.inputCount || -1,
      outputCount: tx.outputCount || -1,
      size: tx.size || -1,
      fee: tx.fee || -1,
      value: tx.value || -1,
      weight: tx.weight || -1,
      vsize: tx.vsize || -1,
      receipt: tx.receipt || [],
    };

    if (tx.receipt && tx.receipt.length > 0) {
      transaction.internals = [
        {
          type: 'call_0_1',
          from: '0xb3c0b3d3803d6c9acf6c1af89bf1cb728f8331b6',
          to: '0xd703ea3e1d1b8a0ffa6f1123ab8373dd539bb654',
          value: 100000,
          gasLimit: 1000
        },
        {
          type: 'call_0_1',
          from: '0xb3c0b3d3803d6c9acf6c1af89bf1cb728f8331b6',
          to: '0xe1b8e76dc4a5d13ac406b306c48573f080623390',
          value: 33000,
          gasLimit: 2500
        }
      ];
    }

    if (options && options.object) {
      return transaction;
    }

    return JSON.stringify(transaction);
  }
}
export let TransactionStorage = new TransactionModel();
