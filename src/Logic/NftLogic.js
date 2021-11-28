
import Erc721Abi from '../Json/ERC721Abi.json'
import LuckyPresents from '../Json/LuckyPresentsNFT.json'
import MetadataAbi from '../Json/MetadataAbi.json'
import { MAX_RENTS } from '../Components/Units'

const blocksInPast = 100;

export const isApprovedForAll = (web3, contractAddress, address, onFinish) => {
    const contract = new web3.eth.Contract(Erc721Abi, contractAddress);
    contract.methods.isApprovedForAll(address, contractAddress).call((err, val) => {
        onFinish(val);
    });
}
export const setApprovalForAll = (web3, contractAddress, address, onFinish) => {
    const contract = new web3.eth.Contract(Erc721Abi, contractAddress);
    contract.methods.setApprovalForAll(contractAddress, true).send({ from: address }).then(() => {
        onFinish();
    }, (err) => console.log("Error when approving."));
}

export const getTokenUri = (web3, contractAddress, tokenId, onFinish) => {
    const contract = new web3.eth.Contract(MetadataAbi, contractAddress);
    contract.methods.tokenURI(tokenId).call((err, val) => {
        onFinish(val);
    });
}
export const getUri = (web3, contractAddress, tokenId, onFinish) => {
    const contract = new web3.eth.Contract(MetadataAbi, contractAddress);
    contract.methods.uri(tokenId).call((err, val) => {
        onFinish(val);
    });
}

export const ownerOf = (web3, contractAddress, tokenId, onFinish) => {
    const contract = new web3.eth.Contract(Erc721Abi, contractAddress);
    contract.methods.ownerOf(tokenId).call((err, val) => {
        onFinish(val);
    });
}

export const hasPresentInside = (web3, contractAddress, rentTokenId, onFinish) => {
    const contract = new web3.eth.Contract(Erc721Abi, contractAddress);
    contract.methods.hasPresentInside(rentTokenId).call((err, val) => {
        onFinish(val);
    });
}

export const getRemainRents = (web3, contractAddress, tokenId, onFinish) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.getRemainsRents(tokenId).call((err, val) => {
        onFinish(val);
    });
}

export const getTokensOfOwner = (web3, contractAddress, address, onFinish) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.tokensOfOwner(address).call((err, val) => {
        onFinish(val);
    });
}

export const getTransfers = (web3, contractAddress, address, onUpdate) => {
    const contract = new web3.eth.Contract(Erc721Abi, contractAddress);
    web3.eth.getBlockNumber().then(blockNumber => {
        console.log("blockNumber: " + blockNumber);
        contract.getPastEvents("Transfer", { filter: { to: address }, fromBlock: blockNumber - blocksInPast }, (err, val) => {
            onUpdate(val);
        });
    });
}

export const getRentTokenId = (web3, contractAddress, tokenId, onFinish) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.getRentTokenId(tokenId, MAX_RENTS).call((err, val) => {
        onFinish(val);
    });
}

export const getRentPrice = (web3, contractAddress, rentTokenId, onFinish) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.getRentPrice(rentTokenId).call((err, val) => {
        console.log("rentPrice:");
        console.log(val);
        const price = Number.parseFloat(web3.utils.fromWei(String(val)));
        onFinish(price);
    });
}

export const wrap = (web3, contractAddress, address, rentTokenId, contractNft, nftId, onUpdate) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    // Sending to address is avoiding sending
    contract.methods.wrapAndSendPresentNFT(address, rentTokenId, contractNft, nftId).send({ from: address }).then(() => {
        onUpdate();
    }, (err) => { console.log("Error when wrapping."); });
}

export const unwrap = (web3, contractAddress, rentTokenId, address, onFinish) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.openPresentNFT(rentTokenId).send({ from: address }).then(() => {
        onFinish();
    }, (err) => { console.log("Error when unwrapping."); })
}

export const rent = (web3, contractAddress, address, tokenId, rentTokenId, price, onUpdate) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    const weiAmount = web3.utils.toWei(String(price.toFixed(18)), "ether");
    contract.methods.rentNFT(tokenId, rentTokenId).send({ from: address, value: weiAmount }).then(() => {
        onUpdate();
    }, (err) => { console.log("Error when renting."); });
}
export const selfRent = (web3, contractAddress, address, tokenId, rentTokenId, onUpdate) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.selfRentNFT(tokenId, rentTokenId).send({ from: address }).then(() => {
        onUpdate();
    }, (err) => { console.log("Error when renting."); });
}

export const mint = (web3, contractAddress, address, tokenId, price, onUpdate) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    const weiAmount = web3.utils.toWei(String(price.toFixed(18)), "ether");
    contract.methods.mintNFT(tokenId).send({ from: address, value: weiAmount }).then(() => {
        onUpdate();
    }, (err) => { console.log("Error when minting."); });
}

export const setStartTime = (web3, contractAddress, address, startTime) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    contract.methods.setStartTime(startTime).send({ from: address }).then(() => console.log("Time updated"),
        (err) => console.log("Error when setting time"));

}
export const setPrice = (web3, contractAddress, address, price) => {
    const contract = new web3.eth.Contract(LuckyPresents.abi, contractAddress);
    const weiAmount = web3.utils.toWei(String(price.toFixed(18)), "ether");
    contract.methods.setPrice(weiAmount).send({ from: address }).then(() => console.log("Price updated"),
        (err) => console.log("Error when setting price"));
}