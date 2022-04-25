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
  contract: '0xB702023D2da1A8B111c6D982b71F2FeBf512721b',
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

  let addy = "0xB702023D2da1A8B111c6D982b71F2FeBf512721b"
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

let channelGroup = '21-0xB702023D2da1A8B111c6D982b71F2FeBf512721b';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0xB702023D2da1A8B111c6D982b71F2FeBf512721b']
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
    console.log(await vmContract.methods.verify(board,EthCrypto.hash.keccak256(test2), signature1, signature2).send({
          from: address,
      })
    )
    console.log(await vmContract.methods.returnWinner().call())
  }else{
    if (P1 != address){
      console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
      console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
      console.log(await vmContract.methods.verify(board,EthCrypto.hash.keccak256(test2), signature2, signature1).send({
        from: address,
    })
    )
    console.log(await vmContract.methods.returnWinner().call())
    }
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
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"result","outputs":[{"internalType":"bytes1","name":"","type":"bytes1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611cc5806100a66000396000f3fe6080604052600436106100e85760003560e01c8063b688a3631161008a578063e7644d3411610059578063e7644d34146102ef578063efef39a11461031a578063fabde80c14610336578063ff893e0d14610373576100e8565b8063b688a36314610264578063d2501b9c1461026e578063ded0997814610299578063dfbf53ae146102c4576100e8565b80638da5cb5b116100c65780638da5cb5b1461018057806393b6db5a146101ab57806397aba7f9146101e8578063a7bb580314610225576100e8565b806311471135146100ed5780633c594059146101185780634b8934e814610155575b600080fd5b3480156100f957600080fd5b506101026103b0565b60405161010f9190611288565b60405180910390f35b34801561012457600080fd5b5061013f600480360381019061013a91906112ee565b610440565b60405161014c919061132a565b60405180910390f35b34801561016157600080fd5b5061016a61046a565b6040516101779190611386565b60405180910390f35b34801561018c57600080fd5b50610195610494565b6040516101a29190611386565b60405180910390f35b3480156101b757600080fd5b506101d260048036038101906101cd9190611406565b6104ba565b6040516101df919061146c565b60405180910390f35b3480156101f457600080fd5b5061020f600480360381019061020a91906115f4565b6104ed565b60405161021c9190611386565b60405180910390f35b34801561023157600080fd5b5061024c60048036038101906102479190611650565b61055c565b60405161025b939291906116b5565b60405180910390f35b61026c6105c4565b005b34801561027a57600080fd5b50610283610607565b6040516102909190611386565b60405180910390f35b3480156102a557600080fd5b506102ae610631565b6040516102bb9190611386565b60405180910390f35b3480156102d057600080fd5b506102d961065b565b6040516102e69190611386565b60405180910390f35b3480156102fb57600080fd5b50610304610681565b60405161031191906116fb565b60405180910390f35b610334600480360381019061032f91906112ee565b6106c8565b005b34801561034257600080fd5b5061035d60048036038101906103589190611742565b61084e565b60405161036a91906116fb565b60405180910390f35b34801561037f57600080fd5b5061039a6004803603810190610395919061176f565b610866565b6040516103a7919061184a565b60405180910390f35b6103b861118e565b6000600980602002604051908101604052809291908260098015610436576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116103e05790505b5050505050905090565b6000816009811061045057600080fd5b60209182820401919006915054906101000a900460f81b81565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082826040516020016104cf9291906118d7565b60405160208183030381529060405280519060200120905092915050565b6000806000806104fc8561055c565b9250925092506001868285856040516000815260200160405260405161052594939291906118fb565b6020604051602081039080840390855afa158015610547573d6000803e3d6000fd5b50505060206040510351935050505092915050565b600080600060418451146105a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161059c9061199d565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b33600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816106db91906119ec565b34101561071d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161071490611ab8565b60405180910390fd5b80600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561079f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161079690611b4a565b60405180910390fd5b80600360003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107ee9190611b6a565b9250508190555080600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546108449190611b9e565b9250508190555050565b60036020528060005260406000206000915090505481565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108ab85856104ed565b73ffffffffffffffffffffffffffffffffffffffff1614610901576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108f890611c40565b60405180910390fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1661094485846104ed565b73ffffffffffffffffffffffffffffffffffffffff161461099a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161099190611c40565b60405180910390fd5b6000868660008181106109b0576109af611c60565b5b905060200201351480156109de57506000868660018181106109d5576109d4611c60565b5b90506020020135145b8015610a0457506000868660028181106109fb576109fa611c60565b5b90506020020135145b80610a755750600086866003818110610a2057610a1f611c60565b5b90506020020135148015610a4e5750600086866004818110610a4557610a44611c60565b5b90506020020135145b8015610a745750600086866005818110610a6b57610a6a611c60565b5b90506020020135145b5b80610ae65750600086866006818110610a9157610a90611c60565b5b90506020020135148015610abf5750600086866007818110610ab657610ab5611c60565b5b90506020020135145b8015610ae55750600086866008818110610adc57610adb611c60565b5b90506020020135145b5b80610b575750600086866000818110610b0257610b01611c60565b5b90506020020135148015610b305750600086866004818110610b2757610b26611c60565b5b90506020020135145b8015610b565750600086866008818110610b4d57610b4c611c60565b5b90506020020135145b5b80610bc85750600086866006818110610b7357610b72611c60565b5b90506020020135148015610ba15750600086866004818110610b9857610b97611c60565b5b90506020020135145b8015610bc75750600086866002818110610bbe57610bbd611c60565b5b90506020020135145b5b80610c395750600086866000818110610be457610be3611c60565b5b90506020020135148015610c125750600086866003818110610c0957610c08611c60565b5b90506020020135145b8015610c385750600086866006818110610c2f57610c2e611c60565b5b90506020020135145b5b80610caa5750600086866001818110610c5557610c54611c60565b5b90506020020135148015610c835750600086866004818110610c7a57610c79611c60565b5b90506020020135145b8015610ca95750600086866007818110610ca057610c9f611c60565b5b90506020020135145b5b80610d1b5750600086866002818110610cc657610cc5611c60565b5b90506020020135148015610cf45750600086866005818110610ceb57610cea611c60565b5b90506020020135145b8015610d1a5750600086866008818110610d1157610d10611c60565b5b90506020020135145b5b15610d8857600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550611180565b600286866000818110610d9e57610d9d611c60565b5b90506020020135148015610dcc5750600286866001818110610dc357610dc2611c60565b5b90506020020135145b8015610df25750600286866002818110610de957610de8611c60565b5b90506020020135145b80610e635750600286866003818110610e0e57610e0d611c60565b5b90506020020135148015610e3c5750600286866004818110610e3357610e32611c60565b5b90506020020135145b8015610e625750600286866005818110610e5957610e58611c60565b5b90506020020135145b5b80610ed45750600286866006818110610e7f57610e7e611c60565b5b90506020020135148015610ead5750600286866007818110610ea457610ea3611c60565b5b90506020020135145b8015610ed35750600286866008818110610eca57610ec9611c60565b5b90506020020135145b5b80610f455750600286866000818110610ef057610eef611c60565b5b90506020020135148015610f1e5750600286866004818110610f1557610f14611c60565b5b90506020020135145b8015610f445750600286866008818110610f3b57610f3a611c60565b5b90506020020135145b5b80610fb65750600286866006818110610f6157610f60611c60565b5b90506020020135148015610f8f5750600286866004818110610f8657610f85611c60565b5b90506020020135145b8015610fb55750600286866002818110610fac57610fab611c60565b5b90506020020135145b5b806110275750600286866000818110610fd257610fd1611c60565b5b905060200201351480156110005750600286866003818110610ff757610ff6611c60565b5b90506020020135145b8015611026575060028686600681811061101d5761101c611c60565b5b90506020020135145b5b80611098575060028686600181811061104357611042611c60565b5b90506020020135148015611071575060028686600481811061106857611067611c60565b5b90506020020135145b8015611097575060028686600781811061108e5761108d611c60565b5b90506020020135145b5b8061110957506002868660028181106110b4576110b3611c60565b5b905060200201351480156110e257506002868660058181106110d9576110d8611c60565b5b90506020020135145b801561110857506002868660088181106110ff576110fe611c60565b5b90506020020135145b5b1561117657600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061117f565b60009050611185565b5b600190505b95945050505050565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b611206816111d1565b82525050565b600061121883836111fd565b60208301905092915050565b6000602082019050919050565b61123a816111b1565b61124481846111bc565b925061124f826111c7565b8060005b83811015611280578151611267878261120c565b965061127283611224565b925050600181019050611253565b505050505050565b60006101208201905061129e6000830184611231565b92915050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6112cb816112b8565b81146112d657600080fd5b50565b6000813590506112e8816112c2565b92915050565b600060208284031215611304576113036112ae565b5b6000611312848285016112d9565b91505092915050565b611324816111d1565b82525050565b600060208201905061133f600083018461131b565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061137082611345565b9050919050565b61138081611365565b82525050565b600060208201905061139b6000830184611377565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126113c6576113c56113a1565b5b8235905067ffffffffffffffff8111156113e3576113e26113a6565b5b6020830191508360208202830111156113ff576113fe6113ab565b5b9250929050565b6000806020838503121561141d5761141c6112ae565b5b600083013567ffffffffffffffff81111561143b5761143a6112b3565b5b611447858286016113b0565b92509250509250929050565b6000819050919050565b61146681611453565b82525050565b6000602082019050611481600083018461145d565b92915050565b61149081611453565b811461149b57600080fd5b50565b6000813590506114ad81611487565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611501826114b8565b810181811067ffffffffffffffff821117156115205761151f6114c9565b5b80604052505050565b60006115336112a4565b905061153f82826114f8565b919050565b600067ffffffffffffffff82111561155f5761155e6114c9565b5b611568826114b8565b9050602081019050919050565b82818337600083830152505050565b600061159761159284611544565b611529565b9050828152602081018484840111156115b3576115b26114b3565b5b6115be848285611575565b509392505050565b600082601f8301126115db576115da6113a1565b5b81356115eb848260208601611584565b91505092915050565b6000806040838503121561160b5761160a6112ae565b5b60006116198582860161149e565b925050602083013567ffffffffffffffff81111561163a576116396112b3565b5b611646858286016115c6565b9150509250929050565b600060208284031215611666576116656112ae565b5b600082013567ffffffffffffffff811115611684576116836112b3565b5b611690848285016115c6565b91505092915050565b600060ff82169050919050565b6116af81611699565b82525050565b60006060820190506116ca600083018661145d565b6116d7602083018561145d565b6116e460408301846116a6565b949350505050565b6116f5816112b8565b82525050565b600060208201905061171060008301846116ec565b92915050565b61171f81611365565b811461172a57600080fd5b50565b60008135905061173c81611716565b92915050565b600060208284031215611758576117576112ae565b5b60006117668482850161172d565b91505092915050565b60008060008060006080868803121561178b5761178a6112ae565b5b600086013567ffffffffffffffff8111156117a9576117a86112b3565b5b6117b5888289016113b0565b955095505060206117c88882890161149e565b935050604086013567ffffffffffffffff8111156117e9576117e86112b3565b5b6117f5888289016115c6565b925050606086013567ffffffffffffffff811115611816576118156112b3565b5b611822888289016115c6565b9150509295509295909350565b60008115159050919050565b6118448161182f565b82525050565b600060208201905061185f600083018461183b565b92915050565b600082825260208201905092915050565b600080fd5b60006118878385611865565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8311156118ba576118b9611876565b5b6020830292506118cb838584611575565b82840190509392505050565b600060208201905081810360008301526118f281848661187b565b90509392505050565b6000608082019050611910600083018761145d565b61191d60208301866116a6565b61192a604083018561145d565b611937606083018461145d565b95945050505050565b600082825260208201905092915050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b6000611987601883611940565b915061199282611951565b602082019050919050565b600060208201905081810360008301526119b68161197a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006119f7826112b8565b9150611a02836112b8565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611a3b57611a3a6119bd565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f636f696e00000000000000000000000000000000000000000000000000000000602082015250565b6000611aa2602483611940565b9150611aad82611a46565b604082019050919050565b60006020820190508181036000830152611ad181611a95565b9050919050565b7f4e6f7420656e6f75676820636f696e7320696e2073746f636b20746f20636f6d60008201527f706c657465207468697320707572636861736500000000000000000000000000602082015250565b6000611b34603383611940565b9150611b3f82611ad8565b604082019050919050565b60006020820190508181036000830152611b6381611b27565b9050919050565b6000611b75826112b8565b9150611b80836112b8565b925082821015611b9357611b926119bd565b5b828203905092915050565b6000611ba9826112b8565b9150611bb4836112b8565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611be957611be86119bd565b5b828201905092915050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b6000611c2a601a83611940565b9150611c3582611bf4565b602082019050919050565b60006020820190508181036000830152611c5981611c1d565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea2646970667358221220c1f2c938fa47ce0c18a48837ec2849e57ca16d2023746ba97ced410ee277137464736f6c634300080d0033';
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