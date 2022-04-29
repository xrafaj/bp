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

const CONTRACT_ADDRESS = '0x1eD925bA7f1cB6B0ED9C468DfA292b266Fd1418f';
const ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"coinBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
const code = '0x' + '608060405266470de4df820000341461001757600080fd5b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060646000803073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550612268806100ab6000396000f3fe6080604052600436106100e85760003560e01c8063b688a3631161008a578063f56f48f211610059578063f56f48f2146102b5578063f78f1d44146102e0578063fabde80c1461031d578063ff893e0d1461035a576100e8565b8063b688a3631461022a578063d2501b9c14610234578063ded099781461025f578063dfbf53ae1461028a576100e8565b80638da5cb5b116100c65780638da5cb5b1461014657806393b6db5a1461017157806397aba7f9146101ae578063a7bb5803146101eb576100e8565b80630e1da6c3146100ed5780633744734d146101045780634b8934e81461011b575b600080fd5b3480156100f957600080fd5b50610102610397565b005b34801561011057600080fd5b5061011961053b565b005b34801561012757600080fd5b50610130610631565b60405161013d919061196c565b60405180910390f35b34801561015257600080fd5b5061015b61065b565b604051610168919061196c565b60405180910390f35b34801561017d57600080fd5b5061019860048036038101906101939190611a00565b610681565b6040516101a59190611a66565b60405180910390f35b3480156101ba57600080fd5b506101d560048036038101906101d09190611bee565b6106b4565b6040516101e2919061196c565b60405180910390f35b3480156101f757600080fd5b50610212600480360381019061020d9190611c4a565b610723565b60405161022193929190611caf565b60405180910390f35b61023261078b565b005b34801561024057600080fd5b5061024961083c565b604051610256919061196c565b60405180910390f35b34801561026b57600080fd5b50610274610866565b604051610281919061196c565b60405180910390f35b34801561029657600080fd5b5061029f610890565b6040516102ac919061196c565b60405180910390f35b3480156102c157600080fd5b506102ca6108b6565b6040516102d79190611cff565b60405180910390f35b3480156102ec57600080fd5b5061030760048036038101906103029190611d1a565b6108bb565b6040516103149190611dd4565b60405180910390f35b34801561032957600080fd5b50610344600480360381019061033f9190611e1b565b610de6565b6040516103519190611cff565b60405180910390f35b34801561036657600080fd5b50610381600480360381019061037c9190611e48565b610dfe565b60405161038e9190611dd4565b60405180910390f35b4260065411156103a657600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff160361040157600080fd5b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516104b190611f39565b60006040518083038185875af1925050503d80600081146104ee576040519150601f19603f3d011682016040523d82523d6000602084013e6104f3565b606091505b5050905080610537576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161052e90611fab565b60405180910390fd5b5050565b3373ffffffffffffffffffffffffffffffffffffffff16600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461059557600080fd5b42600654116105a357600080fd5b6000600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600681905550565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000828260405160200161069692919061203d565b60405160208183030381529060405280519060200120905092915050565b6000806000806106c385610723565b925092509250600186828585604051600081526020016040526040516106ec9493929190612061565b6020604051602081039080840390855afa15801561070e573d6000803e3d6000fd5b50505060206040510351935050505092915050565b6000806000604184511461076c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610763906120f2565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b66470de4df820000341461079e57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146107f957600080fd5b33600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b607881565b600080600654146108cb57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461092657600080fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610b7857600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166109be86856106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610a14576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0b9061215e565b60405180910390fd5b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610a5785846106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610aad576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aa49061215e565b60405180910390fd5b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610dc7565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610dc657600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610c1086856106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610c66576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c5d9061215e565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610ca985846106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610cff576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cf69061215e565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b607842610dd491906121ad565b60068190555060019050949350505050565b60006020528060005260406000206000915090505481565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610e4385856106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610e99576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e909061215e565b60405180910390fd5b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610edc85846106b4565b73ffffffffffffffffffffffffffffffffffffffff1614610f32576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f299061215e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610f8d57600080fd5b600086866000818110610fa357610fa2612203565b5b90506020020135148015610fd15750600086866001818110610fc857610fc7612203565b5b90506020020135145b8015610ff75750600086866002818110610fee57610fed612203565b5b90506020020135145b80611068575060008686600381811061101357611012612203565b5b90506020020135148015611041575060008686600481811061103857611037612203565b5b90506020020135145b8015611067575060008686600581811061105e5761105d612203565b5b90506020020135145b5b806110d9575060008686600681811061108457611083612203565b5b905060200201351480156110b257506000868660078181106110a9576110a8612203565b5b90506020020135145b80156110d857506000868660088181106110cf576110ce612203565b5b90506020020135145b5b8061114a57506000868660008181106110f5576110f4612203565b5b90506020020135148015611123575060008686600481811061111a57611119612203565b5b90506020020135145b801561114957506000868660088181106111405761113f612203565b5b90506020020135145b5b806111bb575060008686600681811061116657611165612203565b5b90506020020135148015611194575060008686600481811061118b5761118a612203565b5b90506020020135145b80156111ba57506000868660028181106111b1576111b0612203565b5b90506020020135145b5b8061122c57506000868660008181106111d7576111d6612203565b5b9050602002013514801561120557506000868660038181106111fc576111fb612203565b5b90506020020135145b801561122b575060008686600681811061122257611221612203565b5b90506020020135145b5b8061129d575060008686600181811061124857611247612203565b5b90506020020135148015611276575060008686600481811061126d5761126c612203565b5b90506020020135145b801561129c575060008686600781811061129357611292612203565b5b90506020020135145b5b8061130e57506000868660028181106112b9576112b8612203565b5b905060200201351480156112e757506000868660058181106112de576112dd612203565b5b90506020020135145b801561130d575060008686600881811061130457611303612203565b5b90506020020135145b5b1561145057600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516113c390611f39565b60006040518083038185875af1925050503d8060008114611400576040519150601f19603f3d011682016040523d82523d6000602084013e611405565b606091505b5050905080611449576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161144090611fab565b60405180910390fd5b505061191d565b60028686600081811061146657611465612203565b5b90506020020135148015611494575060028686600181811061148b5761148a612203565b5b90506020020135145b80156114ba57506002868660028181106114b1576114b0612203565b5b90506020020135145b8061152b57506002868660038181106114d6576114d5612203565b5b9050602002013514801561150457506002868660048181106114fb576114fa612203565b5b90506020020135145b801561152a575060028686600581811061152157611520612203565b5b90506020020135145b5b8061159c575060028686600681811061154757611546612203565b5b90506020020135148015611575575060028686600781811061156c5761156b612203565b5b90506020020135145b801561159b575060028686600881811061159257611591612203565b5b90506020020135145b5b8061160d57506002868660008181106115b8576115b7612203565b5b905060200201351480156115e657506002868660048181106115dd576115dc612203565b5b90506020020135145b801561160c575060028686600881811061160357611602612203565b5b90506020020135145b5b8061167e575060028686600681811061162957611628612203565b5b90506020020135148015611657575060028686600481811061164e5761164d612203565b5b90506020020135145b801561167d575060028686600281811061167457611673612203565b5b90506020020135145b5b806116ef575060028686600081811061169a57611699612203565b5b905060200201351480156116c857506002868660038181106116bf576116be612203565b5b90506020020135145b80156116ee57506002868660068181106116e5576116e4612203565b5b90506020020135145b5b80611760575060028686600181811061170b5761170a612203565b5b9050602002013514801561173957506002868660048181106117305761172f612203565b5b90506020020135145b801561175f575060028686600781811061175657611755612203565b5b90506020020135145b5b806117d1575060028686600281811061177c5761177b612203565b5b905060200201351480156117aa57506002868660058181106117a1576117a0612203565b5b90506020020135145b80156117d057506002868660088181106117c7576117c6612203565b5b90506020020135145b5b1561191357600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161188690611f39565b60006040518083038185875af1925050503d80600081146118c3576040519150601f19603f3d011682016040523d82523d6000602084013e6118c8565b606091505b505090508061190c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161190390611fab565b60405180910390fd5b505061191c565b60009050611922565b5b600190505b95945050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006119568261192b565b9050919050565b6119668161194b565b82525050565b6000602082019050611981600083018461195d565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126119c0576119bf61199b565b5b8235905067ffffffffffffffff8111156119dd576119dc6119a0565b5b6020830191508360208202830111156119f9576119f86119a5565b5b9250929050565b60008060208385031215611a1757611a16611991565b5b600083013567ffffffffffffffff811115611a3557611a34611996565b5b611a41858286016119aa565b92509250509250929050565b6000819050919050565b611a6081611a4d565b82525050565b6000602082019050611a7b6000830184611a57565b92915050565b611a8a81611a4d565b8114611a9557600080fd5b50565b600081359050611aa781611a81565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611afb82611ab2565b810181811067ffffffffffffffff82111715611b1a57611b19611ac3565b5b80604052505050565b6000611b2d611987565b9050611b398282611af2565b919050565b600067ffffffffffffffff821115611b5957611b58611ac3565b5b611b6282611ab2565b9050602081019050919050565b82818337600083830152505050565b6000611b91611b8c84611b3e565b611b23565b905082815260208101848484011115611bad57611bac611aad565b5b611bb8848285611b6f565b509392505050565b600082601f830112611bd557611bd461199b565b5b8135611be5848260208601611b7e565b91505092915050565b60008060408385031215611c0557611c04611991565b5b6000611c1385828601611a98565b925050602083013567ffffffffffffffff811115611c3457611c33611996565b5b611c4085828601611bc0565b9150509250929050565b600060208284031215611c6057611c5f611991565b5b600082013567ffffffffffffffff811115611c7e57611c7d611996565b5b611c8a84828501611bc0565b91505092915050565b600060ff82169050919050565b611ca981611c93565b82525050565b6000606082019050611cc46000830186611a57565b611cd16020830185611a57565b611cde6040830184611ca0565b949350505050565b6000819050919050565b611cf981611ce6565b82525050565b6000602082019050611d146000830184611cf0565b92915050565b60008060008060808587031215611d3457611d33611991565b5b6000611d4287828801611a98565b9450506020611d5387828801611a98565b935050604085013567ffffffffffffffff811115611d7457611d73611996565b5b611d8087828801611bc0565b925050606085013567ffffffffffffffff811115611da157611da0611996565b5b611dad87828801611bc0565b91505092959194509250565b60008115159050919050565b611dce81611db9565b82525050565b6000602082019050611de96000830184611dc5565b92915050565b611df88161194b565b8114611e0357600080fd5b50565b600081359050611e1581611def565b92915050565b600060208284031215611e3157611e30611991565b5b6000611e3f84828501611e06565b91505092915050565b600080600080600060808688031215611e6457611e63611991565b5b600086013567ffffffffffffffff811115611e8257611e81611996565b5b611e8e888289016119aa565b95509550506020611ea188828901611a98565b935050604086013567ffffffffffffffff811115611ec257611ec1611996565b5b611ece88828901611bc0565b925050606086013567ffffffffffffffff811115611eef57611eee611996565b5b611efb88828901611bc0565b9150509295509295909350565b600081905092915050565b50565b6000611f23600083611f08565b9150611f2e82611f13565b600082019050919050565b6000611f4482611f16565b9150819050919050565b600082825260208201905092915050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b6000611f95601483611f4e565b9150611fa082611f5f565b602082019050919050565b60006020820190508181036000830152611fc481611f88565b9050919050565b600082825260208201905092915050565b600080fd5b6000611fed8385611fcb565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8311156120205761201f611fdc565b5b602083029250612031838584611b6f565b82840190509392505050565b60006020820190508181036000830152612058818486611fe1565b90509392505050565b60006080820190506120766000830187611a57565b6120836020830186611ca0565b6120906040830185611a57565b61209d6060830184611a57565b95945050505050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b60006120dc601883611f4e565b91506120e7826120a6565b602082019050919050565b6000602082019050818103600083015261210b816120cf565b9050919050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b6000612148601a83611f4e565b915061215382612112565b602082019050919050565b600060208201905081810360008301526121778161213b565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006121b882611ce6565b91506121c383611ce6565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156121f8576121f761217e565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea2646970667358221220ad8ca0f95ac7e37ed756612d7359c3439db466d72d287f28bb3e542dbab129e464736f6c634300080d0033';
  
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

  if (vmContract) getP1Handler()
  if (vmContract) getP2Handler()
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
        //console.log("Signer "+signer)
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
      //console.log("Updating before stuff");
      board_before = [...board];
      signature_before = JSON.parse(JSON.stringify(msg.message.signature));
      plaintext_before = JSON.parse(JSON.stringify(msg.message.plainText));
      //console.log("board:")
      //console.log(board)
      console.log("received correctly signed state channel")
      //console.log(signer);  
      stateChannel = msg.message.move
      //console.log(JSON.stringify(stateChannel,null,4))
    }
    else{
      //console.log(signer)
      //console.log("P1 " + await vmContract.methods.getP1().call())
      //console.log("P2 " + await vmContract.methods.getP2().call())
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
  let test2 = await vmContract.methods.getMessageHash(board).call()
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

const timeoutChallenge = async() => {
  var hBoard = await vmContract.methods.getMessageHash(board).call();
  var hBoardBefore = await vmContract.methods.getMessageHash(board_before).call();
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
/*
async function check() {
  if (vmContract != null){
    console.log(vmContract.methods.getTimeout().call());
    if ( 0 != await vmContract.methods.getTimeout().call()){
      //alert("TIMEOUT")
    }
  }
}

useEffect(() => {
  check()
 }, [vmContract, address]);

setInterval(check, 10000);
*/


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
                        <div className='control'>
                            <input onChange={updateDonateQty} className='input' type="type" placeholder="Enter amount.."></input>
                        </div>
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