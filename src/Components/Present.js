import { useState } from 'react'
import { MintMenu } from './MintMenu'
import { MintSubmenu } from './MintSubmenu'

import { getUrl } from './Units'


export const Present = (props) => {
    const { order, id, canMint, notMinted, remainRents, price, mint, rent, wrap, unwrap, owner, wallet, myPresents, isPresent,
        contractNft, nftId } = props;
    const [isActiveSubmenu, setIsActiveSubmenu] = useState(false);

    const rndBackground = (id) => {
        return "bg" + (parseInt(id) % 6);
    }
    const presentHandler = () => {
        setIsActiveSubmenu(x => x = !x);
    }

    return (
        <div className="presentImage" onClick={presentHandler}>
            <div className={rndBackground(order)}>
                <div className="presentImageIn">
                    <div>
                        <img className="mainImage" src={getUrl(id)} alt='present' />
                        <div className="mintMenu">
                            <MintMenu canMint={canMint} notMinted={notMinted} remainRents={remainRents} contractNft={contractNft} />
                        </div>
                    </div>
                    <MintSubmenu id={id} isVisible={isActiveSubmenu} canMint={canMint} notMinted={notMinted} remainRents={remainRents} price={price}
                        mint={mint} rent={rent} wrap={wrap} unwrap={unwrap} owner={owner} wallet={wallet} myPresents={myPresents} isPresent={isPresent} 
                        contractNft={contractNft} nftId={nftId} />
                </div>
            </div>
        </div>
    )
}