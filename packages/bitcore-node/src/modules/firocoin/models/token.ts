import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface IToken {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  contractAddress: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: string;
}

export class TokenModel extends BaseModel<IToken> {
  constructor(storage?: StorageService) {
    super('tokens', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, txid: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1 }, { background: true });
  }

  async getToken({ chain, network, txid }) {
    const contract = await this.collection.findOne({ chain, network, txid });
    return contract as IToken;
  }
}

export let TokenStorage = new TokenModel();
