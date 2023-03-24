import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Client, Context, Network, PrivkeyAccount, RPCClient } from 'firovm-sdk';
import fetch from 'node-fetch';
import { abiERC20, byteCodeContractERC20, testAddresses, testPrivkeys } from './data';

let erc20ContractAddress: string;
let txId: string;
let blockHight = 0;

@suite
class TokenApiTest {
  constructor(
    private url: string,
    private rpcClient: RPCClient,
    private urlFirovm: URL,
    private address: any,
    private privkey: any,
    private client: Client,
    private context: Context,
    private account: any
  ) {
    this.urlFirovm = new URL('http://test:test@firovm:1234');
    this.url = 'http://node:3000/api/FIRO/testnet/token';
    this.rpcClient = new RPCClient(this.urlFirovm.href);
    this.client = new Client(this.urlFirovm.href);
    this.address = testAddresses;
    this.privkey = testPrivkeys;
    this.context = new Context().withNetwork(Network.Testnet);
    this.account = {
      acc1: new PrivkeyAccount(this.context, this.privkey.testPrivkey1),
      acc2: new PrivkeyAccount(this.context, this.privkey.testPrivkey2),
      acc3: new PrivkeyAccount(this.context, this.privkey.testPrivkey3),
      acc4: new PrivkeyAccount(this.context, this.privkey.testPrivkey4),
      acc5: new PrivkeyAccount(this.context, this.privkey.testPrivkey5),
    };
  }

  getAccount() {
    return new PrivkeyAccount(
      new Context().withNetwork(Network.Testnet),
      this.privkey.testPrivkey1
    );
  }

  getNewAddress(): string {
    const account = new PrivkeyAccount(new Context().withNetwork(Network.Testnet));
    return account.address().toString();
  }

  async generateToAddress() {
    const res = await this.rpcClient.rpc('generatetoaddress', [
      1,
      this.address.testAddress1,
    ]);
    expect(res.result).to.be.a('array');
  }

  async deployContractERC20() {
    const contract = new this.client.Contract(abiERC20);
    const contractDeploy = contract.deploy(byteCodeContractERC20);
    txId = await contractDeploy.send({ from: this.account.acc1 });
    expect(txId).to.be.a('string');
    await this.generateToAddress();

    const response = await this.rpcClient.getTransactionReceipt(txId);
    expect(response.result.length).to.be.greaterThan(0);
    expect(response.result[0].contractAddress).to.be.a('string');
    erc20ContractAddress = response.result[0].contractAddress;
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

  async tokenTransfer() {
    const txid = await this.client.tokenTransfer(
      this.account.acc1,
      erc20ContractAddress,
      this.address.testAddress2,
      BigInt(10),
      {
        gasLimit: 10000000,
      }
    );
    expect(txid).to.be.a('string');
  }

  async before() {
    await this.generateToAddress();
  }

  @test
  async initToken() {
    await this.deployContractERC20();
    await this.generateToAddress();
    await this.tokenTransfer();
    await this.generateToAddress();
    await this.waitSyncBlock();
  }

  @test
  async token() {
    const response = await fetch(`${this.url}`);
    const data = await response.json();
    expect(data).to.be.an('array');
    expect(data.length).to.be.greaterThan(0);
    expect(data[0].name).to.be.a('string');
  }

  @test
  async tokenByAddress() {
    const response = await fetch(`${this.url}/${erc20ContractAddress}`);
    const data = await response.json();
    expect(data).to.be.an('object');
    expect(data.name).to.be.a('string');
  }

  @test
  async tokenByTx() {
    const response = await fetch(`${this.url}/${erc20ContractAddress}/tx`);
    const data = await response.json();
    expect(data).to.be.an('array');
    expect(data.length).to.be.greaterThan(0);
  }

  @test
  async tokenByTxUpperCase() {
    const response = await fetch(`${this.url}/${erc20ContractAddress.toUpperCase()}/tx`);
    const data = await response.json();
    console.log(data);
    expect(data).to.be.an('array');
    expect(data.length).to.be.greaterThan(0);
  }

  @test
  async tokenTransfers() {
    const response = await fetch(`${this.url}/${erc20ContractAddress}/tokentransfers`);
    const data = await response.json();
    expect(data).to.be.an('array');
    expect(data.length).to.be.greaterThan(0);
  }

  @test
  async tokenHolder() {
    const response = await fetch(`${this.url}/${erc20ContractAddress}/tokenholder`);
    const data = await response.json();
    expect(data).to.be.an('array');
    expect(data.length).to.be.greaterThan(0);
  }
}
