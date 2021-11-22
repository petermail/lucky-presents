import { useState, useEffect } from 'react'
import { getUrl } from './Units'

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
        updateTokenIdHandler(myPresents[selected].id);
    }, [selected, myPresents, updateTokenIdHandler]);

    if (myPresents !== undefined && myPresents.length > 0) {
        return (
            <div className="flex">
                <div className="button vMiddle" onClick={(e) => changeSelected(e, -1)}>&lt;</div>
                <div className="small"><img src={getImage()} alt="present" /></div>
                <div className="button vMiddle" onClick={(e) => changeSelected(e, 1)}>&gt;</div>
            </div>
        )
    } else { return (<div></div>) }
}