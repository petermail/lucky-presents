import { useState } from "react";

export const NftContract = (props) => {
    const { importContract } = props;
    const [contract, setContract] = useState("");
    const [tokenId, setTokenId] = useState("");

    const importHandler = (e) => {
        importContract(contract, tokenId);
        e.stopPropagation();
    }
    const changeHandler = (e) => {
        setContract(x => x = e.target.value);
    }
    const changeTokenHandler = (e) => {
        setTokenId(x => x = e.target.value);
    }

    return (
        <div className="newNftContract">
            <div className="flex">
                <div>Import NFT contract:</div>
                <input className="newNftInput" type="text" value={contract} onChange={changeHandler} />
            </div>
            <div className="flex">
                <div>Token id:</div>
                <input className="newNftTokenId" type="text" value={tokenId} onChange={changeTokenHandler} />
            </div>
            <div className="button" onClick={importHandler}>import</div>
        </div>
    )
}