import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { Button, Card } from 'semantic-ui-react';
import Head from 'next/head'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import 'bulma/css/bulma.css'
import styles from '../styles/index.module.css'
import PubNub from '../node_modules/pubnub'
import EthCrypto, { sign } from 'eth-crypto'; 

let CONTRACT_ADDRESS = '';
const ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"bytes32","name":"leaf","type":"bytes32"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"_verifyMerkleProof","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"bet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"timeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"root","type":"bytes32"},{"internalType":"bytes32","name":"leaf","type":"bytes32"},{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"_verifyMerkleProof","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"bet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"timeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
const code = '0x' + '608060405266470de4df82000034101561001857600080fd5b34600581905550336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061258e8061006e6000396000f3fe6080604052600436106100fe5760003560e01c8063a7bb580311610095578063dfbf53ae11610064578063dfbf53ae146102f6578063ee51c20f14610321578063f56f48f21461035e578063f78f1d4414610389578063ff893e0d146103c6576100fe565b8063a7bb580314610257578063b688a36314610296578063d2501b9c146102a0578063ded09978146102cb576100fe565b806370dea79a116100d157806370dea79a146101875780638da5cb5b146101b257806393b6db5a146101dd57806397aba7f91461021a576100fe565b80630e1da6c31461010357806311610c251461011a5780633744734d146101455780634b8934e81461015c575b600080fd5b34801561010f57600080fd5b50610118610403565b005b34801561012657600080fd5b5061012f6105a7565b60405161013c9190611a90565b60405180910390f35b34801561015157600080fd5b5061015a6105ad565b005b34801561016857600080fd5b506101716106a3565b60405161017e9190611aec565b60405180910390f35b34801561019357600080fd5b5061019c6106cc565b6040516101a99190611a90565b60405180910390f35b3480156101be57600080fd5b506101c76106d2565b6040516101d49190611aec565b60405180910390f35b3480156101e957600080fd5b5061020460048036038101906101ff9190611b80565b6106f6565b6040516102119190611be6565b60405180910390f35b34801561022657600080fd5b50610241600480360381019061023c9190611d6e565b610729565b60405161024e9190611aec565b60405180910390f35b34801561026357600080fd5b5061027e60048036038101906102799190611dca565b610798565b60405161028d93929190611e2f565b60405180910390f35b61029e610800565b005b3480156102ac57600080fd5b506102b56108ac565b6040516102c29190611aec565b60405180910390f35b3480156102d757600080fd5b506102e06108d6565b6040516102ed9190611aec565b60405180910390f35b34801561030257600080fd5b5061030b610900565b6040516103189190611aec565b60405180910390f35b34801561032d57600080fd5b5061034860048036038101906103439190611f29565b610926565b6040516103559190611fb3565b60405180910390f35b34801561036a57600080fd5b506103736109dc565b6040516103809190611a90565b60405180910390f35b34801561039557600080fd5b506103b060048036038101906103ab9190611fce565b6109e1565b6040516103bd9190611fb3565b60405180910390f35b3480156103d257600080fd5b506103ed60048036038101906103e8919061206d565b610f02565b6040516103fa9190611fb3565b60405180910390f35b42600654111561041257600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff160361046d57600080fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161051d9061215e565b60006040518083038185875af1925050503d806000811461055a576040519150601f19603f3d011682016040523d82523d6000602084013e61055f565b606091505b50509050806105a3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161059a906121d0565b60405180910390fd5b5050565b60055481565b3373ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461060757600080fd5b426006541161061557600080fd5b6000600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600681905550565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60065481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000828260405160200161070b929190612262565b60405160208183030381529060405280519060200120905092915050565b60008060008061073885610798565b925092509250600186828585604051600081526020016040526040516107619493929190612286565b6020604051602081039080840390855afa158015610783573d6000803e3d6000fd5b50505060206040510351935050505092915050565b600080600060418451146107e1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107d890612317565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b600554341461080e57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461086957600080fd5b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008083905060005b83518110156109ce57600084828151811061094d5761094c612337565b5b6020026020010151905080831161098e578281604051602001610971929190612387565b6040516020818303038152906040528051906020012092506109ba565b80836040516020016109a1929190612387565b6040516020818303038152906040528051906020012092505b5080806109c6906123e2565b91505061092f565b508481149150509392505050565b603c81565b600080600654146109f157600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610a4c57600080fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610c985760008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610ae08685610729565b73ffffffffffffffffffffffffffffffffffffffff1614610b36576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b2d90612476565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610b798584610729565b73ffffffffffffffffffffffffffffffffffffffff1614610bcf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bc690612476565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610ee3565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610ee257600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610d308685610729565b73ffffffffffffffffffffffffffffffffffffffff1614610d86576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7d90612476565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610dc78584610729565b73ffffffffffffffffffffffffffffffffffffffff1614610e1d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e1490612476565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b603c42610ef09190612496565b60068190555060019050949350505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610f468585610729565b73ffffffffffffffffffffffffffffffffffffffff1614610f9c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9390612476565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610fdf8584610729565b73ffffffffffffffffffffffffffffffffffffffff1614611035576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161102c90612476565b60405180910390fd5b8361104087876106f6565b14611080576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161107790612538565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146110db57600080fd5b6000868660008181106110f1576110f0612337565b5b9050602002013514801561111f575060008686600181811061111657611115612337565b5b90506020020135145b8015611145575060008686600281811061113c5761113b612337565b5b90506020020135145b806111b6575060008686600381811061116157611160612337565b5b9050602002013514801561118f575060008686600481811061118657611185612337565b5b90506020020135145b80156111b557506000868660058181106111ac576111ab612337565b5b90506020020135145b5b8061122757506000868660068181106111d2576111d1612337565b5b9050602002013514801561120057506000868660078181106111f7576111f6612337565b5b90506020020135145b8015611226575060008686600881811061121d5761121c612337565b5b90506020020135145b5b80611298575060008686600081811061124357611242612337565b5b90506020020135148015611271575060008686600481811061126857611267612337565b5b90506020020135145b8015611297575060008686600881811061128e5761128d612337565b5b90506020020135145b5b8061130957506000868660068181106112b4576112b3612337565b5b905060200201351480156112e257506000868660048181106112d9576112d8612337565b5b90506020020135145b801561130857506000868660028181106112ff576112fe612337565b5b90506020020135145b5b8061137a575060008686600081811061132557611324612337565b5b90506020020135148015611353575060008686600381811061134a57611349612337565b5b90506020020135145b801561137957506000868660068181106113705761136f612337565b5b90506020020135145b5b806113eb575060008686600181811061139657611395612337565b5b905060200201351480156113c457506000868660048181106113bb576113ba612337565b5b90506020020135145b80156113ea57506000868660078181106113e1576113e0612337565b5b90506020020135145b5b8061145c575060008686600281811061140757611406612337565b5b90506020020135148015611435575060008686600581811061142c5761142b612337565b5b90506020020135145b801561145b575060008686600881811061145257611451612337565b5b90506020020135145b5b1561159c5760008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161150f9061215e565b60006040518083038185875af1925050503d806000811461154c576040519150601f19603f3d011682016040523d82523d6000602084013e611551565b606091505b5050905080611595576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161158c906121d0565b60405180910390fd5b5050611a69565b6002868660008181106115b2576115b1612337565b5b905060200201351480156115e057506002868660018181106115d7576115d6612337565b5b90506020020135145b801561160657506002868660028181106115fd576115fc612337565b5b90506020020135145b80611677575060028686600381811061162257611621612337565b5b90506020020135148015611650575060028686600481811061164757611646612337565b5b90506020020135145b8015611676575060028686600581811061166d5761166c612337565b5b90506020020135145b5b806116e8575060028686600681811061169357611692612337565b5b905060200201351480156116c157506002868660078181106116b8576116b7612337565b5b90506020020135145b80156116e757506002868660088181106116de576116dd612337565b5b90506020020135145b5b80611759575060028686600081811061170457611703612337565b5b90506020020135148015611732575060028686600481811061172957611728612337565b5b90506020020135145b8015611758575060028686600881811061174f5761174e612337565b5b90506020020135145b5b806117ca575060028686600681811061177557611774612337565b5b905060200201351480156117a3575060028686600481811061179a57611799612337565b5b90506020020135145b80156117c957506002868660028181106117c0576117bf612337565b5b90506020020135145b5b8061183b57506002868660008181106117e6576117e5612337565b5b90506020020135148015611814575060028686600381811061180b5761180a612337565b5b90506020020135145b801561183a575060028686600681811061183157611830612337565b5b90506020020135145b5b806118ac575060028686600181811061185757611856612337565b5b90506020020135148015611885575060028686600481811061187c5761187b612337565b5b90506020020135145b80156118ab57506002868660078181106118a2576118a1612337565b5b90506020020135145b5b8061191d57506002868660028181106118c8576118c7612337565b5b905060200201351480156118f657506002868660058181106118ed576118ec612337565b5b90506020020135145b801561191c575060028686600881811061191357611912612337565b5b90506020020135145b5b15611a5f57600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516119d29061215e565b60006040518083038185875af1925050503d8060008114611a0f576040519150601f19603f3d011682016040523d82523d6000602084013e611a14565b606091505b5050905080611a58576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a4f906121d0565b60405180910390fd5b5050611a68565b60009050611a6e565b5b600190505b95945050505050565b6000819050919050565b611a8a81611a77565b82525050565b6000602082019050611aa56000830184611a81565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611ad682611aab565b9050919050565b611ae681611acb565b82525050565b6000602082019050611b016000830184611add565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112611b4057611b3f611b1b565b5b8235905067ffffffffffffffff811115611b5d57611b5c611b20565b5b602083019150836020820283011115611b7957611b78611b25565b5b9250929050565b60008060208385031215611b9757611b96611b11565b5b600083013567ffffffffffffffff811115611bb557611bb4611b16565b5b611bc185828601611b2a565b92509250509250929050565b6000819050919050565b611be081611bcd565b82525050565b6000602082019050611bfb6000830184611bd7565b92915050565b611c0a81611bcd565b8114611c1557600080fd5b50565b600081359050611c2781611c01565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611c7b82611c32565b810181811067ffffffffffffffff82111715611c9a57611c99611c43565b5b80604052505050565b6000611cad611b07565b9050611cb98282611c72565b919050565b600067ffffffffffffffff821115611cd957611cd8611c43565b5b611ce282611c32565b9050602081019050919050565b82818337600083830152505050565b6000611d11611d0c84611cbe565b611ca3565b905082815260208101848484011115611d2d57611d2c611c2d565b5b611d38848285611cef565b509392505050565b600082601f830112611d5557611d54611b1b565b5b8135611d65848260208601611cfe565b91505092915050565b60008060408385031215611d8557611d84611b11565b5b6000611d9385828601611c18565b925050602083013567ffffffffffffffff811115611db457611db3611b16565b5b611dc085828601611d40565b9150509250929050565b600060208284031215611de057611ddf611b11565b5b600082013567ffffffffffffffff811115611dfe57611dfd611b16565b5b611e0a84828501611d40565b91505092915050565b600060ff82169050919050565b611e2981611e13565b82525050565b6000606082019050611e446000830186611bd7565b611e516020830185611bd7565b611e5e6040830184611e20565b949350505050565b600067ffffffffffffffff821115611e8157611e80611c43565b5b602082029050602081019050919050565b6000611ea5611ea084611e66565b611ca3565b90508083825260208201905060208402830185811115611ec857611ec7611b25565b5b835b81811015611ef15780611edd8882611c18565b845260208401935050602081019050611eca565b5050509392505050565b600082601f830112611f1057611f0f611b1b565b5b8135611f20848260208601611e92565b91505092915050565b600080600060608486031215611f4257611f41611b11565b5b6000611f5086828701611c18565b9350506020611f6186828701611c18565b925050604084013567ffffffffffffffff811115611f8257611f81611b16565b5b611f8e86828701611efb565b9150509250925092565b60008115159050919050565b611fad81611f98565b82525050565b6000602082019050611fc86000830184611fa4565b92915050565b60008060008060808587031215611fe857611fe7611b11565b5b6000611ff687828801611c18565b945050602061200787828801611c18565b935050604085013567ffffffffffffffff81111561202857612027611b16565b5b61203487828801611d40565b925050606085013567ffffffffffffffff81111561205557612054611b16565b5b61206187828801611d40565b91505092959194509250565b60008060008060006080868803121561208957612088611b11565b5b600086013567ffffffffffffffff8111156120a7576120a6611b16565b5b6120b388828901611b2a565b955095505060206120c688828901611c18565b935050604086013567ffffffffffffffff8111156120e7576120e6611b16565b5b6120f388828901611d40565b925050606086013567ffffffffffffffff81111561211457612113611b16565b5b61212088828901611d40565b9150509295509295909350565b600081905092915050565b50565b600061214860008361212d565b915061215382612138565b600082019050919050565b60006121698261213b565b9150819050919050565b600082825260208201905092915050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b60006121ba601483612173565b91506121c582612184565b602082019050919050565b600060208201905081810360008301526121e9816121ad565b9050919050565b600082825260208201905092915050565b600080fd5b600061221283856121f0565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561224557612244612201565b5b602083029250612256838584611cef565b82840190509392505050565b6000602082019050818103600083015261227d818486612206565b90509392505050565b600060808201905061229b6000830187611bd7565b6122a86020830186611e20565b6122b56040830185611bd7565b6122c26060830184611bd7565b95945050505050565b7f496e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b6000612301601883612173565b915061230c826122cb565b602082019050919050565b60006020820190508181036000830152612330816122f4565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000819050919050565b61238161237c82611bcd565b612366565b82525050565b60006123938285612370565b6020820191506123a38284612370565b6020820191508190509392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006123ed82611a77565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361241f5761241e6123b3565b5b600182019050919050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b6000612460601a83612173565b915061246b8261242a565b602082019050919050565b6000602082019050818103600083015261248f81612453565b9050919050565b60006124a182611a77565b91506124ac83611a77565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156124e1576124e06123b3565b5b828201905092915050565b7f53656e742066616b6520626f6172640000000000000000000000000000000000600082015250565b6000612522600f83612173565b915061252d826124ec565b602082019050919050565b6000602082019050818103600083015261255181612515565b905091905056fea26469706673582212209b5b0df88ffe4247448c712e9fc339c969d61256c2fc18ca8af15f4bfcdb71d364736f6c634300080d0033';

