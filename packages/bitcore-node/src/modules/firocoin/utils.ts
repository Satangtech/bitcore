import { Decimal } from 'decimal.js';
Object.defineProperty(global, '_bitcore', {
  get() {
    return undefined;
  },
  set() {},
});
import { Networks, Address } from 'fvmcore-lib';

export const countDecimals = (value: number) => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

export const convertToSmallUnit = ({ amount, decimals }) => {
  const decimalOfAmount = countDecimals(+amount);
  const smallUnit =
    BigInt(new Decimal(amount).mul(new Decimal(10).pow(new Decimal(decimalOfAmount))).toString()) *
    BigInt(new Decimal(10).pow(new Decimal(decimals - decimalOfAmount)).toString());
  return smallUnit.toString();
};

export const fromHexAddress = (hash: string, network: string) => {
  const address = Address.fromPublicKeyHash(Buffer.from(hash.replace('0x', ''), 'hex'), Networks.get(network))
  return address.toString()
}
