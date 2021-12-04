//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract RentableNFT is ERC721, Ownable {
    using SafeMath for uint256;
    using SafeMath for uint64;

    event Rented(address indexed to, uint256 indexed tokenId, uint256 price);
    event Opened(address indexed receiver, uint256 indexed rentTokenId, bool openedByReceiver);

    uint256 public constant MAX_SUPPLY = 300;

    uint256 public minPrice = 0.01 ether;

    uint64 public maxRents = 10;

    // Mapping from token IDs to rent prices
    mapping(uint256 => uint256) private _rentPrices;
    // Mapping from token IDs to rent counts
    mapping(uint256 => uint64) private _rentedCount;
    // Mapping from token IDs to maximum rents
    mapping(uint256 => uint64) private _maxRents;
    // Mapping from rent token IDs to NFT contracts
    mapping(uint256 => address) private _contractPresents;
    // Mapping from rent token IDS to NFT token ids
    mapping(uint256 => uint256) private _nftIds;

    //TO-DO:
    //function rentNFT()
    //function wrapAndSendPresentNFT()
    //function openPresentNFT()

    modifier isRentable(uint256 tokenId) {
        require(tokenId < MAX_SUPPLY, "Not rentable.");
        _;
    }

    function setMinPrice(uint256 newMinPrice) external onlyOwner {
        minPrice = newMinPrice;
    }
    function setMaxRents(uint64 newMaxRents) external onlyOwner {
        maxRents = newMaxRents;
    }
    function setMaxRentsOne(uint64 newMaxRents, uint256 tokenId) external onlyOwner {
        _maxRents[tokenId] = newMaxRents;
    }
    function getMaxRents(uint256 tokenId) external view returns (uint64) {
        return _maxRents[tokenId];
    }

    function getRemainRents(uint256 tokenId) external view isRentable(tokenId) returns (uint64) {
        return _rentedCount[tokenId] - (_maxRents[tokenId] == 0 ? maxRents : _maxRents[tokenId]);
    }
    function getRentPrice(uint256 tokenId) external view returns (uint256) {
        return _rentPrices[tokenId] > minPrice ? _rentPrices[tokenId] : minPrice;
    }

    function changeRentPrice(uint256 tokenId, uint256 newPrice) external isRentable(tokenId) {
        require(msg.sender == ownerOf(tokenId), "Not owner of the NFT.");
        require(_rentPrices[tokenId] >= minPrice, "Price is lower than minimum allowed.");
        _rentPrices[tokenId] = newPrice;
    }

    function hasPresentInside(uint256 rentTokenId) external view returns (bool) {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId");
        return _contractPresents[rentTokenId] != address(0);
    }

    // searchRents should be typically 99 or less
    function getRentTokenId(uint256 tokenId, uint256 searchRents) external view returns (uint256) {
        uint256 max = MAX_SUPPLY.mul(searchRents);
        for (uint256 i = tokenId.add(MAX_SUPPLY); i < max; i = i.add(MAX_SUPPLY)) {
            if (!_exists(i)){
                return i;
            }
        }
        return 0;
    }
    
    function getOwners(uint256 startId, uint256 count) external view returns (address[] memory) {
        address[] memory owners = new address[](count);

        for (uint256 i = startId; i < count; ++i) {
            owners[i] = _exists(i) ? ownerOf(i) : address(0);
        }
        return owners;
    }
    function getRentees(uint256 startId, uint256 count) external view returns (address[] memory) {
        address[] memory rentees = new address[](count);

        for (uint256 i = startId; i < count; i = i.add(MAX_SUPPLY)) {
            rentees[i] = _exists(i) ? ownerOf(i) : address(0);
        }
        return rentees;
    }

    function rentee(uint256 rentTokenId) external view returns (address) {
        return ownerOf(rentTokenId);
    }

    function rentNFT(uint256 tokenId, uint256 rentTokenId) external payable isRentable(tokenId) {
        require(_rentPrices[tokenId] <= msg.value, "Not enough ether to rent.");
        require(minPrice <= msg.value, "Amount sent is lower than minimum.");
        _rentNFT(tokenId, rentTokenId);

        uint256 amount = msg.value.mul(9).div(10);
        payable(ownerOf(tokenId)).transfer(amount);
        emit Rented(msg.sender, rentTokenId, amount);
    }
    function selfRentNFT(uint256 tokenId, uint256 rentTokenId) public isRentable(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not owner of original token.");
        _rentNFT(tokenId, rentTokenId);
        emit Rented(msg.sender, rentTokenId, 0);
    }
    function _rentNFT(uint256 tokenId, uint256 rentTokenId) internal {
        require(_rentedCount[tokenId] < maxRents, "Too many rents already.");
        require(_maxRents[tokenId] == 0 || _rentedCount[tokenId] < _maxRents[tokenId], "Too many rents.");
        require(tokenId != rentTokenId, "Trying to rent original token.");
        require(tokenId == rentTokenId.mod(MAX_SUPPLY), "Rented token has wrong id.");
        _rentedCount[tokenId] = _rentedCount[tokenId] + 1; // Above condition makes it safe to add 1
        _safeMint(msg.sender, rentTokenId);
    }

    function wrapPresentNFT(uint256 rentTokenId, address contractNFT, uint256 nftId) external {
        _wrapAndSendPresentNFT(msg.sender, rentTokenId, contractNFT, nftId);
    }
    function wrapAndSendPresentNFT(address to, uint256 rentTokenId, address contractNFT, uint256 nftId) external {
        _wrapAndSendPresentNFT(to, rentTokenId, contractNFT, nftId);
    }
    function selfRentWrapAndSendPresentNFT(address to, uint256 tokenId, uint256 rentTokenId, address contractNFT, uint256 nftId) external {
        selfRentNFT(tokenId, rentTokenId);
        _wrapAndSendPresentNFT(to, rentTokenId, contractNFT, nftId);
    }
    function _wrapAndSendPresentNFT(address to, uint256 rentTokenId, address contractNFT, uint256 nftId) internal {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId.");
        require(ownerOf(rentTokenId) == msg.sender, "Not owner of rented token.");
        require(_contractPresents[rentTokenId] == address(0), "Present already full.");
        IERC721(contractNFT).safeTransferFrom(msg.sender, address(this), nftId, "");
        _contractPresents[rentTokenId] = contractNFT;
        _nftIds[rentTokenId] = nftId;
        if (msg.sender != to){
            _safeTransfer(msg.sender, to, rentTokenId, "");
        }
    }

    function openPresentNFT(uint256 rentTokenId) external {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId.");
        require(ownerOf(rentTokenId) == msg.sender, "Not renting the token.");
        _openPresentNFT(rentTokenId);
        emit Opened(msg.sender, rentTokenId, true);
    }
    function _openPresentNFT(uint256 rentTokenId) internal {
        uint256 tokenId = rentTokenId.mod(MAX_SUPPLY);
        require(_rentedCount[tokenId] >= 1, "No rent was done.");
        IERC721(_contractPresents[rentTokenId]).safeTransferFrom(address(this), ownerOf(rentTokenId), 
            _nftIds[rentTokenId], "");
        _burn(rentTokenId);
        _rentedCount[tokenId] = _rentedCount[tokenId] - 1;
        _contractPresents[rentTokenId] = address(0);
    }

    function forceOpenPresentNFT(uint256 rentTokenId) external {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId.");
        uint256 tokenId = rentTokenId.mod(MAX_SUPPLY);
        require(ownerOf(tokenId) == msg.sender);
        _openPresentNFT(rentTokenId);
        emit Opened(ownerOf(rentTokenId), rentTokenId, false);
    }

    function getPresentContract(uint256 rentTokenId) external view returns (address) {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId.");
        return _contractPresents[rentTokenId];
    }
    function getPresentTokenId(uint256 rentTokenId) external view returns (uint256) {
        require(rentTokenId >= MAX_SUPPLY, "Wrong rentTokenId.");
        return _nftIds[rentTokenId];
    }
}