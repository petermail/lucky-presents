const LuckyPresents = artifacts.require("LuckyPresentsNFT");

module.exports = async function(deployer) {
    await deployer.deploy(LuckyPresents, "ipfs-pinata-path");
}