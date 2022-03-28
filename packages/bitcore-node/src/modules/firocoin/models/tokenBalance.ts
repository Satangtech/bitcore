import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface ITokenBalance {
  _id?: ObjectID;
  chain: string;
  network: string;
  contractAddress: string;
  address: string;
  balance: string;
}

export class TokenBalanceModel extends BaseModel<ITokenBalance> {
  constructor(storage?: StorageService) {
    super('tokenbalances', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, address: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1, address: 1 }, { background: true });
  }
}

export let TokenBalanceStorage = new TokenBalanceModel();
