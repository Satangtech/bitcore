import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

@suite
class PriceApiTest {
  constructor(private url: string) {
    this.url = 'http://node:3000/api/FIRO/testnet/prices';
  }

  @test
  async prices() {
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(response.status).to.be.equal(200);
    expect(data).to.be.an('object');
  }
}
