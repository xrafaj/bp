// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract VendingMachine {
    address public owner;
    address public winner;
    address payable p2_address;
    address payable inactive;
    address payable waiting;
    uint256 public constant TIMEOUT = 2 minutes;
    uint public bet;
    uint256 public timeout;
    
    constructor() payable {
        require(msg.value >= 0.02 ether);
        bet = msg.value;
        owner = payable(msg.sender);
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
        require(winner == address(0));
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
            uint amount = address(this).balance;
            (bool success, ) = winner.call{value: amount}("");
            require(success, "Failed to send Ether");
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
            uint amount = address(this).balance;
            (bool success, ) = winner.call{value: amount}("");
            require(success, "Failed to send Ether");
        }else {
            return false;
        }
        return true;
    }
    
    function timeoutChallenge(bytes32 _board, bytes32 _boardBefore, bytes memory _challenger, bytes memory _challenged) public returns (bool){
        require(timeout == 0);
        require(winner == address(0));
         if (msg.sender == owner) {
            require(recoverSigner(_board, _challenger) == owner, 'EOAVerify: Signed mismatch');
            require(recoverSigner(_boardBefore, _challenged) == p2_address, 'EOAVerify: Signed mismatch');
            inactive = p2_address;
            waiting = payable(owner);
        } else if (msg.sender == p2_address){
            require(recoverSigner(_board, _challenger) == p2_address, 'EOAVerify: Signed mismatch');
            require(recoverSigner(_boardBefore, _challenged) == owner, 'EOAVerify: Signed mismatch');
            inactive = payable(owner);
            waiting = p2_address;
        }
        timeout = block.timestamp + TIMEOUT;
        return true;
    }

    function claimTimeout() external {
        require(timeout <= block.timestamp);
        require(waiting != address(0));
        winner = waiting;
        uint amount = address(this).balance;
        (bool success, ) = waiting.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function cancelTimeout() public {
        require(inactive == msg.sender);
        require(timeout > block.timestamp);
        inactive = payable(address(0));
        waiting = payable(address(0));
        timeout = 0;
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

    function getP2() public view returns (address) {
        return (p2_address);
    }

    function getP1() public view returns (address) {
        return (owner);
    }

    function join() public payable {
        require(msg.value == bet);
        require(p2_address == address(0));
        p2_address = payable(msg.sender);
    }

}