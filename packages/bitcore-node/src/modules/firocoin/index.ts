import express from 'express';
import { BaseModule } from '..';
import { FIROStateProvider } from '../../providers/chain-state/firo/firo';
import { VerificationPeer } from '../bitcoin/VerificationPeer';
import { FIROP2PWorker } from './p2p';

function bootstrap(path?: string) {
  const fs = require('fs');
  const router = express.Router({
    mergeParams: true,
  });
  const folder = path ? path + '/' : '';
  fs.readdirSync(__dirname + '/' + path).forEach(function (file: string) {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      var route = require('./' + folder + file);
      router.use(route.path, route.router);
    }
  });
  return router;
}

export default class FIROModule extends BaseModule {
  constructor(services) {
    super(services);
    services.Libs.register('FIRO', 'fvmcore-lib', 'fvmcore-p2p');
    services.P2P.register('FIRO', FIROP2PWorker);
    services.CSP.registerService('FIRO', new FIROStateProvider());
    services.Verification.register('FIRO', VerificationPeer);
    services.Api.app.use('/api/:chain/:network', bootstrap('api'));
  }
}
