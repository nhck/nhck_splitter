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
        let amount = new BN(5);
        await truffleAssert.fails(
            splitter.split(first, "0x1234", {from: owner, value: amount})
        )
    });
    it("should require value to be send in to split", async function () {
        let amount = new BN(0);
        await truffleAssert.reverts(
            splitter.split(first, second, {from: owner, value: amount})
        )
    });

    describe("testing the splitting", function () {

        let amount;
        let halfAmount;
        let modAmount;
        let splitReceipt;
        let firstAddressBalanceBefore;

        beforeEach('split the value', async function () {
            amount = new BN(11);
            halfAmount = new BN(5);
            modAmount = new BN(1);
            firstAddressBalanceBefore = new BN(await web3.eth.getBalance(first));

            splitReceipt = await splitter.split(first, second, {from: owner, value: amount});

        });

        it("should split values", async function () {
            let splitFirstBalance = new BN(await splitter.balances.call(first));
            let splitSecondBalance = new BN(await splitter.balances.call(second));
            let splitSenderBalance = new BN(await splitter.balances.call(owner));

            assert.strictEqual("11", new BN(await web3.eth.getBalance(splitter.address)).toString());
            assert.strictEqual("5", splitFirstBalance.toString(), "Half amount should be added to the first Customers balance.");
            assert.strictEqual("5", splitSecondBalance.toString(), "Half amount should be added to the first Customers balance.");
            assert.strictEqual("1", splitSenderBalance.toString(), "The remainder amount should be added to the senders balance.");


            assert.strictEqual(splitReceipt.logs.length, 1, "Only one event is allowed in this transaction.");

            await truffleAssert.eventEmitted(splitReceipt, "LogFundsSplit", (ev) => {
                return ev.sender === owner && halfAmount.eq(ev.valuePerCustomer) && ev.firstCustomer === first && ev.secondCustomer === second;
            });

        });
        describe("testing EOL", function () {
            beforeEach("initialize EOL", async function () {
               await splitter.pauseContract();
                await splitter.initEndOfLifeContract();
               });
            it("should not allow to split values", async function () {
                await truffleAssert.reverts(
                    splitter.split(first, second, {from: owner, value: 10}))
            });
            it("should allow withdrawal", async function () {
                let withdrawReceipt = await splitter.withdrawFunds({from: first});
                let withdrawTransaction = await web3.eth.getTransaction(withdrawReceipt.tx);

                let withdrawfirstBalance = new BN(await splitter.balances.call(first));
                let withdrawsecondBalance = new BN(await splitter.balances.call(second));


               assert.strictEqual(withdrawReceipt.logs.length, 1, "Only one event is allowed in this transaction.");
                await truffleAssert.eventEmitted(withdrawReceipt, "LogFundsWithdrawn", (ev) => {
                    return ev.sender === first && (halfAmount).eq(ev.value);
                });

                assert.strictEqual("0", withdrawfirstBalance.toString(), "Balance of first customer should be 0");
                assert.strictEqual("5", withdrawsecondBalance.toString(), "Second customer should keep his half amount");
                assert.strictEqual("6", new BN(await web3.eth.getBalance(splitter.address)).toString(), "Splitter contract should have half amount plus the remainder of the uneven Split"); //splitter contract should only have half


                let transactionFee = new BN(withdrawReceipt.receipt.gasUsed).mul(new BN(withdrawTransaction.gasPrice));
                let firstAddressBalanceAfter = new BN(await web3.eth.getBalance(first));

                assert.strictEqual(firstAddressBalanceBefore.add(halfAmount).sub(transactionFee).toString(), firstAddressBalanceAfter.toString(), "Balance of first customer should be the original balance plus the half amount minus the transaction fee.");

            });

        });


    });


});