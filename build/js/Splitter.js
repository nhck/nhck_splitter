jQuery(document).ready(function($) {




    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

    const SplitterAddress = "0xdfaA1E0f272694e60Db5d3450013ec84378Ed441";
    const SplitterContractFactory = web3.eth.contract(SplitterCompiled.contracts.abi);
    const SplitterInstance = SplitterContractFactory.at(SplitterAddress);

    Promise.promisifyAll(web3.eth, {
        suffix: 'Promise'
    })

    function _splitterInit() {

        web3.eth.getCoinbasePromise()
            .then(coinbase => {
                console.info("Coinbase:", coinbase);
                console.info("Splitter address:", SplitterAddress);

                $("#coinbasetx").text(coinbase);
                $("#contractttx").text(SplitterAddress);

                return web3.eth.getBalancePromise(coinbase);
            })
            .then(balance => {

                console.info("Coinbase has Ether:", web3.fromWei(balance).toString(10));
                $("#coinbasebalance").text(balance.toString(10));

                return web3.eth.getBalancePromise(SplitterAddress);
            })
            .then(balance => {

                console.info("Splitter contract has Wei:", balance.toString(10));
                $("#localCustomerbalance").text(balance.toString(10));
            })
            .catch(error => {
                console.error(error);
            });

        _splitterInitCustomers();
    }

    function _splitterInitCustomersBalances(error, _tx, _cid) {
        console.info("Setting"  + _cid + " customer address to", _tx);

        var _localid = "#" + _cid + "Customer";

        $(_localid + "address").val(_tx);
        if (_tx == "0x0000000000000000000000000000000000000000") {
            $(_localid + "tx").text("n/a").addClass("alert alert-warning");

        } else {
            SplitterInstance.balances.call(_tx, function(error, balance) {
                if (error) {
                    console.error(error);
                    $(_localid + "tx").text("n/a").addClass("alert alert-warning");
                } else {
                    $(_localid + "tx").text(_tx).removeClass("alert alert-warning");
                    $(_localid + "balance").text((balance.toString(10)));
                }
            });
        }
    }

    function _splitterInitCustomers() {
        SplitterInstance.firstCustomer(function(err, _tx) {
            _splitterInitCustomersBalances(err, _tx, "first")
        });
        SplitterInstance.secondCustomer(function(err, _tx) {
            _splitterInitCustomersBalances(err, _tx, "second")
        });
    }

    function _splitterSetCustomers(event) {
        var which = event.data.which;
        var _whichCustomer;
		console.log(which,"input which ");
	
		
        if (which == "first") {
            _whichCustomer = false;
			console.log("choosing first");
        } else if (which == "second") {
			console.log("choosing second");
            _whichCustomer = true;
        } else {
            console.error(which, "which customer");
            return false;
        }
		console.log(_whichCustomer,"_whichCustomer");

        web3.eth.getCoinbasePromise()
            .then(coinbase => {
                    let _customertx = $("#" + which + "Customeraddress").val();
					console.log(_customertx);
                    SplitterInstance.setCustomer(_customertx, _whichCustomer, {
                        from: coinbase
                    }, function(err, txn) {
                        if (err) {
                            throw err;
                        } else {
                            console.info("Tried to set splitters at transaction: ", txn);
                            _splitterInit();
                        }
                    });
                }

            )
            .catch(error => {
                console.error(error);
            });

    }

    function _splitterSplits() {
        console.log("Spliter splits...");
        
		const sendValue = $("#valueWei").val();
		var coinbase = 0;
		if(sendValue <= 0) return false;
		
		web3.eth.getCoinbasePromise()
		.then(_coinbase => {
				coinbase = _coinbase;
				
				return web3.eth.getBalancePromise(coinbase);
		})
		.then(balance => {
				console.log(coinbase,"coinbase");
				console.log(sendValue,"value");
				if(balance.toNumber()<=0) { throw "balance too low" };
				SplitterInstance.split({
										from: coinbase,
										value: sendValue,
									},
									function(err, txn) {
										if (err) {
											console.error(err);
										} else {
											console.log("Split it: ", txn);
											_splitterInit();
																					
										}
									});
		})
		.catch(function(e){
			console.error(e);
		});
		

    }


    _splitterInit();

    $("#firstCustomerSetAddress").on("click", {
        which: "first"
    }, _splitterSetCustomers);
    $("#secondCustomerSetAddress").on("click", {
        which: "second"
    }, _splitterSetCustomers);
	
    $("#Ispilt").on("click", _splitterSplits);

});