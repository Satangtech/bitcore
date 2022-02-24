import { ObjectID } from 'mongodb';
import fetch from 'node-fetch';
import { BaseModel } from '../../../models/base';
import { Config } from '../../../services/config';
import { StorageService } from '../../../services/storage';

export interface IContract {
  _id?: ObjectID;
  chain: string;
  network: string;
  txid: string;
  contractAddress: string;
  from: string;
}

export class ContractModel extends BaseModel<IContract> {
  constructor(storage?: StorageService) {
    super('contracts', storage);
  }
  allowedPaging = [];

  onConnect() {
    this.collection.createIndex({ chain: 1, network: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, contractAddress: 1 }, { background: true });
    this.collection.createIndex({ txid: 1 }, { background: true });
    this.collection.createIndex({ contractAddress: 1 }, { background: true });
    this.collection.createIndex({ from: 1 }, { background: true });
  }

  async getContract({ chain, network, contractAddress }) {
    const contract = await this.collection.findOne({ chain, network, contractAddress });
    return contract as IContract;
  }

  async processContract({ chain, network, txid }) {
    const chainConfig = Config.chainConfig({ chain, network });
    const { host, port, username, password } = chainConfig.rpc;
    const url = `http://${username}:${password}@${host}:${port}`;
    const init = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        jsonrpc: '2.0',
        method: 'gettransactionreceipt',
        params: [txid]
      })
    };
    const responseTx = await fetch(url, init);
    const responseJsonTx = await responseTx.json();

    if (responseJsonTx.result.length > 0) {
      const query = { txid };
      const options = { upsert: true };
      const txResult = responseJsonTx.result[0];
      if (txResult.contractAddress) {
        const contract: IContract = {
          chain,
          network,
          txid,
          contractAddress: txResult.contractAddress,
          from: txResult.from
        };
        await ContractStorage.collection.updateOne(query, { $set: contract }, options);
      }
    }
  }

  _apiTransform(contract: IContract) {
    return JSON.stringify(contract);
  }
}

export let ContractStorage = new ContractModel();
