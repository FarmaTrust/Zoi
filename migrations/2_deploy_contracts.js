var ZoiToken = artifacts.require("./ZoiToken.sol");
var Staking = artifacts.require("./Staking.sol");
let TestFTT = artifacts.require("./TestFTT.sol");

module.exports = async (deployer, accounts) => {
    const acc = accounts[0];
    deployer.deploy(ZoiToken);
    deployer.deploy(Staking);
    deployer.deploy(TestFTT, "0x4Ea2F8520Bf84CE16ADCE4a3C53e2C6B7c5AE8a4");
};