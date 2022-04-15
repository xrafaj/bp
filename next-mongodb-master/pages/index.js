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
  contract: '0x0696240b4695cF677e060359a985605a68B9c656',
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

const Index = ({ notes }) => {

  let addy = "0x0696240b4695cF677e060359a985605a68B9c656"
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

let channelGroup = '21-0x0696240b4695cF677e060359a985605a68B9c656';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0x0696240b4695cF677e060359a985605a68B9c656']
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
    //console.log("sig "+msg.message.signature)
    const signer = EthCrypto.recover(
      msg.message.signature,                          // signature
      msg.message.plainText                           // message hash
    );

    /* const signer = EthCrypto.recover(
      msg.message.signature,                          // signature
      EthCrypto.hash.keccak256(msg.message.plainText) // message hash
    );  */
      
    if(signer == address)
    {
      console.log("Selfmessage - ignoring")
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

/*
const buyDonutHandler = async() => {
  try{
      await vmContract.methods.purchase(buyCount).send({
          from: address,
          value: web3.utils.toWei('0.01', 'ether') * buyCount
      })
  }catch(err){
      setError(err.message)
  }
}
*/

/*

    function hash(
        uint[] calldata _num
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_num));
    }

*/

const updateBoard = async() => {
  //R1C1, 
  setR0(board[0])
  //R1C2, 
  setR1(board[1])
  //R1C3, 
  setR2(board[2])
  //R2C1, 
  setR3(board[3])
  //R2C2,
  setR4(board[4])
  //R2C3, 
  setR5(board[5])
  //R3C1, 
  setR6(board[6])
  //R3C2, 
  setR7(board[7])
  //R3C3, 
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

const makeMoveOnBoard0 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(0)
        board[0] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(0)
        board[0] = 2;
        await moveDonutHandler();
      }
    
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard1 = async() => {
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(1)
      board[1] = 0;
      await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(1)
      board[1] = 2;
      await moveDonutHandler();
    }
      
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard2 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(2)
        board[2] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(2)
        board[2] = 2;
        await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard3 = async() => {
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(3)
      board[3] = 0;
      await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(3)
      board[3] = 2;
      await moveDonutHandler();
    }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard4 = async() => {
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(4)
      board[4] = 0;
      await moveDonutHandler();
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(4)
      board[4] = 2;
      await moveDonutHandler();
    }
    console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard5 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(5)
        board[5] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(5)
        board[5] = 2;
        await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard6 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(6)
        board[6] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(6)
        board[6] = 2;
        await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard7 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(7)
        board[7] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(7)
        board[7] = 2;
        await moveDonutHandler();
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
}

const makeMoveOnBoard8 = async() => {
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(8)
        board[8] = 0;
        await moveDonutHandler();
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(8)
        board[8] = 2;
        await moveDonutHandler();
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

  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes1[9]","name":"_mdata","type":"bytes1[9]"}],"name":"foo","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"hash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061115e806100a66000396000f3fe60806040526004361061009c5760003560e01c8063b688a36311610064578063b688a3631461019c578063c21a702a146101a6578063ded09978146101cf578063e7644d34146101fa578063efef39a114610225578063f337c52c146102415761009c565b806311471135146100a157806340ec6e49146100cc5780634b8934e8146101095780638da5cb5b146101345780639a020d8a1461015f575b600080fd5b3480156100ad57600080fd5b506100b661027e565b6040516100c3919061097b565b60405180910390f35b3480156100d857600080fd5b506100f360048036038101906100ee9190610a10565b61030e565b6040516101009190610a76565b60405180910390f35b34801561011557600080fd5b5061011e610341565b60405161012b9190610ad2565b60405180910390f35b34801561014057600080fd5b5061014961036b565b6040516101569190610ad2565b60405180910390f35b34801561016b57600080fd5b5061018660048036038101906101819190610b19565b610391565b6040516101939190610b5f565b60405180910390f35b6101a46103a9565b005b3480156101b257600080fd5b506101cd60048036038101906101c89190610ba6565b61049a565b005b3480156101db57600080fd5b506101e4610583565b6040516101f19190610ad2565b60405180910390f35b34801561020657600080fd5b5061020f6105ad565b60405161021c9190610b5f565b60405180910390f35b61023f600480360381019061023a9190610ba6565b6105f4565b005b34801561024d57600080fd5b5061026860048036038101906102639190610d3c565b61077a565b604051610275919061097b565b60405180910390f35b610286610881565b6000600980602002604051908101604052809291908260098015610304576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116102ae5790505b5050505050905090565b60008282604051602001610323929190610deb565b60405160208183030381529060405280519060200120905092915050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60026020528060005260406000206000915090505481565b33600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461043a9190610e3e565b925050819055506000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104919190610e72565b92505081905550565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461052a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052190610f25565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105799190610e72565b9250508190555050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816106079190610f45565b341015610649576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064090611011565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156106cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106c2906110a3565b60405180910390fd5b80600260003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461071a9190610e3e565b9250508190555080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546107709190610e72565b9250508190555050565b610782610881565b60005b60098160ff1610156107f657828160ff16600981106107a7576107a66110c3565b5b602002015160008260ff16600981106107c3576107c26110c3565b5b602091828204019190066101000a81548160ff021916908360f81c021790555080806107ee906110ff565b915050610785565b6000600980602002604051908101604052809291908260098015610874576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168152602001906001019060208260000104928301926001038202915080841161081e5790505b5050505050915050919050565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b6108f9816108c4565b82525050565b600061090b83836108f0565b60208301905092915050565b6000602082019050919050565b61092d816108a4565b61093781846108af565b9250610942826108ba565b8060005b8381101561097357815161095a87826108ff565b965061096583610917565b925050600181019050610946565b505050505050565b6000610120820190506109916000830184610924565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126109d0576109cf6109ab565b5b8235905067ffffffffffffffff8111156109ed576109ec6109b0565b5b602083019150836020820283011115610a0957610a086109b5565b5b9250929050565b60008060208385031215610a2757610a266109a1565b5b600083013567ffffffffffffffff811115610a4557610a446109a6565b5b610a51858286016109ba565b92509250509250929050565b6000819050919050565b610a7081610a5d565b82525050565b6000602082019050610a8b6000830184610a67565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610abc82610a91565b9050919050565b610acc81610ab1565b82525050565b6000602082019050610ae76000830184610ac3565b92915050565b610af681610ab1565b8114610b0157600080fd5b50565b600081359050610b1381610aed565b92915050565b600060208284031215610b2f57610b2e6109a1565b5b6000610b3d84828501610b04565b91505092915050565b6000819050919050565b610b5981610b46565b82525050565b6000602082019050610b746000830184610b50565b92915050565b610b8381610b46565b8114610b8e57600080fd5b50565b600081359050610ba081610b7a565b92915050565b600060208284031215610bbc57610bbb6109a1565b5b6000610bca84828501610b91565b91505092915050565b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610c1c82610bd3565b810181811067ffffffffffffffff82111715610c3b57610c3a610be4565b5b80604052505050565b6000610c4e610997565b9050610c5a8282610c13565b919050565b600067ffffffffffffffff821115610c7a57610c79610be4565b5b602082029050919050565b610c8e816108c4565b8114610c9957600080fd5b50565b600081359050610cab81610c85565b92915050565b6000610cc4610cbf84610c5f565b610c44565b90508060208402830185811115610cde57610cdd6109b5565b5b835b81811015610d075780610cf38882610c9c565b845260208401935050602081019050610ce0565b5050509392505050565b600082601f830112610d2657610d256109ab565b5b6009610d33848285610cb1565b91505092915050565b60006101208284031215610d5357610d526109a1565b5b6000610d6184828501610d11565b91505092915050565b600082825260208201905092915050565b600080fd5b82818337600083830152505050565b6000610d9b8385610d6a565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115610dce57610dcd610d7b565b5b602083029250610ddf838584610d80565b82840190509392505050565b60006020820190508181036000830152610e06818486610d8f565b90509392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610e4982610b46565b9150610e5483610b46565b925082821015610e6757610e66610e0f565b5b828203905092915050565b6000610e7d82610b46565b9150610e8883610b46565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610ebd57610ebc610e0f565b5b828201905092915050565b600082825260208201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b6000610f0f601b83610ec8565b9150610f1a82610ed9565b602082019050919050565b60006020820190508181036000830152610f3e81610f02565b9050919050565b6000610f5082610b46565b9150610f5b83610b46565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610f9457610f93610e0f565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b6000610ffb602583610ec8565b915061100682610f9f565b604082019050919050565b6000602082019050818103600083015261102a81610fee565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b600061108d603483610ec8565b915061109882611031565b604082019050919050565b600060208201905081810360008301526110bc81611080565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600060ff82169050919050565b600061110a826110f2565b915060ff820361111d5761111c610e0f565b5b60018201905091905056fea26469706673582212204f4269df6ec4b7fb9f6c7b8b6905efaea260924c47a6212e2559d9c0d22cf49c64736f6c634300080d0033'
  console.log("Deploying the contract");
  let contract2 = new web3.eth.Contract(CONTRACT_ABI);
  await contract2.deploy({
                  data: code, 
                  arguments: ''
              })
              .send({
                  from: address, 
                  gasPrice: '100000', gas: 2310334
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