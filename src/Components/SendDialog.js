import { useState, useEffect } from 'react'
import { verifyAddress } from '../Logic/WalletConn'
import { safeTransferFrom } from '../Logic/NftLogic';
import { contractAddress } from './Units';
import { NotificationManager } from 'react-notifications';

export const SendDialog = (props) => {
    const { web3, wallet, tokenId, isActive, changeDialogActive } = props;
    const [addressTo, setAddressTo] = useState("");

    const handleTransfer = (e) => {
        if (addressTo && verifyAddress(web3, addressTo)) {
            safeTransferFrom(web3, contractAddress, wallet, addressTo, tokenId, (val) => {
                NotificationManager.success("Transfer has finished.", "Transfer successful", 5000);
            });
            closeDialog();
        } else {
            NotificationManager.error("Used address has wrong format.", "Wrong address", 5000);
        }
    }

    const dontClose = (e) => {
        e.stopPropagation();
    }
    const closeDialog = () => {
        changeDialogActive(false);
    }

    if (isActive) {
        return (
            <div className="dialog" onClick={closeDialog}>
                <div className="dialogIn" onClick={dontClose}>
                    <div>Transfer present to: <input type="text" value={addressTo} onChange={e => setAddressTo(e.target.value)} /></div>
                    <div className="dialogFooter">
                        <div className="button" onClick={handleTransfer}>Transfer</div>
                        <div className="button" onClick={closeDialog}>Cancel</div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (<div></div>)
    }
}