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

    describe("testing the splitting", function () {

        it("should not split uneven values", async function () {
            let _amount = 5;

            await truffleAssert.reverts(
                splitter.split(first, second, {from: owner, value: _amount}),
                "Amount not splittable."
            );
        });

        it("should split even values", async function () {
            let _amount = new BN(10);
            let _halfamount = new BN(5);

            let splitResult = await splitter.split(first, second, {from: owner, value: _amount});
            let splitFirstBalance = await splitter.balances.call(first);
            let splitSecondBalance = await splitter.balances.call(second);

            assert.isTrue(_amount.eq(new BN(await web3.eth.getBalance(splitter.address))));
            assert.isTrue(_halfamount.eq(splitFirstBalance));
            assert.isTrue(_halfamount.eq(splitFirstBalance));

            await truffleAssert.eventEmitted(splitResult, "LogFundsSplit", (ev) => {
                return ev.sender === owner && _halfamount.eq(ev.valuePerCustomer) && ev.firstCustomer === first && ev.secondCustomer === second;
            });
            await truffleAssert.eventEmitted(splitResult, "LogBalanceUpdated", (ev) => {
                return ev.customer === first && ev.newBalance.eq(splitFirstBalance);
            });
            await truffleAssert.eventEmitted(splitResult, "LogBalanceUpdated", (ev) => {
                return ev.customer === second && ev.newBalance.eq(splitSecondBalance)
            })

        });

        it("should allow withdrawal", async function () {
            let _amount = new BN(10);
            let _halfamount = new BN(5);

            let firstAddressBalanceBefore = new BN(await web3.eth.getBalance(first));


            await splitter.split(first, second, {from: owner, value: _amount});

            let _gasPrice = new BN(await web3.eth.getGasPrice());
            let withdrawResult = await splitter.withdrawFunds({from: first, gasPrice: _gasPrice.toNumber()});


            let firstBalance = await splitter.balances.call(first);
            let secondBalance = await splitter.balances.call(second);

            await truffleAssert.eventEmitted(withdrawResult, "LogFundsWithdrawn", (ev) => {
                return ev.sender === first && (_halfamount).eq(ev.value);
            });

            assert.isTrue(firstBalance.isZero()); //balance of first customer should be 0
            assert.isTrue(secondBalance.eq(_halfamount)); //second customer should keep his half ammount
            assert.isTrue(new BN(await web3.eth.getBalance(splitter.address)).eq(_halfamount)); //splitter contract should only have half


            let transactionFee = new BN(withdrawResult.receipt.gasUsed);
            transactionFee = transactionFee.mul(_gasPrice);
            let firstAddressBalanceAfter = new BN(await web3.eth.getBalance(first));

            assert.isTrue(firstAddressBalanceBefore.add(_halfamount).sub(transactionFee).eq(firstAddressBalanceAfter));

        });
    });

    it("should allow withdrawal only if you have a split balance", async function () {
        await truffleAssert.reverts(
            splitter.withdrawFunds({from: third})
        )
    });
});