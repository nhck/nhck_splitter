const BN = web3.utils.BN;
const SplitterFactory = artifacts.require("./Splitter.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract('Splitter Contract', accounts => {
    const [owner, first, second, third] = accounts;

    let splitter; //SplitterInstance

    beforeEach('setup contract for each test', async function () {
        splitter = await SplitterFactory.new(true, {from: owner});
    });

    it("should have an owner", async function () {
        assert.equal(await splitter.getOwner(), owner);
    });
    it("should allow withdrawal only if you have a split balance", async function () {
        await truffleAssert.reverts(
            splitter.withdrawFunds({from: third})
        )
    });
    it("should require two proper addresses to split", async function () {
        let _amount  = new BN(5);
        await truffleAssert.fails(
            splitter.split(first, "0x1234", {from: owner, value: _amount})
        )
    });
    it("should require value to be send in to split", async function () {
        let _amount  = new BN(0);
        await truffleAssert.reverts(
            splitter.split(first, second, {from: owner, value: _amount})
        )
    });

    describe("testing the splitting", function () {

        let _amount;
        let _halfAmount;
        let _modAmount;
        let splitResult;
        let firstAddressBalanceBefore;

        beforeEach('split the value', async function () {
            _amount = new BN(11);
            _halfAmount = _amount.div(new BN(2));
            _modAmount = _amount.mod(new BN(2));
            firstAddressBalanceBefore = new BN(await web3.eth.getBalance(first));

            splitResult = await splitter.split(first, second, {from: owner, value: _amount});
        });

        it("should split values", async function () {
            let splitFirstBalance = new BN(await splitter.balances.call(first));
            let splitSecondBalance = new BN(await splitter.balances.call(second));
            let splitSenderBalance = new BN(await splitter.balances.call(owner));

            assert.isTrue(_amount.eq(new BN(await web3.eth.getBalance(splitter.address))));
            assert.isTrue(_halfAmount.eq(splitFirstBalance));
            assert.isTrue(_halfAmount.eq(splitSecondBalance));
            assert.isTrue(_modAmount.eq(splitSenderBalance));

            await truffleAssert.eventEmitted(splitResult, "LogFundsSplit", (ev) => {
                return ev.sender === owner && _halfAmount.eq(ev.valuePerCustomer) && ev.firstCustomer === first && ev.secondCustomer === second;
            });
            await truffleAssert.eventEmitted(splitResult, "LogBalanceUpdated", (ev) => {
                return ev.customer === first && ev.newBalance.eq(splitFirstBalance);
            });
            await truffleAssert.eventEmitted(splitResult, "LogBalanceUpdated", (ev) => {
                return ev.customer === second && ev.newBalance.eq(splitSecondBalance);
            });
            await truffleAssert.eventEmitted(splitResult, "LogBalanceUpdated", (ev) => {
                return ev.customer === owner && ev.newBalance.eq(splitSenderBalance);
            });
        });

        it("should allow withdrawal", async function () {
            let withdrawResult = await splitter.withdrawFunds({from: first});
            let withdrawTransaction = await web3.eth.getTransaction(withdrawResult.tx);

            let withdrawfirstBalance = new BN(await splitter.balances.call(first));
            let withdrawsecondBalance = new BN(await splitter.balances.call(second));

            await truffleAssert.eventEmitted(withdrawResult, "LogFundsWithdrawn", (ev) => {
                return ev.sender === first && (_halfAmount).eq(ev.value);
            });

            assert.isTrue(withdrawfirstBalance.isZero(),"Balance of first customer should be 0");
            assert.isTrue(withdrawsecondBalance.eq(_halfAmount),"Second customer should keep his half amount");
            assert.isTrue(new BN(await web3.eth.getBalance(splitter.address)).eq(_halfAmount.add(_modAmount)),"Splitter contract should have half amount plus the remainder of the uneven Split"); //splitter contract should only have half


            let transactionFee = new BN(withdrawResult.receipt.gasUsed).mul(new BN(withdrawTransaction.gasPrice));
            let firstAddressBalanceAfter = new BN(await web3.eth.getBalance(first));

            assert.isTrue(firstAddressBalanceBefore.add(_halfAmount).sub(transactionFee).eq(firstAddressBalanceAfter),"Balance of first customer should be the original balance plus the half amount minus the transaction fee.");

        });
    });

});