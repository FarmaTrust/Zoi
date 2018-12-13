let ZoiToken = artifacts.require("../contracts/ZoiToken.sol");
let Staking = artifacts.require("../contracts/Staking.sol");
let TestFTT = artifacts.require("../contracts/TestFTT.sol");
let zoiToken;
let staking;
let testFtt;


contract('Staking', async (accounts) => {
    beforeEach(async () => {
        zoiToken = await ZoiToken.new({from: accounts[0]});
        staking = await Staking.new({from: accounts[0]});
        testFtt = await TestFTT.new(accounts[0], {from: accounts[0]});
        console.log("Staking deployed: ", staking.address);
        tx = await web3.eth.sendTransaction({from:accounts[0],to:staking.address, value:web3.toWei(1, "ether")});

        console.log("---------------------- Set Zoi Issuer ----------------------");
        await zoiToken.setZoiIssuer(staking.address, {from:accounts[0]});
        let zoiIssuer = await zoiToken.zoiIssuer.call();
        console.log("ZoiIssuer: ", JSON.stringify(zoiIssuer));
    });

    it('should test zoi issuance from staking contract', async () => {
        setZoiToken = await staking.setZoiToken(zoiToken.address);
        zoiTokenAddress = await staking.zoiToken.call();
        console.log("ZOI token address: ", zoiTokenAddress);

        setTestFttToken = await staking.setFttToken(testFtt.address);
        tfttTokenAddress = await staking.fttToken.call();
        console.log("FTT token address: ", JSON.stringify(tfttTokenAddress));

        approved = await testFtt.approve(staking.address, 1000000000000000000000);
        allowance = await testFtt.allowance(accounts[0], staking.address);
        console.log("Allowance: ", JSON.stringify(allowance));

        await staking.stakeFtt(1000000000000000000000);
        amountStaked = await staking.getStakedAmount(accounts[0]);
        console.log("Amount staked", JSON.stringify(amountStaked));

        await staking.claim(accounts[0]);
        zoiBalance = await zoiToken.balanceOf(accounts[0]);
        console.log("Zoi balance: ", JSON.stringify(zoiBalance));

        await staking.releaseStake(100000000000000000000);

    });
});