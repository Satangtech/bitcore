import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface ITxns {
  _id?: ObjectID;
  timestamp: Date;
  metadata: any;
}

export class TxnsModel extends BaseModel<ITxns> {
  constructor(storage?: StorageService) {
    super('txns', storage);
  }
  allowedPaging = [];

  onConnect() {}
}

export let TxnsStorage = new TxnsModel();
