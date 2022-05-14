import { expect } from 'chai';
import { Decimal128 } from 'mongodb';
import { TokenBalanceStorage } from '../../../src/modules/firocoin/models/tokenBalance';
import { resetDatabase } from '../../helpers';
import { intAfterHelper, intBeforeHelper } from '../../helpers/integration';

async function insertTokenBalances() {
  await TokenBalanceStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    contractAddress: '933e0722991578ec87bc6953c5101e05bbca00f2',
    address: 'efac02fd1949372e85eaa910ea3100f6a5237b30',
    balance: Decimal128.fromString('100300000'),
  });
  await TokenBalanceStorage.collection.insertOne({
    chain: 'FIRO',
    network: 'regtest',
    contractAddress: '933e0722991578ec87bc6953c5101e05bbca00f2',
    address: 'd70fcf2b7fd2aa68e0a97ecf38b6f4133d666132',
    balance: Decimal128.fromString('10000'),
  });
}

describe('TokenBalance Model', function () {
  const suite = this;
  this.timeout(30000);
  before(intBeforeHelper);
  after(() => intAfterHelper(suite));

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('get from contract address', () => {
    it('should show all balance of contract', async () => {
      await insertTokenBalances();
      const tokenBalances = await TokenBalanceStorage.collection
        .find({ chain: 'FIRO', network: 'regtest', contractAddress: '933e0722991578ec87bc6953c5101e05bbca00f2' })
        .toArray();
      expect(tokenBalances.length).to.equal(2);
    });
  });

  describe('get from address', () => {
    it('should find token from contract address', async () => {
      await insertTokenBalances();
      const tokenBalances = await TokenBalanceStorage.collection
        .find({
          chain: 'FIRO',
          network: 'regtest',
          address: 'd70fcf2b7fd2aa68e0a97ecf38b6f4133d666132',
        })
        .toArray();
      expect(tokenBalances.length).to.equal(1);
      expect(tokenBalances[0].address).to.equal('d70fcf2b7fd2aa68e0a97ecf38b6f4133d666132');
      expect(tokenBalances[0].contractAddress).to.equal('933e0722991578ec87bc6953c5101e05bbca00f2');
      expect(tokenBalances[0].balance.toString()).to.equal('10000');
    });
  });
});
