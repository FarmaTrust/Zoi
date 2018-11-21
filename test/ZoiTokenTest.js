const {assertRevert} = require('./assertRevert');
const common = require('./common');

let ZoiToken = artifacts.require("../contracts/ZoiToken.sol");
let zoiToken;

contract('SystechOnePoC', async (accounts) => {
    beforeEach(async () => {
        zoiToken = await ZoiToken.new({from: accounts[0]});
        console.log("---------------------- Set Zoi Issuer ----------------------");
        await zoiToken.setZoiIssuer(accounts[0]);
        let zoiIssuer = await zoiToken.zoiIssuer.call({from: accounts[0]});
        console.log("ZoiIssuer: ", JSON.stringify(zoiIssuer));
    });

    describe('creation', function() {
        it('creation: correct name of token', async() => {
            const name = await zoiToken.name();
            assert.equal(name, "Zoi Token");
        });
        it('creation: correct short name of token', async() => {
            const symbol = await zoiToken.symbol();
            assert.equal(symbol, "ZOI");
        });
        it('creation: correct decimals', async() => {
            const totalSupply = await zoiToken.decimals();
            assert.equal(+totalSupply, 18);
        });
    });

    describe('issue', function() {
        it('issue: issue 1000 tokens', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);
        });
        it('issue: total supply', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            const supply = await zoiToken.zoiIssued();
            assert.equal(+supply, 1000);
        });
        it('issue: issue event', async() => {
            const { logs } = await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'ZoiIssued');
            assert.equal(logs[0].args.indexedTo, accounts[1]);
            assert.equal(+logs[0].args.amount, 1000);
        });
    });

    describe('burn', function() {
        it('burn: burn 1000 tokens', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.burn(1000, {from: accounts[1]});
            const balance1 = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance1, 0);
        });
        it('burn: burn event', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            const { logs } = await zoiToken.burn(1000, {from: accounts[1]});
            const balance1 = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance1, 0);

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Burn');
            assert.equal(logs[0].args.indexedBurner, accounts[1]);
            assert.equal(+logs[0].args.value, 1000);
        });
    });


});