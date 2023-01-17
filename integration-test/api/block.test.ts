import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

@suite
class BlockApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/block';
  }

  @test
  async block() {
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(data).to.have.lengthOf(10);
    expect(data[0]).to.have.property('hash');
    expect(data[0].hash).to.be.a('string');
  }
}
