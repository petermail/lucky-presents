import { useState } from 'react'
import { MintMenu } from './MintMenu'
import { MintSubmenu } from './MintSubmenu'

import { getUrl } from './Units'


export const Present = (props) => {
    //const baseUrl = "https://gateway.pinata.cloud/ipfs/QmT18BUESpx7iupthA5ZyMN9YXPTd8ypUUi6V3PUGhvSVW/";
    const { order, id, canMint, notMinted, remainRents, price, mint, rent } = props;
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
                        <img src={getUrl(id)} alt='present' />
                        <div className="mintMenu">
                            <MintMenu canMint={canMint} notMinted={notMinted} remainRents={remainRents} />
                        </div>
                    </div>
                    <MintSubmenu id={id} isVisible={isActiveSubmenu} canMint={canMint} notMinted={notMinted} remainRents={remainRents} price={price}
                        mint={mint} rent={rent} />
                </div>
            </div>
        </div>
    )
}