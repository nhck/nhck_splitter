// This is your test_file.js
const SplitterLoad = artifacts.require("./Splitter.sol");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');


contract('Splitter Contract', accounts => {
    const _owner = accounts[0];
    const _first = accounts[1];
    const _second = accounts[2];

	let Splitter; //SplitterInstance


	beforeEach('setup contract for each test', async function () {
       Splitter = await SplitterLoad.new({from:_owner});
    })

  
	it("should have an owner", async function () {
        assert.equal(await Splitter.getOwner(), _owner);
	});
	
	it("should be able to set customers", async function () {
	
		await Splitter.setCustomer(_first, false, {from: _owner});
		await Splitter.setCustomer(_second, true, {from: _owner});
	
		assert.equal(await Splitter.firstCustomer(), _first);
		assert.equal(await Splitter.secondCustomer(), _second);
		
	});
	
	
	it("should fail on an malformed addresses", async function () {
		let _malade = "0x01111";
		await truffleAssert.fails(Splitter.setCustomer(_malade,false, {from: _owner}));
	});
	it("should not split uneven values", async function () {
			let _ammount = 5;
		
			await Splitter.setCustomer(_first, false, {from: _owner});
			await Splitter.setCustomer(_second, true, {from: _owner});
			
			await truffleAssert.reverts(
				Splitter.split({from: _owner, value:_ammount}),
				"Ammount not splittable."
			);
	});
	
	it("should split even values", async function () {
			let _ammount = 10;
			let _halfammount = 5;
			
			await Splitter.setCustomer(_first, false, {from: _owner});
			await Splitter.setCustomer(_second, true, {from: _owner});
			
			await truffleAssert.passes(await Splitter.split({from: _owner, value:_ammount}));
			
			assert.equal(await web3.eth.getBalance(Splitter.address), _ammount);
			assert.equal(await Splitter.balances.call(_first), _halfammount);
			assert.equal(await Splitter.balances.call(_second), _halfammount);
	});
	
	it("should allow withdrawal", async function () {
			let _ammount = 10;
			let _halfammount = 5;
			
			let _firstCustomerBalanceBeforeSplit = await web3.eth.getBalance(_first);
			let _firstCustomerBalanceAfterSplit = _firstCustomerBalanceBeforeSplit + _halfammount;
			
			
			await Splitter.setCustomer(_first, false, {from: _owner});
			await Splitter.setCustomer(_second, true, {from: _owner});
			
			await Splitter.split({from: _owner, value:_ammount});
			
			await truffleAssert.passes(Splitter.withdrawFunds({from:_first}));
			
			
			assert.equal(await Splitter.balances.call(_first), 0); //balance of first customer should be 0
			assert.equal(await Splitter.balances.call(_second), _halfammount); //second customer should keep his half ammount
			assert.equal(await web3.eth.getBalance(Splitter.address), _halfammount); //splitter contract should only have half
			
	});
	
	it("should allow withdrawal only if you have a split balance", async function () {		
			await truffleAssert.reverts(
				Splitter.withdrawFunds({from:_first})
				)
	});
	

});
//personal.unlockAccount(eth.accounts[0],"Xcool3232");personal.unlockAccount(eth.accounts[1],"Xcool32");personal.unlockAccount(eth.accounts[2],"Xcool32");
