import { Decimal128 } from 'mongodb';
import { LoggifyClass } from '../decorators/Loggify';
import logger from '../logger';
import { ContractStorage } from '../modules/firocoin/models/contract';
import { EvmDataStorage } from '../modules/firocoin/models/evmData';
import { TokenStorage } from '../modules/firocoin/models/token';
import { TokenBalanceStorage } from '../modules/firocoin/models/tokenBalance';
import { checkIsTransfer, getDataEventTransfer } from '../modules/firocoin/utils';
import { StorageService } from '../services/storage';
import { SpentHeightIndicators } from '../types/Coin';
import { BitcoinBlockType, BitcoinHeaderObj } from '../types/namespaces/Bitcoin';
import { TransformOptions } from '../types/TransformOptions';
import { MongoBound } from './base';
import { BaseBlock, IBlock } from './baseBlock';
import { CoinStorage } from './coin';
import { EventStorage } from './events';
import { TransactionStorage } from './transaction';

export type IBtcBlock = IBlock & {
  version: number;
  merkleRoot: string;
  bits: number;
  nonce: number;
};

@LoggifyClass
export class BitcoinBlock extends BaseBlock<IBtcBlock> {
  constructor(storage?: StorageService) {
    super(storage);
  }

  async addBlock(params: {
    block: BitcoinBlockType;
    parentChain?: string;
    forkHeight?: number;
    initialSyncComplete: boolean;
    chain: string;
    network: string;
  }) {
    const { block, chain, network } = params;
    const header = block.header.toObject();

    const reorg = await this.handleReorg({ header, chain, network });

    if (reorg) {
      return Promise.reject('reorg');
    }
    return this.processBlock(params);
  }

  async processBlock(params: {
    block: BitcoinBlockType;
    parentChain?: string;
    forkHeight?: number;
    initialSyncComplete: boolean;
    chain: string;
    network: string;
  }) {
    const { chain, network, block, parentChain, forkHeight, initialSyncComplete } = params;
    const blockOp = await this.getBlockOp(params);
    const convertedBlock = blockOp.updateOne.update.$set;
    const { height, timeNormalized, time } = convertedBlock;

    const previousBlock = await this.collection.findOne({ hash: convertedBlock.previousBlockHash, chain, network });

    await this.collection.bulkWrite([blockOp]);
    if (previousBlock) {
      await this.collection.updateOne(
        { chain, network, hash: previousBlock.hash },
        { $set: { nextBlockHash: convertedBlock.hash } }
      );
      logger.debug('Updating previous block.nextBlockHash ', convertedBlock.hash);
    }

    await TransactionStorage.batchImport({
      txs: block.transactions,
      blockHash: convertedBlock.hash,
      blockTime: new Date(time),
      blockTimeNormalized: new Date(timeNormalized),
      height,
      chain,
      network,
      parentChain,
      forkHeight,
      initialSyncComplete,
    });

    if (initialSyncComplete) {
      EventStorage.signalBlock(convertedBlock);
    }

    await this.collection.updateOne({ hash: convertedBlock.hash, chain, network }, { $set: { processed: true } });
  }

  async getBlockOp(params: { block: BitcoinBlockType; chain: string; network: string }) {
    const { block, chain, network } = params;
    const header = block.header.toObject();
    const blockTime = header.time * 1000;

    const previousBlock = await this.collection.findOne({ hash: header.prevHash, chain, network });

    const blockTimeNormalized = (() => {
      const prevTime = previousBlock ? new Date(previousBlock.timeNormalized) : null;
      if (prevTime && blockTime <= prevTime.getTime()) {
        return prevTime.getTime() + 1;
      } else {
        return blockTime;
      }
    })();

    const height = (previousBlock && previousBlock.height + 1) || 1;
    logger.debug('Setting blockheight: ' + height);

    const convertedBlock: IBtcBlock = {
      chain,
      network,
      hash: block.hash,
      height,
      version: header.version,
      nextBlockHash: '',
      previousBlockHash: header.prevHash,
      merkleRoot: header.merkleRoot,
      time: new Date(blockTime),
      timeNormalized: new Date(blockTimeNormalized),
      bits: header.bits,
      nonce: header.nonce,
      transactionCount: block.transactions.length,
      size: block.toBuffer().length,
      reward: block.transactions[0].outputAmount,
      processed: false,
    };
    return {
      updateOne: {
        filter: {
          hash: header.hash,
          chain,
          network,
        },
        update: {
          $set: convertedBlock,
        },
        upsert: true,
      },
    };
  }

