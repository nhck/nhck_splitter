pragma solidity 0.5.8;

contract Owned {
	address private _owner;
	 
	event LogChangeOwner(address indexed sender, address indexed newOnwer);

	modifier onlyOwner {
		require(msg.sender == _owner, "You are not the owner of this contract.");
		_;
	}
	
	constructor() public {
		
		_owner = msg.sender;
		
	}
	
	function changeOwner(address newOwner) public onlyOwner returns(bool success) {
		require(newOwner != address(0),"Invalid address for new Onwer");
	
		_owner = newOwner;
		emit LogChangeOwner(msg.sender, newOwner);
		
		return true;
	}
	
	function getOwner() public view returns (address owner){
		return _owner;
	}
}