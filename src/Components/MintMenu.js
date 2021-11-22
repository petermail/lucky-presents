
export const MintMenu = (props) => {
    const { canMint, notMinted, remainRents } = props;

    if (canMint){
        return (<div>mint</div>)
    } else if (notMinted){
        return (<div>coming soon</div>)
    } else {
        if (remainRents > 0){
            return (<div>remaining rents {remainRents}</div>)
        } else {
            return (<div>all rented</div>)
        }
    }
}