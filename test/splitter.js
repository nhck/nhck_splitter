const SplitterLoad = artifacts.require("./Splitter.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract('Splitter Contract', accounts => {
    const [owner, first, second, third] = accounts;

    let Splitter; //SplitterInstance

    beforeEach('setup contract for each test', async function () {
        Splitter = await SplitterLoad.new({from: owner});
    });

    it("should have an owner", async function () {
        assert.equal(await Splitter.getOwner(), owner);
    });

    it("should be able to set customers", async function () {

        await Splitter.setCustomer(first, false, {from: owner});
        await Splitter.setCustomer(first, true, {from: owner});

        assert.equal(await Splitter.firstCustomer(), first);
        assert.equal(await Splitter.secondCustomer(), first);

    });

    it("should fail on an malformed addresses", async function () {
        let _malade = "0x01111";
        await truffleAssert.fails(Splitter.setCustomer(_malade, false, {from: owner}));
    });

    describe("testing the splitting", function () {
        let firstCustomerResult;
        let secondCustomerResult;

        beforeEach("setting up customers", async function () {
            firstCustomerResult = await Splitter.setCustomer(first, false, {from: owner});
            secondCustomerResult = await Splitter.setCustomer(second, true, {from: owner});

        });

        it("should emit events on Customer setting", async function () {
            await truffleAssert.eventEmitted(firstCustomerResult, "LogCustomerSet", (ev) => {
                return ev.sender === owner && ev.newCustomer === first && ev.isSecond === false;
            });
            await truffleAssert.eventEmitted(secondCustomerResult, "LogCustomerSet", (ev) => {
                return ev.sender === owner && ev.newCustomer === second && ev.isSecond === true;
            });
        });

        it("should not split uneven values", async function () {
            let _ammount = 5;


            await truffleAssert.reverts(
                Splitter.split({from: owner, value: _ammount}),
                "Ammount not splittable."
            );
        });

        it("should split even values", async function () {
            let _ammount = 10;
            let _halfammount = 5;

            let splitResult = await Splitter.split({from: owner, value: _ammount});

            assert.equal(await web3.eth.getBalance(Splitter.address), _ammount);
            assert.equal(await Splitter.balances.call(first), _halfammount);
            assert.equal(await Splitter.balances.call(first), _halfammount);

            await truffleAssert.eventEmitted(splitResult, "LogFundsSplit", (ev) => {
                return ev.sender === owner && ev.valuePerCustomer.toNumber() === _halfammount && ev.firstCustomer === first && ev.secondCustomer === second;
            });

        });

        it("should allow withdrawal", async function () {
            let _ammount = 10;
            let _halfammount = 5;

            let firstAddressBalanceBefore = await web3.eth.getBalance(first);

            await Splitter.split({from: owner, value: _ammount});
            let withdrawResult = await Splitter.withdrawFunds({from: first});


            let firstBalance = await Splitter.balances.call(first);
            let secondBalance = await Splitter.balances.call(second);

            await truffleAssert.eventEmitted(withdrawResult, "LogFundsWithdrawn", (ev) => {
                return ev.sender === first && ev.value.toNumber() === _halfammount;
            });

            assert.equal(firstBalance.toNumber(), 0); //balance of first customer should be 0
            assert.equal(secondBalance.toNumber(), _halfammount); //second customer should keep his half ammount
            assert.equal(await web3.eth.getBalance(Splitter.address), _halfammount); //splitter contract should only have half


            let transactionFee = withdrawResult.receipt.gasUsed * parseInt(await web3.eth.getGasPrice(), 10);
            let firstAddressBalanceAfter = await web3.eth.getBalance(first);

            assert.equal(parseInt(firstAddressBalanceBefore, 10) + _halfammount - transactionFee, parseInt(firstAddressBalanceAfter));

        });
    });

    it("should allow withdrawal only if you have a split balance", async function () {
        await truffleAssert.reverts(
            Splitter.withdrawFunds({from: third})
        )
    });
});