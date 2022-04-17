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
  //account: null,
  contract: '0x652a328AC7DaF1C265245C6F9d8F7d31Ea4C2379',
  //opponent: null,
  gameOver: false,
  seq: -1,
  moves: [],
  whoseTurn: null,
  //pendingMove: null,
  signature: null,
  timeout: null,
  //latePlayer: null,
  //timeLeft: null,
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

  let addy = "0x652a328AC7DaF1C265245C6F9d8F7d31Ea4C2379"
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

let channelGroup = '21-0x652a328AC7DaF1C265245C6F9d8F7d31Ea4C2379';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0x652a328AC7DaF1C265245C6F9d8F7d31Ea4C2379']
  });

  if (vmContract) getInventoryHandler()
  if (vmContract && address) getMyDonutCountHandler()
  if (vmContract) getP1Handler()
  if (vmContract) getP2Handler()
  if (vmContract && address) updateStateChannel()
  return leaveApplication
}, [vmContract, address])

// vmContract.address

const updateStateChannel = async () => {
  //stateChannel.contract = vmContract.address;
} 

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
  const count = await vmContract.methods.donutBalances(address).call()
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
    board[0]==0 && board[1]==0 && board[2]==0
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
    var r = signature1.slice(0, 66)
    var s = '0x' + signature1.slice(66, 130)
    var v = '0x' + signature1.slice(130, 132)

    
    // working succesfully
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
    //console.log(await vmContract.methods.verify(EthCrypto.hash.keccak256(test2),v,r,s).call())

    // not working
    //console.log(await vmContract.methods.recoverSigner(await vmContract.methods.getMessageHash(board).call(), signature1).call())
    //console.log(await vmContract.methods.verifyExtra(EthCrypto.hash.keccak256(test2),v,r,s).call())
    
  }else{
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
    //console.log(await vmContract.methods.verify(P2, board, signature1).call())
    //console.log(await vmContract.methods.verify(P1, board, signature2).call())
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
  /*  Old
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
  let code = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610848806100a56000396000f3fe60806040526004361061004a5760003560e01c80638da5cb5b1461004f5780639a020d8a1461007a578063c21a702a146100b7578063e7644d34146100e0578063efef39a11461010b575b600080fd5b34801561005b57600080fd5b50610064610127565b6040516100719190610458565b60405180910390f35b34801561008657600080fd5b506100a1600480360381019061009c91906104a4565b61014b565b6040516100ae91906104ea565b60405180910390f35b3480156100c357600080fd5b506100de60048036038101906100d99190610531565b610163565b005b3480156100ec57600080fd5b506100f561024a565b60405161010291906104ea565b60405180910390f35b61012560048036038101906101209190610531565b610291565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101e8906105bb565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610240919061060a565b9250508190555050565b6000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816102a49190610660565b3410156102e6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102dd9061072c565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610368576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161035f906107be565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103b791906107de565b9250508190555080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461040d919061060a565b9250508190555050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061044282610417565b9050919050565b61045281610437565b82525050565b600060208201905061046d6000830184610449565b92915050565b600080fd5b61048181610437565b811461048c57600080fd5b50565b60008135905061049e81610478565b92915050565b6000602082840312156104ba576104b9610473565b5b60006104c88482850161048f565b91505092915050565b6000819050919050565b6104e4816104d1565b82525050565b60006020820190506104ff60008301846104db565b92915050565b61050e816104d1565b811461051957600080fd5b50565b60008135905061052b81610505565b92915050565b60006020828403121561054757610546610473565b5b60006105558482850161051c565b91505092915050565b600082825260208201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b60006105a5601b8361055e565b91506105b08261056f565b602082019050919050565b600060208201905081810360008301526105d481610598565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610615826104d1565b9150610620836104d1565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610655576106546105db565b5b828201905092915050565b600061066b826104d1565b9150610676836104d1565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156106af576106ae6105db565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b600061071660258361055e565b9150610721826106ba565b604082019050919050565b6000602082019050818103600083015261074581610709565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b60006107a860348361055e565b91506107b38261074c565b604082019050919050565b600060208201905081810360008301526107d78161079b565b9050919050565b60006107e9826104d1565b91506107f4836104d1565b925082821015610807576108066105db565b5b82820390509291505056fea26469706673582212202d4926b7b12768f6ff8bb886a22dfe502c07a79f03c9dda697940b64d74cc17964736f6c634300080d0033';
  */
  /* Old and great 
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610a1d806100a56000396000f3fe60806040526004361061007b5760003560e01c8063c21a702a1161004e578063c21a702a1461011d578063ded0997814610146578063e7644d3414610171578063efef39a11461019c5761007b565b80634b8934e8146100805780638da5cb5b146100ab5780639a020d8a146100d6578063b688a36314610113575b600080fd5b34801561008c57600080fd5b506100956101b8565b6040516100a2919061062d565b60405180910390f35b3480156100b757600080fd5b506100c06101e1565b6040516100cd919061062d565b60405180910390f35b3480156100e257600080fd5b506100fd60048036038101906100f89190610679565b610205565b60405161010a91906106bf565b60405180910390f35b61011b61021d565b005b34801561012957600080fd5b50610144600480360381019061013f9190610706565b61030e565b005b34801561015257600080fd5b5061015b6103f5565b604051610168919061062d565b60405180910390f35b34801561017d57600080fd5b5061018661041f565b60405161019391906106bf565b60405180910390f35b6101b660048036038101906101b19190610706565b610466565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546102ae9190610762565b925050819055506000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103059190610796565b92505081905550565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461039c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161039390610849565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103eb9190610796565b9250508190555050565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816104799190610869565b3410156104bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104b290610935565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561053d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610534906109c7565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461058c9190610762565b9250508190555080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105e29190610796565b9250508190555050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610617826105ec565b9050919050565b6106278161060c565b82525050565b6000602082019050610642600083018461061e565b92915050565b600080fd5b6106568161060c565b811461066157600080fd5b50565b6000813590506106738161064d565b92915050565b60006020828403121561068f5761068e610648565b5b600061069d84828501610664565b91505092915050565b6000819050919050565b6106b9816106a6565b82525050565b60006020820190506106d460008301846106b0565b92915050565b6106e3816106a6565b81146106ee57600080fd5b50565b600081359050610700816106da565b92915050565b60006020828403121561071c5761071b610648565b5b600061072a848285016106f1565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061076d826106a6565b9150610778836106a6565b92508282101561078b5761078a610733565b5b828203905092915050565b60006107a1826106a6565b91506107ac836106a6565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156107e1576107e0610733565b5b828201905092915050565b600082825260208201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b6000610833601b836107ec565b915061083e826107fd565b602082019050919050565b6000602082019050818103600083015261086281610826565b9050919050565b6000610874826106a6565b915061087f836106a6565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156108b8576108b7610733565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b600061091f6025836107ec565b915061092a826108c3565b604082019050919050565b6000602082019050818103600083015261094e81610912565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b60006109b16034836107ec565b91506109bc82610955565b604082019050919050565b600060208201905081810360008301526109e0816109a4565b905091905056fea264697066735822122038a79ca9acefa10e1eb47b8883d03f088217ae010f830ab61c3c0b202b91304964736f6c634300080d0033'
  */

  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes1[9]","name":"_mdata","type":"bytes1[9]"}],"name":"foo","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_messageHash","type":"bytes32"}],"name":"getEthSignedMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"hash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"message","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"verify","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"message","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"verifyExtra","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611aca806100a66000396000f3fe6080604052600436106100fe5760003560e01c8063a7bb580311610095578063e7644d3411610064578063e7644d3414610352578063efef39a11461037d578063f1835db714610399578063f337c52c146103d6578063fa54080114610413576100fe565b8063a7bb5803146102b5578063b688a363146102f4578063c21a702a146102fe578063ded0997814610327576100fe565b80638f5b2ddc116100d15780638f5b2ddc146101c157806393b6db5a146101fe57806397aba7f91461023b5780639a020d8a14610278576100fe565b8063114711351461010357806340ec6e491461012e5780634b8934e81461016b5780638da5cb5b14610196575b600080fd5b34801561010f57600080fd5b50610118610450565b6040516101259190610dec565b60405180910390f35b34801561013a57600080fd5b5061015560048036038101906101509190610e81565b6104e0565b6040516101629190610ee7565b60405180910390f35b34801561017757600080fd5b5061018061054f565b60405161018d9190610f43565b60405180910390f35b3480156101a257600080fd5b506101ab610579565b6040516101b89190610f43565b60405180910390f35b3480156101cd57600080fd5b506101e860048036038101906101e39190610fc3565b61059f565b6040516101f59190610f43565b60405180910390f35b34801561020a57600080fd5b5061022560048036038101906102209190610e81565b610668565b6040516102329190610ee7565b60405180910390f35b34801561024757600080fd5b50610262600480360381019061025d919061116b565b61069b565b60405161026f9190610f43565b60405180910390f35b34801561028457600080fd5b5061029f600480360381019061029a91906111f3565b61070a565b6040516102ac9190611239565b60405180910390f35b3480156102c157600080fd5b506102dc60048036038101906102d79190611254565b610722565b6040516102eb939291906112ac565b60405180910390f35b6102fc61078a565b005b34801561030a57600080fd5b506103256004803603810190610320919061130f565b61087b565b005b34801561033357600080fd5b5061033c610964565b6040516103499190610f43565b60405180910390f35b34801561035e57600080fd5b5061036761098e565b6040516103749190611239565b60405180910390f35b6103976004803603810190610392919061130f565b6109d5565b005b3480156103a557600080fd5b506103c060048036038101906103bb9190610fc3565b610b5b565b6040516103cd9190610f43565b60405180910390f35b3480156103e257600080fd5b506103fd60048036038101906103f89190611419565b610bbb565b60405161040a9190610dec565b60405180910390f35b34801561041f57600080fd5b5061043a60048036038101906104359190611447565b610cc2565b6040516104479190610ee7565b60405180910390f35b610458610cf2565b60006009806020026040519081016040528092919082600980156104d6576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116104805790505b5050505050905090565b6000806040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a33320000000081525090508084846040516020016105309392919061155a565b6040516020818303038152906040528051906020012091505092915050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000806040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a3332000000008152509050600081876040516020016105ef9291906115a1565b60405160208183030381529060405280519060200120905060006001828888886040516000815260200160405260405161062c94939291906115c9565b6020604051602081039080840390855afa15801561064e573d6000803e3d6000fd5b505050602060405103519050809350505050949350505050565b6000828260405160200161067d92919061167b565b60405160208183030381529060405280519060200120905092915050565b6000806000806106aa85610722565b925092509250600186828585604051600081526020016040526040516106d394939291906115c9565b6020604051602081039080840390855afa1580156106f5573d6000803e3d6000fd5b50505060206040510351935050505092915050565b60026020528060005260406000206000915090505481565b6000806000604184511461076b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610762906116fc565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b33600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461081b919061174b565b925050819055506000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610872919061177f565b92505081905550565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461090b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161090290611821565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461095a919061177f565b9250508190555050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816109e89190611841565b341015610a2a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a219061190d565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610aac576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aa39061199f565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610afb919061174b565b9250508190555080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b51919061177f565b9250508190555050565b60008060018686868660405160008152602001604052604051610b8194939291906115c9565b6020604051602081039080840390855afa158015610ba3573d6000803e3d6000fd5b50505060206040510351905080915050949350505050565b610bc3610cf2565b60005b60098160ff161015610c3757828160ff1660098110610be857610be76119bf565b5b602002015160008260ff1660098110610c0457610c036119bf565b5b602091828204019190066101000a81548160ff021916908360f81c02179055508080610c2f906119ee565b915050610bc6565b6000600980602002604051908101604052809291908260098015610cb5576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681526020019060010190602082600001049283019260010382029150808411610c5f5790505b5050505050915050919050565b600081604051602001610cd59190611a6e565b604051602081830303815290604052805190602001209050919050565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b610d6a81610d35565b82525050565b6000610d7c8383610d61565b60208301905092915050565b6000602082019050919050565b610d9e81610d15565b610da88184610d20565b9250610db382610d2b565b8060005b83811015610de4578151610dcb8782610d70565b9650610dd683610d88565b925050600181019050610db7565b505050505050565b600061012082019050610e026000830184610d95565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610e4157610e40610e1c565b5b8235905067ffffffffffffffff811115610e5e57610e5d610e21565b5b602083019150836020820283011115610e7a57610e79610e26565b5b9250929050565b60008060208385031215610e9857610e97610e12565b5b600083013567ffffffffffffffff811115610eb657610eb5610e17565b5b610ec285828601610e2b565b92509250509250929050565b6000819050919050565b610ee181610ece565b82525050565b6000602082019050610efc6000830184610ed8565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610f2d82610f02565b9050919050565b610f3d81610f22565b82525050565b6000602082019050610f586000830184610f34565b92915050565b610f6781610ece565b8114610f7257600080fd5b50565b600081359050610f8481610f5e565b92915050565b600060ff82169050919050565b610fa081610f8a565b8114610fab57600080fd5b50565b600081359050610fbd81610f97565b92915050565b60008060008060808587031215610fdd57610fdc610e12565b5b6000610feb87828801610f75565b9450506020610ffc87828801610fae565b935050604061100d87828801610f75565b925050606061101e87828801610f75565b91505092959194509250565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6110788261102f565b810181811067ffffffffffffffff8211171561109757611096611040565b5b80604052505050565b60006110aa610e08565b90506110b6828261106f565b919050565b600067ffffffffffffffff8211156110d6576110d5611040565b5b6110df8261102f565b9050602081019050919050565b82818337600083830152505050565b600061110e611109846110bb565b6110a0565b90508281526020810184848401111561112a5761112961102a565b5b6111358482856110ec565b509392505050565b600082601f83011261115257611151610e1c565b5b81356111628482602086016110fb565b91505092915050565b6000806040838503121561118257611181610e12565b5b600061119085828601610f75565b925050602083013567ffffffffffffffff8111156111b1576111b0610e17565b5b6111bd8582860161113d565b9150509250929050565b6111d081610f22565b81146111db57600080fd5b50565b6000813590506111ed816111c7565b92915050565b60006020828403121561120957611208610e12565b5b6000611217848285016111de565b91505092915050565b6000819050919050565b61123381611220565b82525050565b600060208201905061124e600083018461122a565b92915050565b60006020828403121561126a57611269610e12565b5b600082013567ffffffffffffffff81111561128857611287610e17565b5b6112948482850161113d565b91505092915050565b6112a681610f8a565b82525050565b60006060820190506112c16000830186610ed8565b6112ce6020830185610ed8565b6112db604083018461129d565b949350505050565b6112ec81611220565b81146112f757600080fd5b50565b600081359050611309816112e3565b92915050565b60006020828403121561132557611324610e12565b5b6000611333848285016112fa565b91505092915050565b600067ffffffffffffffff82111561135757611356611040565b5b602082029050919050565b61136b81610d35565b811461137657600080fd5b50565b60008135905061138881611362565b92915050565b60006113a161139c8461133c565b6110a0565b905080602084028301858111156113bb576113ba610e26565b5b835b818110156113e457806113d08882611379565b8452602084019350506020810190506113bd565b5050509392505050565b600082601f83011261140357611402610e1c565b5b600961141084828561138e565b91505092915050565b600061012082840312156114305761142f610e12565b5b600061143e848285016113ee565b91505092915050565b60006020828403121561145d5761145c610e12565b5b600061146b84828501610f75565b91505092915050565b600081519050919050565b600081905092915050565b60005b838110156114a857808201518184015260208101905061148d565b838111156114b7576000848401525b50505050565b60006114c882611474565b6114d2818561147f565b93506114e281856020860161148a565b80840191505092915050565b600081905092915050565b600080fd5b600061150a83856114ee565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561153d5761153c6114f9565b5b60208302925061154e8385846110ec565b82840190509392505050565b600061156682866114bd565b91506115738284866114fe565b9150819050949350505050565b6000819050919050565b61159b61159682610ece565b611580565b82525050565b60006115ad82856114bd565b91506115b9828461158a565b6020820191508190509392505050565b60006080820190506115de6000830187610ed8565b6115eb602083018661129d565b6115f86040830185610ed8565b6116056060830184610ed8565b95945050505050565b600082825260208201905092915050565b600061162b838561160e565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561165e5761165d6114f9565b5b60208302925061166f8385846110ec565b82840190509392505050565b6000602082019050818103600083015261169681848661161f565b90509392505050565b600082825260208201905092915050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b60006116e660188361169f565b91506116f1826116b0565b602082019050919050565b60006020820190508181036000830152611715816116d9565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061175682611220565b915061176183611220565b9250828210156117745761177361171c565b5b828203905092915050565b600061178a82611220565b915061179583611220565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156117ca576117c961171c565b5b828201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b600061180b601b8361169f565b9150611816826117d5565b602082019050919050565b6000602082019050818103600083015261183a816117fe565b9050919050565b600061184c82611220565b915061185783611220565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156118905761188f61171c565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b60006118f760258361169f565b91506119028261189b565b604082019050919050565b60006020820190508181036000830152611926816118ea565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b600061198960348361169f565b91506119948261192d565b604082019050919050565b600060208201905081810360008301526119b88161197c565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60006119f982610f8a565b915060ff8203611a0c57611a0b61171c565b5b600182019050919050565b600081905092915050565b7f19457468657265756d205369676e6564204d6573736167653a0a333200000000600082015250565b6000611a58601c83611a17565b9150611a6382611a22565b601c82019050919050565b6000611a7982611a4b565b9150611a85828461158a565b6020820191508190509291505056fea264697066735822122019730ead6197d676951bb92680906300f7afeb066a74b25e4305676122957f5664736f6c634300080d0033'
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
          //web3 = new Web3(window.ethereum)
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