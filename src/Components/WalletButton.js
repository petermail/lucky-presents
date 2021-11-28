import { CHAIN_POLYGON } from './Units'
import { coinRound, getChainMainCoin } from './Converters'
import ReactTooltip from 'react-tooltip'

import polygonIcon from '../Images/polygon.png'

export const WalletButton = (props) => {
    const { wallet, balance } = props;

    const shortenWallet = (wallet) => {
        if (wallet !== null && wallet.length > 13){
            return wallet.substring(0, 6) + "..." + wallet.substring(wallet.length - 4);
        } else {
            return wallet;
        }
    }

    if (wallet.length > 0) {
        return (
            <div>
                { props.chain !== CHAIN_POLYGON &&
                <div className="connectIcon" data-tip="switch to polygon network"
                    onClick={props.addPolygon}>
                    <img src={polygonIcon} alt="switch to polygon" width="22" />
                </div>
                }
                <div className="connect">{coinRound(props.chain, balance)} {getChainMainCoin(props.chain)} {shortenWallet(wallet)}</div>
                <ReactTooltip /> 
            </div>
        )
    } else
    return (
        <div className="connect" onClick={props.connectHandler}>connect wallet</div>
    )
}