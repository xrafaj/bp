// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract VendingMachine {

    bytes1[9] result;

    function getMessageHash(
        uint[] calldata _num
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_num));
    }

    function hash(
        uint[] calldata _num
    ) public pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix,_num));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
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
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

    }

    function verify(bytes32 message, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        address signer = ecrecover(message, v, r, s);
        return signer;
    }

    function verifyExtra(bytes32 message, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, message));
        address signer = ecrecover(prefixedHash, v, r, s);
        return signer;
    }

    function foo(bytes1[9] memory _mdata) public returns(bytes1[9] memory){
        
        uint8 i;
        for(i=0 ; i<9 ; i++){
            result[i] = _mdata[i];
        }
        return result;
    }
    
    function getResultBalance() public view returns (bytes1[9] memory) {
        return result;
    }



    // state variables
    address public owner;
    mapping (address => uint) public donutBalances;

    address payable p2_address;
    //uint256 eth_bet;
    // set the owner as th address that deployed the contract
    // set the initial vending machine balance to 100
    constructor() {
        owner = msg.sender;
        donutBalances[address(this)] = 100;
    }

    function getVendingMachineBalance() public view returns (uint) {
        return donutBalances[address(this)];
    }

    function getP2() public view returns (address) {
        return (p2_address);
    }

    function getP1() public view returns (address) {
        return (owner);
    }

    // Let the owner restock the vending machine
    function restock(uint amount) public {
        require(msg.sender == owner, "Only the owner can restock.");
        donutBalances[address(this)] += amount;
    }

    // Purchase donuts from the vending machine
    function purchase(uint amount) public payable {
        require(msg.value >= amount * 0.01 ether, "You must pay at least 2 ETH per donut");
        require(donutBalances[address(this)] >= amount, "Not enough donuts in stock to complete this purchase");
        donutBalances[address(this)] -= amount;
        donutBalances[msg.sender] += amount;
    }

    function join() public payable {
        //require(msg.value >= amount * 0.01 ether, "You must pay at least 2 ETH per donut");
        //require(donutBalances[address(this)] >= amount, "Not enough donuts in stock to complete this purchase");
        p2_address = payable(msg.sender);
        donutBalances[address(this)] -= 0;
        donutBalances[msg.sender] += 0;
    }

}