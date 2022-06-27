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
  requireUncached,
} from '../ethereum/models/transaction';
import { ContractStorage } from './models/contract';
import fetch from 'node-fetch';
import 'dotenv/config';

const ERC20 = 'ERC20';
const ERC721 = 'ERC721';
const INVOICE = 'INVOICE';
const MULTISIG = 'MULTISIG';
export const storageUsername = process.env.STORAGE_USERNAME;
export const storagePassword = process.env.STORAGE_PASSWORD;
export const storageUrl = process.env.STORAGE_URL;
export const cacheUrl = process.env.CACHE_URL;

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

export const toHexAddress = (nativeAddress: string, network: string) => {
  return Address.fromString(nativeAddress, Networks.get(network)).hashBuffer.toString('hex');
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

export const checkIsCreateContract = (receipt) => {
  return (
    receipt.length > 0 && receipt[0].contractAddress && receipt[0].to === '0000000000000000000000000000000000000000'
  );
};

export const checkIsCallContract = (receipt) => {
  return (
    receipt.length > 0 && receipt[0].contractAddress && receipt[0].to !== '0000000000000000000000000000000000000000'
  );
};

export const checkIsERC20 = ({ decimals, name, symbol, totalSupply }) => {
  return decimals !== 0 && name !== '' && symbol !== '' && totalSupply !== '0';
};

export const checkIsLog = (receipt) => {
  return receipt.length > 0 && receipt[0].log.length > 0;
};

export const getDataEventTransfer = (receipt) => {
  const from = receipt.log[0].topics[1].replace('000000000000000000000000', '');
  const to = receipt.log[0].topics[2].replace('000000000000000000000000', '');
  const value = BigInt(`0x${receipt.log[0].data}`);
  const contractAddress = receipt.log[0].address;
  return { from, to, value, contractAddress };
};

export const decodeMethod = async (input, contractAddress = '') => {
  let dataDecode: any = undefined;
  try {
    if (contractAddress && contractAddress !== '') {
      const contract = await ContractStorage.collection.findOne({ contractAddress });
      if (contract && contract.name) {
        const abiDecoder = requireUncached('abi-decoder');
        const folderUpload = '/bitcore/packages/bitcore-node/src/modules/firocoin/api/contracts';
        const contractJson = require(`${folderUpload}/${contractAddress}.json`);
        abiDecoder.addABI(contractJson);
        dataDecode = abiDecoder.decodeMethod(input);
      }
    }
  } catch (e) {}
  try {
    const erc20Data = getErc20Decoder().decodeMethod(input);
    if (erc20Data && dataDecode) {
      dataDecode.type = ERC20;
      return dataDecode;
    }
    if (erc20Data) {
      return {
        type: ERC20,
        ...erc20Data,
      };
    }
  } catch (e) {}
  try {
    const erc721Data = getErc721Decoder().decodeMethod(input);
    if (erc721Data && dataDecode) {
      dataDecode.type = ERC721;
      return dataDecode;
    }
    if (erc721Data) {
      return {
        type: ERC721,
        ...erc721Data,
      };
    }
  } catch (e) {}
  try {
    const invoiceData = getInvoiceDecoder().decodeMethod(input);
    if (invoiceData && dataDecode) {
      dataDecode.type = INVOICE;
      return dataDecode;
    }
    if (invoiceData) {
      return {
        type: INVOICE,
        ...invoiceData,
      };
    }
  } catch (e) {}
  try {
    const multisigData = getMultisigDecoder().decodeMethod(input);
    if (multisigData && dataDecode) {
      dataDecode.type = MULTISIG;
      return dataDecode;
    }
    if (multisigData) {
      return {
        type: MULTISIG,
        ...multisigData,
      };
    }
  } catch (e) {}
  if (dataDecode) {
    dataDecode.type = '';
    return dataDecode;
  }
  return undefined;
};

export const decodeLogs = async (logs, contractAddress = '') => {
  let dataDecode: any = undefined;
  try {
    if (contractAddress && contractAddress !== '') {
      const contract = await ContractStorage.collection.findOne({ contractAddress });
      if (contract && contract.name) {
        const abiDecoder = requireUncached('abi-decoder');
        const folderUpload = '/bitcore/packages/bitcore-node/src/modules/firocoin/api/contracts';
        const contractJson = require(`${folderUpload}/${contractAddress}.json`);
        abiDecoder.addABI(contractJson);
        dataDecode = abiDecoder.decodeLogs(logs);
      }
    }
  } catch (e) {}
  try {
    const erc20Data = getErc20Decoder().decodeLogs(logs);
    if (erc20Data && dataDecode) {
      dataDecode.type = ERC20;
      return dataDecode;
    }
    if (erc20Data) {
      return {
        type: ERC20,
        ...erc20Data,
      };
    }
  } catch (e) {}
  try {
    const erc721Data = getErc721Decoder().decodeLogs(logs);
    if (erc721Data && dataDecode) {
      dataDecode.type = ERC721;
      return dataDecode;
    }
    if (erc721Data) {
      return {
        type: ERC721,
        ...erc721Data,
      };
    }
  } catch (e) {}
  try {
    const invoiceData = getInvoiceDecoder().decodeLogs(logs);
    if (invoiceData && dataDecode) {
      dataDecode.type = INVOICE;
      return dataDecode;
    }
    if (invoiceData) {
      return {
        type: INVOICE,
        ...invoiceData,
      };
    }
  } catch (e) {}
  try {
    const multisigData = getMultisigDecoder().decodeLogs(logs);
    if (multisigData && dataDecode) {
      dataDecode.type = MULTISIG;
      return dataDecode;
    }
    if (multisigData) {
      return {
        type: MULTISIG,
        ...multisigData,
      };
    }
  } catch (e) {}
  if (dataDecode) {
    dataDecode.type = '';
    return dataDecode;
  }
  return undefined;
};

export const formatHexAddress = (address: string) => {
  return address.replace('0x', '').toLowerCase();
};

export const fetchGetStorage = async (url: string) => {
  const response = await fetch(url, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${storageUsername}:${storagePassword}`).toString('base64'),
    },
  });
  if (response.status === 404) {
    return {};
  }
  return await response.json();
};

export const fetchPostStorage = async (url: string, body: string) => {
  await fetch(url, {
    method: 'post',
    body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${storageUsername}:${storagePassword}`).toString('base64'),
    },
  });
};

export const getCompileSetting = (contractAddress: string, content: string) => {
  return {
    language: 'Solidity',
    sources: {
      [contractAddress]: {
        content: content,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
};

export const resMessage = (message) => {
  return {
    message,
  };
};

export const addMonths = (date, months) => {
  date.setMonth(date.getMonth() + months);
  return date;
};
