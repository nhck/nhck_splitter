pragma solidity 0.5.8;

import './SafeMath.sol';
import './Stoppable.sol';

/**
 * @title Splitting of Alice' ethereum for the Blockstars course. 
 */
contract Splitter is Stoppable {
    using SafeMath for uint;

    event LogCustomerSet(address indexed sender, address indexed newCustomer, bool isSecond);
    event LogFundsSplit(address indexed sender, uint valuePerCustomer, address indexed firstCustomer, address indexed secondCustomer);
    event LogFundsWithdrawn(address indexed sender, uint value);


    mapping(address => uint256) public balances;

    address public firstCustomer;
    address public secondCustomer;

    /**
	 *
	 * @param startRunning true to start the contract in running mode, false to start stopped
	 */
    constructor(bool startRunning)  Stoppable(startRunning) public {}

    /**
     * Add/Update
     *
     * @param _newCustomer new Customer address
     * @param isSecond Select customer first customer by 0 and second customer by 1
     * @return sucess
     */
    function setCustomer(address payable _newCustomer, bool isSecond) onlyOwner onlyIfRunning public returns (bool success) {
        require(_newCustomer != address(0));

        if (!isSecond) {
            firstCustomer = _newCustomer;
            emit LogCustomerSet(msg.sender, _newCustomer, isSecond);
        } else {
            secondCustomer = _newCustomer;
            emit LogCustomerSet(msg.sender, _newCustomer, isSecond);
        }

        return true;
    }

    /**
     * Assign half of the localbalance to the Customers
     * If the localbalance doesn't split even it is reduced until it splits even
     * Update the localbalance.
     *
     * @return true on success
     */
    function split() onlyOwner onlyIfRunning public payable returns (bool success) {
        //Test if splitters are actually set
        require(firstCustomer != address(0) && secondCustomer != address(0), "Both customers have to be set.");
        require(msg.value > 0);
        require(msg.value.mod(2) == 0, "Ammount not splittable.");

        balances[firstCustomer] = balances[firstCustomer].add(msg.value.div(2));
        balances[secondCustomer] = balances[secondCustomer].add(msg.value.div(2));

        emit LogFundsSplit(msg.sender, msg.value.div(2), firstCustomer, secondCustomer);

	return true;
    }


    /**
     * Currently set customers can Withdraw their funds there
     *
     * @return true on success
     */
    function withdrawFunds() onlyIfRunning public returns (bool success){
        uint _ammount = balances[msg.sender];
        require(_ammount > 0);

        balances[msg.sender] = 0;
        emit LogFundsWithdrawn(msg.sender, _ammount);
        msg.sender.transfer(_ammount);

        return true;
    }
}