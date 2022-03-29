import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { StorageService } from '../../../services/storage';

export interface IAddress {
  _id?: ObjectID;
  chain: string;
  network: string;
  address: string;
  addressFiro: string;
}

export class AddressModel extends BaseModel<IAddress> {
  constructor(storage?: StorageService) {
    super('addresses', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1, address: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, addressFiro: 1 }, { background: true });
  }
}

export let AddressStorage = new AddressModel();
