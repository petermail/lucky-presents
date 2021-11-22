import { useState } from 'react'
import { PRICE_UNIT } from './Units'
import { PresentSelector } from './PresentSelector'

export const MintSubmenu = (props) => {
    const { id, isVisible, canMint, notMinted, remainRents, price, mint, rent, wrap,
        allowWrap, myPresents, contractNft, nftId } = props;
    const [tokenId, setTokenId] = useState(-1);

    const mintHandler = (e) => {
        mint(id, price);
        e.stopPropagation();
    }
    const rentHandler = (e) => {
        rent(id, price);
        e.stopPropagation();
    }
    const wrapHandler = (e) => {
        wrap(tokenId, contractNft, nftId);
        e.stopPropagation();
    }
    const emptyHandler = (e) => {
        e.stopPropagation();
    }
    const updateTokenIdHandler = (id) => {
        setTokenId(x => x = id);
    }

    if (isVisible) {
        if (canMint)
            return (
                <div className="mintSubmenu">
                    Ready to be minted<br />
                    Price: {price} {PRICE_UNIT}
                    <div className="button" onClick={mintHandler}>mint</div>
                    Id: {id}
                </div>
            )
        else if (notMinted) 
            return (
                <div className="mintSubmenu">
                    Coming soon
                </div>
            )
        else if (remainRents > 0)
            return (
                <div className="mintSubmenu">
                    Remains for rent: {remainRents} <br />
                    Price: {price} {PRICE_UNIT}
                    <div className="button" onClick={rentHandler}>rent</div>
                    Id: {id}
                </div>
            )
        else if (allowWrap) {
            if (myPresents.length > 0)
                return (
                    <div>
                        <PresentSelector myPresents={myPresents} updateTokenIdHandler={updateTokenIdHandler} />
                        <div className="button" onClick={wrapHandler}>wrap</div>
                    </div>
                )
            else 
                return (
                    <div>
                        <div>You don't have <br />any gift yet.</div>
                        <div className="buttonDisabled" onClick={emptyHandler}>wrap</div>
                    </div>
                )
        }
        else return (<div></div>)
    } else return (<div></div>)
}