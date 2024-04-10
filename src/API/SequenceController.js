import { SequenceIndexer } from '@0xsequence/indexer';
import { Mutex, E_CANCELED} from 'async-mutex';

const mutexMinting = new Mutex();

class SequenceController {
  constructor(scene) {
    this.scene = scene
    this.indexer = new SequenceIndexer(
      'https://arbitrum-sepolia-indexer.sequence.app',
      process.env.PROJECT_ACCESS_KEY
    );
  }

  async init(walletClient, sendTransactionBurn) {
    this.walletAddress = walletClient.account.address;

    // uncomment when function implemented 
    // this.sendBurnToken = sendTransactionBurn;
  }

}

export { SequenceController };