  async handleReorg(params: { header?: BitcoinHeaderObj; chain: string; network: string }): Promise<boolean> {
    const { header, chain, network } = params;
    let localTip = await this.getLocalTip(params);
    if (header && localTip && localTip.hash === header.prevHash) {
      return false;
    }
    if (!localTip || localTip.height === 0) {
      return false;
    }
    if (header) {
      const prevBlock = await this.collection.findOne({ chain, network, hash: header.prevHash });
      if (prevBlock) {
        localTip = prevBlock;
      } else {
        logger.error("Previous block isn't in the DB need to roll back until we have a block in common");
      }
      logger.info(`Resetting tip to ${localTip.height - 1}`, { chain, network });
    }

    const txs = await TransactionStorage.collection
      .find({ chain, network, blockHeight: { $gte: localTip.height } })
      .toArray();
    for (let tx of txs) {
      if (tx.receipt && checkIsTransfer(tx.receipt)) {
        const { from, to, value, contractAddress } = getDataEventTransfer(tx.receipt[0]);
        const fromTokenBalance = await TokenBalanceStorage.collection.findOne({ contractAddress, address: from });
        let balanceFrom = Decimal128.fromString('0');
        if (fromTokenBalance) {
          const newBalance = BigInt(fromTokenBalance.balance.toString()) + value;
          balanceFrom = Decimal128.fromString(newBalance.toString());
        } else {
          balanceFrom = Decimal128.fromString(value.toString());
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
        if (toTokenBalance) {
          const newBalance = BigInt(toTokenBalance.balance.toString()) - value;
          balanceTo = Decimal128.fromString(newBalance < 0 ? '0' : newBalance.toString());
        } else {
          balanceTo = Decimal128.fromString('0');
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
      }

      const token = await TokenStorage.collection.findOne({ txid: tx.txid });
      if (token) {
        await TokenBalanceStorage.collection.deleteMany({ contractAddress: token.contractAddress });
      }
      const reorgOps = [
        TokenStorage.collection.deleteMany({ txid: tx.txid }),
        ContractStorage.collection.deleteMany({ txid: tx.txid }),
        EvmDataStorage.collection.deleteMany({ txid: tx.txid }),
      ];
      await Promise.all(reorgOps);
    }

    const reorgOps = [
      this.collection.deleteMany({ chain, network, height: { $gte: localTip.height } }),
      TransactionStorage.collection.deleteMany({ chain, network, blockHeight: { $gte: localTip.height } }),
      CoinStorage.collection.deleteMany({ chain, network, mintHeight: { $gte: localTip.height } }),
    ];
    await Promise.all(reorgOps);

    await CoinStorage.collection.updateMany(
      { chain, network, spentHeight: { $gte: localTip.height } },
      { $set: { spentTxid: null, spentHeight: SpentHeightIndicators.unspent } }
    );

    logger.debug('Removed data from above blockHeight: ', localTip.height);
    return true;
  }

  _apiTransform(block: Partial<MongoBound<IBtcBlock>>, options?: TransformOptions): any {
    const transform = {
      _id: block._id,
      chain: block.chain,
      network: block.network,
      hash: block.hash,
      height: block.height,
      version: block.version,
      size: block.size,
      merkleRoot: block.merkleRoot,
      time: block.time,
      timeNormalized: block.timeNormalized,
      nonce: block.nonce,
      bits: block.bits,
      /*
       *difficulty: block.difficulty,
       */
      /*
       *chainWork: block.chainWork,
       */
      previousBlockHash: block.previousBlockHash,
      nextBlockHash: block.nextBlockHash,
      reward: block.reward,
      /*
       *isMainChain: block.mainChain,
       */
      transactionCount: block.transactionCount,
      /*
       *minedBy: BlockModel.getPoolInfo(block.minedBy)
       */
    };
    if (options && options.object) {
      return transform;
    }
    return JSON.stringify(transform);
  }
}

export let BitcoinBlockStorage = new BitcoinBlock();