var cntr = 0;

var pubnub = new PubNub({
  publishKey: 'pub-c-428292e3-f3b4-4af9-aeb4-80cb8467c0ac',
  subscribeKey: 'sub-c-5f9a3170-b0de-11ec-a00a-ee285607d0e8',
  uuid: 'myFirstUser'
});

var stateChannel = {
  contract: CONTRACT_ADDRESS,
  gameOver: false,
  seq: -1,
  moves: [],
  whoseTurn: null,
  signature: null,
  timeout: null,
};

var FinishedGame = false;
var board_before;
var signature_before;
var plaintext_before;

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

  let addy = CONTRACT_ADDRESS
  const [error, setError] = useState('')
  const [P1, setP1] = useState('')
  const [P2, setP2] = useState('')  
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [vmContract, setVmContract] = useState(null)
  const [wallet, setWallet] = useState('Connect wallet')
  const [R1C1, setR0] = useState('1')
  const [R1C2, setR1] = useState('1')
  const [R1C3, setR2] = useState('1')
  const [R2C1, setR3] = useState('1')
  const [R2C2, setR4] = useState('1')
  const [R2C3, setR5] = useState('1')
  const [R3C1, setR6] = useState('1')
  const [R3C2, setR7] = useState('1')
  const [R3C3, setR8] = useState('1')

