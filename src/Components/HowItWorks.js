import mintExample from '../Images/mint_example.png'
import rentExample from '../Images/rent_example.png'
import wrapExample from '../Images/wrap_example.png'
import videoExample from '../Videos/LuckyPresents.mp4'

export const HowItWorks = () => {

    return (
        <div className="mainMargin">
            <h3>How it works</h3>
            <video src={videoExample} width={600} controls autoplay muted></video>
            <p>
                <b>Mint your present</b> - now you are owner of one of 300 unique NFTs, you can rent it for additional revenue and set your rent price.
            </p>
            <p>
                <img src={mintExample} alt="mint example" />
            </p>
            <p><b>Rent a present</b> - rent a present and now you can wrap another NFT into it and send it to someone ahead of Christmas but they will not be able to open it before Christmas.</p>
            <p>
                <img src={rentExample} alt="rent example" />
            </p>
            <p><b>Wrap a present</b> - choose your NFT you wish to wrap into a present. Select one of your presents and wrap it inside. Symbol of tree tells you that it will be available to open it on Christmas.</p>
            <p>
                <img src={wrapExample} alt="wrap example" />
            </p>
            <p><b>Why Polygon</b></p>
            <p>
                Polygon is fast and cheap L2 blockchain that allows great user experience when sending and receiving presents. This way users will avoid high fees of Ethereum blockchain.
            </p>
            <p><b>More detailed information</b></p>
            <p>
                There are 2 kinds of presents - original and rented. Original presents work like regular NFTs but they can create a certian number of copies - <i>rents</i>. Rented presents are cheaper but they can not create new rented presents and once they are unwrapped, they are burned.<br />
                Regular NFTs can be wrapped into rented presents. (If you own original present, you can create self-rented present for free.) On the background, your NFT is sent to lucky-presents smart contract that holds the NFT until the present is unwrapped. This means that you will see in your wallet only the rented present and not the NFT inside it so if you send the present to someone, they don't know what is inside, until they open it. At that point, smart contract sends the NFT to the owner of the rented present that holds the NFT.
            </p>
        </div>
    )
}