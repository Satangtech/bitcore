import { BTCStateProvider } from '../btc/btc';

export class FIROStateProvider extends BTCStateProvider {
  constructor(chain: string = 'FIRO') {
    super(chain);
  }
}
