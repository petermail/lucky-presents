import { useState, useEffect } from 'react'
import { getUrl } from './Units'

import treeImg from '../Images/tree.png'

export const PresentSelector = (props) => {
    const { myPresents, updateTokenIdHandler } = props;
    const [selected, setSelected] = useState(0);

    const getImage = () => {
        return myPresents != null && myPresents.length > selected ? getUrl(myPresents[selected].id) : null;
    }
    const changeSelected = (e, step) => {
        setSelected(x => x = (x + step + myPresents.length) % myPresents.length);
        e.stopPropagation();
    }

    useEffect(() => {
        if (updateTokenIdHandler !== undefined && myPresents !== undefined && myPresents[selected] !== undefined) {
            updateTokenIdHandler(myPresents[selected].id);
        }
    }, [selected, myPresents, updateTokenIdHandler]);

    if (myPresents !== undefined && myPresents.length > 0) {
        return (
            <div id="giftSelector" className="flex">
                <div className="button vMiddle" onClick={(e) => changeSelected(e, -1)}>&lt;</div>
                <div className="small"><img src={getImage()} alt="present" /></div>
                <div className="button vMiddle" onClick={(e) => changeSelected(e, 1)}>&gt;</div>
                <div className="supersmall" data-tip="unwrap on Christmas"><img src={treeImg} alt="tree" /></div>
            </div>
        )
    } else { return (<div></div>) }
}