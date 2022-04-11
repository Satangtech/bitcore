import { Decimal } from 'decimal.js';
Object.defineProperty(global, '_bitcore', {
  get() {
    return undefined;
  },
  set() {},
});
import { Networks, Address } from 'fvmcore-lib';
import {
  getErc20Decoder,
  getErc721Decoder,
  getInvoiceDecoder,
  getMultisigDecoder,
} from '../ethereum/models/transaction';

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
  const address = Address.fromPublicKeyHash(Buffer.from(hash.replace('0x', ''), 'hex'), Networks.get(network));
  return address.toString();
};

export const checkIsTransfer = (receipt) => {
  return (
    receipt &&
    receipt.length > 0 &&
    receipt[0].log.length > 0 &&
    receipt[0].log[0].topics.length > 0 &&
    receipt[0].log[0].topics[0] === 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  );
};

export const getDataEventTransfer = (receipt) => {
  const from = receipt.log[0].topics[1].replace('000000000000000000000000', '');
  const to = receipt.log[0].topics[2].replace('000000000000000000000000', '');
  const value = BigInt(`0x${receipt.log[0].data}`);
  const contractAddress = receipt.log[0].address;
  return { from, to, value, contractAddress };
};

export const decodeInputType = (input) => {
  try {
    const erc20Data = getErc20Decoder().decodeMethod(input);
    if (erc20Data) {
      return {
        type: 'ERC20',
        ...erc20Data,
      };
    }
  } catch (e) {}
  try {
    const erc721Data = getErc721Decoder().decodeMethod(input);
    if (erc721Data) {
      return {
        type: 'ERC721',
        ...erc721Data,
      };
    }
  } catch (e) {}
  try {
    const invoiceData = getInvoiceDecoder().decodeMethod(input);
    if (invoiceData) {
      return {
        type: 'INVOICE',
        ...invoiceData,
      };
    }
  } catch (e) {}
  try {
    const multisigData = getMultisigDecoder().decodeMethod(input);
    if (multisigData) {
      return {
        type: 'MULTISIG',
        ...multisigData,
      };
    }
  } catch (e) {}
  return undefined;
};
