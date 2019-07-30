pragma solidity 0.5.8;

contract Owned {
    address public owner;
     
    event LogChangeOwner(address sender, address newOnwer);
   
    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner of this contract.");
        _;
    }
    
   constructor() public {
        
        owner = msg.sender;
        
    }
    
    function changeOwner(address newOnwer) public onlyOwner returns(bool success) {
        owner = newOnwer;
        emit LogChangeOwner(msg.sender, newOnwer);
        return true;
    }
       
    
}