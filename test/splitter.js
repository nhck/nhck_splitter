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

        it("should be able to set customers", async function () {

            await splitter.setCustomer(first, false, {from: owner});
            await splitter.setCustomer(first, true, {from: owner});

            assert.equal(await splitter.firstCustomer(), first);
            assert.equal(await splitter.secondCustomer(), first);

        });

        it("should fail on an malformed addresses", async function () {
            let _malade = "0x01111";
            await truffleAssert.fails(splitter.setCustomer(_malade, false, {from: owner}));
        });

    describe("testing the splitting", function () {
        let firstCustomerResult;
        let secondCustomerResult;

        beforeEach("setting up customers", async function () {
            firstCustomerResult = await splitter.setCustomer(first, false, {from: owner});
            secondCustomerResult = await splitter.setCustomer(second, true, {from: owner});

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
                        splitter.split({from: owner, value: _ammount}),
                        "Ammount not splittable."
                    );
                });

                it("should split even values", async function () {
                    let _ammount = 10;
                    let _halfammount = 5;

                    let splitResult = await splitter.split({from: owner, value: _ammount});

                    assert.equal(await web3.eth.getBalance(splitter.address), _ammount);
                    assert.equal(await splitter.balances.call(first), _halfammount);
                    assert.equal(await splitter.balances.call(first), _halfammount);

                    await truffleAssert.eventEmitted(splitResult, "LogFundsSplit", (ev) => {
                        return ev.sender === owner && ev.valuePerCustomer.toNumber() === _halfammount && ev.firstCustomer === first && ev.secondCustomer === second;
                    });

                });

        it("should allow withdrawal", async function () {
            let _ammount = new BN(10);
            let _halfammount = new BN(5);

            let firstAddressBalanceBefore = new BN(await web3.eth.getBalance(first));


            await splitter.split({from: owner, value: _ammount});

            let _gasPrice = new BN(await web3.eth.getGasPrice());
            let withdrawResult = await splitter.withdrawFunds({from: first, gasPrice: _gasPrice.toNumber()});


            let firstBalance = await splitter.balances.call(first);
            let secondBalance = await splitter.balances.call(second);

            await truffleAssert.eventEmitted(withdrawResult, "LogFundsWithdrawn", (ev) => {
                return ev.sender === first && (_halfammount).eq(ev.value);
            });

            assert.isTrue(firstBalance.isZero()); //balance of first customer should be 0
            assert.isTrue(secondBalance.eq(_halfammount)); //second customer should keep his half ammount
            assert.isTrue(new BN(await web3.eth.getBalance(splitter.address)).eq(_halfammount)); //splitter contract should only have half


            let transactionFee = new BN(withdrawResult.receipt.gasUsed);
            transactionFee = transactionFee.mul(_gasPrice);
            let firstAddressBalanceAfter = new BN(await web3.eth.getBalance(first));

            assert.isTrue(firstAddressBalanceBefore.add(_halfammount).sub(transactionFee).eq(firstAddressBalanceAfter));

        });
    });

        it("should allow withdrawal only if you have a split balance", async function () {
            await truffleAssert.reverts(
                splitter.withdrawFunds({from: third})
            )
        });
});