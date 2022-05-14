import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface IEvmData {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  version: string;
  fvmGasLimit: string;
  fvmGasPrice: number;
  callData: string;
  contract: string;
  op: string;
}

export class EvmDataModel extends BaseModel<IEvmData> {
  constructor(storage?: StorageService) {
    super('evmdata', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1, txid: 1 }, { background: true });
  }

  async getEvmData({ chain, network, txid }) {
    const contract = await this.collection.findOne({ chain, network, txid });
    return contract as IEvmData;
  }
}

export let EvmDataStorage = new EvmDataModel();
