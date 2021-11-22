//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// Version 1.0.0

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./RentableNFT.sol";

contract LuckyPresentsNFT is RentableNFT, ERC721Holder {
    using SafeMath for uint256;
    
    uint256 public price = 100 ether;
    uint256 public startTime = 1638554400;
    
    string public baseTokenURI;
    
    constructor(string memory baseURI) ERC721("lucky-presents", "LPNFT") {
        setBaseURI(baseURI);
    }
    
    function reserveNFT(uint256 id) public onlyOwner {
        require(id < MAX_SUPPLY, "No NFT to mint.");
        _safeMint(msg.sender, id);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function setPrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }
    function setStartTime(uint256 newStartTime) public onlyOwner {
        startTime = newStartTime;
    }
    
    function mintNFT(uint256 id) public payable {
        require(block.timestamp >= startTime, "Wait for mint to start.");
        require(msg.value >= price, "Not enough ether to purchase NFTs.");
        require(id < MAX_SUPPLY, "No NFT to mint.");

        _safeMint(msg.sender, id);
    }
    
    function tokensOfOwner(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }
    
    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }
    
}