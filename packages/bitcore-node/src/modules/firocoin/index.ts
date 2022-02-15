import { BaseModule } from '..';
import { FIROStateProvider } from '../../providers/chain-state/firo/firo';
import { VerificationPeer } from '../bitcoin/VerificationPeer';
import { FIROP2PWorker } from './p2p';

export default class FIROModule extends BaseModule {
  constructor(services) {
    super(services);
    services.Libs.register('FIRO', 'fvmcore-lib', 'fvmcore-p2p');
    services.P2P.register('FIRO', FIROP2PWorker);
    services.CSP.registerService('FIRO', new FIROStateProvider());
    services.Verification.register('FIRO', VerificationPeer);
  }
}
