
const axios = require('axios');

export const insertNft = (address, contract, tokenId, json) => {
    axios.post("https://fullbridge.wz.cz/LuckyPresents/insertNft.php", 
        { address: address, contract: contract, tokenId: tokenId, json: JSON.stringify(json) }).then(val => {
            //console.log("inserted:");
            //console.log(val);
        });
}
export const getNfts = (address, onFinish) => {
    let id = 0;
    let limit = 1000;
    let lock = "Lj287sjAKjfsi2918dEJ";
    let url = "https://fullbridge.wz.cz/LuckyPresents/getNfts.php?id=" + id + "&limit=" + limit 
        + "&lock=" + lock + "&address=" + address;
    //console.log("getNfts: " + url);
    axios.get(url).then(val => {
        onFinish(val);
    });
}
export const getPresents = (contract, onFinish) => {
    let id = 0;
    let limit = 1000;
    let lock = "Lj287sjAKjfsi2918dEJ";
    let url = "https://fullbridge.wz.cz/LuckyPresents/getPresents.php?id=" + id + "&limit=" + limit 
        + "&lock=" + lock + "&contract=" + contract;
    //console.log("getPresents: " + url);
    axios.get(url).then(val => {
            onFinish(val);
    });
}

export const getPrices = (onFinish) => {
    let id = 0;
    let limit = 1000;
    let lock = "Lj287sjAKjfsi2918dEJ";
    let url = "https://fullbridge.wz.cz/LuckyPresents/getPrices.php?id=" + id + "&limit=" + limit
        + "&lock=" + lock;
    //console.log(url);
    axios.get(url).then(val => {
        onFinish(val);
    });
}

export const insertPrice = (price, address, tokenId) => {
    let url = "https://fullbridge.wz.cz/LuckyPresents/insertOrUpdatePrice.php";
    axios.post(url, { price: price, address: address, tokenId: tokenId }).then(val => {

    });
}

export const updateNft = (address, contract, tokenId, json) => {
    axios.post("https://fullbridge.wz.cz/LuckyPresents/updateNft.php", 
        { address: address, contract: contract, tokenId: tokenId, json: JSON.stringify(json) }).then((val) => {
        //console.log("updated:");
        //console.log(val);
    });
}