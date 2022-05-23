import { expect } from 'chai';
import { Decimal128 } from 'mongodb';
import { TokenStorage } from '../../../src/modules/firocoin/models/token';
import { resetDatabase } from '../../helpers';
import { intAfterHelper, intBeforeHelper } from '../../helpers/integration';

async function insertTokens() {
  await TokenStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    txid: '597a44a679ff650caa76e47e44046c878924454c3083dcebc157e1e43ea20276',
    contractAddress: '3ae46b28c7d1918094a84784fc5702d8cf5422ae',
    decimals: 8,
    name: 'Test Token1',
    symbol: 'TOKEN1',
    totalSupply: Decimal128.fromString('100000000000000000'),
    officialSite: '',
    socialProfiles: '',
  });
  await TokenStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    txid: '2a5ab88d9a59b8999afc6b269f7cbf67dc7e2357ce7e820e970e4e4a26ad46b2',
    contractAddress: '933e0722991578ec87bc6953c5101e05bbca00f2',
    decimals: 18,
    name: 'Test Token2',
    symbol: 'TOKEN2',
    totalSupply: Decimal128.fromString('1000000000000000000000000'),
    officialSite: '',
    socialProfiles: '',
  });
}

describe('Token Model', function () {
  const suite = this;
  this.timeout(30000);
  before(intBeforeHelper);
  after(() => intAfterHelper(suite));

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('addToken', () => {
    it('should have 2 tokens', async () => {
      await insertTokens();
      const tokens = await TokenStorage.collection.find({ chain: 'FIRO', network: 'regtest' }).toArray();
      expect(tokens.length).to.equal(2);
    });
  });

  describe('findToken', () => {
    it('should find token from contract address', async () => {
      await insertTokens();
      const token = await TokenStorage.collection.findOne({
        chain: 'FIRO',
        network: 'regtest',
        contractAddress: '3ae46b28c7d1918094a84784fc5702d8cf5422ae',
      });
      expect(token).to.not.be.null;
      if (token) {
        expect(token.chain).to.equal('FIRO');
        expect(token.network).to.equal('regtest');
        expect(token.contractAddress).to.equal('3ae46b28c7d1918094a84784fc5702d8cf5422ae');
        expect(token.decimals).to.equal(8);
        expect(token.name).to.equal('Test Token1');
        expect(token.symbol).to.equal('TOKEN1');
        expect(token.totalSupply.toString()).to.equal('100000000000000000');
      }
    });
  });
});