let channelGroup = '21-'+CONTRACT_ADDRESS;

function contractChange(event) {
  try{
    CONTRACT_ADDRESS = event.target.value;
  }
  catch(error){
    setError(error.message)
  }
}

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-'+CONTRACT_ADDRESS]
  });

  if (vmContract && CONTRACT_ADDRESS != '') getP1Handler()
  if (vmContract && CONTRACT_ADDRESS != '') getP2Handler()
  return leaveApplication
}, [vmContract, address])

const pubnubListener = {
  message: async function (msg) { 
    if (
      msg.message.plainText == "ALERT" && msg.message.move == null && msg.message.signature == null && stateChannel.whoseTurn == address
    ){
      alert("Timeout has been called !!!")
      return
    }

    if (
      msg.message.plainText == "ALERT" && msg.message.move == null && msg.message.signature == null && stateChannel.whoseTurn != address
    ){
      return
    }

    if (FinishedGame){
      console.log("Recovering signature.")
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
          console.log("-################-")
          console.log(signer)
          console.log(stateChannel.whoseTurn)
          console.log("-################-")
          if( (signer == stateChannel.whoseTurn) || (stateChannel.whoseTurn == null && stateChannel.seq == -1)){
            console.log("Correct order, no duplicate");
            stateChannel.whoseTurn = await vmContract.methods.getP2().call();
          } else {
            console.log("Duplicate");
            return;
          }
          board[msg.message.move.moves[msg.message.move.seq]]=0
        }
        if (signer == await vmContract.methods.getP2().call()){
          if( (signer == stateChannel.whoseTurn) || (stateChannel.whoseTurn == null && stateChannel.seq == -1)){
            console.log("Correct order, no duplicate");
            stateChannel.whoseTurn = await vmContract.methods.getP1().call();
          } else {
            console.log("Duplicate");
            return;
          }
          board[msg.message.move.moves[msg.message.move.seq]]=2
        }
      updateBoard()
      board_before = [...board];
      signature_before = JSON.parse(JSON.stringify(msg.message.signature));
      plaintext_before = JSON.parse(JSON.stringify(msg.message.plainText));
      console.log("received correctly signed state channel")
      stateChannel = msg.message.move
      console.log(JSON.stringify(stateChannel,null,4))
    }
    else{
      console.log("error-wrong sender")
    }
    finishMove()
  },
}

