import { Decimal128, ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';
import { TransformOptions } from '../../../types/TransformOptions';

export interface ITokenBalance {
  _id?: ObjectID;
  chain: string;
  network: string;
  contractAddress: string;
  address: string;
  balance: Decimal128 | string;
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

  _apiTransform(t, options?: TransformOptions): ITokenBalance | string {
    const tokenBalance: ITokenBalance = {
      _id: t._id,
      chain: t.chain,
      network: t.network,
      contractAddress: t.contractAddress,
      address: t.address,
      balance: t.balance.toString(),
    };
    if (options && options.object) {
      return tokenBalance;
    }
    return JSON.stringify(tokenBalance);
  }
}

export let TokenBalanceStorage = new TokenBalanceModel();
