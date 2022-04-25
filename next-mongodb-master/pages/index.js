import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { Button, Card } from 'semantic-ui-react';
import Head from 'next/head'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import 'bulma/css/bulma.css'
import styles from '../styles/index.module.css'
import PubNub from '../node_modules/pubnub'
//import dynamic from 'next/dynamic'
//import vendingMachineContract from '../blockchain/vending'
import EthCrypto, { sign } from 'eth-crypto'; 

const CONTRACT_ADDRESS = '0x4524ba3e5C0630399539ba20855AB17Ea6E8EE6b';
const ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"result","outputs":[{"internalType":"bytes1","name":"","type":"bytes1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getResultBalance","outputs":[{"internalType":"bytes1[9]","name":"","type":"bytes1[9]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"result","outputs":[{"internalType":"bytes1","name":"","type":"bytes1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
const code = '0x' + '608060405266470de4df820000341461001757600080fd5b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506064600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611f8f806100ac6000396000f3fe6080604052600436106100e85760003560e01c8063b688a3631161008a578063e7644d3411610059578063e7644d34146102ef578063efef39a11461031a578063fabde80c14610336578063ff893e0d14610373576100e8565b8063b688a36314610264578063d2501b9c1461026e578063ded0997814610299578063dfbf53ae146102c4576100e8565b80638da5cb5b116100c65780638da5cb5b1461018057806393b6db5a146101ab57806397aba7f9146101e8578063a7bb580314610225576100e8565b806311471135146100ed5780633c594059146101185780634b8934e814610155575b600080fd5b3480156100f957600080fd5b506101026103b0565b60405161010f91906114a0565b60405180910390f35b34801561012457600080fd5b5061013f600480360381019061013a9190611506565b610440565b60405161014c9190611542565b60405180910390f35b34801561016157600080fd5b5061016a61046a565b604051610177919061159e565b60405180910390f35b34801561018c57600080fd5b50610195610494565b6040516101a2919061159e565b60405180910390f35b3480156101b757600080fd5b506101d260048036038101906101cd919061161e565b6104ba565b6040516101df9190611684565b60405180910390f35b3480156101f457600080fd5b5061020f600480360381019061020a919061180c565b6104ed565b60405161021c919061159e565b60405180910390f35b34801561023157600080fd5b5061024c60048036038101906102479190611868565b61055c565b60405161025b939291906118cd565b60405180910390f35b61026c6105c4565b005b34801561027a57600080fd5b50610283610675565b604051610290919061159e565b60405180910390f35b3480156102a557600080fd5b506102ae61069f565b6040516102bb919061159e565b60405180910390f35b3480156102d057600080fd5b506102d96106c9565b6040516102e6919061159e565b60405180910390f35b3480156102fb57600080fd5b506103046106ef565b6040516103119190611913565b60405180910390f35b610334600480360381019061032f9190611506565b610736565b005b34801561034257600080fd5b5061035d6004803603810190610358919061195a565b6108bc565b60405161036a9190611913565b60405180910390f35b34801561037f57600080fd5b5061039a60048036038101906103959190611987565b6108d4565b6040516103a79190611a62565b60405180910390f35b6103b86113a6565b6000600980602002604051908101604052809291908260098015610436576020028201916000905b82829054906101000a900460f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190600101906020826000010492830192600103820291508084116103e05790505b5050505050905090565b6000816009811061045057600080fd5b60209182820401919006915054906101000a900460f81b81565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082826040516020016104cf929190611aef565b60405160208183030381529060405280519060200120905092915050565b6000806000806104fc8561055c565b925092509250600186828585604051600081526020016040526040516105259493929190611b13565b6020604051602081039080840390855afa158015610547573d6000803e3d6000fd5b50505060206040510351935050505092915050565b600080600060418451146105a5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161059c90611bb5565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b66470de4df82000034146105d757600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461063257600080fd5b33600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905090565b662386f26fc10000816107499190611c04565b34101561078b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078290611cd0565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561080d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161080490611d62565b60405180910390fd5b80600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461085c9190611d82565b9250508190555080600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546108b29190611db6565b9250508190555050565b60016020528060005260406000206000915090505481565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1661091985856104ed565b73ffffffffffffffffffffffffffffffffffffffff161461096f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161096690611e58565b60405180910390fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166109b285846104ed565b73ffffffffffffffffffffffffffffffffffffffff1614610a08576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109ff90611e58565b60405180910390fd5b600086866000818110610a1e57610a1d611e78565b5b90506020020135148015610a4c5750600086866001818110610a4357610a42611e78565b5b90506020020135145b8015610a725750600086866002818110610a6957610a68611e78565b5b90506020020135145b80610ae35750600086866003818110610a8e57610a8d611e78565b5b90506020020135148015610abc5750600086866004818110610ab357610ab2611e78565b5b90506020020135145b8015610ae25750600086866005818110610ad957610ad8611e78565b5b90506020020135145b5b80610b545750600086866006818110610aff57610afe611e78565b5b90506020020135148015610b2d5750600086866007818110610b2457610b23611e78565b5b90506020020135145b8015610b535750600086866008818110610b4a57610b49611e78565b5b90506020020135145b5b80610bc55750600086866000818110610b7057610b6f611e78565b5b90506020020135148015610b9e5750600086866004818110610b9557610b94611e78565b5b90506020020135145b8015610bc45750600086866008818110610bbb57610bba611e78565b5b90506020020135145b5b80610c365750600086866006818110610be157610be0611e78565b5b90506020020135148015610c0f5750600086866004818110610c0657610c05611e78565b5b90506020020135145b8015610c355750600086866002818110610c2c57610c2b611e78565b5b90506020020135145b5b80610ca75750600086866000818110610c5257610c51611e78565b5b90506020020135148015610c805750600086866003818110610c7757610c76611e78565b5b90506020020135145b8015610ca65750600086866006818110610c9d57610c9c611e78565b5b90506020020135145b5b80610d185750600086866001818110610cc357610cc2611e78565b5b90506020020135148015610cf15750600086866004818110610ce857610ce7611e78565b5b90506020020135145b8015610d175750600086866007818110610d0e57610d0d611e78565b5b90506020020135145b5b80610d895750600086866002818110610d3457610d33611e78565b5b90506020020135148015610d625750600086866005818110610d5957610d58611e78565b5b90506020020135145b8015610d885750600086866008818110610d7f57610d7e611e78565b5b90506020020135145b5b15610ecb57600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1682604051610e3e90611ed8565b60006040518083038185875af1925050503d8060008114610e7b576040519150601f19603f3d011682016040523d82523d6000602084013e610e80565b606091505b5050905080610ec4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ebb90611f39565b60405180910390fd5b5050611398565b600286866000818110610ee157610ee0611e78565b5b90506020020135148015610f0f5750600286866001818110610f0657610f05611e78565b5b90506020020135145b8015610f355750600286866002818110610f2c57610f2b611e78565b5b90506020020135145b80610fa65750600286866003818110610f5157610f50611e78565b5b90506020020135148015610f7f5750600286866004818110610f7657610f75611e78565b5b90506020020135145b8015610fa55750600286866005818110610f9c57610f9b611e78565b5b90506020020135145b5b806110175750600286866006818110610fc257610fc1611e78565b5b90506020020135148015610ff05750600286866007818110610fe757610fe6611e78565b5b90506020020135145b8015611016575060028686600881811061100d5761100c611e78565b5b90506020020135145b5b80611088575060028686600081811061103357611032611e78565b5b90506020020135148015611061575060028686600481811061105857611057611e78565b5b90506020020135145b8015611087575060028686600881811061107e5761107d611e78565b5b90506020020135145b5b806110f957506002868660068181106110a4576110a3611e78565b5b905060200201351480156110d257506002868660048181106110c9576110c8611e78565b5b90506020020135145b80156110f857506002868660028181106110ef576110ee611e78565b5b90506020020135145b5b8061116a575060028686600081811061111557611114611e78565b5b90506020020135148015611143575060028686600381811061113a57611139611e78565b5b90506020020135145b801561116957506002868660068181106111605761115f611e78565b5b90506020020135145b5b806111db575060028686600181811061118657611185611e78565b5b905060200201351480156111b457506002868660048181106111ab576111aa611e78565b5b90506020020135145b80156111da57506002868660078181106111d1576111d0611e78565b5b90506020020135145b5b8061124c57506002868660028181106111f7576111f6611e78565b5b90506020020135148015611225575060028686600581811061121c5761121b611e78565b5b90506020020135145b801561124b575060028686600881811061124257611241611e78565b5b90506020020135145b5b1561138e57600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161130190611ed8565b60006040518083038185875af1925050503d806000811461133e576040519150601f19603f3d011682016040523d82523d6000602084013e611343565b606091505b5050905080611387576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161137e90611f39565b60405180910390fd5b5050611397565b6000905061139d565b5b600190505b95945050505050565b604051806101200160405280600990602082028036833780820191505090505090565b600060099050919050565b600081905092915050565b6000819050919050565b60007fff0000000000000000000000000000000000000000000000000000000000000082169050919050565b61141e816113e9565b82525050565b60006114308383611415565b60208301905092915050565b6000602082019050919050565b611452816113c9565b61145c81846113d4565b9250611467826113df565b8060005b8381101561149857815161147f8782611424565b965061148a8361143c565b92505060018101905061146b565b505050505050565b6000610120820190506114b66000830184611449565b92915050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6114e3816114d0565b81146114ee57600080fd5b50565b600081359050611500816114da565b92915050565b60006020828403121561151c5761151b6114c6565b5b600061152a848285016114f1565b91505092915050565b61153c816113e9565b82525050565b60006020820190506115576000830184611533565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006115888261155d565b9050919050565b6115988161157d565b82525050565b60006020820190506115b3600083018461158f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126115de576115dd6115b9565b5b8235905067ffffffffffffffff8111156115fb576115fa6115be565b5b602083019150836020820283011115611617576116166115c3565b5b9250929050565b60008060208385031215611635576116346114c6565b5b600083013567ffffffffffffffff811115611653576116526114cb565b5b61165f858286016115c8565b92509250509250929050565b6000819050919050565b61167e8161166b565b82525050565b60006020820190506116996000830184611675565b92915050565b6116a88161166b565b81146116b357600080fd5b50565b6000813590506116c58161169f565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611719826116d0565b810181811067ffffffffffffffff82111715611738576117376116e1565b5b80604052505050565b600061174b6114bc565b90506117578282611710565b919050565b600067ffffffffffffffff821115611777576117766116e1565b5b611780826116d0565b9050602081019050919050565b82818337600083830152505050565b60006117af6117aa8461175c565b611741565b9050828152602081018484840111156117cb576117ca6116cb565b5b6117d684828561178d565b509392505050565b600082601f8301126117f3576117f26115b9565b5b813561180384826020860161179c565b91505092915050565b60008060408385031215611823576118226114c6565b5b6000611831858286016116b6565b925050602083013567ffffffffffffffff811115611852576118516114cb565b5b61185e858286016117de565b9150509250929050565b60006020828403121561187e5761187d6114c6565b5b600082013567ffffffffffffffff81111561189c5761189b6114cb565b5b6118a8848285016117de565b91505092915050565b600060ff82169050919050565b6118c7816118b1565b82525050565b60006060820190506118e26000830186611675565b6118ef6020830185611675565b6118fc60408301846118be565b949350505050565b61190d816114d0565b82525050565b60006020820190506119286000830184611904565b92915050565b6119378161157d565b811461194257600080fd5b50565b6000813590506119548161192e565b92915050565b6000602082840312156119705761196f6114c6565b5b600061197e84828501611945565b91505092915050565b6000806000806000608086880312156119a3576119a26114c6565b5b600086013567ffffffffffffffff8111156119c1576119c06114cb565b5b6119cd888289016115c8565b955095505060206119e0888289016116b6565b935050604086013567ffffffffffffffff811115611a0157611a006114cb565b5b611a0d888289016117de565b925050606086013567ffffffffffffffff811115611a2e57611a2d6114cb565b5b611a3a888289016117de565b9150509295509295909350565b60008115159050919050565b611a5c81611a47565b82525050565b6000602082019050611a776000830184611a53565b92915050565b600082825260208201905092915050565b600080fd5b6000611a9f8385611a7d565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115611ad257611ad1611a8e565b5b602083029250611ae383858461178d565b82840190509392505050565b60006020820190508181036000830152611b0a818486611a93565b90509392505050565b6000608082019050611b286000830187611675565b611b3560208301866118be565b611b426040830185611675565b611b4f6060830184611675565b95945050505050565b600082825260208201905092915050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b6000611b9f601883611b58565b9150611baa82611b69565b602082019050919050565b60006020820190508181036000830152611bce81611b92565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611c0f826114d0565b9150611c1a836114d0565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611c5357611c52611bd5565b5b828202905092915050565b7f596f75206d75737420706179206174206c6561737420302e303120455448207060008201527f657220636f696e00000000000000000000000000000000000000000000000000602082015250565b6000611cba602783611b58565b9150611cc582611c5e565b604082019050919050565b60006020820190508181036000830152611ce981611cad565b9050919050565b7f4e6f7420656e6f75676820636f696e7320696e2073746f636b20746f20636f6d60008201527f706c657465207468697320707572636861736500000000000000000000000000602082015250565b6000611d4c603383611b58565b9150611d5782611cf0565b604082019050919050565b60006020820190508181036000830152611d7b81611d3f565b9050919050565b6000611d8d826114d0565b9150611d98836114d0565b925082821015611dab57611daa611bd5565b5b828203905092915050565b6000611dc1826114d0565b9150611dcc836114d0565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611e0157611e00611bd5565b5b828201905092915050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b6000611e42601a83611b58565b9150611e4d82611e0c565b602082019050919050565b60006020820190508181036000830152611e7181611e35565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600081905092915050565b50565b6000611ec2600083611ea7565b9150611ecd82611eb2565b600082019050919050565b6000611ee382611eb5565b9150819050919050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b6000611f23601483611b58565b9150611f2e82611eed565b602082019050919050565b60006020820190508181036000830152611f5281611f16565b905091905056fea264697066735822122000c6a51af12b550adef574bed11f60f3a64e26e7d56c023d262aa74fb72671b764736f6c634300080d0033';
  
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

let channelGroup = '21-'+CONTRACT_ADDRESS;

useEffect (() => {
  pubnub.addListener(pubnubListener);

  pubnub.subscribe({
    channels: ['21-'+CONTRACT_ADDRESS]
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
  if (address != stateChannel.whoseTurn && stateChannel.whoseTurn !=null){
    console.log("Already made a move.")
    return;
  }
  if (stateChannel.whoseTurn == null && address == await vmContract.methods.getP2().call()){
    console.log("You cannot make first move, owner has to.")
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
          value: web3.utils.toWei('0.02', 'ether')
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