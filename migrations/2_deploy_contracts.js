var ZoiToken = artifacts.require("./ZoiToken.sol");

module.exports = function(deployer) {
    deployer.deploy(ZoiToken);
};