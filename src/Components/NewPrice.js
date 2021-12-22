import { useState } from 'react'

export const NewPrice = (props) => {
    const { closeHandler, setPriceHandler, startPrice } = props;
    const [price, setPrice] = useState(startPrice);

    return (<div className="flex">
        <input type="text" size={4} value={price} onChange={(e) => setPrice(e.target.value)} />&nbsp;
        <div className="button" onClick={() => { setPriceHandler(price); closeHandler(); }}>ok</div>&nbsp;<div className="button" onClick={() => closeHandler()}>cancel</div>
    </div>)
}