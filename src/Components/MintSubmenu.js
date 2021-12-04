import { useState } from 'react'
import { PRICE_UNIT, contractAddress } from './Units'
import { PresentSelector } from './PresentSelector'

export const MintSubmenu = (props) => {
    const { id, isVisible, canMint, notMinted, remainRents, price, mint, rent, wrap, unwrap,
        allowWrap, myPresents, contractNft, nftId, owner, wallet, isPresent } = props;
    const [tokenId, setTokenId] = useState(-1);
    const [imgSrc, setImgSrc] = useState("");

    const mintHandler = (e) => {
        mint(id, price);
        e.stopPropagation();
    }
    const rentHandler = (e) => {
        rent(id, owner);
        e.stopPropagation();
    }
    const wrapHandler = (e) => {
        wrap(tokenId, contractNft, nftId ?? id);
        e.stopPropagation();
    }
    const unwrapHandler = (e) => {
        unwrap(id, contractNft, nftId);
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
                <div className="mintSubmenu" onClick={emptyHandler}>
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
                <div className="mintSubmenu" onClick={emptyHandler}>
                    Remains for rent: {remainRents} <br />
                    Price: {price} {PRICE_UNIT}
                    <div className="button" onClick={rentHandler}>
                        { owner === wallet &&
                            <>self-rent</>
                        }
                        { owner !== wallet &&
                            <>rent</>
                        }
                    </div>
                    Id: {id}<br />
                    { owner === wallet &&
                    <>
                        <PresentSelector myPresents={myPresents} updateTokenIdHandler={updateTokenIdHandler} />
                        { myPresents !== undefined && myPresents.length > 0 &&
                            <div className="button" onClick={wrapHandler}>wrap</div>
                        }
                    </>
                    }
                </div>
            )
        else if (allowWrap) {
            if (myPresents.length > 0)
                return (
                    <div onClick={emptyHandler}>
                        <PresentSelector myPresents={myPresents} updateTokenIdHandler={updateTokenIdHandler} />
                        <div className="button" onClick={wrapHandler}>wrap</div>
                    </div>
                )
            else 
                return (
                    <div onClick={emptyHandler}>
                        <div>You don't have <br />any gift yet.</div>
                        <div className="buttonDisabled" onClick={emptyHandler}>wrap</div>
                    </div>
                )
        }
        else if (isPresent && contractNft) {
            return (
                <div className="presentImageIn" onClick={emptyHandler}>
                    <div className="mintSubmenu">
                        <div className="button" onClick={unwrapHandler}>unwrap</div>
                    </div>
                </div>
            )
        }
        else return (<div></div>)
    } else return (<div></div>)
}