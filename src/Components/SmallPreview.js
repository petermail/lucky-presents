import { useState } from 'react'
import { createNft } from '../Logic/MetadataLogic'

export const SmallPreview = (props) => {
    const { contractNft, nftId, imgSrc, web3, setImgage } = props;
    const [imgSource, setImgSource] = useState(imgSrc);
    if (!imgSource) {
        createNft(web3, contractNft, nftId, 0, (newNft) => {
            setImgSource(x => newNft.img);
            setImgage(x => newNft.img);
            console.log("image: " + newNft.img);
        }, false);
    }

    if (imgSource) {
        return (<div className="smallPreview">
            <img src={imgSource} alt='NFT in present' />
        </div>)
    } else {
        return (<div></div>)
    }
}