import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { Button, Card } from 'semantic-ui-react';

import Head from 'next/head'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import 'bulma/css/bulma.css'
// import vendingMachineContract from '../blockchain/vending'
// import abi from '../blockchain/vending'
import styles from '../styles/index.module.css'
import PubNub from '../node_modules/pubnub'
import dynamic from 'next/dynamic'
import vendingMachineContract from '../blockchain/vending'

import { ethers } from "ethers";
import arrayify from 'arrayify';
import EthCrypto, { sign } from 'eth-crypto';

var pubnub = new PubNub({
  publishKey: 'pub-c-428292e3-f3b4-4af9-aeb4-80cb8467c0ac',
  subscribeKey: 'sub-c-5f9a3170-b0de-11ec-a00a-ee285607d0e8',
  uuid: 'myFirstUser'
});

var stateChannel = {
  contract: '0x882B7cd1be726Ce09aA8Dd39481fd99710363AA4',
  gameOver: false,
  seq: -1,
  moves: [],
  whoseTurn: null,
  signature: null,
  timeout: null,
};

var FinishedGame = false;

var board = new Array(9);
board[0] = 1;
board[1] = 1;
board[2] = 1;
board[3] = 1;
board[4] = 1;
board[5] = 1;
board[6] = 1;
board[7] = 1;
board[8] = 1;

let signature1 = null;
let signature2 = null;

const Index = ({ notes }) => {

  let addy = "0x882B7cd1be726Ce09aA8Dd39481fd99710363AA4"
  const [error, setError] = useState('')
  const [inventory, setInventory] = useState('') 
  const [P1, setP1] = useState('')
  const [P2, setP2] = useState('')  
  const [myDonutCount, setMyDonutCount] = useState('') 
  const [buyCount, setBuyCount] = useState('')
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [vmContract, setVmContract] = useState(null)
  const [wallet, setWallet] = useState('Connect wallet')
  const [stateShared, setStateChannel] = useState('Nothing yet.')
  const [R1C1, setR0] = useState('1')
  const [R1C2, setR1] = useState('1')
  const [R1C3, setR2] = useState('1')
  const [R2C1, setR3] = useState('1')
  const [R2C2, setR4] = useState('1')
  const [R2C3, setR5] = useState('1')
  const [R3C1, setR6] = useState('1')
  const [R3C2, setR7] = useState('1')
  const [R3C3, setR8] = useState('1')

let channelGroup = '21-0x882B7cd1be726Ce09aA8Dd39481fd99710363AA4';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0x882B7cd1be726Ce09aA8Dd39481fd99710363AA4']
  });

  if (vmContract) getInventoryHandler()
  if (vmContract && address) getMyDonutCountHandler()
  if (vmContract) getP1Handler()
  if (vmContract) getP2Handler()
  return leaveApplication
}, [vmContract, address])

const pubnubListener = {
  message: async function (msg) { 
    if (FinishedGame){
      console.log("Recovering from")
      console.log(msg.message.signature)
      console.log(msg.message.plainText)
      console.log("----------------------------")
      const signer = EthCrypto.recover(
        msg.message.signature,                          // signature
        msg.message.plainText                           // message hash
      );

      if(signer == address)
      {
        console.log("Selfsignature")
        signature1 = msg.message.signature;
        return
      }
      else if(signer == await vmContract.methods.getP1().call() || signer == await vmContract.methods.getP2().call()){
        console.log("Signer "+signer)
        signature2 = msg.message.signature;
        console.log("Good.")
      }
      return;
    }

    const signer = EthCrypto.recover(
      msg.message.signature,                          // signature
      msg.message.plainText                           // message hash
    );
      
    if(signer == address)
    {
      console.log("Selfmessage - ignoring")
      finishMove()
      return
    }
    else if(signer == await vmContract.methods.getP1().call() || signer == await vmContract.methods.getP2().call()){
      if (signer == await vmContract.methods.getP1().call()){
        board[msg.message.move.moves[msg.message.move.seq]]=0
      }
      if (signer == await vmContract.methods.getP2().call()){
        board[msg.message.move.moves[msg.message.move.seq]]=2
      }
      updateBoard()
      console.log("board:")
      console.log(board)
      console.log("received correctly signed state channel")
      console.log(signer);  
      stateChannel = msg.message.move
      console.log(JSON.stringify(stateChannel,null,4))
    }
    else{
      console.log(signer)
      console.log("P1 " + await vmContract.methods.getP1().call())
      console.log("P2 " + await vmContract.methods.getP2().call())
      console.log("error-wrong sender")
    }
    finishMove()
  },
}

