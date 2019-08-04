// This is your test_file.js
const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter Contract', accounts => {
    console.log(accounts);

    var _owner = accounts[0];
    var _left = accounts[1];
    var _right = accounts[2];

    var _nonexsting = "0xdd870fa1b7c4700f2bd7f44238821c26f7392148";
    var _wrongformat = "0x1111";

    // Your unit tests come here

    it("should add LeftCustomer", done => {
        let instance;

        Splitter.deployed()
            .then(_instance => {
                instance = _instance;
                return instance.LeftCustomer.call(_left, {
                    from: _owner
                });
            })
            .then(success => {
                assert.isTrue(success, "failed to add LeftCustomer	");
                return instance.LeftCustomer(_left, {
                    from: _owner
                });
            })
            .then(txInfo => {
                assert.strictEqual(txInfo.logs.length, 1, "Should emit only one event.");
                return instance.LeftCustomerGet();
            })
            .then(_LeftCustomerGet => {
                assert(_LeftCustomerGet._leftCustomerId == _left, "Customer not set in the array.");
                done();
            }) // Test passed
            .catch(done);
    });

    it("should add RightCustomer", done => {
        let instance;

        Splitter.deployed()
            .then(_instance => {
                instance = _instance;
                return instance.RightCustomer.call(_right, {
                    from: _owner
                });
            })
            .then(success => {
                assert.isTrue(success, "failed to add RightCustomer	");
                return instance.RightCustomer(_right, {
                    from: _owner
                });
            })
            .then(txInfo => {
                assert.strictEqual(txInfo.logs.length, 1, "Should emit only one event.");
                return instance.RightCustomerGet();
            })
            .then(_RightCustomerGet => {
                assert(_RightCustomerGet._rightCustomerId == _right, "Customer not set in the array.");
                done();
            }) // Test passed
            .catch(done);
    });



});

/*

//Splitter.deployed().then(_instance => { instance = _instance; instance.LeftCustomer("0xc4079d539a6378d01fffb2ac75280c1365859d5f", { from: "0xb9f4a71c2ca1cfbfdcf3fceb09ca2f86be2da83e" });return instance.LeftCustomerGet()}).then(id,ammount => {console.log(id,"id");});
//web3.eth.getAccounts(function(err,res) { accounts = res; });
//Splitter.deployed().then(_instance => { instance = _instance; instance.AddFunds({ from: "0xb9f4a71c2ca1cfbfdcf3fceb09ca2f86be2da83e",value:12 })});
//Splitter.deployed().then(_instance => { instance = _instance; return instance.WithdrawFunds({ from: accounts[2]})}).then(console.log);
//0x17a20E63611dB83eCb86Cdea3240B8e23542880C
*/