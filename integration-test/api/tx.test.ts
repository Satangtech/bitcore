import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

let txId: string;
let blockHight = 0;

@suite
class TransactionApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/tx';
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
  async tx() {
    await this.waitSyncBlock();
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(data).to.have.lengthOf(10);
    expect(data[0]).to.have.property('txid');
    expect(data[0].txid).to.be.a('string');
    txId = data[0].txid;
  }

  @test
  async txById() {
    const response = await fetch(`${this.url}/${txId}`);
    const data = await response.json();
    expect(data).to.have.property('txid');
    expect(data.txid).to.be.a('string');
    expect(data.txid).to.be.equal(txId);
  }

  @test
  async txCoins() {
    const response = await fetch(`${this.url}/${txId}/coins`);
    const data = await response.json();
    expect(data).to.have.property('inputs');
    expect(data.inputs).to.be.a('array');
    expect(data).to.have.property('outputs');
    expect(data.outputs).to.be.a('array');
  }
}
