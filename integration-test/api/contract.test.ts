import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Client, Context, Network, PrivkeyAccount, RPCClient } from 'firovm-sdk';
import fetch from 'node-fetch';
import { abiERC20, byteCodeContractERC20, testAddresses, testPrivkeys } from './data';
import { createReadStream, readFileSync } from 'fs';
import FormData from 'form-data';

let erc20ContractAddress: string;
let txId: string;
let blockHight = 0;

@suite
class ContractApiTest {
  constructor(
    private url: string,
    private rpcClient: RPCClient,
    private urlFirovm: URL,
    private address: any,
    private privkey: any,
    private client: Client,
    private context: Context,
    private account: any,
    private storageUser: string,
    private storagePassword: string
  ) {
    this.urlFirovm = new URL('http://test:test@firovm:1234');
    this.url = 'http://node:3000/api/FIRO/testnet/contract';
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
    this.storageUser = 'admin';
    this.storagePassword = 'Admin123!';
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

    const { result, error } = await this.rpcClient.getTransactionReceipt(txId);
    expect(error).to.be.null;
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].contractAddress).to.be.a('string');
    erc20ContractAddress = result[0].contractAddress;
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

  @test
  async initToken() {
    await this.waitSyncBlock();
    await this.deployContractERC20();
    await this.generateToAddress();
    await this.tokenTransfer();
    await this.generateToAddress();
    await this.waitSyncBlock();
  }

  @test
  async getContract() {
    const res = await fetch(`${this.url}/${erc20ContractAddress}`);
    const data = await res.json();
    expect(data).to.be.a('object');
    expect(data.contractAddress).to.be.a('string');
    expect(data.contractAddress).to.be.equal(erc20ContractAddress);
    expect(data.txid).to.be.a('string');
  }

  @test
  async getContractNotFound() {
    const res = await fetch(`${this.url}/123`);
    const data = await res.json();
    expect(res.status).to.be.equal(404);
    expect(data).to.be.a('object');
    expect(data.message).to.be.equal(
      'The requested contract address 123 could not be found.'
    );
  }

  @test
  async uploadContract() {
    const formData = new FormData();
    const contract = createReadStream('/app/api/GLDToken.sol');
    formData.append('file', contract);
    formData.append('version', 'v0.8.17+commit.8df45f5f');
    const res = await fetch(`${this.url}/${erc20ContractAddress}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    expect(res.status).to.be.equal(200);
    expect(data).to.be.a('object');
    expect(data.chain).to.be.equal('FIRO');
    expect(data.network).to.be.equal('testnet');
    expect(data.contractName).to.be.equal('GLDToken');
  }

  @test
  async getContractCode() {
    const res = await fetch(`${this.url}/${erc20ContractAddress}/code`);
    const code = await res.text();
    expect(code).to.be.a('string');
    expect(code).to.be.equal(readFileSync('/app/api/GLDToken.sol', 'utf8'));
    expect(res.status).to.be.equal(200);
  }

  @test
  async getContractAbi() {
    const res = await fetch(`${this.url}/${erc20ContractAddress}/abi`);
    const abi = await res.json();
    expect(abi).to.be.a('array');
    expect(abi).to.be.deep.equal(abiERC20);
    expect(res.status).to.be.equal(200);
  }

  @test
  async getContractEvents() {
    const res = await fetch(`${this.url}/${erc20ContractAddress}/event`);
    const event = await res.json();
    expect(res.status).to.be.equal(200);
    expect(event).to.be.a('array');
    expect(event.length).to.be.greaterThan(0);
    expect(event[0].txid).to.be.a('string');
  }

  @test
  async removeContractFromStorage() {
    const res = await fetch(`http://storage:5555/contracts/${erc20ContractAddress}`, {
      method: 'DELETE',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${this.storageUser}:${this.storagePassword}`).toString('base64'),
      },
    });
    expect(res.status).to.be.equal(204);
  }

  @test
  async removeContractNotFound() {
    const res = await fetch(`http://storage:5555/contracts/123`, {
      method: 'DELETE',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${this.storageUser}:${this.storagePassword}`).toString('base64'),
      },
    });
    expect(res.status).to.be.equal(404);
  }
}