const leaveApplication = () => {
  pubnub.removeListener(pubnubListener);
  pubnub.unsubscribeAll()
}

const getInventoryHandler = async () => {
  const inventory = await vmContract.methods.getVendingMachineBalance().call()
  setInventory(inventory) 
} 

const getP1Handler = async () => {
  const P1 = await vmContract.methods.getP1().call()
  setP1(P1) 
} 

const getP2Handler = async () => {
  const P2 = await vmContract.methods.getP2().call()
  setP2(P2) 
} 

const getMyDonutCountHandler = async () => {
  const count = await vmContract.methods.coinBalance(address).call()
  setMyDonutCount(count)
}

const updateDonateQty = event => {
  setBuyCount(event.target.value)
}

const updateBoard = async() => {
  setR0(board[0])
  setR1(board[1])
  setR2(board[2])
  setR3(board[3])
  setR4(board[4])
  setR5(board[5])
  setR6(board[6])
  setR7(board[7])
  setR8(board[8])
}

const hashHandler = async() => {
  try{
      console.log(board)
      let test2 = await vmContract.methods.getMessageHash(board).call()
      console.log("Contract returned this:")
      console.log(test2)

  }catch(err){
      setError(err.message)
  }
}

const finishMove = async() => {
  if (
    (board[0]==0 && board[1]==0 && board[2]==0 ) ||
    (board[3]==0 && board[4]==0 && board[5]==0 ) ||
    (board[6]==0 && board[7]==0 && board[8]==0 ) ||
    (board[0]==0 && board[4]==0 && board[8]==0 ) ||
    (board[6]==0 && board[4]==0 && board[2]==0 ) ||
    (board[0]==0 && board[3]==0 && board[6]==0 ) ||
    (board[1]==0 && board[4]==0 && board[7]==0 ) ||
    (board[2]==0 && board[5]==0 && board[8]==0 ) 
  ){
    FinishedGame = true;
    console.log("Finished.")
  }
  else if (
    (board[0]==2 && board[1]==2 && board[2]==2 ) ||
    (board[3]==2 && board[4]==2 && board[5]==2 ) ||
    (board[6]==2 && board[7]==2 && board[8]==2 ) ||
    (board[0]==2 && board[4]==2 && board[8]==2 ) ||
    (board[6]==2 && board[4]==2 && board[2]==2 ) ||
    (board[0]==2 && board[3]==2 && board[6]==2 ) ||
    (board[1]==2 && board[4]==2 && board[7]==2 ) ||
    (board[2]==2 && board[5]==2 && board[8]==2 ) 
  ){
    FinishedGame = true;
    console.log("Finished.")
  }
}

const claimWinner = async() => {
  console.log("P1 "+P1)
  console.log("P2 "+P2)
  console.log("Board " + board)
  console.log("Signature 1 " + signature1)
  console.log("Signature 2 " + signature2)
  let test2 = await vmContract.methods.getMessageHash(board).call()
  console.log("Hash of board " + test2)
  if(address==P1){
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
    console.log(await vmContract.methods.verify(EthCrypto.hash.keccak256(test2), signature1, signature2).send({
          from: address,
      })
    )
    console.log(await vmContract.methods.returnWinner().call())
  }else{
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
  }
}

const sendBoard = async() => {
  if(FinishedGame){
      try{
        console.log(stateChannel.whoseTurn)
        if (stateChannel.whoseTurn != address && stateChannel.whoseTurn != null){
          console.log("error")
          return ErrorEvent
        }
        
        let temp = await vmContract.methods.getMessageHash(board).call();
        console.log("Temp-> " + temp)
        console.log("Signer-> " + address)
        let sign = await web3.eth.sign(
            EthCrypto.hash.keccak256(temp), 
            address,     
            function (err, sign) {
                stateChannel.signature = sign
                if (err) return error(err);
                if (stateChannel.whoseTurn == null || stateChannel.whoseTurn == P1){
                  stateChannel.whoseTurn = P2;
                } else{
                  stateChannel.whoseTurn = P1;
                }
                stateChannel.seq = stateChannel.seq + 1;
                pubnub.publish(
                    {
                        channel: '21-' + addy,
                        message: {
                          plainText: EthCrypto.hash.keccak256(temp),
                          move: stateChannel,
                          signature: sign,
                        },
                        },
                    function(status, response) {
                        }
                    )
                }
            )
        console.log("Signature-> " + sign)
        updateBoard()
        return sign
    }catch(err){
        setError(err.message)
    }
  } 
}

