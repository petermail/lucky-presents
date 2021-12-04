import { React } from 'react'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery'
import { HowItWorks } from './HowItWorks'
import { MyPresents } from './MyPresents'
import { WalletButton } from './WalletButton'
import { getChainName, getChainMainCoin } from './Converters'
import { connect, getWeb3, fixChecksumAddress, getBalance, addChain } from '../Logic/WalletConn'
import { mint, rent, wrap, unwrap, setStartTime, setPrice, getTransfers, getTokenUri, getUri, getRentTokenId, ownerOf, 
    getRemainRents, getRentPrice, isApprovedForAll, setApprovalForAll, selfRent, balanceOf } from '../Logic/NftLogic'
import { insertNft, getNfts, getPresents, updateNft } from '../Logic/ServerLogic'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { indexOf } from './Utils'
import ReactTooltip from 'react-tooltip'
import discordImg from '../Images/discord.png'
import twitterImg from '../Images/twitter.png'

import 'react-notifications/lib/notifications.css';
import '../Css/Main.css';
import { CHAIN_POLYGON, MAX_SUPPLY, contractAddress, zeroAddress } from './Units';

const axios = require('axios');

export const Main = () => {
    const rentsCount = 10;
    const rentBasePrice = 1;
    const polygonChain = "137";
    const [nfts, setNfts] = useState([]);
    const [presents, setPresents] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [eth, setEth] = useState(null);
    const [wallet, setWallet] = useState("");
    const [chain, setChain] = useState("");
    const [balance, setBalance] = useState(0);
    const [myPresents, setMyPresents] = useState([]);
    let nextId = useRef(1000000000);
    const [received, setReceived] = useState([]);
    const [wasUpdated, setWasUpdated] = useState(false);

    const isMine = (address) => {
        return true || address === wallet;
    }
    const contractMint = (tokenId, price) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        mint(web3, contractAddress, wallet, tokenId, price, () => {
            // MINTED
            console.log("minted");
            let present = { id: tokenId, isPresent: true, remainRents: rentsCount, owner: wallet, price: rentBasePrice };
            insertNft(wallet, contractAddress, tokenId, present);

            updatePresentsStateLocal([present]);
            updateNfts([present]);
            NotificationManager.success("Present was successfully minted.", "Minted", 5000);
        }, (err) => {
            NotificationManager.error("Present was already minted, try reload page.", "Mint wasn't successful", 5000);
        });
    }
    const contractRent = (tokenId, owner) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        getRentTokenId(web3, contractAddress, tokenId, (val) => {
            let rentTokenId = val;
            console.log("rentTokenId: " + rentTokenId);

            if (owner === wallet) {
                selfRent(web3, contractAddress, wallet, tokenId, rentTokenId, () => {
                    // RENTED
                    afterRent(tokenId, rentTokenId);
                });
            } else {
                getRentPrice(web3, contractAddress, tokenId, (price) => {
                    console.log("price: " + price);

                    rent(web3, contractAddress, wallet, tokenId, rentTokenId, price, () => {
                        // RENTED
                        afterRent(tokenId, rentTokenId);
                    });
                });
            }
        });
    }
    const afterRent = (tokenId, rentTokenId) => {
        console.log("rented");
        let newPresent = { id: rentTokenId, isPresent: true, owner: wallet };
        insertNft(wallet, contractAddress, rentTokenId, newPresent);
        let gift = myPresents.filter(x => x.id === tokenId)[0];
        if (gift === undefined || gift == null){ gift = presents.filter(x => x.id === tokenId)[0]; }
        console.log("gift:");
        console.log(gift);
        let originalPresent = { id: tokenId, isPresent: true, remainRents: (gift.remainRents - 1),
            owner: gift.owner };
        updateNft(wallet, contractAddress, tokenId, originalPresent);

        updateNfts([newPresent, originalPresent]);
        NotificationManager.success("Present was successfully rented.", "Rented", 5000);
    }
    const contractWrap = (tokenId, contractNft, nftId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        console.log("tokenId: " + tokenId);
        let rentable = findRentable(tokenId);
        if (rentable === undefined) {
            NotificationManager.warning("Rent a present first.", "Present wasn't rented yet", 5000);
            /*getRentTokenId(web3, contractAddress, tokenId, val => {
                let rentTokenId = val;

                wrapPrivate(rentTokenId, contractNft, nftId);
            });*/
        } else {
            let rentTokenId = rentable.id;
            wrapPrivate(rentTokenId, contractNft, nftId);
        }
    }
    const wrapPrivate = (rentTokenId, contractNft, nftId) => {
        if (contractNft === undefined) {
            contractNft = contractAddress;
        }
        console.log("rentTokenId: " + rentTokenId + " contractNft: " + contractNft + " nftId: " + nftId);
        approveIfNeeded(contractNft, () => {
            wrap(web3, contractAddress, wallet, rentTokenId, contractNft, nftId, (val) => {
                // WRAPPED
                console.log("wrap");
                let gift = myPresents.filter(x => x.contractNft === contractNft && x.nftId === nftId)[0];
                if (gift === undefined) { gift = myPresents.filter(x => x.id === nftId)[0]; }
                gift.owner = contractAddress;
                updateNft(wallet, contractNft, nftId, gift);
                let wrapper = myPresents.filter(x => x.id === rentTokenId)[0];
                wrapper.contractNft = contractNft;
                wrapper.nftId = nftId;
                updateNft(wallet, contractAddress, rentTokenId, wrapper);

                removeLocalNft(contractNft, nftId);
                NotificationManager.success("NFT was wrapped successfully.", "Wrapped", 5000);
            }, (err) => {
                NotificationManager.error("Verify that you own the NFT to wrap it and that it is on correct network.", "Wrapping not successful", 8000);
            });
        });
    }
    const findRentable = (tokenId) => {
        let result = myPresents.filter(x => x.id >= MAX_SUPPLY && (x.id % MAX_SUPPLY) === (tokenId % MAX_SUPPLY) && x.contractNft === undefined);
        return result !== undefined && result.length > 0 ? result[0] : undefined;
    }
    const approveIfNeeded = (contractNft, onFinish) => {
        isApprovedForAll(web3, contractNft, wallet, (isApproved) => {
            if (!isApproved) {
                NotificationManager.info("Approve first, then wrapping will be possible.", "Approval needed", 5000);
                setApprovalForAll(web3, contractAddress, wallet, () => {
                    onFinish();
                });
            } else {
                onFinish();
            }
        });
    }
    const contractUnwrap = (rentTokenId, contractNft, nftId) => {
        if (Date.now() < 1640354400000) {
            NotificationManager.warning("You can not open it before Christmas.", "Too soon", 5000);
        } else {
            unwrap(web3, contractAddress, rentTokenId, wallet, () => {
                // UNWRAPPED
                console.log("unwrap");
                let wrapper = myPresents.filter(x => x.id === rentTokenId)[0];
                wrapper.owner = wallet;
                updateNft(wallet, contractAddress, rentTokenId, wrapper);
                updateNft(wallet, contractNft, nftId, { contractNft: contractNft, nftId: nftId, owner: wallet } );
                NotificationManager.success("Present was successfully unwrapped.", "Unwrapped", 5000);
            });
        }
    }
    const importSingle = (contractId, tokenId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ return; }
        tokenId = parseInt(tokenId);
        if (isNaN(tokenId) || tokenId < 0){ 
            NotificationManager.info("Please fill token id first.", "Wrong token id", 5000);
            return; 
        }
        ownerOf(web3, contractId, tokenId, (owner) => {
            if (owner !== undefined) {
                if (isMine(owner)) {
                    createNft(contractId, tokenId, true, (newNft) => {
                        setNfts(x => [...x, newNft]);
                        insertNft(wallet, contractId, tokenId, newNft);
                        NotificationManager.success("NFT loaded.", "NFT found", 5000);
                    });
                }
            } else {
                //console.log("ERC1155");
                createNft(contractId, tokenId, false, (newNft) => {
                    setNfts(x => [...x, newNft]);
                    insertNft(wallet, contractId, tokenId, newNft);
                    NotificationManager.success("NFT loaded.", "NFT found", 5000);
                });
            }
        });
    }
    const notConnected = () => {
        NotificationManager.error("Connect wallet first.", "Wallet not connected", 5000);
    }
    const checkChain = () => {
        if (chain !== polygonChain && chain.length > 0) {
            NotificationManager.warning("Use Polygon blockchain to interact with presents - mint, rent, wrap, unwrap.", "Wrong blockchain", 5000);
        }
    }
    const importContract = (contractId, tokenId) => {
        if (web3 == null || wallet == null || wallet.length === 0){ 
            notConnected();
            return; 
        }
        if (contractId.length === 0) {
            NotificationManager.info("Please fill in smart contract address first.", "No NFT contract", 5000);
            return;
        }
        if (!web3.utils.isAddress(contractId)) {
            NotificationManager.error("Smart contract address has wrong format.", "Wrong NFT contract", 5000);
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
        let localNextId = nextId.current;
        nextId.current += transfers.length;

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
    }
    const transformUri = (tokenUri) => {
        if (tokenUri.substring(0, 7) === "ipfs://") {
            return "https://cloudflare-ipfs.com/ipfs/" + tokenUri.substring(7);
        }
        return tokenUri;
    }

    const createPresent = (order, id, canMint = true, notMinted = false, remainRents = 0) => {
        let price = canMint ? 10 : rentBasePrice;
        return { order: order, id: id, key: id, canMint: canMint, notMinted: notMinted, remainRents: remainRents, price: price,
            owner: null };
    }
    const createPresents = () => {
        const arr = [];
        const ids = [];
        
        let id = 52; 
        //ids.push(id);
        //arr.push(createPresent(0, id.toString(), false, false, 10));

        for (let i = 0; i < 20; ++i) {
            id = Math.floor(Math.random() * 30);
            if (id >= MAX_SUPPLY) { continue; } // Id is out of bound
            if (ids.includes(id)) { --i; continue; }
            ids.push(id);
            arr.push(createPresent(i, id.toString(), true, true));
        }
        return arr;
    }
    const createNft = (contractNft, nftId, isErc721, onCreated) => {
        let id = nextId.current;
        nextId.current += 1;
        const funcGetUri = isErc721 ? getTokenUri : getUri;
        funcGetUri(web3, contractNft, nftId, (tokenUri) => {
            if (tokenUri === undefined) { 
                NotificationManager.error("Token URL wasn't found.", "Token URL not found", 5000);
                return; 
            }
            let newTokenUri = transformUri(tokenUri);

            axios.get(newTokenUri).then((val2) => {
                console.log(val2);
                let imgSrc = transformUri(val2.data.image);
                let title = val2.data.name;
                onCreated({ id: id, title: title, img: imgSrc, contractNft: contractNft, nftId: nftId });
            }).catch((err) => {
                NotificationManager.error("NFT can not be loaded.", "NFT not found", 5000);
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
    useEffect(() => {
        checkChain();
    }, [chain])
    
    const addChainPolygon = () => {
        addChain(eth, CHAIN_POLYGON, getChainName(CHAIN_POLYGON), 
            "Matic", getChainMainCoin(CHAIN_POLYGON), ["https://rpc-mainnet.matic.network"], ["https://explorer.matic.network"]);
    }

    useEffect(() => {
        if (web3 == null || wallet == null || wallet.length === 0){ return; }
        //setStartTime(web3, contractAddress, wallet, 1637405401);
        //setPrice(web3, contractAddress, wallet, 0.0001);

        getTransfers(web3, contractAddress, wallet, (res) => {
            console.log("transfers:");
            console.log(res);
            let arr = [];
            for (let i = 0; i < res.length; ++i){
                let tokenId = res[i].returnValues.tokenId;
                let owner = res[i].returnValues.to;
                let item = createPresent(i, tokenId, false, false, 0);
                item.remainRents = undefined;
                item.owner = owner;
                item.contractAddress = contractAddress;
                item.haveReceived = res[i].returnValues.from !== zeroAddress;
                if (item.haveReceived) {
                    arr.push(item);
                }
            }
            if (arr.length === 0) { return; }
            updateNfts(arr);
        });

        console.log("wallet changed: " + wallet);
        try {
            getBalance(web3, wallet, x => setBalance(x));
        } catch {
            setBalance(x => x = 0);
        }

        getNfts(wallet, (val) => {
            updateNfts(val.data);
            /*console.log("getNfts:");
            console.log(val);
            let arrNfts = nfts;
            let arrGifts = myPresents;
            let localNextId = 0;
            for (let i = 0; i < val.data.length; ++i) {
                if (val.data[i].isPresent) {
                    let gift = val.data[i];
                    gift.canMint = false;
                    gift.notMinted = false;
                    gift.key = nextId.current + localNextId;
                    ++localNextId;
                    if (!arrGifts.some(x => x.id === gift.id)) {
                        arrGifts.push(gift);
                    }
                } else {
                    arrNfts.push(val.data[i]);
                }
            }
            nextId.current += localNextId;
            setNfts(x => x = arrNfts);
            setMyPresents(x => x = arrGifts);*/
        });
    }, [wallet, web3]);
    useEffect(() => {
        document.title = "lucky-presents";
        setPresents(x => x = createPresents());
    }, []);
    useEffect(() => {
        updatePresentsState();
    }, [presents]);

    const updateNfts = (newNfts) => {
        console.log("getNfts:");
        console.log(newNfts);
        let arrNfts = [];
        let arrGifts = [];
        for (let i = 0; i < newNfts.length; ++i) {
            let item = newNfts[i];
            if (item.haveReceived) {
                setReceived(x => x = [...received, item]);
            } else if (item.isPresent || item.contractAddress === contractAddress) {
                console.log(item);
                if (item.owner === contractAddress) { // Present is inside other contract
                    continue;
                }
                if (item.tokenId){ item.id = item.tokenId; }
                item.canMint = false;
                item.notMinted = false;
                item.order = 0;
                item.key = nextId.current;
                ++nextId.current;
                if (true || !myPresents.some(x => x.id === item.id)) {
                    arrGifts.push(item);
                }
            } else if (!nfts.some(x => x.id === item.id && x.contractAddress === item.contractAddress)) {
                item.key = item.nftId + ';' + item.contractNft;
                arrNfts.push(item);
            }
        }
        if (arrGifts.length > 0){ 
            setMyPresents(x => x = [...myPresents.filter(x => !arrGifts.some(y => x.id === y.id)), ...arrGifts]); 
        }
        if (arrNfts.length > 0){ setNfts(x => x = [...nfts, ...arrNfts]); }
    }
    const removeLocalNft = (contractNft, nftId) => {
        if (contractNft === contractAddress) {
            setMyPresents(x => x = [...myPresents.filter(x => x.id !== nftId)]); 
        } else {
            setNfts(x => x = [...nfts.filter(x => x.contractNft !== contractNft || x.nftId !== nftId)]);
        }
    }
    const updatePresentsState = () => {
        if (presents == null || presents.length === 0 || wasUpdated){ return; }
        setWasUpdated(x => x = true);
        //console.log(presents);
        getPresents(contractAddress, (gifts) => {
            updatePresentsStateLocal(gifts.data);
        });
    }
    const updatePresentsStateLocal = (gifts) => {
        const arr = [];
        //console.log("getPresents:");
        //console.log(gifts);
        let localNextId = 0;
        for (let i = 0; i < gifts.length; ++i) {
            const present = gifts[i];
            const filteredIndex = indexOf(presents, x => x.id === presents.id || x.id?.toString() === present.id?.toString());
            if (filteredIndex > -1) {
                if (present.owner) {
                    //console.log("present: " + present.id + " count: " + presents.length);
                    const item = { ...present, canMint: false, notMinted: false, key: nextId.current + localNextId, order: presents[filteredIndex].order };
                    //presents.splice(filteredIndex, 1);
                    //arr.concat([item]);
                    arr.push(item);
                    //console.log(item);
                    localNextId += 1;
                    //setPresents(x => x = arr);//.sort(x => x.order));
                }
            }
        }
        setPresents(x => x = [...presents.filter(x => !arr.some(y => x.id === y.id)), ...arr]);
        if (localNextId > 0){ nextId.current += localNextId; }
    }

    return (
        <Router>
            <ReactTooltip />
            <div className="header">
                <a href="http://www.lucky-presents.com">
                    <img src="https://gateway.pinata.cloud/ipfs/QmT18BUESpx7iupthA5ZyMN9YXPTd8ypUUi6V3PUGhvSVW/1.png" alt="" />
                    <div>lucky-presents.com</div>
                </a>
                <div className="externalLink"><a href="https://discord.gg/RM8hDC5t" target="new"><img src={discordImg} alt="Discord" /></a></div>
                <div className="externalLink"><a href="https://twitter.com/lucky_presents2" target="new"><img src={twitterImg} alt="Twitter" /></a></div>
            </div>
            <div className="topnav">
                <Link to="/">Gallery</Link>
                <Link to="/my">My NFTs</Link>
                <Link to="/received">Received</Link>
                <Link to="/howItWorks">How it works</Link>
                <WalletButton connectHandler={connectHandler} addPolygon={addChainPolygon} wallet={wallet} chain={chain} balance={balance} />
            </div>
            
            <Routes>
                <Route path="/" element={<Gallery presents={presents} myPresents={myPresents} mint={contractMint} rent={contractRent} wrap={contractWrap} wallet={wallet} />} />
                <Route path="/my" element={<Gallery presents={myPresents} myPresents={myPresents} nfts={nfts} importContract={importContract} rent={contractRent} wrap={contractWrap} unwrap={contractUnwrap} wallet={wallet} />} />
                <Route path="/howItWorks" element={<HowItWorks />} />
                <Route path="/received" element={<MyPresents received={received} />} />
            </Routes>
            
            <NotificationContainer />
        </Router>
    )
}