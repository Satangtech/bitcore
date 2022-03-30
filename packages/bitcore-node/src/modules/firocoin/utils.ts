import { AsyncRPC } from '../../rpc';
import { Config } from '../../services/config';
import { AddressStorage } from './models/address';
import { Decimal } from 'decimal.js';

export const fromHexAddress = async ({ address, chain, network }) => {
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
};

export const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

export const convertToSmallUnit = ({ amount, decimals }) => {
  const numberDecimal = countDecimals(+amount);
  const smallUnit =
    BigInt(new Decimal(amount).mul(new Decimal(10).pow(new Decimal(numberDecimal))).toString()) *
    BigInt(new Decimal(10).pow(new Decimal(decimals - numberDecimal)).toString());
  return smallUnit.toString();
};
