export const PRICE_UNIT = "MATIC";
export const CHAIN_POLYGON = "137"; // "Polygon";

export const MAX_SUPPLY = 300;
export const MAX_RENTS = 99;


export const contractAddress = "0xd203a410fEBd1cdFe77D89A8E1D2c5B573feC66c";// "0xA532303BFD5A99fAbe65C9405d72e3Ea65f8D4E5";
export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const baseUrl = "https://cloudflare-ipfs.com/ipfs/QmT18BUESpx7iupthA5ZyMN9YXPTd8ypUUi6V3PUGhvSVW/";
export const getUrl = (id) => {
    return baseUrl + (id % MAX_SUPPLY) + ".png";
}
