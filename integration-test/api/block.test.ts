import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

let blockHight = 0;

@suite
class BlockApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/block';
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
  async block() {
    await this.waitSyncBlock();
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(data).to.have.lengthOf(10);
    expect(data[0]).to.have.property('hash');
    expect(data[0].hash).to.be.a('string');
  }

  @test
  async blockTip() {
    const response = await fetch(`${this.url}/tip`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.have.property('hash');
    expect(data.hash).to.be.a('string');
  }
}
