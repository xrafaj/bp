// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract VendingMachine {

    // state variables
    bytes1[9] public result;
    address public owner;
    address public winner;
    mapping (address => uint) public coinBalance;
    address payable p2_address;
    constructor() {
            owner = msg.sender;
            coinBalance[address(this)] = 100;
        }

    function returnWinner() public
        view
        returns (address){
            return winner;
        }
    
    function getMessageHash(
        uint[] calldata _num
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_num));
        }

    function verify(uint[] calldata _num, bytes32 _board, bytes memory _signature1, bytes memory _signature2) public returns (bool){
        require(recoverSigner(_board, _signature1) == owner, 'EOAVerify: Signed mismatch');
        require(recoverSigner(_board, _signature2) == p2_address, 'EOAVerify: Signed mismatch');
        if (    (_num[0] == 0x00 && _num[1] == 0x00 && _num[2] == 0x00 ) ||
                (_num[3] == 0x00 && _num[4] == 0x00 && _num[5] == 0x00 ) ||
                (_num[6] == 0x00 && _num[7] == 0x00 && _num[8] == 0x00 ) ||
                (_num[0] == 0x00 && _num[4] == 0x00 && _num[8] == 0x00 ) ||
                (_num[6] == 0x00 && _num[4] == 0x00 && _num[2] == 0x00 ) ||
                (_num[0] == 0x00 && _num[3] == 0x00 && _num[6] == 0x00 ) ||
                (_num[1] == 0x00 && _num[4] == 0x00 && _num[7] == 0x00 ) ||
                (_num[2] == 0x00 && _num[5] == 0x00 && _num[8] == 0x00 ) 
        ){
            winner = owner;
        }else if(
                (_num[0] == 0x02 && _num[1] == 0x02 && _num[2] == 0x02 ) ||
                (_num[3] == 0x02 && _num[4] == 0x02 && _num[5] == 0x02 ) ||
                (_num[6] == 0x02 && _num[7] == 0x02 && _num[8] == 0x02 ) ||
                (_num[0] == 0x02 && _num[4] == 0x02 && _num[8] == 0x02 ) ||
                (_num[6] == 0x02 && _num[4] == 0x02 && _num[2] == 0x02 ) ||
                (_num[0] == 0x02 && _num[3] == 0x02 && _num[6] == 0x02 ) ||
                (_num[1] == 0x02 && _num[4] == 0x02 && _num[7] == 0x02 ) ||
                (_num[2] == 0x02 && _num[5] == 0x02 && _num[8] == 0x02 ) 
        ){
            winner = p2_address;
        }else {
            return false;
        }
        return true;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address){
            (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
            return ecrecover(_ethSignedMessageHash, v, r, s);
        }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
                bytes32 r,
                bytes32 s,
                uint8 v
            ){
            require(sig.length == 65, "invalid signature length");
            assembly {
                r := mload(add(sig, 32))
                s := mload(add(sig, 64))
                v := byte(0, mload(add(sig, 96)))
            }
        }

    function getResultBalance() public view returns (bytes1[9] memory) {
        return result;
    }

    function getVendingMachineBalance() public view returns (uint) {
        return coinBalance[address(this)];
    }

    function getP2() public view returns (address) {
        return (p2_address);
    }

    function getP1() public view returns (address) {
        return (owner);
    }

    // Purchase from the vending machine
    function purchase(uint amount) public payable {
        require(msg.value >= amount * 0.01 ether, "You must pay at least 2 ETH per coin");
        require(coinBalance[address(this)] >= amount, "Not enough coins in stock to complete this purchase");
        coinBalance[address(this)] -= amount;
        coinBalance[msg.sender] += amount;
    }

    // join channel
    function join() public payable {
        p2_address = payable(msg.sender);
    }

}