import { Decimal128, ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';
import { TransformOptions } from '../../../types/TransformOptions';

export interface IToken {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  contractAddress: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: Decimal128 | string;
  officialSite: string;
  socialProfiles: string;
  price: Decimal128 | string;
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

  _apiTransform(t, options?: TransformOptions): IToken | string {
    const token: IToken = {
      _id: t._id,
      chain: t.chain,
      network: t.network,
      txid: t.txid,
      contractAddress: t.contractAddress,
      decimals: t.decimals,
      name: t.name,
      symbol: t.symbol,
      totalSupply: t.totalSupply.toString(),
      officialSite: '',
      socialProfiles: '',
      price: '-1',
    };
    if (options && options.object) {
      return token;
    }
    return JSON.stringify(token);
  }
}

export let TokenStorage = new TokenModel();