const leaveApplication = () => {
  pubnub.removeListener(pubnubListener);
  pubnub.unsubscribeAll()
}

const getP1Handler = async () => {
  const P1 = await vmContract.methods.getP1().call()
  setP1(P1) 
} 

const getP2Handler = async () => {
  const P2 = await vmContract.methods.getP2().call()
  setP2(P2) 
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
  let test2 = await vmContract.methods.getMessageHash(board).call()
  if(address==P1){
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
    console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
    console.log("***********************")
    console.log(signature1)
    console.log(signature2)
    console.log(test2)
    console.log(EthCrypto.hash.keccak256(test2))
    console.log(board)
    console.log("***********************")
    console.log(await vmContract.methods.verify(board,EthCrypto.hash.keccak256(test2), signature1, signature2).send({
          from: address,
      })
    )
    console.log(await vmContract.methods.returnWinner().call())
  }else{
    if (P1 != address){
      console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature1).call())
      console.log(await vmContract.methods.recoverSigner(EthCrypto.hash.keccak256(test2), signature2).call())
      console.log("***********************")
      console.log(signature1)
      console.log(signature2)
      console.log(EthCrypto.hash.keccak256(test2))
      console.log(board)
      console.log("***********************")
      console.log(await vmContract.methods.verify(board,EthCrypto.hash.keccak256(test2), signature2, signature1).send({
        from: address,
    })
    )
    console.log(await vmContract.methods.returnWinner().call())
    }
  }
}

