import mintExample from '../Images/mint_example.png'
import rentExample from '../Images/rent_example.png'

export const HowItWorks = () => {

    return (
        <div className="mainMargin">
            <h3>How it works</h3>
            <p>
                <b>Mint your present</b> - now you are owner of one of 300 unique NFTs, you can rent it for additional revenue and set your rent price.
            </p>
            <p>
                <img src={mintExample} alt="mint example" />
            </p>
            <p><b>Rent a present</b> - rent a present and now you can wrap another NFT into it and send it to someone ahead of the special occasion and set when they are allowed to open it.</p>
            <p>
                <img src={rentExample} alt="rent example" />
            </p>
        </div>
    )
}