import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

let txid: string;

@suite
class TransactionApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/tx';
  }

  @test
  async tx() {
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(data).to.have.lengthOf(10);
    expect(data[0]).to.have.property('txid');
    expect(data[0].txid).to.be.a('string');
    txid = data[0].txid;
  }

  @test
  async txById() {
    const response = await fetch(`${this.url}/${txid}`);
    const data = await response.json();
    expect(data).to.have.property('txid');
    expect(data.txid).to.be.a('string');
    expect(data.txid).to.be.equal(txid);
  }

  @test
  async txCoins() {
    const response = await fetch(`${this.url}/${txid}/coins`);
    const data = await response.json();
    expect(data).to.have.property('inputs');
    expect(data.inputs).to.be.a('array');
    expect(data).to.have.property('outputs');
    expect(data.outputs).to.be.a('array');
  }
}
