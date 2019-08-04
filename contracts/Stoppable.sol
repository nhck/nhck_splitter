pragma solidity 0.5.8;

import './Owned.sol';

contract Stoppable is Owned {
    bool isRunning;
    event LogPausedcontract(address indexed sender);
    event LogResumedcontract(address indexed sender);
   
     modifier onlyifRunning {
        require(isRunning);
        _;
    }
    
    constructor() public {
        isRunning = true; 
    }
    
    function pauseContract() public onlyOwner onlyifRunning returns(bool success) {
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