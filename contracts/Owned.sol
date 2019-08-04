pragma solidity 0.5.8;

contract Owned {
    address payable owner;
     
    event LogChangeOwner(address indexed sender, address indexed newOnwer);
   
    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner of this contract.");
        _;
    }
    
   constructor() public {
        
        owner = msg.sender;
        
    }
    
    function changeOwner(address payable newOnwer) public onlyOwner returns(bool success) {
        owner = newOnwer;
        emit LogChangeOwner(msg.sender, newOnwer);
        return true;
    }
       
    
}