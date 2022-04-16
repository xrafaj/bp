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
  contract: '0xB8Fa056ec5FDf96615565b4265BC340d902C168C',
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

  let addy = "0xB8Fa056ec5FDf96615565b4265BC340d902C168C"
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

let channelGroup = '21-0xB8Fa056ec5FDf96615565b4265BC340d902C168C';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0xB8Fa056ec5FDf96615565b4265BC340d902C168C']
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
      //let testnet = await vmContract.methods.hash(board).send({
      //    from: address
      //})
      console.log(board)
      let test2 = await vmContract.methods.hash(board).call()
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
  if(address==P1){
    console.log(await vmContract.methods.verify(P1, board, signature1).call())
    console.log(await vmContract.methods.verify(P2, board, signature2).call())
  }else{
    console.log(await vmContract.methods.verify(P2, board, signature1).call())
    console.log(await vmContract.methods.verify(P1, board, signature2).call())
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
        
        let temp = await vmContract.methods.hash(board).call();
        let sign = await web3.eth.sign(
            temp, 
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
                          plainText: temp,
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
      
      let temp = await vmContract.methods.hash(board).call();
      let sign = await web3.eth.sign(
          temp, 
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
                        plainText: temp,
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

  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes1[9]","name":"_mdata","type":"bytes1[9]"}],"name":"foo","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_messageHash","type":"bytes32"}],"name":"getEthSignedMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"hash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"_signer","type":"address"},{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611881806100a66000396000f3fe6080604052600436106100f35760003560e01c8063b688a3631161008a578063e7644d3411610059578063e7644d3414610347578063efef39a114610372578063f337c52c1461038e578063fa540801146103cb576100f3565b8063b688a363146102ac578063c21a702a146102b6578063d613b9dc146102df578063ded099781461031c576100f3565b806393b6db5a116100c657806393b6db5a146101b657806397aba7f9146101f35780639a020d8a14610230578063a7bb58031461026d576100f3565b806311471135146100f857806340ec6e49146101235780634b8934e8146101605780638da5cb5b1461018b575b600080fd5b34801561010457600080fd5b5061010d610408565b60405161011a9190610c9f565b60405180910390f35b34801561012f57600080fd5b5061014a60048036038101906101459190610d34565b610498565b6040516101579190610d9a565b60405180910390f35b34801561016c57600080fd5b506101756104cb565b6040516101829190610df6565b60405180910390f35b34801561019757600080fd5b506101a06104f5565b6040516101ad9190610df6565b60405180910390f35b3480156101c257600080fd5b506101dd60048036038101906101d89190610d34565b61051b565b6040516101ea9190610d9a565b60405180910390f35b3480156101ff57600080fd5b5061021a60048036038101906102159190610f7e565b61054e565b6040516102279190610df6565b60405180910390f35b34801561023c57600080fd5b5061025760048036038101906102529190611006565b6105bd565b604051610264919061104c565b60405180910390f35b34801561027957600080fd5b50610294600480360381019061028f9190611067565b6105d5565b6040516102a3939291906110cc565b60405180910390f35b6102b461063d565b005b3480156102c257600080fd5b506102dd60048036038101906102d8919061112f565b61072e565b005b3480156102eb57600080fd5b506103066004803603810190610301919061115c565b610817565b6040516103139190611207565b60405180910390f35b34801561032857600080fd5b50610331610877565b60405161033e9190610df6565b60405180910390f35b34801561035357600080fd5b5061035c6108a1565b604051610369919061104c565b60405180910390f35b61038c6004803603810190610387919061112f565b6108e8565b005b34801561039a57600080fd5b506103b560048036038101906103b091906112ff565b610a6e565b6040516103c29190610c9f565b60405180910390f35b3480156103d757600080fd5b506103f260048036038101906103ed919061132d565b610b75565b6040516103ff9190610d9a565b60405180910390f35b610410610ba5565b600060098060200260405190810160405280929190826009801561048e576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116104385790505b5050505050905090565b600082826040516020016104ad9291906113cc565b60405160208183030381529060405280519060200120905092915050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082826040516020016105309291906113cc565b60405160208183030381529060405280519060200120905092915050565b60008060008061055d856105d5565b9250925092506001868285856040516000815260200160405260405161058694939291906113f0565b6020604051602081039080840390855afa1580156105a8573d6000803e3d6000fd5b50505060206040510351935050505092915050565b60026020528060005260406000206000915090505481565b6000806000604184511461061e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161061590611492565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b33600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546106ce91906114e1565b925050819055506000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107259190611515565b92505081905550565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146107be576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107b5906115b7565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461080d9190611515565b9250508190555050565b600080610824858561051b565b9050600061083182610b75565b90508673ffffffffffffffffffffffffffffffffffffffff16610854828661054e565b73ffffffffffffffffffffffffffffffffffffffff161492505050949350505050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816108fb91906115d7565b34101561093d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610934906116a3565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156109bf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109b690611735565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610a0e91906114e1565b9250508190555080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610a649190611515565b9250508190555050565b610a76610ba5565b60005b60098160ff161015610aea57828160ff1660098110610a9b57610a9a611755565b5b602002015160008260ff1660098110610ab757610ab6611755565b5b602091828204019190066101000a81548160ff021916908360f81c02179055508080610ae290611784565b915050610a79565b6000600980602002604051908101604052809291908260098015610b68576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681526020019060010190602082600001049283019260010382029150808411610b125790505b5050505050915050919050565b600081604051602001610b889190611825565b604051602081830303815290604052805190602001209050919050565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b610c1d81610be8565b82525050565b6000610c2f8383610c14565b60208301905092915050565b6000602082019050919050565b610c5181610bc8565b610c5b8184610bd3565b9250610c6682610bde565b8060005b83811015610c97578151610c7e8782610c23565b9650610c8983610c3b565b925050600181019050610c6a565b505050505050565b600061012082019050610cb56000830184610c48565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610cf457610cf3610ccf565b5b8235905067ffffffffffffffff811115610d1157610d10610cd4565b5b602083019150836020820283011115610d2d57610d2c610cd9565b5b9250929050565b60008060208385031215610d4b57610d4a610cc5565b5b600083013567ffffffffffffffff811115610d6957610d68610cca565b5b610d7585828601610cde565b92509250509250929050565b6000819050919050565b610d9481610d81565b82525050565b6000602082019050610daf6000830184610d8b565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610de082610db5565b9050919050565b610df081610dd5565b82525050565b6000602082019050610e0b6000830184610de7565b92915050565b610e1a81610d81565b8114610e2557600080fd5b50565b600081359050610e3781610e11565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610e8b82610e42565b810181811067ffffffffffffffff82111715610eaa57610ea9610e53565b5b80604052505050565b6000610ebd610cbb565b9050610ec98282610e82565b919050565b600067ffffffffffffffff821115610ee957610ee8610e53565b5b610ef282610e42565b9050602081019050919050565b82818337600083830152505050565b6000610f21610f1c84610ece565b610eb3565b905082815260208101848484011115610f3d57610f3c610e3d565b5b610f48848285610eff565b509392505050565b600082601f830112610f6557610f64610ccf565b5b8135610f75848260208601610f0e565b91505092915050565b60008060408385031215610f9557610f94610cc5565b5b6000610fa385828601610e28565b925050602083013567ffffffffffffffff811115610fc457610fc3610cca565b5b610fd085828601610f50565b9150509250929050565b610fe381610dd5565b8114610fee57600080fd5b50565b60008135905061100081610fda565b92915050565b60006020828403121561101c5761101b610cc5565b5b600061102a84828501610ff1565b91505092915050565b6000819050919050565b61104681611033565b82525050565b6000602082019050611061600083018461103d565b92915050565b60006020828403121561107d5761107c610cc5565b5b600082013567ffffffffffffffff81111561109b5761109a610cca565b5b6110a784828501610f50565b91505092915050565b600060ff82169050919050565b6110c6816110b0565b82525050565b60006060820190506110e16000830186610d8b565b6110ee6020830185610d8b565b6110fb60408301846110bd565b949350505050565b61110c81611033565b811461111757600080fd5b50565b60008135905061112981611103565b92915050565b60006020828403121561114557611144610cc5565b5b60006111538482850161111a565b91505092915050565b6000806000806060858703121561117657611175610cc5565b5b600061118487828801610ff1565b945050602085013567ffffffffffffffff8111156111a5576111a4610cca565b5b6111b187828801610cde565b9350935050604085013567ffffffffffffffff8111156111d4576111d3610cca565b5b6111e087828801610f50565b91505092959194509250565b60008115159050919050565b611201816111ec565b82525050565b600060208201905061121c60008301846111f8565b92915050565b600067ffffffffffffffff82111561123d5761123c610e53565b5b602082029050919050565b61125181610be8565b811461125c57600080fd5b50565b60008135905061126e81611248565b92915050565b600061128761128284611222565b610eb3565b905080602084028301858111156112a1576112a0610cd9565b5b835b818110156112ca57806112b6888261125f565b8452602084019350506020810190506112a3565b5050509392505050565b600082601f8301126112e9576112e8610ccf565b5b60096112f6848285611274565b91505092915050565b6000610120828403121561131657611315610cc5565b5b6000611324848285016112d4565b91505092915050565b60006020828403121561134357611342610cc5565b5b600061135184828501610e28565b91505092915050565b600082825260208201905092915050565b600080fd5b600061137c838561135a565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8311156113af576113ae61136b565b5b6020830292506113c0838584610eff565b82840190509392505050565b600060208201905081810360008301526113e7818486611370565b90509392505050565b60006080820190506114056000830187610d8b565b61141260208301866110bd565b61141f6040830185610d8b565b61142c6060830184610d8b565b95945050505050565b600082825260208201905092915050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b600061147c601883611435565b915061148782611446565b602082019050919050565b600060208201905081810360008301526114ab8161146f565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006114ec82611033565b91506114f783611033565b92508282101561150a576115096114b2565b5b828203905092915050565b600061152082611033565b915061152b83611033565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156115605761155f6114b2565b5b828201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b60006115a1601b83611435565b91506115ac8261156b565b602082019050919050565b600060208201905081810360008301526115d081611594565b9050919050565b60006115e282611033565b91506115ed83611033565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611626576116256114b2565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b600061168d602583611435565b915061169882611631565b604082019050919050565b600060208201905081810360008301526116bc81611680565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b600061171f603483611435565b915061172a826116c3565b604082019050919050565b6000602082019050818103600083015261174e81611712565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600061178f826110b0565b915060ff82036117a2576117a16114b2565b5b600182019050919050565b600081905092915050565b7f19457468657265756d205369676e6564204d6573736167653a0a333200000000600082015250565b60006117ee601c836117ad565b91506117f9826117b8565b601c82019050919050565b6000819050919050565b61181f61181a82610d81565b611804565b82525050565b6000611830826117e1565b915061183c828461180e565b6020820191508190509291505056fea26469706673582212206f0aaa5deddf5a0d49e6339159d5f3f4d2815cc26dd5586c2b8217c66fece17c64736f6c634300080d0033'
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