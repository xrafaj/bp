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
import EthCrypto from 'eth-crypto';

var pubnub = new PubNub({
  publishKey: 'pub-c-428292e3-f3b4-4af9-aeb4-80cb8467c0ac',
  subscribeKey: 'sub-c-5f9a3170-b0de-11ec-a00a-ee285607d0e8',
  uuid: 'myFirstUser'
});

var stateChannel = {
  //account: null,
  contract: '0xC612cb71D938960F79f3e773EcABdc352FB6b566',
  //opponent: null,
  gameOver: false,
  seq: 9,
  num: 0,
  whoseTurn: null,
  //pendingMove: null,
  signature: null,
  timeout: null,
  //latePlayer: null,
  //timeLeft: null,
};

const Index = ({ notes }) => {

  let addy = "0xC612cb71D938960F79f3e773EcABdc352FB6b566"
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

let channelGroup = '21-0xC612cb71D938960F79f3e773EcABdc352FB6b566';

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-0xC612cb71D938960F79f3e773EcABdc352FB6b566']
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
  message: function (msg) { 
  
    const signer = EthCrypto.recover(
      msg.message.signature, // signature
      EthCrypto.hash.keccak256(msg.message.plainText) // message hash
    );
    console.log(signer);  
    // First the message must be binary
    stateChannel = msg.message.move
    console.log(JSON.stringify(stateChannel,null,4))
    
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

function recoverSigner(message, signature) {
  console.log("xd")
  var split = ethereumjs.Util.fromRpcSig(signature);
  console.log("xd")
  var publicKey = ethereumjs.Util.ecrecover(message, split.v, split.r, split.s);
  console.log("xd")
  var signer = "0x" + ethereumjs.Util.pubToAddress(publicKey).toString("hex");
  console.log("xd")
  console.log(signer)
  return signer;
}

const moveDonutHandler = async() => {
  try{
      console.log(stateChannel.whoseTurn)
      if (stateChannel.whoseTurn != address && stateChannel.whoseTurn != null){
        console.log("error")
        return ErrorEvent
      }
      let sign = await web3.eth.sign(
          web3.utils.sha3('Hello world'), 
          address,     
          function (err, sign) {
              if (err) return error(err);
              if (stateChannel.whoseTurn == null || stateChannel.whoseTurn == P1){
                stateChannel.whoseTurn = P2;
              } else{
                stateChannel.whoseTurn = P1;
              }
              //console.log("C " + stateChannel.account)
              stateChannel.seq = stateChannel.seq + 1;
              //console.log(JSON.stringify(stateChannel,null,4))
              pubnub.publish(
                  {
                      channel: '21-' + addy,
                      //message: stateChannel,
                      message: {
                        plainText: "Hello world",
                        move: stateChannel,
                        signature: sign,
                      },
                      },
                  function(status, response) {
                      }
                  )
              }
          )
  }catch(err){
      setError(err.message)
  }
}


const deployContract = async() => {
  /*  Old
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]');
  let code = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610848806100a56000396000f3fe60806040526004361061004a5760003560e01c80638da5cb5b1461004f5780639a020d8a1461007a578063c21a702a146100b7578063e7644d34146100e0578063efef39a11461010b575b600080fd5b34801561005b57600080fd5b50610064610127565b6040516100719190610458565b60405180910390f35b34801561008657600080fd5b506100a1600480360381019061009c91906104a4565b61014b565b6040516100ae91906104ea565b60405180910390f35b3480156100c357600080fd5b506100de60048036038101906100d99190610531565b610163565b005b3480156100ec57600080fd5b506100f561024a565b60405161010291906104ea565b60405180910390f35b61012560048036038101906101209190610531565b610291565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101e8906105bb565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610240919061060a565b9250508190555050565b6000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816102a49190610660565b3410156102e6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102dd9061072c565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610368576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161035f906107be565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103b791906107de565b9250508190555080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461040d919061060a565b9250508190555050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061044282610417565b9050919050565b61045281610437565b82525050565b600060208201905061046d6000830184610449565b92915050565b600080fd5b61048181610437565b811461048c57600080fd5b50565b60008135905061049e81610478565b92915050565b6000602082840312156104ba576104b9610473565b5b60006104c88482850161048f565b91505092915050565b6000819050919050565b6104e4816104d1565b82525050565b60006020820190506104ff60008301846104db565b92915050565b61050e816104d1565b811461051957600080fd5b50565b60008135905061052b81610505565b92915050565b60006020828403121561054757610546610473565b5b60006105558482850161051c565b91505092915050565b600082825260208201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b60006105a5601b8361055e565b91506105b08261056f565b602082019050919050565b600060208201905081810360008301526105d481610598565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610615826104d1565b9150610620836104d1565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610655576106546105db565b5b828201905092915050565b600061066b826104d1565b9150610676836104d1565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156106af576106ae6105db565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b600061071660258361055e565b9150610721826106ba565b604082019050919050565b6000602082019050818103600083015261074581610709565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b60006107a860348361055e565b91506107b38261074c565b604082019050919050565b600060208201905081810360008301526107d78161079b565b9050919050565b60006107e9826104d1565b91506107f4836104d1565b925082821015610807576108066105db565b5b82820390509291505056fea26469706673582212202d4926b7b12768f6ff8bb886a22dfe502c07a79f03c9dda697940b64d74cc17964736f6c634300080d0033';
  */
  const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]')
  let code = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610a1d806100a56000396000f3fe60806040526004361061007b5760003560e01c8063c21a702a1161004e578063c21a702a1461011d578063ded0997814610146578063e7644d3414610171578063efef39a11461019c5761007b565b80634b8934e8146100805780638da5cb5b146100ab5780639a020d8a146100d6578063b688a36314610113575b600080fd5b34801561008c57600080fd5b506100956101b8565b6040516100a2919061062d565b60405180910390f35b3480156100b757600080fd5b506100c06101e1565b6040516100cd919061062d565b60405180910390f35b3480156100e257600080fd5b506100fd60048036038101906100f89190610679565b610205565b60405161010a91906106bf565b60405180910390f35b61011b61021d565b005b34801561012957600080fd5b50610144600480360381019061013f9190610706565b61030e565b005b34801561015257600080fd5b5061015b6103f5565b604051610168919061062d565b60405180910390f35b34801561017d57600080fd5b5061018661041f565b60405161019391906106bf565b60405180910390f35b6101b660048036038101906101b19190610706565b610466565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546102ae9190610762565b925050819055506000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103059190610796565b92505081905550565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461039c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161039390610849565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103eb9190610796565b9250508190555050565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816104799190610869565b3410156104bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104b290610935565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561053d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610534906109c7565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461058c9190610762565b9250508190555080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105e29190610796565b9250508190555050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610617826105ec565b9050919050565b6106278161060c565b82525050565b6000602082019050610642600083018461061e565b92915050565b600080fd5b6106568161060c565b811461066157600080fd5b50565b6000813590506106738161064d565b92915050565b60006020828403121561068f5761068e610648565b5b600061069d84828501610664565b91505092915050565b6000819050919050565b6106b9816106a6565b82525050565b60006020820190506106d460008301846106b0565b92915050565b6106e3816106a6565b81146106ee57600080fd5b50565b600081359050610700816106da565b92915050565b60006020828403121561071c5761071b610648565b5b600061072a848285016106f1565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061076d826106a6565b9150610778836106a6565b92508282101561078b5761078a610733565b5b828203905092915050565b60006107a1826106a6565b91506107ac836106a6565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156107e1576107e0610733565b5b828201905092915050565b600082825260208201905092915050565b7f4f6e6c7920746865206f776e65722063616e20726573746f636b2e0000000000600082015250565b6000610833601b836107ec565b915061083e826107fd565b602082019050919050565b6000602082019050818103600083015261086281610826565b9050919050565b6000610874826106a6565b915061087f836106a6565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156108b8576108b7610733565b5b828202905092915050565b7f596f75206d75737420706179206174206c65617374203220455448207065722060008201527f646f6e7574000000000000000000000000000000000000000000000000000000602082015250565b600061091f6025836107ec565b915061092a826108c3565b604082019050919050565b6000602082019050818103600083015261094e81610912565b9050919050565b7f4e6f7420656e6f75676820646f6e75747320696e2073746f636b20746f20636f60008201527f6d706c6574652074686973207075726368617365000000000000000000000000602082015250565b60006109b16034836107ec565b91506109bc82610955565b604082019050919050565b600060208201905081810360008301526109e0816109a4565b905091905056fea264697066735822122038a79ca9acefa10e1eb47b8883d03f088217ae010f830ab61c3c0b202b91304964736f6c634300080d0033'
  console.log("Deploying the contract");
  let contract2 = new web3.eth.Contract(CONTRACT_ABI);
  await contract2.deploy({
                  data: code, 
                  arguments: ''
              })
              .send({
                  from: address, 
                  gasPrice: '1000', gas: 2310334
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

/*
if (typeof window !== "undefined") {
  (function() {
      var pubnub = new PubNub({
          publishKey: 'pub-c-428292e3-f3b4-4af9-aeb4-80cb8467c0ac',
          subscribeKey: 'sub-c-5f9a3170-b0de-11ec-a00a-ee285607d0e8',
          uuid: 'myFirstUser'
      });
      function $(id) {
          return document.getElementById(id);
      }
      var box = $('box'),
          input = $('input'),
          channel = '21-0xC612cb71D938960F79f3e773EcABdc352FB6b566';
      pubnub.addListener({
          message: function(obj) {
              //console.log(msg.message.seq);
              //stateChannel = msg.message;
              box.innerHTML = ('' + obj.message).replace(/[<>]/g, '') + '<br>' + box.innerHTML;
          }
      });
      pubnub.subscribe({
          channels: [channel]
      });
  })()
}
*/
export default Index;