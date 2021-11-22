import { Present } from './Present'

export const MyPresents = (props) => {
    const { received } = props;

    if (received == null || received.length === 0) {
        return (
            <div className="centered mainMargin">
                No one send you a present yet. Remind them what you want ;)
            </div>
        )
    } else {
        return (
            <div className="presents">
                { received.map(x => 
                    <Present key={x.id} order={x.order} id={x.id} canMint={x.canMint} notMinted={x.notMinted} remainRents={x.remainRents} price={x.price} />)
                }
            </div>
        )
    }
}