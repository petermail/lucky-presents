import { Present } from './Present'
import { Nft } from './Nft'
import { NftContract } from './NftContract'

export const Gallery = (props) => {
    const { presents, nfts, mint, rent, wrap, unwrap, importContract, contractNft, nftId, wallet, myPresents } = props;

    if (nfts !== undefined && nfts.length === 0 && presents.length === 0) {
        return (
            <div className="presents">
                <NftContract importContract={importContract} />
                <div className="centered mainMargin">
                    No NFTs found. Try import them with contract name and token id.
                </div>
            </div>
        )
    } else return (
        <div className="presents">
            { (presents != null && nfts === undefined) &&
                <div className="centered mainMargin">
                    Minting coming soon, already December 4.
                </div>
            }
            { (nfts !== undefined) &&
                <NftContract importContract={importContract} />
            }
            { [...presents]?.sort((a, b) => a.order - b.order)?.map((x, index) => (
                <Present key={x.key} order={index} id={x.id} canMint={x.canMint} notMinted={x.notMinted} remainRents={x.remainRents} price={x.price}
                    mint={mint} rent={rent} wrap={wrap} unwrap={unwrap} owner={x.owner} wallet={wallet} myPresents={myPresents} isPresent={true}
                    contractNft={x.contractNft} nftId={x.nftId} />
            )) }
            { nfts?.map(x => (
                <Nft key={x.id} id={x.id} img={x.img} title={x.title} myPresents={presents} wrap={wrap} contractNft={contractNft} nftId={nftId} />
            )) }
        </div>
    )
}