const timeoutChallenge = async() => {
  var hBoard = await vmContract.methods.getMessageHash(board).call();
  var hBoardBefore = await vmContract.methods.getMessageHash(board_before).call();
  console.log("-------------------------");
  console.log(EthCrypto.hash.keccak256(hBoard));
  console.log(EthCrypto.hash.keccak256(hBoardBefore));
  console.log(signature1);
  console.log(signature_before);
  console.log("-------------------------");
  console.log(await vmContract.methods.timeoutChallenge(EthCrypto.hash.keccak256(hBoard),EthCrypto.hash.keccak256(hBoardBefore), signature1, signature_before).send({
    from: address,
  }));
  pubnub.publish(
    {
        channel: '21-' + addy,
        message: {
          plainText: "ALERT",
          move: null,
          signature: null,
        },
        },
    function(status, response) {
        }
    )
}

const cancelTimeout = async() => {
  console.log(await vmContract.methods.cancelTimeout().send({
    from: address,
  }));
}

const claimTimeout = async() => {  
  console.log(await vmContract.methods.claimTimeout().send({
    from: address,
  }));
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
                if (err) return setError(err);
                stateChannel.signature = sign
                if ( address == P1 ){
                  stateChannel.whoseTurn = P1;
                }
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
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[0]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(0)
        board[0] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        console.log(signature1)
        if(signature1 == null){
          stateChannel.moves.pop();
          board[0] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(0)
        board[0] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[0] = 1; 
        }
      }
    
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard1 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[1]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(1)
      board[1] = 0;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[1] = 1; 
      }
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(1)
      board[1] = 2;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[1] = 1; 
      }
    }
      
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard2 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[2]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(2)
        board[2] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[2] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(2)
        board[2] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[2] = 1; 
        }
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard3 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[3]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(3)
      board[3] = 0;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[3] = 1; 
      }
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(3)
      board[3] = 2;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[3] = 1; 
      }
    }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard4 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[4]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
    if (await vmContract.methods.getP1().call() == address){
      stateChannel.moves.push(4)
      board[4] = 0;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[4] = 1; 
      }
    }else if(await vmContract.methods.getP2().call()){
      stateChannel.moves.push(4)
      board[4] = 2;
      signature1 = null;
      signature1 = await moveDonutHandler();
      if(signature1 == null){
        stateChannel.moves.pop();
        board[4] = 1; 
      }
    }
    console.log(board)
  }catch(err){
    setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard5 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[5]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(5)
        board[5] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[5] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(5)
        board[5] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[5] = 1; 
        }
      }
      console.log(board)
  }catch(err){
    setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard6 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[6]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(6)
        board[6] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[6] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(6)
        board[6] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[6] = 1; 
        }
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard7 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[7]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(7)
        board[7] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[7] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(7)
        board[7] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[7] = 1; 
        }
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const makeMoveOnBoard8 = async() => {
  if (cntr > 0){
    return console.log("Already running.");
  }
  if (board[8]!=1){
    return console.log("Cannot do this.")
  }
  cntr = 1;
  if (FinishedGame){
    console.log("Cannot do this.")
    cntr = 0;
    return;
  }
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    cntr = 0;
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
    cntr = 0;
    return;
  }
  try{
      if (await vmContract.methods.getP1().call() == address){
        stateChannel.moves.push(8)
        board[8] = 0;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[8] = 1; 
        }
      }else if(await vmContract.methods.getP2().call()){
        stateChannel.moves.push(8)
        board[8] = 2;
        signature1 = null;
        signature1 = await moveDonutHandler();
        if(signature1 == null){
          stateChannel.moves.pop();
          board[8] = 1; 
        }
      }
      console.log(board)
  }catch(err){
      setError(err.message)
  }
  cntr = 0;
}

