import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface IContract {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  contractAddress: string;
  from: string;
  gasUsed: string;
  name?: string;
}

export class ContractModel extends BaseModel<IContract> {
  constructor(storage?: StorageService) {
    super('contracts', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, txid: 1 }, { background: true });
    // this.collection.createIndex({ chain: 1, network: 1 }, { background: true });
    // this.collection.createIndex({ txid: 1 }, { background: true });
    // this.collection.createIndex({ contractAddress: 1 }, { background: true });
    // this.collection.createIndex({ from: 1 }, { background: true });
  }

  async getContract({ chain, network, contractAddress }) {
    const contract = await this.collection.findOne({ chain, network, contractAddress });
    return contract as IContract;
  }

  _apiTransform(contract: IContract) {
    return JSON.stringify(contract);
  }
}

export let ContractStorage = new ContractModel();
