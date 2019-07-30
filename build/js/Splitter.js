jQuery(document).ready(function($) {

	web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
 


    const SplitterAddress = "0xca8f308669D55F8E4ad64DeA54Be194f10bE1B9e"; // 
    const SplitterContractFactory = web3.eth.contract(SplitterCompiled.contracts.abi);
    const SplitterInstance = SplitterContractFactory.at(SplitterAddress);




    function _splitterInit() {
		web3.eth.getCoinbase(function(err, coinbase) {
		if (err) {
			console.error(err);
		} else {
			var account = coinbase;
			 console.log("Account", account);
			$("#coinbasetx").text(account);

			web3.eth.getBalance(account, function(err, balance) {
				if (err) {
					console.error(err);
				} else {
					$("#coinbasebalance").text(web3.fromWei(balance));
				}

			});

			web3.eth.getBalance(SplitterAddress, function(err, balance) {
				if (err) {
					console.error(err);
				} else {
					console.log("Contract balance", balance);
					$("#balance").text(web3.fromWei(balance));
					_splitterInitTargets();
				}
			});
			}
		});
    }

    function _splitterInitTargets() {
        SplitterInstance.splitterGetTargets(function(err, targets) {
            if (err) {
                console.error(err);
            } else {
                console.log("Splitter targets", targets);

                $("#splitter1address").val(targets[0]);
                $("#splitter2address").val(targets[1]);
                if (targets[0] == "0x0000000000000000000000000000000000000000") {
                    $("#splitter1tx").text("n/a").addClass("alert alert-warning");

                } else {
                    $("#splitter1tx").text(targets[0]).removeClass("alert alert-warning");
                }
                if (targets[1] == "0x0000000000000000000000000000000000000000") {
                    $("#splitter2tx").text("n/a").addClass("alert alert-warning");
                } else {
                    $("#splitter2tx").text(targets[1]).removeClass("alert alert-warning");
                }
            }

        });

        SplitterInstance.splittergetBalance(function(err, balances) {
            if (err) {
                console.error(err);
            } else {
                console.log("Splitter 1 balance", balances[0].toString(10));
                console.log("Splitter 2 balance", balances[1].toString(10));
                $("#splitter1balance").text(web3.fromWei(balances[0]));
                $("#splitter2balance").text(web3.fromWei(balances[1]));
            }

        });
    }

    function _splitterSetTargets() {
        web3.eth.getCoinbase(function(err, coinbase) {
            if (err) {
                console.error(err);
            } else {
                web3.eth.getAccounts(function(err, accounts) {
                    if (err) {
                        console.error(err);
                    } else {
                        // function splitterSetTargets(address payable _splitter1, address payable _splitter2) 
                        const _splitter1 = $("#splitter1address").val();
                        const _splitter2 = $("#splitter2address").val();

                        SplitterInstance.splitterSetTargets(
                            _splitter1, _splitter2, {
                                from: coinbase
                            },
                            function(err, txn) {
                                if (err) {
                                    console.error(err);
                                } else {
									console.log("Tried to set splitters txn: ", txn);                                    
                                    _splitterInit();	
                                }
                            });
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
                        // function splitit() public onlyOwner returns (bool success) {

                        SplitterInstance.splitit({
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



    $("#contractttx").text(SplitterAddress);
	_splitterInit();

    


    $("#Iset").on("click", _splitterSetTargets);
    $("#Ispilt").on("click", _splitterSplits);

});