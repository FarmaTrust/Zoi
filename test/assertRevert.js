module.exports = {
    assertRevert: async (promise) => {
        try {
            console.log('1');
            await promise;
        } catch (error) {
            console.log('2');
            const revertFound = error.message.search('revert') >= 0;
            console.log('3');
            assert(revertFound, `Expected "revert", got ${error} instead`);
            console.log('4');
            return;
        }
        console.log('5');
        assert.fail('Expected revert not received');
    },
};
