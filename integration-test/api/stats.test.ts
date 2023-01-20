import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

@suite
class StatApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/stats';
  }

  @test
  async stats() {
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
}
