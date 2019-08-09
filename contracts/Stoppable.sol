pragma solidity 0.5.8;

import './Owned.sol';

contract Stoppable is Owned {
    bool private isRunning;
    event LogPausedcontract(address indexed sender);
    event LogResumedcontract(address indexed sender);
   
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
        emit LogPausedcontract(msg.sender);
        return true;
    }
    
    function resumeContract() public onlyOwner returns(bool success) {
       require(!isRunning);
        isRunning = true;
        emit LogResumedcontract(msg.sender);
        return true;
    }
}