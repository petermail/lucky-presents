import { useState } from 'react'
import { MintSubmenu } from './MintSubmenu'

export const Nft = (props) => {
    const { id, img, title, myPresents, wrap, contractNft, nftId, wallet } = props;
    const [isActiveSubmenu, setIsActiveSubmenu] = useState(false);

    const rndBackground = (id) => {
        return "bg" + (parseInt(id) % 6);
    }
    const presentHandler = () => {
        setIsActiveSubmenu(x => x = !x);
    }

    return (
        <div className="presentImage" onClick={presentHandler}>
            <div className={rndBackground(id)}>
                <div className="presentImageIn">
                    <div className="nft">
                        <img className="mainImage" src={img} alt="NFT" />
                        <div>{title}</div>
                    </div>
                    <MintSubmenu id={id} isVisible={isActiveSubmenu} canMint={false} notMinted={false} remainRents={0}
                        allowWrap={true} myPresents={myPresents} wrap={wrap} contractNft={contractNft} nftId={nftId} wallet={wallet} />
                </div>
            </div>
        </div>
    )
}