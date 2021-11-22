
const axios = require('axios');

export const insertNft = (address, contract, tokenId, json) => {
    axios.post("http://fullbridge.wz.cz/LuckyPresents/insertNft.php", 
        { address: address, contract: contract, tokenId: tokenId, json: JSON.stringify(json) }).then(val => {
            console.log("inserted:");
            console.log(val);
        });
}
export const getNfts = (address, onFinish) => {
    let id = 0;
    let limit = 1000;
    let lock = "Lj287sjAKjfsi2918dEJ";
    axios.get("http://fullbridge.wz.cz/LuckyPresents/getNfts.php?id=" + id + "&limit=" + limit 
        + "&lock=" + lock + "&address=" + address).then(val => {
            onFinish(val);
    });
}