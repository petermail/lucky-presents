import Web3 from "web3";
import WalletConnect from '@walletconnect/client';

export const getWeb3 = () => {
    const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    return web3;
}

export const connect = (onConnected, onNetworkUpdate, onAccountUpdate) => {
    var ethereum;
    console.log("connecting");
    if (typeof window.ethereum !== 'undefined'){
        ethereum = window.ethereum;

        ethereum.on('chainChanged', onNetworkUpdate)
        ethereum.on('accountsChanged', onAccountUpdate);
    } else {
      const bridge = "https://bridge.walletconnect.org";
      // create new connector
      const connector = new WalletConnect({ bridge });
      if (!connector.connected) {
        // create new session
        connector.createSession();
      }

      //ethereum = new Web3(JSONRPC_URL);
    }

    // Enable
    if (ethereum != null){
      ethereum.request({ method: 'eth_requestAccounts' }).then(x => {
        onConnected(ethereum);
      });
    }
}

export const disconnect = (ethereum) => {
    console.log("ethereum: " + ethereum);
    try {
      ethereum.disconnect();
    } catch (err) {
      if (ethereum !== null && ethereum.close){
        ethereum.close();
      }
    }
  }

export const getBalance = (web3, address, onBalanceUpdate) => {
    web3.eth.getBalance(address).then(x => 
      onBalanceUpdate(web3.utils.fromWei(x))
    );
  }
  
export var fixChecksumAddress = function (web3, address) {
  return address.length === 0 ? "" : web3.utils.toChecksumAddress(address.toString());
}


export const addChain = (ethereum, chainId, chainName, nativeCoinName, nativeCoinSymbol, rpcUrls, blockExplorers, onDone) => {
  if (ethereum === null){ return; }
  ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: "0x" + Number(chainId).toString(16), // A 0x-prefixed hexadecimal string
      chainName: chainName,
      nativeCurrency: {
        name: nativeCoinName,
        symbol: nativeCoinSymbol, // 2-6 characters long
        decimals: 18,
      },
      rpcUrls: rpcUrls, // string[];
      blockExplorerUrls: blockExplorers, // string[];
    }]
  }).then(x => {
    if (onDone){ onDone(); }
  });
}