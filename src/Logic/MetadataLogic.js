import { getTokenUri, getUri, ownerOf } from './NftLogic'
import { NotificationManager } from 'react-notifications'

const axios = require('axios');


export const transformUri = (tokenUri) => {
    if (tokenUri.substring(0, 7) === "ipfs://") {
        return "https://ipfs.io/ipfs/" + tokenUri.substring(7);
        //return "https://cloudflare-ipfs.com/ipfs/" + tokenUri.substring(7);
    }
    return tokenUri;
}

export const createNft = (web3, contractNft, nftId, id, onCreated, isNotification = true) => {
    ownerOf(web3, contractNft, nftId, (owner) => {
        console.log("owner: " + owner);
        createNftPrivate(web3, contractNft, nftId, owner !== undefined, id, onCreated, isNotification);
    });
}
const createNftPrivate = (web3, contractNft, nftId, isErc721, id, onCreated, isNotification) => {
    const funcGetUri = isErc721 ? getTokenUri : getUri;
    funcGetUri(web3, contractNft, nftId, (tokenUri) => {
        console.log("contractNft: " + contractNft + ", nftId: " + nftId + ", tokenUri: " + tokenUri);
        if (tokenUri === undefined) {
            if (isNotification) {
                NotificationManager.error("Token URL wasn't found.", "Token URL not found", 5000);
            }
            return;
        }
        let newTokenUri = transformUri(tokenUri);

        axios.get(newTokenUri).then((val2) => {
            console.log(val2);
            let imgSrc = transformUri(val2.data.image);
            let title = val2.data.name;
            onCreated({ id: id, title: title, img: imgSrc, contractNft: contractNft, nftId: nftId });
        }).catch((err) => {
            if (isNotification) {
                NotificationManager.error("NFT can not be loaded.", "NFT not found", 5000);
            }
        });
    });
}