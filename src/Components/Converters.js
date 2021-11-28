
// Round to about 10 USD cents for each coin
export const coinRound = (chain, x) => {
    switch (chain){
        case "137":
            return Math.round(x * 10) / 10;
        case "56":
        default: return Math.round(x * 1000) / 1000;
    }
}

export const getChainName = (x) => {
    switch (String(x)){
        case "56": return "Binance";
        case "137": return "Polygon";
        case "1": return "Ethereum";
        default: return x;
      }
}

export const getChainMainCoin = (x) => {
    switch (String(x)){
      case "56": return "BNB";
      case "137": return "MATIC";
      case "1": return "ETH";
      default: return "coins";
    }
  }