import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface IGas {
  _id?: ObjectID;
  timestamp: Date;
  metadata: any;
  gasPrice: number;
}

export class GasModel extends BaseModel<IGas> {
  constructor(storage?: StorageService) {
    super('gas', storage);
  }
  allowedPaging = [];

  onConnect() {}
}

export let GasStorage = new GasModel();
