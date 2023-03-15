import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

let blockHight = 0;

@suite
class SolcVersionApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/solc-versions';
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
  async solVersions() {
    await this.waitSyncBlock();
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.be.a('array');
    expect(data.length).to.be.equal(103);
  }
}
