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
    // this.fetchWalletTokens();
    this.sendBurnToken = sendTransactionBurn;
  }

  async fetchTokensFromAchievementMint(tokenID) {
    // check for achievement balance
    this.indexer = new SequenceIndexer(
      'https://arbitrum-sepolia-indexer.sequence.app',
      process.env.PROJECT_ACCESS_KEY
    );
    const wait = (ms) => new Promise((res) => setTimeout(res, ms))
    let hasFoundPlane = false
    let tokenIDs = []
    while(!hasFoundPlane) {
      const response = await this.indexer.getTokenBalances({
        accountAddress: this.walletAddress,
        contractAddress: '0x856de99d7647fb7f1d0f60a04c08340db3875340',
      })
      await wait(1000)
      for(let i = 0; i < response.balances.length; i++){
        if(response.balances[i].tokenID == String(tokenID)){
          hasFoundPlane = true
          document.getElementById('burnBtn').style.display = 'flex'
        }
      }
    }
  }

  async fetchTokensFromBurn(tokenID){
    this.indexer = new SequenceIndexer(
        'https://arbitrum-sepolia-indexer.sequence.app',
        process.env.PROJECT_ACCESS_KEY
      );
      const wait = (ms) => new Promise((res) => setTimeout(res, ms))
      let hasBeenBurned = false
      while(!hasBeenBurned) {
        let tokenIDs = []
        const response = await this.indexer.getTokenBalances({
          accountAddress: this.walletAddress,
          contractAddress: '0x856de99d7647fb7f1d0f60a04c08340db3875340',
        })
        await wait(1000)
        for(let i = 0; i < response.balances.length; i++){
            tokenIDs.push(response.balances[i].tokenID)
        }
        if(!tokenIDs.includes(String(tokenID))) {
          hasBeenBurned = true
          document.getElementById('burnBtn').style.display = 'none'
        } 
      }
  } 

  async fetchPlaneTokens(){
    this.indexer = new SequenceIndexer(
        'https://arbitrum-sepolia-indexer.sequence.app',
        process.env.PROJECT_ACCESS_KEY
    );

    const wait = (ms) => new Promise((res) => setTimeout(res, ms))
    let hasFoundPlane = false

    while(!hasFoundPlane) {
       const response = await this.indexer.getTokenBalances({
        accountAddress: this.walletAddress,
        contractAddress: '0x10ac72ada55ed46ee35deed371b8d215c2e870e1',
      })
      await wait(1000)
      for(let i = 0; i < response.balances.length; i++){
        if(response.balances[i].tokenID == '1' && Number(response.balances[i].balance) > 0){
          this.scene.airplane.addPlane(Number(response.balances[i].tokenID))
          hasFoundPlane = true
        }
      }
    }
  }

  async burnToken(tokenID, callback) {
    this.sendBurnToken(tokenID, callback);
  }

  async callContract(tokenId, isPlane, callback) {
    if(!mutexMinting.isLocked()){
      try {
          await mutexMinting.runExclusive(async () => {
              console.log('Minting token:', tokenId);
              const url = 'http://localhost:8787';
              const data = {
                address: this.walletAddress,
                tokenId: tokenId,
                isPlane: isPlane
              };

              try {
                const res = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                })
                const txHash = await res.text();
                mutexMinting.release();
                callback(txHash);
              } catch(err) {
                mutexMinting.release();
                callback(err);
              }
          });
      } catch (err) {
          if (err === E_CANCELED) {
              mutexMinting.release();
          }
      }
    } else {
      console.log('mutex is locked')
    }
  }
}

export { SequenceController };
