export const PRICE_UNIT = "MATIC";
export const CHAIN_POLYGON = "137"; // "Polygon";

export const MAX_SUPPLY = 300;
export const MAX_RENTS = 99;


export const baseUrl = "https://cloudflare-ipfs.com/ipfs/QmT18BUESpx7iupthA5ZyMN9YXPTd8ypUUi6V3PUGhvSVW/";
export const getUrl = (id) => {
    return baseUrl + (id % MAX_SUPPLY) + ".png";
}
