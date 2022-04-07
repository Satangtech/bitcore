import { ObjectID } from 'mongodb';
import { BaseModel } from '../../../models/base';
import { AsyncRPC } from '../../../rpc';
import { Config } from '../../../services/config';
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

  async fromHexAddress({ chain, network, address }) {
    address = address.replace('0x', '');
    if (address.length === 40) {
      const addressCollection = await AddressStorage.collection.findOne({ address, chain, network });
      if (addressCollection) {
        return addressCollection.addressFiro;
      } else {
        const chainConfig = Config.chainConfig({ chain, network });
        const { username, password, host, port } = chainConfig.rpc;
        const rpc = new AsyncRPC(username, password, host, port);
        const addressFiro = await rpc.call('fromhexaddress', [address]);
        AddressStorage.collection.updateOne(
          { address },
          {
            $set: {
              chain,
              network,
              address,
              addressFiro,
            },
          },
          { upsert: true }
        );
        return addressFiro;
      }
    }
    return address;
  }
}

export let AddressStorage = new AddressModel();
