import { React } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery'
import { HowItWorks } from './HowItWorks'
import { MyPresents } from './MyPresents'
import { WalletButton } from './WalletButton'
import { getChainName, getChainMainCoin } from './Converters'
import { connect, getWeb3, fixChecksumAddress, getBalance, addChain } from '../Logic/WalletConn'
import { mint, rent, wrap, setStartTime, setPrice, getTransfers, getTokenUri, getUri, getRentTokenId, ownerOf, getTokensOfOwner } from '../Logic/NftLogic'
import { insertNft, getNfts } from '../Logic/ServerLogic'
import { NotificationContainer, NotificationManager } from 'react-notifications'

import 'react-notifications/lib/notifications.css';
import '../Css/Main.css';
import { CHAIN_POLYGON, MAX_SUPPLY } from './Units';

const axios = require('axios');

export const Main = () => {
    const contractAddress = "0xA532303BFD5A99fAbe65C9405d72e3Ea65f8D4E5";
    const [nfts, setNfts] = useState([]);
    const [presents, setPresents] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [eth, setEth] = useState(null);
    const [wallet, setWallet] = useState("");
    const [chain, setChain] = useState("");
    const [balance, setBalance] = useState(0);
    const [myPresents, setMyPresents] = useState([]);
    const [nextId, setNextId] = useState(1000000000);
    const [received, setReceived] = useState([]);

    const isMine = (address) => {
        return true || address === wallet;
    }
    const contractMint = (tokenId, price) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        mint(web3, contractAddress, wallet, tokenId, price, () => {
            // TO-DO
            console.log("minted");
        });
    }
    const contractRent = (tokenId, price) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        getRentTokenId(web3, contractAddress, tokenId, (val) => {
            let rentTokenId = val;

            rent(web3, contractAddress, wallet, tokenId, rentTokenId, price, () => {
                // TO-DO
                console.log("rented");
            });
        });
    }
    const contractWrap = (tokenId, contractNft, nftId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        getRentTokenId(web3, contractAddress, tokenId, val => {
            let rentTokenId = val;

            wrap(web3, contractAddress, wallet, rentTokenId, contractNft, nftId, (val) => {
                // TO-DO
                console.log("wrap");
            });
        });
    }
    const importSingle = (contractId, tokenId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ return; }
        tokenId = parseInt(tokenId);
        if (isNaN(tokenId) || tokenId < 0){ return; }
        ownerOf(web3, contractId, tokenId, (owner) => {
            if (isMine(owner)) {
                createNft(contractId, tokenId, (newNft) => {
                    setNfts(x => [...x, newNft]);
                    insertNft(wallet, contractId, tokenId, newNft);
                });
            }
        });
    }
    const notConnected = () => {
        NotificationManager.error("Connect wallet first.", "Wallet not connected", 5000);
    }
    const importContract = (contractId, tokenId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        if (tokenId.length > 0){
            importSingle(contractId, tokenId);
        }
        else getTransfers(web3, contractId, wallet, (val) => {
            console.log(val);
            if (val.length === 0){ return; }
            getTokenUri(web3, contractId, tokenId, (val2) => {
                if (val2 !== undefined) {
                    importContractPrivate(val, val2);
                } else {
                    getUri(web3, contractId, tokenId, (val3) => {
                        importContractPrivate(val, val3);
                    });
                }
            });
        });
    }
    const importContractPrivate = (transfers, tokenUri) => {
        let arr = nfts;
        let localNextId = nextId;

        console.log(tokenUri);
        let newTokenUri = transformUri(tokenUri);

        let finishCount = 0;
        let checkFinish = () => {
            ++finishCount;
            if (finishCount === transfers.length){
                setNfts(x => x = arr);
            }
        }
        for (let i = 0; i < transfers.length; ++i) {
            let tokenId = transfers[i].returnValues.tokenId;
            axios.get(newTokenUri).then(val3 => {
                let imgSrc = transformUri(val3.image);
                console.log(newTokenUri);
                arr.push({ id: localNextId + i, title: val3.name, img: imgSrc, tokenId: tokenId });
                checkFinish();
            });
        }
        setNextId(x => x + transfers.length);
    }
    const transformUri = (tokenUri) => {
        if (tokenUri.substring(0, 7) === "ipfs://") {
            return "https://cloudflare-ipfs.com/ipfs/" + tokenUri.substring(7);
        }
        return tokenUri;
    }

    const createPresent = (order, id, canMint = true, notMinted = false, remainRents = 0) => {
        let price = canMint ? 0.001 : 0.1; //100 : 10;
        return { order: order, id: id, canMint: canMint, notMinted: notMinted, remainRents: remainRents, price: price };
    }
    const createPresents = () => {
        const arr = [];
        const ids = [];
        
        let id = 52; 
        ids.push(id);
        arr.push(createPresent(0, id.toString(), false, false, 10));

        for (let i = 1; i < 20; ++i) {
            id = Math.floor(Math.random() * 100);
            if (id >= MAX_SUPPLY) { continue; } // Id is out of bound
            if (ids.includes(id)) { --i; continue; }
            ids.push(id);
            arr.push(createPresent(i, id.toString(), true, true));
        }
        return arr;
    }
    const createNft = (contractNft, nftId, onCreated) => {
        let id = nextId;
        setNextId(x => x += 1);
        getTokenUri(web3, contractNft, nftId, (tokenUri) => {
            if (tokenUri === undefined) { return; }
            let newTokenUri = transformUri(tokenUri);

            axios.get(newTokenUri).then((val2) => {
                console.log(val2);
                let imgSrc = transformUri(val2.data.image);
                let title = val2.data.name;
                onCreated({ id: id, title: title, img: imgSrc, contractNft: contractNft, nftId: nftId });
            });
        });
    }

    const connectHandler = () => {
        setWeb3(x => x = getWeb3());
    }
    useEffect(() => {
        if (web3 === null){ return; }
        connect((eth) => {
            setEth(x => x = eth);
            setChain(x => x = eth.networkVersion);
            web3?.eth.getAccounts().then(accounts => {
                const acc = fixChecksumAddress(web3, accounts[0]);
                setWallet(x => x = acc);
            })
        }, (network) => {
            const chain = parseInt(network, 16);
            setChain(x => x = chain);
            web3.eth.getAccounts().then(accounts => {
              const acc = fixChecksumAddress(web3, accounts[0]);
              setWallet(x => x = acc);
            });
        }, (account) => {
            const acc = fixChecksumAddress(web3, account);
            setWallet(x => x = acc);
        });
    }, [web3]);
    
    const addChainPolygon = () => {
        addChain(eth, CHAIN_POLYGON, getChainName(CHAIN_POLYGON), 
            "Matic", getChainMainCoin(CHAIN_POLYGON), ["https://rpc-mainnet.matic.network"], ["https://explorer.matic.network"]);
    }

    useEffect(() => {
        if (web3 == null || wallet == null || wallet.length === 0){ return; }
        //setStartTime(web3, contractAddress, wallet, 1637405401);
        //setPrice(web3, contractAddress, wallet, 0.0001);

        getTransfers(web3, contractAddress, wallet, (res) => {
            let arr = [];
            let arr2 = [];
            console.log("transfers:");
            console.log(res);
            for (let i = 0; i < res.length; ++i){
                let tokenId = res[i].returnValues.tokenId;
                if (tokenId < MAX_SUPPLY) {
                    arr.push(createPresent(i, tokenId, false, false, 10));
                } else {
                    arr2.push(createPresent(i, tokenId, false, false, 0));
                }
            }
            setMyPresents(x => x = arr);
            setReceived(x => x = arr2);
        });

        console.log("wallet changed: " + wallet);
        try {
            getBalance(web3, wallet, x => setBalance(x));
        } catch {
            setBalance(x => x = 0);
        }

        getNfts(wallet, (val) => {
            console.log("getNfts:");
            console.log(val);
            setNfts(x => x = val.data);
        });

        getTokensOfOwner(web3, contractAddress, wallet, (val) => {
            console.log("getTokensOfOwner:");
            console.log(val);
        });
    }, [wallet, web3]);
    useEffect(() => {
        document.title = "lucky-presents";
        setPresents(x => x = createPresents());
    }, []);

    return (
        <Router>
            <div className="header">
                <a href="http://www.lucky-presents.com">
                    <img src="https://gateway.pinata.cloud/ipfs/QmT18BUESpx7iupthA5ZyMN9YXPTd8ypUUi6V3PUGhvSVW/1.png" alt="" />
                    <div>lucky-presents.com</div>
                </a>
            </div>
            <div className="topnav">
                <Link to="/">Gallery</Link>
                <Link to="/my">My NFTs</Link>
                <Link to="/received">Received</Link>
                <Link to="/howItWorks">How it works</Link>
                <WalletButton connectHandler={connectHandler} addPolygon={addChainPolygon} wallet={wallet} chain={chain} balance={balance} />
            </div>
            
            <Routes>
                <Route path="/" element={<Gallery presents={presents} mint={contractMint} rent={contractRent} />} />
                <Route path="/my" element={<Gallery presents={myPresents} nfts={nfts} importContract={importContract} rent={contractRent} wrap={contractWrap} />} />
                <Route path="/howItWorks" element={<HowItWorks />} />
                <Route path="/received" element={<MyPresents received={received} />} />
            </Routes>
            
            <NotificationContainer />
        </Router>
    )
}