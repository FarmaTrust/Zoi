var ZoiToken = artifacts.require("./ZoiToken.sol");
var Staking = artifacts.require("./Staking.sol");

module.exports = async (deployer) => {
    deployer.deploy(ZoiToken);
    deployer.deploy(Staking);
};