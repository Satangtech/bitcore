import { expect } from 'chai';
import { ContractStorage } from '../../../src/modules/firocoin/models/contract';
import { resetDatabase } from '../../helpers';
import { intAfterHelper, intBeforeHelper } from '../../helpers/integration';

async function insertContracts() {
  await ContractStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    txid: '597a44a679ff650caa76e47e44046c878924454c3083dcebc157e1e43ea20276',
    contractAddress: '3ae46b28c7d1918094a84784fc5702d8cf5422ae',
    from: 'efac02fd1949372e85eaa910ea3100f6a5237b30',
  });
  await ContractStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    txid: '2a5ab88d9a59b8999afc6b269f7cbf67dc7e2357ce7e820e970e4e4a26ad46b2',
    contractAddress: '933e0722991578ec87bc6953c5101e05bbca00f2',
    from: 'efac02fd1949372e85eaa910ea3100f6a5237b30',
  });
}

describe('Contract Model', function () {
  const suite = this;
  this.timeout(30000);
  before(intBeforeHelper);
  after(() => intAfterHelper(suite));

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('addContract', () => {
    it('should have 2 contracts', async () => {
      await insertContracts();
      const contracts = await ContractStorage.collection.find({ chain: 'FIRO', network: 'regtest' }).toArray();
      expect(contracts.length).to.equal(2);
    });
  });

  describe('findContract', () => {
    it('should find contract from contract address', async () => {
      await insertContracts();
      const contract = await ContractStorage.collection.findOne({
        chain: 'FIRO',
        network: 'regtest',
        contractAddress: '3ae46b28c7d1918094a84784fc5702d8cf5422ae',
      });
      expect(contract).to.not.be.null;
      if (contract) {
        expect(contract.chain).to.equal('FIRO');
        expect(contract.network).to.equal('regtest');
        expect(contract.contractAddress).to.equal('3ae46b28c7d1918094a84784fc5702d8cf5422ae');
        expect(contract.from).to.equal('efac02fd1949372e85eaa910ea3100f6a5237b30');
      }
    });
  });
});
