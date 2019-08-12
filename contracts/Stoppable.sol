pragma solidity 0.5.8;

import './Owned.sol';

contract Stoppable is Owned {
	bool private isRunning;
	event LogPausedContract(address indexed sender);
	event LogResumedContract(address indexed sender);

	 modifier onlyIfRunning {
		require(isRunning);
		_;
	}
	
	 modifier onlyIfPaused {
		require(!isRunning);
		_;
	}
	
	/**
	 * 
	 * @param startRunning true to start the contract in running mode, false to start stopped
	 */
	constructor(bool startRunning) public {
		isRunning = startRunning; 
	}
	
	function pauseContract() public onlyOwner onlyIfRunning returns(bool success) {
		isRunning = false;
		emit LogPausedContract(msg.sender);
		return true;
	}
	
	function resumeContract() public onlyOwner onlyIfPaused returns(bool success) {
		isRunning = true;
		emit LogResumedContract(msg.sender);
		return true;
	}
}