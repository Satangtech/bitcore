import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Client, Context, Network, PrivkeyAccount, RPCClient } from 'firovm-sdk';
import fetch from 'node-fetch';
import { abiERC20, byteCodeContractERC20, testAddresses, testPrivkeys } from './data';

let erc20ContractAddress: string;
let txid: string;

@suite
class AddressApiTest {
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
    this.url = 'http://node:3000/api/FIRO/testnet/address';
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
    return new PrivkeyAccount(new Context().withNetwork(Network.Testnet), this.privkey.testPrivkey1);
  }

  async getNewAddress(): Promise<string> {
    const res = await this.rpcClient.rpc('getnewaddress');
    const address = res.result;
    expect(address).to.be.a('string');
    return address;
  }

  async generateToAddress() {
    const res = await this.rpcClient.rpc('generatetoaddress', [1, this.address.testAddress1]);
    expect(res.result).to.be.a('array');
  }

  async deployContractERC20() {
    const contract = new this.client.Contract(abiERC20);
    const contractDeploy = contract.deploy(byteCodeContractERC20);
    txid = await contractDeploy.send({ from: this.account.acc1 });
    expect(txid).to.be.a('string');
    await this.generateToAddress();

    const { result, error } = await this.rpcClient.getTransactionReceipt(txid);
    expect(error).to.be.null;
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].contractAddress).to.be.a('string');
    erc20ContractAddress = result[0].contractAddress;
  }

  async sendToAddress(acc: PrivkeyAccount, addressTo: string, amount: number) {
    await this.client.sendFrom(
      acc,
      [
        {
          to: addressTo,
          value: amount,
        },
      ],
      { feePerKb: 400000 }
    );
    await this.generateToAddress();
  }

  async loadWallet() {
    const res = await this.rpcClient.rpc('loadwallet', ['testwallet']);
  }

  async waitSyncBlock() {
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));
    try {
      const res = await fetch('http://node:3000/api/FIRO/testnet/block/tip');
      const data = await res.json();
      if (data.height <= 2000) {
        console.log('waiting for sync block:', data.height);
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
    await this.loadWallet();
    await this.deployContractERC20();
    await this.generateToAddress();
    await this.tokenTransfer();
    await this.generateToAddress();
    await this.sendToAddress(this.account.acc1, this.address.testAddress2, 100000);
    await this.waitSyncBlock();
  }

  @test
  async addressDetail() {
    const res = await fetch(`${this.url}/${this.address.testAddress1}/detail`);
    const data = await res.json();
    expect(data).to.be.a('object');
    expect(data).to.have.property('balance');
    expect(data).to.have.property('tokens');
    expect(data).to.have.property('transactionNativeCount');
    expect(data).to.have.property('transactionEVMCount');
    expect(data).to.have.property('transactionTotalCount');
  }

  @test
  async addressDetailTx() {
    const res = await fetch(`${this.url}/${this.address.testAddress2}/detail/tx`);
    const data = await res.json();
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
    expect(data[0]).to.have.property('txid');
  }

  @test
  async addressDetailTxQueryByContractAddress() {
    const res = await fetch(
      `${this.url}/${this.address.testAddress2}/detail/tx?contractAddress=${erc20ContractAddress}`
    );
    const data = await res.json();
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
    expect(data[0]).to.have.property('txid');
  }

  @test
  async addressDetailTokens() {
    const res = await fetch(`${this.url}/${this.address.testAddress1}/detail/tokens`);
    const data = await res.json();
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
    expect(data[0]).to.have.property('contractAddress');
    expect(data[0]).to.have.property('balance');
  }

  @test
  async addressDetailTokenTransfers() {
    const res = await fetch(`${this.url}/${this.address.testAddress1}/detail/tokentransfers`);
    const data = await res.json();
    expect(data).to.be.a('array');
    expect(data.length).to.be.greaterThan(0);
    expect(data[0]).to.have.property('txid');
  }
}
