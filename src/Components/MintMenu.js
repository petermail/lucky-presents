
export const MintMenu = (props) => {
    const { canMint, notMinted, remainRents, contractNft } = props;

    if (canMint){
        return (<div>mint</div>)
    } else if (notMinted){
        return (<div>coming soon</div>)
    } else {
        if (remainRents > 0){
            return (<div>remaining rents {remainRents}</div>)
        } else if (remainRents === 0) {
            return (<div>all rented</div>)
        } else if (contractNft){
            return (<div>gift inside</div>)
        } else { return (<div>rented</div>) }
    }
}