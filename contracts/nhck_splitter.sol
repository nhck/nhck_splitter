 pragma solidity 0.5.8;
 
 import './owned.sol';
 
 /** @title Splitting of Alice' ethereum for the Blockstars course. */
 contract Splitter is Owned {
     
    // We assume that only the owner can send in ether and only the owner can split them
    address payable owner;  //Alices address

    address payable splitter1; //Bobs address
    address payable splitter2; //Carols address
    
    /**
     * In the constructor we set the owner of the contract to be the initial deployer
     * This could be Alice.
     * 
     */
    constructor() public payable {
        owner = msg.sender;
    }
    
    /**
     * This gets the balance of the contract.
     * This is also at the same time the wallet of the contract owner.
     * 
     * @return balance Contract balance as uint
     */
    function getBalance() public view returns (uint) {
         return address(this).balance;
    }
    
    /**
     * Sets addresses of Splitter customers
     * 
     * QUESTION: Should I check if the parameters are empty here?
     * QUESTION: Does it actually save transaction space to check if the new spltters are the same as before?
     * 
     * @param _splitter1 First user that will recieve half of the split
     * @param _splitter2 Second user that will recieve half of the split
     * 
     * @return success function was executed sucessfully
     */
     function splitterSetTargets(address payable _splitter1, address payable _splitter2) public onlyOwner returns (bool success) {
        

        //avoid just flipping of variables or both being emtpy
        require( !((_splitter1 == splitter1 && _splitter2 == splitter2) || (_splitter1 == splitter2 && _splitter2 == splitter1)), "Provided splitter client addresses are the same as before (or empty)." );
 
        //only set if _splitter1 is not the same as before and not emtpy
        if(_splitter1 != splitter1 && _splitter1 != address(0)) {
             splitter1 = _splitter1;
         }
        if(_splitter2 != splitter2 && _splitter2 != address(0)) {
             splitter2 = _splitter2;
        }
        
         return true;
     }
     
     /**
      * Provides currently set splitter customers
      * 
      * @return splitter1 address of splitter 1
      * @return splitter2 address of splitter 2
      */
     function splitterGetTargets() public view returns(address, address) {
         return (splitter1,splitter2);
     }
     
     /**
      * Sends half of a selected ammount of the contracts ether to the two splitters (splitter1 and splitter2)
      * 
      * QUESTION: How small can the ammount be - could there be a rounding problem?
      * 
      * @return success function was executed sucessfully
      */
      function splitit() public onlyOwner returns (bool success) {
          
           //Test if splitters are actually set
          require(splitter1 != address(0) && splitter2 != address(0));
          
          
          uint _ammount = getBalance();
          uint _hmount = _ammount/2;
          require(_hmount>0, "Contract does not have enough funds");
          require(_hmount+_hmount == _ammount,"Not enough funds to split equally for two.");
          
         
          //transfer
          splitter1.transfer(_hmount);
          splitter2.transfer(_hmount);
           
          return true;
      }

      
      /**
       * getBalance of splitter1/_splitter2
       * 
       * @return _splitter1bal balance of splitter 1
       * @return _splitter2bal balance of splitter 2
       */
       function splittergetBalance() public view returns (uint _splitter1bal, uint _splitter2bal) {
          
          //Test if splitters are actually set
          require(splitter1 != address(0) && splitter2 != address(0));
          
          return(splitter1.balance, splitter2.balance);
       }
       
       /*
        * Alice says: "Hey - I want my money back."
        * Returns contract funds to owner.
        *
        * @return success function was executed sucessfully
        */
       function splitterReturnToOwner() public onlyOwner returns (bool success) {
           
           uint _ammount = getBalance();
           require(_ammount>0,"Contract does not have funds to return.");
           
           owner.transfer(_ammount);
           
           return true;
       }
    
    function() payable external {}
 }