const { expect } = require("chai");
const { ethers } = require("hardhat");
//require("web3");
//import Web3 from 'web3'
//const { Web3 } = require("@nomiclabs/hardhat-web3");

const CONTRACT_ADDRESS = '0x1eD925bA7f1cB6B0ED9C468DfA292b266Fd1418f';
const ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

describe("GameChannel", function () {
  it("Deployed contract with 0.02 ETH value. User 2 joined successfully.",async function main() {
    const accounts = await hre.ethers.getSigners();
    const GameChannel_ = await ethers.getContractFactory("GameChannel");
    const greeter = await GameChannel_.deploy({ value: ethers.utils.parseEther("0.02") });
    await greeter.deployed();
    await greeter.connect(accounts[1]).join({ value: ethers.utils.parseEther("0.02") });
    const getP3addy = await greeter.getP2();
    expect(await greeter.getP2()).to.equal(accounts[1].address);
  });
  it("Simulated game where player 1 should be a winner.",async function main() {
    const Web3 = require('web3')
    let web3t;
    web3t = new Web3("HTTP://127.0.0.1:7545")
    let account = await web3t.eth.getAccounts();
    var board = new Array(9);
    board[0] = 0;
    board[1] = 0;
    board[2] = 0;
    board[3] = 2;
    board[4] = 2;
    board[5] = 1;
    board[6] = 1;
    board[7] = 1;
    board[8] = 1;
    const accounts = await hre.ethers.getSigners();
    const GameChannel_ = await ethers.getContractFactory("GameChannel");
    const greeter = await GameChannel_.deploy({ value: ethers.utils.parseEther("0.02") });
    await greeter.deployed();
    boardHash = await greeter.getMessageHash(board);
    keccak256Hash = await ethers.utils.keccak256(ethers.utils.toUtf8Bytes(boardHash))
    const test = board;
    const testBytes = ethers.utils.arrayify(test);
    const messageHash = ethers.utils.hashMessage(testBytes);
    const messageHashBytes = ethers.utils.arrayify(messageHash);
    const signature = await accounts[0].signMessage(ethers.utils.arrayify(test));
    const signature2 = await accounts[1].signMessage(ethers.utils.arrayify(test));
    await greeter.deployed();
    await greeter.connect(accounts[1]).join({ value: ethers.utils.parseEther("0.02") });    
    await greeter.connect(accounts[1]).verify(test, messageHashBytes, signature, signature2);
    expect(await greeter.returnWinner()).to.equal(accounts[0].address);
    return true;
  });
  it("Simulated game where player 2 should be a winner.",async function main() {
    const Web3 = require('web3')
    let web3t;
    web3t = new Web3("HTTP://127.0.0.1:7545")
    let account = await web3t.eth.getAccounts();
    var board = new Array(9);
    board[0] = 2;
    board[1] = 1;
    board[2] = 1;
    board[3] = 0;
    board[4] = 2;
    board[5] = 1;
    board[6] = 0;
    board[7] = 0;
    board[8] = 2;
    const accounts = await hre.ethers.getSigners();
    const GameChannel_ = await ethers.getContractFactory("GameChannel");
    const greeter = await GameChannel_.deploy({ value: ethers.utils.parseEther("0.02") });
    await greeter.deployed();
    boardHash = await greeter.getMessageHash(board);
    keccak256Hash = await ethers.utils.keccak256(ethers.utils.toUtf8Bytes(boardHash))
    const test = board;
    const testBytes = ethers.utils.arrayify(test);
    const messageHash = ethers.utils.hashMessage(testBytes);
    const messageHashBytes = ethers.utils.arrayify(messageHash);
    const signature = await accounts[0].signMessage(ethers.utils.arrayify(test));
    const signature2 = await accounts[1].signMessage(ethers.utils.arrayify(test));
    await greeter.deployed();
    await greeter.connect(accounts[1]).join({ value: ethers.utils.parseEther("0.02") });    
    await greeter.connect(accounts[1]).verify(test, messageHashBytes, signature, signature2);
    expect(await greeter.returnWinner()).to.equal(accounts[1].address);
    return true;
  });
  it("Simulation of timeout situation.",async function main() {
    this.timeout(0)
    const Web3 = require('web3')
    let web3t;
    web3t = new Web3("HTTP://127.0.0.1:7545")
    let account = await web3t.eth.getAccounts();
    var board = new Array(9);
    board[0] = 0;
    board[1] = 0;
    board[2] = 1;
    board[3] = 2;
    board[4] = 1;
    board[5] = 1;
    board[6] = 1;
    board[7] = 1;
    board[8] = 1;
    var boardBefore = new Array(9);
    boardBefore[0] = 0;
    boardBefore[1] = 1;
    boardBefore[2] = 1;
    boardBefore[3] = 2;
    boardBefore[4] = 1;
    boardBefore[5] = 1;
    boardBefore[6] = 1;
    boardBefore[7] = 1;
    boardBefore[8] = 1;
    const accounts = await hre.ethers.getSigners();
    const GameChannel_ = await ethers.getContractFactory("GameChannel");
    const greeter = await GameChannel_.deploy({ value: ethers.utils.parseEther("0.02") });
    await greeter.deployed();
    boardHash = await greeter.getMessageHash(board);
    keccak256Hash = await ethers.utils.keccak256(ethers.utils.toUtf8Bytes(boardHash))
    const test = board;
    const testBytes = ethers.utils.arrayify(test);
    const messageHash = ethers.utils.hashMessage(testBytes);
    const messageHashBytes = ethers.utils.arrayify(messageHash);
    const signature = await accounts[0].signMessage(ethers.utils.arrayify(test));
    boardHash = await greeter.getMessageHash(boardBefore);
    keccak256Hash = await ethers.utils.keccak256(ethers.utils.toUtf8Bytes(boardHash))
    const test2 = board;
    const testBytes2 = ethers.utils.arrayify(test2);
    const messageHash2 = ethers.utils.hashMessage(testBytes2);
    const messageHashBytes2 = ethers.utils.arrayify(messageHash2);  
    const signature2 = await accounts[1].signMessage(ethers.utils.arrayify(test2));
    await greeter.deployed();
    await greeter.connect(accounts[1]).join({ value: ethers.utils.parseEther("0.02") });    
    await greeter.connect(accounts[0]).timeoutChallenge(messageHashBytes2,messageHashBytes, signature, signature2);
    console.log("\t Waiting 60 seconds...");
    await delay(70000);
    await greeter.connect(accounts[0]).claimTimeout();
    expect(await greeter.returnWinner()).to.equal(accounts[0].address);
    return true;
  });
  it("Merkle tree simulation", async function main(){
    const Web3 = require('web3')
    let web3t;
    web3t = new Web3("HTTP://127.0.0.1:7545")
    let account = await web3t.eth.getAccounts();
    const { MerkleTree } = require('merkletreejs')
    const keccak256 = require('keccak256')
    const unhashed = ['015', '025', '035', '045', '056', '067'];
    const leaves = ['015', '025', '035', '045', '056', '067'].map(v => keccak256(v))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()
    const leaf = keccak256('035')
    const proof = tree.getHexProof(leaf)
    const badLeaves = ['015', '025', '035', '045', '056', '067'].map(v => keccak256(v))
    const badTree = new MerkleTree(badLeaves, keccak256, { sort: true })
    const bProof = badTree.getHexProof(leaf)
    const accounts = await hre.ethers.getSigners();
    const TreeChannel = await ethers.getContractFactory("TreeChannel");
    const greeter = await TreeChannel.deploy(root);
    await greeter.deployed();
    await greeter.connect(accounts[1]).join({ value: ethers.utils.parseEther("0.02") });  
    console.log("Checksum")
    console.log(root)
    console.log(await greeter.getRoot());
    console.log("Testy:")
    console.log(await greeter._verifyMerkleProof(leaf, proof))
    console.log(await greeter._verifyMerkleProof(leaf, bProof))
    console.log("----------------------------------------------")
    // prvý bit hit =1 , stand = 0           0 / 1 
    // druhý bit hráč = 0 (A) , 1(B)
    moves1 = [10, 10, 11, 11, 10, 11, 0, 1];
    await greeter.verify(moves1, unhashed)
    console.log(await greeter.getrowA());
    console.log(await greeter.getrowB());
    console.log("Winner:")
    console.log(await greeter.returnWinner());
  });
});
