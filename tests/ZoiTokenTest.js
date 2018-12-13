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
        // it('issue: issue tokens from not owner', async() => {
        //     await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[1]});
        //     const balance = await zoiToken.balanceOf(accounts[1]);
        //     console.log("BALANCE: ", JSON.stringify(balance))
        // });
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
            assert.equal(logs[0].args.to, accounts[1]);
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
            assert.equal(logs[0].args.burner, accounts[1]);
            assert.equal(+logs[0].args.value, 1000);
        });
    });

    describe('transfer', function() {
        it('transfer: transfer 200 tokens to accounts[2] from accounts[1]', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.transfer(accounts[2], 100, {from: accounts[1]});
            await zoiToken.transfer(accounts[2], 100, {from: accounts[1]});
            const balance1 = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance1, 800);

            const balance2 = await zoiToken.balanceOf(accounts[2]);
            assert.equal(+balance2, 200);
        });
        it('transfer: transfer event', async() => {
            transferEvent = await zoiToken.Transfer({});

            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            const { logs } = await zoiToken.transfer(accounts[2], 1000, {from: accounts[1]});

            const balance1 = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance1, 0);

            const balance2 = await zoiToken.balanceOf(accounts[2]);
            assert.equal(+balance2, 1000);

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Transfer');
            assert.equal(logs[0].args.from, accounts[1]);
            assert.equal(logs[0].args.to, accounts[2]);
            assert.equal(+logs[0].args.value, 1000);
        });

        // it('transfer: transfer more, than on balance', async() => {
        //     await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
        //     const balance = await zoiToken.balanceOf(accounts[1]);
        //     assert.equal(+balance, 1000);
        //
        //     await assertRevert(zoiToken.transfer(accounts[1], 10000, {from: accounts[1]}));
        // });
        // it('transfer: transfer without balance', async() => {
        //     await assertRevert(zoiToken.transfer(accounts[1], 10000, {from: accounts[1]}));
        // });
        // it('transfer: ether transfer reverted', async() => {
        //     await assertRevert(new Promise((resolve, reject) => {
        //         web3.eth.sendTransaction({from: accounts[0], to: zoiToken.address, value: web3.toWei('1', 'Ether')}, (err, res) => {
        //             if(err) { reject(err);}
        //             resolve(res);
        //         });
        //     }));
        // });
        // it('transfer: send to itself', async() => {
        //     await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
        //     const balance = await zoiToken.balanceOf(accounts[1]);
        //     assert.equal(+balance, 1000);
        //
        //     await assertRevert(zoiToken.transfer(accounts[1], 1000, {from: accounts[1]}));
        // });
    });

    describe('approve', function() {
        it('approve: correct approve', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 1000, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 1000);
        });
        it('approve: approve amount more than on the balance', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await assertRevert(zoiToken.approve(accounts[1], 10000, {from: accounts[0]}));
        });
        it('approve: approve to itself', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await assertRevert(zoiToken.approve(accounts[0], 1000, {from: accounts[0]}));
        });
        it('approve: increase approval', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 100, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 100);

            await zoiToken.increaseApproval(accounts[1], 800, {from: accounts[0]});
            const allowance2 = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance2, 900);
        });
        it('approve: increase approval more, than on balance', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 1000, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 1000);

            await assertRevert(zoiToken.increaseApproval(accounts[1], 800, {from: accounts[0]}));
        });
        it('approve: increase approval for itself', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await assertRevert(zoiToken.increaseApproval(accounts[0], 800, {from: accounts[0]}));
        });
        it('approve: decrease approval', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 100, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 100);

            await zoiToken.decreaseApproval(accounts[1], 50, {from: accounts[0]});
            const allowance2 = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance2, 50);
        });
        it('approve: decrease approval on amount more, than on balance', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 100, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 100);

            await zoiToken.decreaseApproval(accounts[1], 500, {from: accounts[0]});
            const allowance2 = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance2, 0);
        });
        it('approve: decrease approval for itself', async() => {
            await zoiToken.issueZoi(accounts[0], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[0]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[1], 1000, {from: accounts[0]});
            const allowance = await zoiToken.allowance(accounts[0], accounts[1], {from: accounts[0]});
            assert.equal(+allowance, 1000);

            await assertRevert(zoiToken.decreaseApproval(accounts[0], 800, {from: accounts[0]}));
        });
    });

    describe('transferFrom', function() {
        it('transferFrom: correct transfer', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[2], 1000, {from: accounts[1]});
            const allowance = await zoiToken.allowance(accounts[1], accounts[2], {from: accounts[1]});
            assert.equal(+allowance, 1000);

            await zoiToken.transferFrom(accounts[1], accounts[2], 1000, {from: accounts[2]});
            const balance2 = await zoiToken.balanceOf(accounts[2]);
            assert.equal(+balance2, 1000);
        });
        it('transferFrom: transferFrom event', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[2], 1000, {from: accounts[1]});
            const allowance = await zoiToken.allowance(accounts[1], accounts[2], {from: accounts[1]});
            assert.equal(+allowance, 1000);

            const { logs } = await zoiToken.transferFrom(accounts[1], accounts[2], 1000, {from: accounts[2]});
            const balance2 = await zoiToken.balanceOf(accounts[2]);
            assert.equal(+balance2, 1000);

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'Transfer');
            assert.equal(logs[0].args.from, accounts[1]);
            assert.equal(logs[0].args.to, accounts[2]);
            assert.equal(+logs[0].args.value, 1000);
        });
        it('transferFrom: correct transfer from accounts[3] to [2]', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[2], 1000, {from: accounts[1]});
            const allowance = await zoiToken.allowance(accounts[1], accounts[2], {from: accounts[1]});
            assert.equal(+allowance, 1000);

            await zoiToken.transferFrom(accounts[1], accounts[3], 1000, {from: accounts[2]});
            const bal = await zoiToken.balanceOf(accounts[3]);
            assert.equal(bal, 1000);
        });
        it('transferFrom: transfer more, than allowed', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[2], 100, {from: accounts[1]});
            const allowance = await zoiToken.allowance(accounts[1], accounts[2], {from: accounts[1]});
            assert.equal(+allowance, 100);

            await assertRevert(zoiToken.transferFrom(accounts[1], accounts[2], 1000, {from: accounts[2]}));
        });
        it('transferFrom: transfer without approve', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await assertRevert(zoiToken.transferFrom(accounts[1], accounts[2], 1000, {from: accounts[2]}));
        });
        it('transferFrom: transfer before unlock', async() => {
            await zoiToken.issueZoi(accounts[1], 1000, {from: accounts[0]});
            const balance = await zoiToken.balanceOf(accounts[1]);
            assert.equal(+balance, 1000);

            await zoiToken.approve(accounts[2], 100, {from: accounts[1]});
            const allowance = await zoiToken.allowance(accounts[1], accounts[2], {from: accounts[1]});
            assert.equal(+allowance, 100);

            await assertRevert(zoiToken.transferFrom(accounts[1], accounts[2], 100, {from: accounts[2]}));
        });
    });

});