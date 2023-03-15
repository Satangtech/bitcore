import { expect } from 'chai';
import { Client, Context, Network, PrivkeyAccount, RPCClient } from 'firovm-sdk';
import { abiERC20, byteCodeContractERC20, testAddresses, testPrivkeys } from './data';

export class IntegrationTest {
  rpcClient: RPCClient;
  urlFirovm: URL;
  address: any;
  privkey: any;
  client: Client;
  context: Context;
  account: any;

  constructor() {
    this.urlFirovm = new URL('http://test:test@firovm:1234');
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
    const txId = await contractDeploy.send({ from: this.account.acc1 });
    expect(txId).to.be.a('string');
    await this.generateToAddress();

    const { result, error } = await this.rpcClient.getTransactionReceipt(txId);
    expect(error).to.be.null;
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].contractAddress).to.be.a('string');
    return result[0].contractAddress;
  }
}