const joinHandler = async() => {
  try{
      let tmp = await vmContract.methods.bet().call()
      tmp = tmp / 1000000000000000000;
      console.log(tmp);
      await vmContract.methods.join().send({
          from: address,
          value: web3.utils.toWei(tmp.toString(), 'ether')
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
              if (err) return setError(err.message);
              if ((address == P1) && (stateChannel.seq % 2 == 1)){
                console.log("OK");
              }
              if ((address == P1) && (stateChannel.seq % 2 == 0)){
                console.log("Multiple sig issue.")
                sign = null;
                return null;
              }
              stateChannel.signature = sign;
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

const myFunction = async() => {
  console.log("here");
  var copyText = document.getElementById("myInput");
  console.log("Copied -> " + copyText);
  copyText.select();
  navigator.clipboard.writeText(copyText.value);
  alert("Copied the text: " + copyText.value);
}

const deployContract = async() => {
  console.log("Deploying the contract");
  let contract2 = new web3.eth.Contract(CONTRACT_ABI);
  await contract2.deploy({
                  data: code, 
                  arguments: ''
              })
              .send({
                  from: address, 
                  value: web3.utils.toWei('0.02', 'ether'),
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
          const vm = new web3.eth.Contract(ABI,CONTRACT_ADDRESS)
          setVmContract(vm)     
      }catch(err){
          console.log(err.message)
          setError(err.message)
      }
  }else{
      console.log("Error")
  }
}
if (typeof window === "undefined") {
}

if (typeof window !== "undefined") {
  window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
  };
}


return (
    
    <div className="notes-container" style={{background: '#16191e'}}>

                <div className="container">

                    <div className="navbar-end">
                        <button onClick={connectWalletHandler} className='button' style={{background: '#e8b00b'}}>{wallet}</button>
                    </div>
                </div>
    

      <div className="grid wrapper" style={{background: '#16191e'}}>
      </div>
      
      

      <div className={styles.main} style={{background: '#16191e'}}>
            <Head>
                <title>BP Rafaj</title>
                <meta name="description" content="BP Rafaj app" />
                
            </Head>
            <br></br>
            
            <section>
                
                <div className='container'>
                    <h1 style={{background: '#16191e',color: '#e8b00b',display: "flex",justifyContent: "center"}}> PLEASE PUT INVITE LINK / CONTRACT ADDRESS </h1>
                    <div style={{background: '#16191e',color: "#9393a7",display: "flex",justifyContent: "center",wordWrap: "break-word"}}>
                       <br></br><br></br><br></br>
                      <input name="contract_address" onChange={contractChange}/> 
                    </div>
                    <h2 style={{color: "#9393a7"}}>State channel seq number: {stateChannel.seq}</h2>
                    <h2 style={{color: "#9393a7"}}>My addy: {address}</h2>
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
                        <button onClick={deployContract} className='' style={{background: '#e8b00b'}}>Deploy contract</button>                     
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={joinHandler} className='' style={{background: '#e8b00b'}}>Join contract</button>
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
                <div className='container'>
                    <div className='field'>
                        <button onClick={timeoutChallenge} className='' style={{background: '#e8b00b'}}>Start timeout.</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={claimTimeout} className='' style={{background: '#e8b00b'}}>Claim timeout.</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container'>
                    <div className='field'>
                        <button onClick={cancelTimeout} className='' style={{background: '#e8b00b'}}>Stop timeout.</button>
                    </div>
                    <br></br>
                </div>
            </section>
            <section>
                <div className='container has-text-danger' style={{color: "red"}}>
                Error output
                    <div id='box'></div>
                    <p>{error}</p>
                </div>
            </section>
        </div>


        <h1 className='container' style={{color: '#e8b00b',fontSize: "24px"}}>Games</h1>
      <div className="grid wrapper" style={{background: '#16191e'}}>
        {notes.map(note => {
          return (
            <div key={note._id} style={{background: '#16191e'}}>
              <Card style={{background: '#24242e'}}>
                <Card.Content style={{wordWrap: "break-word"}}>
                <Card.Header>
                <div className='container'>
                    <h4 style={{color: '#e8b00b',fontSize: "17px"}}>Name: {note.title}</h4>
                    <h4 style={{color: '#e8b00b',fontSize: "17px"}}>Bet: {note.description} ETH</h4>
                </div>    
                </Card.Header>
                </Card.Content>
                
                <Card.Content extra style={{wordWrap: "break-word",color: "white"}}>
                
                  <div className='container' extra style={{color: "red"}}>
                  <p extra style={{color: "green"}}> {note.extra.toString()}</p>
                  <br></br>
                    
                  </div>  
                <Link href={`https://rinkeby.etherscan.io/address/${note.extra.toString()}`} extra style={{background: 'green',color: "white"}} target = "_blank" 
rel = "noopener noreferrer">
                <Button>Visit explorer</Button>
                </Link>
                </Card.Content>
              </Card>
            </div>
          )
        })}
      </div>
      <br></br>
      <br></br>
      <br></br>
    </div>

    
  )
}

Index.getInitialProps = async () => {
  const res = await fetch('http://localhost:3000/api/notes');
  const { data } = await res.json();
  console.log(data[0].extra);
  return { notes: data }
}

export default Index;