 pragma solidity 0.5.8;

 import './SafeMath.sol';

 import './Stoppable.sol';



 
 /**
  * @title Splitting of Alice' ethereum for the Blockstars course. 
  */
 contract Splitter is Stoppable(true) {
     using SafeMath for uint;
     
     event logCustomerSet(address indexed _by, address indexed _newCustomer, string _leftOrRight);
     event logFundsSplit(address indexed _by, uint _valuePerCustomer, address indexed _firstCustomer, address indexed _secondCustomer);
     event logFundsWithdrawn(address indexed _by, uint _value);
         
     
     mapping (address => uint256) public balances;
     
     address public firstCustomer;
     address public secondCustomer;
     
     

     /**
     * Add/Update 
     * 
     * @param _newCustomer new Customer address
     * @param _which Select customer first customer by 0 and second customer by 1
     * @return sucess
     */
    function setCustomer(address payable _newCustomer, bool _which) onlyOwner onlyIfRunning public returns (bool success) {
        require(_newCustomer != address(0));
        
        if(_which == false) {
            firstCustomer = _newCustomer;
            emit logCustomerSet(msg.sender, firstCustomer, "first Customer");
        }
        
        if(_which == true) {
            secondCustomer = _newCustomer;
            emit logCustomerSet(msg.sender, secondCustomer, "second Customer");
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
         uint _ammount = msg.value;
		 uint _halfAmmount;
		  
		  //Test if splitters are actually set
          require(firstCustomer != address(0) && secondCustomer != address(0),"Both customers have to be set.");

		  
		  // If there is a remainder then we reduce the ammount by one Wei
		   if(_ammount.mod(2) == 1) {
			  revert("Ammount not splittable.");
		  }
		  
		  //Split the ammount by half and check if we still have enough funds.
          _halfAmmount = _ammount.div(2);
          require(_halfAmmount>0, "Local balance is too low.");
		  
		
        
          //transfer
         balances[firstCustomer] = balances[firstCustomer].add(_halfAmmount);
         balances[secondCustomer] = balances[secondCustomer].add(_halfAmmount);
         emit logFundsSplit(msg.sender, _halfAmmount, firstCustomer, secondCustomer);
          
          return true;
     }
     
    
     /**
      * Currently set customers can Withdraw their funds there
      *
      * @return true on success 
      */
     function withdrawFunds() onlyIfRunning public returns (bool success){
         uint _ammount;
         require(balances[msg.sender]>0);
         
        _ammount = balances[msg.sender];
        balances[msg.sender] = 0;
        
        msg.sender.transfer(_ammount);
        emit logFundsWithdrawn(msg.sender,_ammount);

        return true;
     }
     
   
     
 }