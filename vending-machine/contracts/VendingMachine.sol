// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract VendingMachine {

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