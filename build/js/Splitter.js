jQuery(document).ready(function($) {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

    const SplitterAddress = "0x17a20E63611dB83eCb86Cdea3240B8e23542880C";
    const SplitterContractFactory = web3.eth.contract(SplitterCompiled.contracts.abi);
    const SplitterInstance = SplitterContractFactory.at(SplitterAddress);

    function _splitterInit() {
        web3.eth.getCoinbase(function(err, coinbase) {
            if (err) {
                console.error(err);
            } else {
                $("#coinbasetx").text(coinbase);
                $("#contractttx").text(SplitterAddress);

                web3.eth.getBalance(coinbase, function(err, balance) {
                    if (err) {
                        console.error(err);
                    } else {
                        $("#coinbasebalance").text((balance));
                    }

                });

                web3.eth.getBalance(SplitterAddress, function(err, balance) {
                    if (err) {
                        console.error(err);
                    } else {
                        $("#balance").text((balance));
                        _splitterInitCustomers();
                    }
                });
				
            }
        });
    }

    function _splitterInitCustomersBalances(_tx, _balance,_cid) {
        var _localid = "#" + _cid + "Customer";

        $(_localid + "address").val(_tx);
        if (_tx == "0x0000000000000000000000000000000000000000") {
            $(_localid + "tx").text("n/a").addClass("alert alert-warning");

        } else {
            $(_localid + "tx").text(_tx).removeClass("alert alert-warning");
            $(_localid + "balance").text((_balance));
        }
    }

    function _splitterInitCustomers() {
        SplitterInstance.LeftCustomerGet.call(function(error, _customer) {
            if (error) {
                console.error(error)
            } else {
                _splitterInitCustomersBalances(_customer[0], _customer[1], "left")
            }
        });
        SplitterInstance.RightCustomerGet.call(function(error, _customer) {
            if (error) {
                console.error(error)
            } else {
                _splitterInitCustomersBalances(_customer[0], _customer[1], "right")
            }
        });
		SplitterInstance.LocalBalanceGet.call(function(error, _balance) {
            if (error) {
                console.error(error)
            } else {
                _splitterInitCustomersBalances("local", _balance, "local")
            }
        });
    }

    function _splitterSetCustomers(event) {
		var which = event.data.which;

        web3.eth.getCoinbase(function(err, coinbase) {
            if (err) {
                console.error(err);
            } else {
                web3.eth.getAccounts(function(err, accounts) {
                    if (err) {
                        console.error(err);
                    } else {					
						var _customertx = $("#"+which+"Customeraddress").val();
						console.log(_customertx,"tx");
						if(which == "left") {
							SplitterInstance.LeftCustomer(_customertx,{ from: coinbase }),function(err, txn) {
								if (err) {
                                    console.error(err);
                                } else {
                                    console.log("Tried to set splitters txn: ", txn);
                                    _splitterInit();
                                }
							}
						}
						if(which == "right") {
							SplitterInstance.RightCustomer(_customertx,{ from: coinbase }),function(err, txn) {
								if (err) {
                                    console.error(err);
                                } else {
                                    console.log("Tried to set splitters txn: ", txn);
                                    _splitterInit();
                                }
							}
						}

                    }
                });
            }

        });
    }
	
	
	function _splitterSplits() {
		console.log("Spliter splits...");
            web3.eth.getCoinbase(function(err, coinbase) {
                if (err) {
                    console.error(err);
                } else {
                    web3.eth.getAccounts(function(err, accounts) {
                        if (err) {
                            console.error(err);
                        } else {
                            // function Split() onlyOwner onlyifRunning public returns (bool success) {

                            SplitterInstance.Split({
                                    from: coinbase
                                },
                                function(err, txn) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log("Split it: ", txn);
										_splitterInit();
										                                        
                                    }
                                });
                        }
                    });
                }

            });

	}		


    _splitterInit();

    $("#LeftCustomerSetAddress").on("click", {which: "left"},_splitterSetCustomers);
	$("#RightCustomerSetAddress").on("click", {which: "right"},_splitterSetCustomers);
	$("#Ispilt").on("click", _splitterSplits);

});