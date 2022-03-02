import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { AsyncRPC } from '../../../rpc';
import { Config } from '../../../services/config';
import { StorageService } from '../../../services/storage';

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  contractAddress?: string;
  excepted: string;
  bloom: string;
  log: Array<any>;
}

export interface IContract {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  contractAddress: string;
  from: string;
  transactionReceipt: TransactionReceipt;
}

export class ContractModel extends BaseModel<IContract> {
  constructor(storage?: StorageService) {
    super('contracts', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1 }, { background: true });
    // this.collection.createIndex({ chain: 1, network: 1 }, { background: true });
    // this.collection.createIndex({ txid: 1 }, { background: true });
    // this.collection.createIndex({ contractAddress: 1 }, { background: true });
    // this.collection.createIndex({ from: 1 }, { background: true });
  }

  async getContract({ chain, network, contractAddress }) {
    const contract = await this.collection.findOne({ chain, network, contractAddress });
    return contract as IContract;
  }

  async processContract({ chain, network, txid }) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { username, password, host, port } = chainConfig.rpc;
    const rpc = new AsyncRPC(username, password, host, port);
    try {
      console.log('[txid]', txid);
      const result = await rpc.call('gettransactionreceipt', [txid]);
      if (result.length > 0) {
        const query = { txid };
        const options = { upsert: true };
        const txResult = result[0];
        if (txResult.contractAddress) {
          const contract: IContract = {
            chain,
            network,
            txid,
            contractAddress: txResult.contractAddress,
            from: txResult.from,
            transactionReceipt: txResult
          };
          await ContractStorage.collection.updateOne(query, { $set: contract }, options);
        }
      }
    } catch (err) {
      console.error({ chain, network, txid });
      console.error(err);
      this.processContract({ chain, network, txid });
    }
  }

  _apiTransform(contract: IContract) {
    return JSON.stringify(contract);
  }
}

export let ContractStorage = new ContractModel();
