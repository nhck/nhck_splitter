pragma solidity 0.5.8;

import './SafeMath.sol';
import './Stoppable.sol';

/**
 * @title Splitting of Alice' ethereum for the Blockstars course. 
 */
contract Splitter is Stoppable {
    using SafeMath for uint;

    event LogFundsSplit(address indexed sender, uint valuePerCustomer, address indexed firstCustomer, address indexed secondCustomer);
    event LogFundsWithdrawn(address indexed sender, uint value);
    event LogBalanceUpdated(address indexed customer, uint newBalance);

    mapping(address => uint256) public balances;

    /**
	 *
	 * @param startRunning true to start the contract in running mode, false to start stopped
	 */
    constructor(bool startRunning)  Stoppable(startRunning) public {}

    /**
     * Assign half of the localbalance to the Customers
     * If the localbalance doesn't split even it is reduced until it splits even
     * Update the localbalance.
     *
     * @return true on success
     */
    function split(address firstCustomer, address secondCustomer) onlyIfRunning public payable returns (bool success) {
        require(firstCustomer != address(0) && secondCustomer != address(0), "Both customers have to be set.");
        require(msg.value > 0);

        if(msg.value.mod(2) == 1) {
            balances[msg.sender] = balances[msg.sender].add(1);
            emit LogBalanceUpdated(msg.sender,balances[msg.sender]);
        }

        balances[firstCustomer] = balances[firstCustomer].add(msg.value.div(2));
        balances[secondCustomer] = balances[secondCustomer].add(msg.value.div(2));

        emit LogBalanceUpdated(firstCustomer,balances[firstCustomer]);
        emit LogBalanceUpdated(secondCustomer,balances[secondCustomer]);
        emit LogFundsSplit(msg.sender, msg.value.div(2), firstCustomer, secondCustomer);

        return true;
    }


    /**
     * Currently set customers can Withdraw their funds there
     *
     * @return true on success
     */
    function withdrawFunds() onlyIfRunning public returns (bool success){
        uint _amount = balances[msg.sender];
        require(_amount > 0);

        balances[msg.sender] = 0;
        emit LogFundsWithdrawn(msg.sender, _amount);
        msg.sender.transfer(_amount);

        return true;
    }
}