const makeMoveOnBoard0 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(0)
        board[0] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(0)
        board[0] = 2;
        signature1 = await moveDonutHandler();
      }
    
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard1 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(1)
      board[1] = 0;
      signature1 = await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(1)
      board[1] = 2;
      signature1 = await moveDonutHandler();
    }
      
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard2 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(2)
        board[2] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(2)
        board[2] = 2;
        signature1 = await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard3 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(3)
      board[3] = 0;
      signature1 = await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(3)
      board[3] = 2;
      signature1 = await moveDonutHandler();
    }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard4 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(4)
      board[4] = 0;
      signature1 = await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(4)
      board[4] = 2;
      signature1 = await moveDonutHandler();
    }
    console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard5 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(5)
        board[5] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(5)
        board[5] = 2;
        signature1 = await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard6 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(6)
        board[6] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(6)
        board[6] = 2;
        signature1 = await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard7 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(7)
        board[7] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(7)
        board[7] = 2;
        signature1 = await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard8 = async() => {
  if (FinishedGame){
    console.log("Cannot do this.")
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(8)
        board[8] = 0;
        signature1 = await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(8)
        board[8] = 2;
        signature1 = await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const buyDonutHandler = async() => {
  try{
      let testnet = await vmContract.methods.foo(board).send({
          from: address
      })

      let test2 = await vmContract.methods.getResultBalance().call()
      console.log("Contract returned this:")
      console.log(test2)

  }catch(err){
      setError(err.message)
  }
}

const joinDonutHandler = async() => {
  try{
      await vmContract.methods.join().send({
          from: address,
          value: web3.utils.toWei('0.01', 'ether') * buyCount
      })
  }catch(err){
      setError(err.message)
  }
}

const moveDonutHandler = async() => {
  try{
      console.log(stateChannel.whoseTurn)
      if (stateChannel.whoseTurn != address && stateChannel.whoseTurn != null){
        console.log("error")
        return ErrorEvent
      }
      
      let temp = await vmContract.methods.getMessageHash(board).call();
      let sign = await web3.eth.sign(
          EthCrypto.hash.keccak256(temp), 
          address,     
          function (err, sign) {
              stateChannel.signature = sign
              if (err) return error(err);
              if (stateChannel.whoseTurn == null || stateChannel.whoseTurn == P1){
                stateChannel.whoseTurn = P2;
              } else{
                stateChannel.whoseTurn = P1;
              }
              stateChannel.seq = stateChannel.seq + 1;
              pubnub.publish(
                  {
                      channel: '21-' + addy,
                      message: {
                        plainText: EthCrypto.hash.keccak256(temp), 
                        move: stateChannel,
                        signature: sign,
                      },
                      },
                  function(status, response) {
                      }
                  )
              }
          )
      updateBoard()
      return sign
  }catch(err){
      setError(err.message)
  }
  
}


const deployContract = async() => {
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"result","outputs":[{"internalType":"bytes1","name":"","type":"bytes1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506114db806100a66000396000f3fe6080604052600436106100e85760003560e01c8063a7bb58031161008a578063dfbf53ae11610059578063dfbf53ae14610301578063e7644d341461032c578063efef39a114610357578063fabde80c14610373576100e8565b8063a7bb580314610262578063b688a363146102a1578063d2501b9c146102ab578063ded09978146102d6576100e8565b80635bf48e3a116100c65780635bf48e3a146101805780638da5cb5b146101bd57806393b6db5a146101e857806397aba7f914610225576100e8565b806311471135146100ed5780633c594059146101185780634b8934e814610155575b600080fd5b3480156100f957600080fd5b506101026103b0565b60405161010f9190610b02565b60405180910390f35b34801561012457600080fd5b5061013f600480360381019061013a9190610b68565b610440565b60405161014c9190610ba4565b60405180910390f35b34801561016157600080fd5b5061016a61046a565b6040516101779190610c00565b60405180910390f35b34801561018c57600080fd5b506101a760048036038101906101a29190610d97565b610494565b6040516101b49190610e3d565b60405180910390f35b3480156101c957600080fd5b506101d2610636565b6040516101df9190610c00565b60405180910390f35b3480156101f457600080fd5b5061020f600480360381019061020a9190610eb8565b61065c565b60405161021c9190610f14565b60405180910390f35b34801561023157600080fd5b5061024c60048036038101906102479190610f2f565b61068f565b6040516102599190610c00565b60405180910390f35b34801561026e57600080fd5b5061028960048036038101906102849190610f8b565b6106fe565b60405161029893929190610ff0565b60405180910390f35b6102a9610766565b005b3480156102b757600080fd5b506102c06107a9565b6040516102cd9190610c00565b60405180910390f35b3480156102e257600080fd5b506102eb6107d3565b6040516102f89190610c00565b60405180910390f35b34801561030d57600080fd5b506103166107fd565b6040516103239190610c00565b60405180910390f35b34801561033857600080fd5b50610341610823565b60405161034e9190611036565b60405180910390f35b610371600480360381019061036c9190610b68565b61086a565b005b34801561037f57600080fd5b5061039a6004803603810190610395919061107d565b6109f0565b6040516103a79190611036565b60405180910390f35b6103b8610a08565b6000600980602002604051908101604052809291908260098015610436576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116103e05790505b5050505050905090565b6000816009811061045057600080fd5b60209182820401919006915054906101000a900460f81b81565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166104d9858561068f565b73ffffffffffffffffffffffffffffffffffffffff161461052f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052690611107565b60405180910390fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610572858461068f565b73ffffffffffffffffffffffffffffffffffffffff16146105c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105bf90611107565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600190509392505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008282604051602001610671929190611199565b60405160208183030381529060405280519060200120905092915050565b60008060008061069e856106fe565b925092509250600186828585604051600081526020016040526040516106c794939291906111bd565b6020604051602081039080840390855afa1580156106e9573d6000803e3d6000fd5b50505060206040510351935050505092915050565b60008060006041845114610747576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161073e9061124e565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b33600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc100008161087d919061129d565b3410156108bf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108b690611369565b60405180910390fd5b80600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610941576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610938906113fb565b60405180910390fd5b80600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610990919061141b565b9250508190555080600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546109e6919061144f565b9250508190555050565b60036020528060005260406000206000915090505481565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b610a8081610a4b565b82525050565b6000610a928383610a77565b60208301905092915050565b6000602082019050919050565b610ab481610a2b565b610abe8184610a36565b9250610ac982610a41565b8060005b83811015610afa578151610ae18782610a86565b9650610aec83610a9e565b925050600181019050610acd565b505050505050565b600061012082019050610b186000830184610aab565b92915050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b610b4581610b32565b8114610b5057600080fd5b50565b600081359050610b6281610b3c565b92915050565b600060208284031215610b7e57610b7d610b28565b5b6000610b8c84828501610b53565b91505092915050565b610b9e81610a4b565b82525050565b6000602082019050610bb96000830184610b95565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610bea82610bbf565b9050919050565b610bfa81610bdf565b82525050565b6000602082019050610c156000830184610bf1565b92915050565b6000819050919050565b610c2e81610c1b565b8114610c3957600080fd5b50565b600081359050610c4b81610c25565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610ca482610c5b565b810181811067ffffffffffffffff82111715610cc357610cc2610c6c565b5b80604052505050565b6000610cd6610b1e565b9050610ce28282610c9b565b919050565b600067ffffffffffffffff821115610d0257610d01610c6c565b5b610d0b82610c5b565b9050602081019050919050565b82818337600083830152505050565b6000610d3a610d3584610ce7565b610ccc565b905082815260208101848484011115610d5657610d55610c56565b5b610d61848285610d18565b509392505050565b600082601f830112610d7e57610d7d610c51565b5b8135610d8e848260208601610d27565b91505092915050565b600080600060608486031215610db057610daf610b28565b5b6000610dbe86828701610c3c565b935050602084013567ffffffffffffffff811115610ddf57610dde610b2d565b5b610deb86828701610d69565b925050604084013567ffffffffffffffff811115610e0c57610e0b610b2d565b5b610e1886828701610d69565b9150509250925092565b60008115159050919050565b610e3781610e22565b82525050565b6000602082019050610e526000830184610e2e565b92915050565b600080fd5b600080fd5b60008083601f840112610e7857610e77610c51565b5b8235905067ffffffffffffffff811115610e9557610e94610e58565b5b602083019150836020820283011115610eb157610eb0610e5d565b5b9250929050565b60008060208385031215610ecf57610ece610b28565b5b600083013567ffffffffffffffff811115610eed57610eec610b2d565b5b610ef985828601610e62565b92509250509250929050565b610f0e81610c1b565b82525050565b6000602082019050610f296000830184610f05565b92915050565b60008060408385031215610f4657610f45610b28565b5b6000610f5485828601610c3c565b925050602083013567ffffffffffffffff811115610f7557610f74610b2d565b5b610f8185828601610d69565b9150509250929050565b600060208284031215610fa157610fa0610b28565b5b600082013567ffffffffffffffff811115610fbf57610fbe610b2d565b5b610fcb84828501610d69565b91505092915050565b600060ff82169050919050565b610fea81610fd4565b82525050565b60006060820190506110056000830186610f05565b6110126020830185610f05565b61101f6040830184610fe1565b949350505050565b61103081610b32565b82525050565b600060208201905061104b6000830184611027565b92915050565b61105a81610bdf565b811461106557600080fd5b50565b60008135905061107781611051565b92915050565b60006020828403121561109357611092610b28565b5b60006110a184828501611068565b91505092915050565b600082825260208201905092915050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b60006110f1601a836110aa565b91506110fc826110bb565b602082019050919050565b60006020820190508181036000830152611120816110e4565b9050919050565b600082825260208201905092915050565b600080fd5b60006111498385611127565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561117c5761117b611138565b5b60208302925061118d838584610d18565b82840190509392505050565b600060208201905081810360008301526111b481848661113d565b90509392505050565b60006080820190506111d26000830187610f05565b6111df6020830186610fe1565b6111ec6040830185610f05565b6111f96060830184610f05565b95945050505050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b60006112386018836110aa565b915061124382611202565b602082019050919050565b600060208201905081810360008301526112678161122b565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006112a882610b32565b91506112b383610b32565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156112ec576112eb61126e565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f636f696e00000000000000000000000000000000000000000000000000000000602082015250565b60006113536024836110aa565b915061135e826112f7565b604082019050919050565b6000602082019050818103600083015261138281611346565b9050919050565b7f4e6f7420656e6f75676820636f696e7320696e2073746f636b20746f20636f6d60008201527f706c657465207468697320707572636861736500000000000000000000000000602082015250565b60006113e56033836110aa565b91506113f082611389565b604082019050919050565b60006020820190508181036000830152611414816113d8565b9050919050565b600061142682610b32565b915061143183610b32565b9250828210156114445761144361126e565b5b828203905092915050565b600061145a82610b32565b915061146583610b32565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561149a5761149961126e565b5b82820190509291505056fea2646970667358221220434621046863a3a65e8c10b5514ccc0658d1ac5e625e72c6a026aab19a4339c364736f6c634300080d0033';
  console.log("Deploying the contract");
  let contract2 = new web3.eth.Contract(CONTRACT_ABI);
  await contract2.deploy({
                  data: code, 
                  arguments: ''
              })
              .send({
                  from: address, 
                  gasPrice: web3.eth.gasPrice,
                  gasLimit: web3.eth.getBlock("latest").gasLimit,
              });
}

const connectWalletHandler = async () => {
  if(typeof window !== "undefined" && typeof window.ethereum !=="undefined"){
      try{
          await window.ethereum.request({method: "eth_requestAccounts"});
          const web3 = new Web3(Web3.givenProvider);
          setWeb3(web3)
          const accounts = await web3.eth.getAccounts()
          setAddress(accounts[0])
          setWallet(accounts[0])
          const vm = vendingMachineContract(web3)
          setVmContract(vm)     
      }catch(err){
          console.log(err.message)
          setError(err.message)
      }
  }else{
      console.log("install metamask, ty")
  }
}





return (
    
    <div className="notes-container" style={{background: '#16191e'}}>

                <div className="container">

                    <div className="navbar-end">
                        <button onClick={connectWalletHandler} className='button' style={{background: '#e8b00b'}}>{wallet}</button>
                    </div>
                    <label>
                      {stateShared}
                    </label>
                </div>
    

      <h1 className='container' style={{color: '#e8b00b'}}>Games</h1>
      <div className="grid wrapper" style={{background: '#16191e'}}>
        {notes.map(note => {
          return (
            <div key={note._id} style={{background: '#16191e'}}>
              <Card style={{background: '#24242e'}}>
                <Card.Content>
                  <Card.Header>
                    <Link href={`/${note._id}`}>
                      <a>{note.title}</a>
                    </Link>
                  </Card.Header>
                </Card.Content>
                <Card.Content extra>
                  <Link href={`/${note._id}`}>
                    <Button>Delete</Button>
                  </Link>
                  <Link href={`/${note._id}/edit`}>
                    <Button>Edit</Button>
                  </Link>
                  
                </Card.Content>
              </Card>
            </div>
          )
        })}
      </div>
      
      

      <div className={styles.main} style={{background: '#16191e'}}>
            <Head>
                <title>BP Rafaj</title>
                <meta name="description" content="A blockchain vending machine app" />
            </Head>
            <br></br>
            <section>
            <div className='container'>
              <Link href="/new">
                <button className="">Create game  by clicking here</button>
              </Link>
            </div>
            </section>
            <section>
                <br></br>
                <div className='container'>
                    <h2 style={{color: "#9393a7"}}>Total inventory (supply): {inventory}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <h2 style={{color: "#9393a7"}}>State channel seq number: {stateChannel.seq}</h2>
                    <h2 style={{color: "#9393a7"}}>My addy: {address}</h2>
                    <h2 style={{color: "#9393a7"}}>My coins: {myDonutCount}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <h2 style={{color: "#9393a7"}}>Player 1 addy (owner): {P1}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <h2 style={{color: "#9393a7"}}>Player 2 addy (joined): {P2}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <label className='label' style={{color: "#9393a7"}}>Buy coins (1 coin = 0.01 ETH)</label>
                        <div className='control'>
                            <input onChange={updateDonateQty} className='input' type="type" placeholder="Enter amount.."></input>
                        </div>
                        <button onClick={buyDonutHandler} className='' style={{background: '#e8b00b'}}>Buy coins</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={hashHandler} className='' style={{background: '#e8b00b'}}>Hash</button>
                    </div>
                    <br></br>
                </div>
            </section>

            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={deployContract} className='' style={{background: '#e8b00b'}}>Deploy contract</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={joinDonutHandler} className='' style={{background: '#e8b00b'}}>Join contract</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={moveDonutHandler} className='' style={{background: '#e8b00b'}}>Send signed message</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={makeMoveOnBoard0} className='' style={{background: '#e8b00b'}}>{R1C1}</button>
                        <button onClick={makeMoveOnBoard1} className='' style={{background: '#e8b00b'}}>{R1C2}</button>
                        <button onClick={makeMoveOnBoard2} className='' style={{background: '#e8b00b'}}>{R1C3}</button>
                    </div>
                    <div className='field'>
                        <button onClick={makeMoveOnBoard3} className='' style={{background: '#e8b00b'}}>{R2C1}</button>
                        <button onClick={makeMoveOnBoard4} className='' style={{background: '#e8b00b'}}>{R2C2}</button>
                        <button onClick={makeMoveOnBoard5} className='' style={{background: '#e8b00b'}}>{R2C3}</button>
                    </div>
                    <div className='field'>
                        <button onClick={makeMoveOnBoard6} className='' style={{background: '#e8b00b'}}>{R3C1}</button>
                        <button onClick={makeMoveOnBoard7} className='' style={{background: '#e8b00b'}}>{R3C2}</button>
                        <button onClick={makeMoveOnBoard8} className='' style={{background: '#e8b00b'}}>{R3C3}</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={sendBoard} className='' style={{background: '#e8b00b'}}>Send signature of board.</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={claimWinner} className='' style={{background: '#e8b00b'}}>Claim being a winner.</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container has-text-danger' style={{color: "#9393a7"}}>
                Chat Output
                    <div id='box'></div>
                    <p>{error}</p>
                </div>
            </section>
        </div>
    </div>

    
  )
}

Index.getInitialProps = async () => {
  const res = await fetch('http://localhost:3000/api/notes');
  const { data } = await res.json();

  return { notes: data }
}

export default Index;