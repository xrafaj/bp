//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

//import "hardhat/console.sol";

contract TreeChannel {
    address public owner;
    address public winner;
    address payable p2_address;
    bytes32 public rootTree;
    uint[] public rowA;
    uint[] public rowB;
    uint public sumA = 0;
    uint public sumB = 0;

    constructor(bytes32 root) public payable{
        rootTree = root;
        owner = payable(msg.sender);
    }

    function getrowA() public view returns (uint[] memory) {
        return (rowA);
    }
    
    function getrowB() public view returns (uint[] memory) {
        return (rowB);
    }

    function getRoot() public view returns (bytes32) {
        return (rootTree);
    }

    function returnWinner() public
        view
        returns (address){
            return winner;
    }

    function join() public payable {
        require(p2_address == address(0));
        p2_address = payable(msg.sender);
    }

   function _verifyMerkleProof(
        bytes32 leaf,
        bytes32[] memory proof
    )
            public
            view
            returns (bool)
        {
            bytes32 computedHash = leaf;
            for (uint256 i = 0; i < proof.length; i++) {
                bytes32 proofElement = proof[i];
                if (computedHash <= proofElement) {
                    computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
                } else {
                    computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
                }
            }
            return computedHash == rootTree;
        }    


    function st2num(string memory numString) public pure returns(uint) {
        uint  val=0;
        bytes   memory stringBytes = bytes(numString);
        for (uint  i =  0; i<stringBytes.length; i++) {
            uint exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
           uint jval = uval - uint(0x30);
   
           val +=  (uint(jval) * (10**(exp-1))); 
        }
      return val;
    }

    function verify(uint[] calldata _num, string[] calldata _tree) public returns (bool){
        // prvý     bit hit =1 , stand = 0           0 / 1 
        // druhý    bit hráč = 0 (A) , 1(B)
        
        // parsing moves
        for(uint i=0; i<_num.length; i++){
            if (_num[i]==10){
                rowA.push(st2num(_tree[i])%10);
            }
            if (_num[i]==11){
                rowB.push(st2num(_tree[i])%10);
            }
            if (_num[i]==0){
                continue;
            }
            if (_num[i]==1){
                continue;
            }
        }

        for(uint i=0; i<rowA.length; i++){
            sumA = sumA + rowA[i];
        }

        for(uint i=0; i<rowB.length; i++){
            sumB = sumB + rowB[i];
        }

        if (sumA > sumB){
            winner = owner;
            uint amount = address(this).balance;
            (bool success, ) = winner.call{value: amount}("");
            require(success, "Failed to send Ether");
        } else if (sumB > sumA){
            winner = p2_address;
            uint amount = address(this).balance;
            (bool success, ) = winner.call{value: amount}("");
            require(success, "Failed to send Ether");
        }
        return true;
    }
}