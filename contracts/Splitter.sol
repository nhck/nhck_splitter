 pragma solidity 0.5.8;

 
 import './Owned.sol';
 import './Stoppable.sol';
 
 /**
  * @title Splitting of Alice' ethereum for the Blockstars course. 
  */
 contract Splitter is Owned, Stoppable {
     
     event LogFundsAdded(address indexed _from, uint _value);
     event LogCustomerSet(address indexed _by, address indexed _newCustomer, string _leftOrRight);
     event LogFundsSplit(address indexed _by, uint _valuePerCustomer, address indexed _left, address indexed _right);
     event LogFundsWithdrawn(address indexed _by, uint _value);
     event LogFundsReturned(address indexed _by);
         
     
     
     /**
      * Comment:
      * There is also a way to design this with a mapping.
      * You could keep track of the balances saying
      * mapping (address => uint) localbalances;
      * 
      * This would be nice because you could have a history of different users using the splitter.
      * 
      * However, I wanted to have a posibility to purge all localbalances.
      * There is no easy way in solidity to walk a mapping, hence I decided, in this case, a simpler design would do.
      */
     
     // Initally I used a mapping, but for this use case a simple struct should be enough
     struct Customer {
        address id;
        uint ammount;
    }
    //we will only have to customers: Customer[0] and Customer[1]
    Customer[2] private Customers;

    uint private localbalance;
     
     /**
     * The constructor is set in Owned.
	 */
	 //constructor()
     
     
    /**
     * Add/Update Customer[0] address
     * 
     * @param _newCustomer Bobs address
     * @return sucess
     */
    function LeftCustomer(address payable _newCustomer) onlyOwner public returns (bool success) {
       require(Customers[0].id != _newCustomer);
       
        Customers[0].id = _newCustomer;
        
        emit LogCustomerSet(msg.sender, Customers[0].id, "left");
       
        return true;

    }
    
    
    
     /**
     * Add/Update Customer[1] address
     * 
     * @param _newCustomer Carols address
     * @return sucess
     */
    function RightCustomer(address payable _newCustomer) onlyOwner public returns (bool success) {
       require(Customers[1].id != _newCustomer);
       emit LogCustomerSet(msg.sender, _newCustomer, "right");
       
        Customers[1].id = _newCustomer;
        return true;
    }
    
    /**
     * Get value of left Customers
     * 
     * @return object _leftCustomerId address of left customer and  _leftCustomerAmmount ammount of localbalance of left customer
     */
    function LeftCustomerGet() public view returns(address _leftCustomerId,uint _leftCustomerAmmount) {
        return (Customers[0].id, Customers[0].ammount);
    }
    
    /**
     * Get value of right Customers
     * 
     * @return object _rightCustomerId address of right customer and  _rightCustomerAmmount ammount of localbalance of right customer
     */
    function RightCustomerGet() public view returns(address _rightCustomerId,uint _rightCustomerAmmount) {
        return (Customers[1].id,Customers[1].ammount);
    }
    
	/**
	 * Returns the local balance available to be split among left and righ customer
	 * 
	 * @return uint local splitter balance
	 */
	function LocalBalanceGet() public view returns(uint _localbalance) {
		return localbalance;
	}
 
   
     
     /**
     * Assign half of the localbalance to the Customers
     * If the localbalance doesn't split even it is reduced until it splits even
     * Update the localbalance.
     * 
     * @return sucess
     */
     function Split() onlyOwner onlyifRunning public returns (bool success) {
         uint _ammount;
		 uint _halfmount;
		  
		  //Test if splitters are actually set
          require(Customers[0].id != address(0) && Customers[1].id != address(0),"Both customers have to be set.");
          
          _ammount = localbalance;
		  
		  // If there is a remainder then we reduce the ammount by one Wei
		   if(_ammount%2 == 1) {
			  _ammount = _ammount-1;
		  }
		  
		  //Split the ammount by half and check if we still have enough funds.
          _halfmount = _ammount/2;
          require(_halfmount>0, "Local balance is too low.");
		  
		
        
          //transfer
          localbalance = localbalance - ( _halfmount *2);
          
           emit LogFundsSplit(msg.sender, _halfmount,Customers[0].id,Customers[1].id);
          Customers[0].ammount += _halfmount;
          Customers[1].ammount += _halfmount;
          
          
          return true;
     }
     
     
     
     /**
      * To add ether to the Splitter you send it to this function.
      * It then updates the localbalance of ether available to be split
      */
     function AddFunds() onlyifRunning public payable returns (bool success) {
        
        assert(msg.value > 0);
        emit LogFundsAdded(msg.sender, msg.value);
        
        localbalance += msg.value;
        
        return true;
     }
     
     /**
      * Currently set customers can Withdraw their funds there
      *
      * 
      */
     function WithdrawFunds() onlyifRunning public {
         uint _ammount;
         require(Customers[0].id == msg.sender || Customers[1].id == msg.sender);
         
         if(Customers[0].id == msg.sender) {
             _ammount = Customers[0].ammount;
             
             emit LogFundsWithdrawn(Customers[0].id,_ammount);
             Customers[0].ammount = 0;
             msg.sender.transfer(_ammount);
         }
         if(Customers[1].id == msg.sender) {
             _ammount = Customers[1].ammount;
             
             emit LogFundsWithdrawn(Customers[1].id,_ammount);
             Customers[1].ammount = 0;
             msg.sender.transfer(_ammount);
         }
     }
     
     
    
  
     /**
	* Alice says: "Hey - I want my money back."
	* Returns contract funds to owner.
	*
	* @return success function was executed sucessfully
	*/
	function ReturnFunds() onlyifRunning onlyOwner public returns (bool success) {
	   
	   uint _ammount = address(this).balance;
	   require(_ammount>0,"Contract does not have funds to return.");
	   
	   //cleanup
	   
	  emit LogFundsReturned(msg.sender);
      localbalance = 0;
      Customers[0].ammount = 0;
      Customers[1].ammount = 0;
	   
	   owner.transfer(_ammount);
	   
	   return true;
	}
 }