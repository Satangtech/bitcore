import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';
import { IntegrationTest } from './integration.test';

let blockHight = 0;

@suite
class StatApiTest extends IntegrationTest {
  constructor(private url: string) {
    super();
    this.url = 'http://node:3000/api/FIRO/testnet/stats';
  }

  async waitSyncBlock() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const res = await fetch('http://node:3000/api/FIRO/testnet/block/tip');
      const data = await res.json();
      if (data.height !== blockHight) {
        blockHight = data.height;
        console.log('waiting for sync block:', blockHight);
        await this.waitSyncBlock();
      }
    } catch (e) {
      await this.waitSyncBlock();
    }
  }

  @test
  async stats() {
    await this.waitSyncBlock();
    await this.deployContractERC20();
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.be.a('object');
    expect(data.block_time).to.be.a('number');
    expect(data.block_time).to.be.greaterThan(0);
    expect(data.total_txns).to.be.a('number');
    expect(data.total_txns).to.be.greaterThan(0);
    expect(data.total_blocks).to.be.a('number');
    expect(data.total_blocks).to.be.greaterThan(0);
  }

  @test
  async statsGasHistory() {
    const response = await fetch(`${this.url}/gashistory`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
  }

  @test
  async statsTxnsHistory() {
    const response = await fetch(`${this.url}/txnshistory`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
  }
}
