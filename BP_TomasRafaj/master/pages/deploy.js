import fetch from 'isomorphic-unfetch';
import { Button, Card } from 'semantic-ui-react';
import Head from 'next/head'
import Web3 from 'web3'
import 'bulma/css/bulma.css'
import styles from '../styles/index.module.css'
import PubNub from '../node_modules/pubnub'
import EthCrypto, { sign } from 'eth-crypto'; 
import dbConnect from '../utils/dbConnect';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Form, Loader } from 'semantic-ui-react';
import { useRouter } from 'next/router';


let CONTRACT_ADDRESS = '0x8ba5C30eFd62f9643574B6C11e18925A2e70f112';
const CONTRACT_ABI = JSON.parse('[{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"timeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]')
const ABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"inputs":[],"name":"TIMEOUT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cancelTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"}],"name":"getMessageHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_ethSignedMessageHash","type":"bytes32"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"returnWinner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"timeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes32","name":"_boardBefore","type":"bytes32"},{"internalType":"bytes","name":"_challenger","type":"bytes"},{"internalType":"bytes","name":"_challenged","type":"bytes"}],"name":"timeoutChallenge","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_num","type":"uint256[]"},{"internalType":"bytes32","name":"_board","type":"bytes32"},{"internalType":"bytes","name":"_signature1","type":"bytes"},{"internalType":"bytes","name":"_signature2","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
const code = '0x' + '608060405266470de4df82000034101561001857600080fd5b34600581905550336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506122128061006e6000396000f3fe6080604052600436106100f35760003560e01c8063a7bb58031161008a578063dfbf53ae11610059578063dfbf53ae146102eb578063f56f48f214610316578063f78f1d4414610341578063ff893e0d1461037e576100f3565b8063a7bb58031461024c578063b688a3631461028b578063d2501b9c14610295578063ded09978146102c0576100f3565b806370dea79a116100c657806370dea79a1461017c5780638da5cb5b146101a757806393b6db5a146101d257806397aba7f91461020f576100f3565b80630e1da6c3146100f857806311610c251461010f5780633744734d1461013a5780634b8934e814610151575b600080fd5b34801561010457600080fd5b5061010d6103bb565b005b34801561011b57600080fd5b5061012461055f565b6040516101319190611947565b60405180910390f35b34801561014657600080fd5b5061014f610565565b005b34801561015d57600080fd5b5061016661065b565b60405161017391906119a3565b60405180910390f35b34801561018857600080fd5b50610191610684565b60405161019e9190611947565b60405180910390f35b3480156101b357600080fd5b506101bc61068a565b6040516101c991906119a3565b60405180910390f35b3480156101de57600080fd5b506101f960048036038101906101f49190611a37565b6106ae565b6040516102069190611a9d565b60405180910390f35b34801561021b57600080fd5b5061023660048036038101906102319190611c25565b6106e1565b60405161024391906119a3565b60405180910390f35b34801561025857600080fd5b50610273600480360381019061026e9190611c81565b610750565b60405161028293929190611ce6565b60405180910390f35b6102936107b8565b005b3480156102a157600080fd5b506102aa610864565b6040516102b791906119a3565b60405180910390f35b3480156102cc57600080fd5b506102d561088e565b6040516102e291906119a3565b60405180910390f35b3480156102f757600080fd5b506103006108b8565b60405161030d91906119a3565b60405180910390f35b34801561032257600080fd5b5061032b6108de565b6040516103389190611947565b60405180910390f35b34801561034d57600080fd5b5061036860048036038101906103639190611d1d565b6108e3565b6040516103759190611dd7565b60405180910390f35b34801561038a57600080fd5b506103a560048036038101906103a09190611df2565b610e04565b6040516103b29190611dd7565b60405180910390f35b4260065411156103ca57600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff160361042557600080fd5b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516104d590611ee3565b60006040518083038185875af1925050503d8060008114610512576040519150601f19603f3d011682016040523d82523d6000602084013e610517565b606091505b505090508061055b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055290611f55565b60405180910390fd5b5050565b60055481565b3373ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146105bf57600080fd5b42600654116105cd57600080fd5b6000600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600681905550565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60065481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600082826040516020016106c3929190611fe7565b60405160208183030381529060405280519060200120905092915050565b6000806000806106f085610750565b92509250925060018682858560405160008152602001604052604051610719949392919061200b565b6020604051602081039080840390855afa15801561073b573d6000803e3d6000fd5b50505060206040510351935050505092915050565b60008060006041845114610799576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107909061209c565b60405180910390fd5b6020840151925060408401519150606084015160001a90509193909250565b60055434146107c657600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461082157600080fd5b33600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b607881565b600080600654146108f357600080fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461094e57600080fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610b9a5760008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166109e286856106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610a38576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a2f90612108565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610a7b85846106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610ad1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ac890612108565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610de5565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1603610de457600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610c3286856106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610c88576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7f90612108565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610cc985846106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610d1f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d1690612108565b60405180910390fd5b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b607842610df29190612157565b60068190555060019050949350505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610e4885856106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610e9e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e9590612108565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16610ee185846106e1565b73ffffffffffffffffffffffffffffffffffffffff1614610f37576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f2e90612108565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610f9257600080fd5b600086866000818110610fa857610fa76121ad565b5b90506020020135148015610fd65750600086866001818110610fcd57610fcc6121ad565b5b90506020020135145b8015610ffc5750600086866002818110610ff357610ff26121ad565b5b90506020020135145b8061106d5750600086866003818110611018576110176121ad565b5b90506020020135148015611046575060008686600481811061103d5761103c6121ad565b5b90506020020135145b801561106c5750600086866005818110611063576110626121ad565b5b90506020020135145b5b806110de5750600086866006818110611089576110886121ad565b5b905060200201351480156110b757506000868660078181106110ae576110ad6121ad565b5b90506020020135145b80156110dd57506000868660088181106110d4576110d36121ad565b5b90506020020135145b5b8061114f57506000868660008181106110fa576110f96121ad565b5b90506020020135148015611128575060008686600481811061111f5761111e6121ad565b5b90506020020135145b801561114e5750600086866008818110611145576111446121ad565b5b90506020020135145b5b806111c0575060008686600681811061116b5761116a6121ad565b5b9050602002013514801561119957506000868660048181106111905761118f6121ad565b5b90506020020135145b80156111bf57506000868660028181106111b6576111b56121ad565b5b90506020020135145b5b8061123157506000868660008181106111dc576111db6121ad565b5b9050602002013514801561120a5750600086866003818110611201576112006121ad565b5b90506020020135145b80156112305750600086866006818110611227576112266121ad565b5b90506020020135145b5b806112a2575060008686600181811061124d5761124c6121ad565b5b9050602002013514801561127b5750600086866004818110611272576112716121ad565b5b90506020020135145b80156112a15750600086866007818110611298576112976121ad565b5b90506020020135145b5b8061131357506000868660028181106112be576112bd6121ad565b5b905060200201351480156112ec57506000868660058181106112e3576112e26121ad565b5b90506020020135145b80156113125750600086866008818110611309576113086121ad565b5b90506020020135145b5b156114535760008054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516113c690611ee3565b60006040518083038185875af1925050503d8060008114611403576040519150601f19603f3d011682016040523d82523d6000602084013e611408565b606091505b505090508061144c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161144390611f55565b60405180910390fd5b5050611920565b600286866000818110611469576114686121ad565b5b90506020020135148015611497575060028686600181811061148e5761148d6121ad565b5b90506020020135145b80156114bd57506002868660028181106114b4576114b36121ad565b5b90506020020135145b8061152e57506002868660038181106114d9576114d86121ad565b5b9050602002013514801561150757506002868660048181106114fe576114fd6121ad565b5b90506020020135145b801561152d5750600286866005818110611524576115236121ad565b5b90506020020135145b5b8061159f575060028686600681811061154a576115496121ad565b5b90506020020135148015611578575060028686600781811061156f5761156e6121ad565b5b90506020020135145b801561159e5750600286866008818110611595576115946121ad565b5b90506020020135145b5b8061161057506002868660008181106115bb576115ba6121ad565b5b905060200201351480156115e957506002868660048181106115e0576115df6121ad565b5b90506020020135145b801561160f5750600286866008818110611606576116056121ad565b5b90506020020135145b5b80611681575060028686600681811061162c5761162b6121ad565b5b9050602002013514801561165a5750600286866004818110611651576116506121ad565b5b90506020020135145b80156116805750600286866002818110611677576116766121ad565b5b90506020020135145b5b806116f2575060028686600081811061169d5761169c6121ad565b5b905060200201351480156116cb57506002868660038181106116c2576116c16121ad565b5b90506020020135145b80156116f157506002868660068181106116e8576116e76121ad565b5b90506020020135145b5b80611763575060028686600181811061170e5761170d6121ad565b5b9050602002013514801561173c5750600286866004818110611733576117326121ad565b5b90506020020135145b80156117625750600286866007818110611759576117586121ad565b5b90506020020135145b5b806117d4575060028686600281811061177f5761177e6121ad565b5b905060200201351480156117ad57506002868660058181106117a4576117a36121ad565b5b90506020020135145b80156117d357506002868660088181106117ca576117c96121ad565b5b90506020020135145b5b1561191657600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060004790506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161188990611ee3565b60006040518083038185875af1925050503d80600081146118c6576040519150601f19603f3d011682016040523d82523d6000602084013e6118cb565b606091505b505090508061190f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161190690611f55565b60405180910390fd5b505061191f565b60009050611925565b5b600190505b95945050505050565b6000819050919050565b6119418161192e565b82525050565b600060208201905061195c6000830184611938565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061198d82611962565b9050919050565b61199d81611982565b82525050565b60006020820190506119b86000830184611994565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126119f7576119f66119d2565b5b8235905067ffffffffffffffff811115611a1457611a136119d7565b5b602083019150836020820283011115611a3057611a2f6119dc565b5b9250929050565b60008060208385031215611a4e57611a4d6119c8565b5b600083013567ffffffffffffffff811115611a6c57611a6b6119cd565b5b611a78858286016119e1565b92509250509250929050565b6000819050919050565b611a9781611a84565b82525050565b6000602082019050611ab26000830184611a8e565b92915050565b611ac181611a84565b8114611acc57600080fd5b50565b600081359050611ade81611ab8565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611b3282611ae9565b810181811067ffffffffffffffff82111715611b5157611b50611afa565b5b80604052505050565b6000611b646119be565b9050611b708282611b29565b919050565b600067ffffffffffffffff821115611b9057611b8f611afa565b5b611b9982611ae9565b9050602081019050919050565b82818337600083830152505050565b6000611bc8611bc384611b75565b611b5a565b905082815260208101848484011115611be457611be3611ae4565b5b611bef848285611ba6565b509392505050565b600082601f830112611c0c57611c0b6119d2565b5b8135611c1c848260208601611bb5565b91505092915050565b60008060408385031215611c3c57611c3b6119c8565b5b6000611c4a85828601611acf565b925050602083013567ffffffffffffffff811115611c6b57611c6a6119cd565b5b611c7785828601611bf7565b9150509250929050565b600060208284031215611c9757611c966119c8565b5b600082013567ffffffffffffffff811115611cb557611cb46119cd565b5b611cc184828501611bf7565b91505092915050565b600060ff82169050919050565b611ce081611cca565b82525050565b6000606082019050611cfb6000830186611a8e565b611d086020830185611a8e565b611d156040830184611cd7565b949350505050565b60008060008060808587031215611d3757611d366119c8565b5b6000611d4587828801611acf565b9450506020611d5687828801611acf565b935050604085013567ffffffffffffffff811115611d7757611d766119cd565b5b611d8387828801611bf7565b925050606085013567ffffffffffffffff811115611da457611da36119cd565b5b611db087828801611bf7565b91505092959194509250565b60008115159050919050565b611dd181611dbc565b82525050565b6000602082019050611dec6000830184611dc8565b92915050565b600080600080600060808688031215611e0e57611e0d6119c8565b5b600086013567ffffffffffffffff811115611e2c57611e2b6119cd565b5b611e38888289016119e1565b95509550506020611e4b88828901611acf565b935050604086013567ffffffffffffffff811115611e6c57611e6b6119cd565b5b611e7888828901611bf7565b925050606086013567ffffffffffffffff811115611e9957611e986119cd565b5b611ea588828901611bf7565b9150509295509295909350565b600081905092915050565b50565b6000611ecd600083611eb2565b9150611ed882611ebd565b600082019050919050565b6000611eee82611ec0565b9150819050919050565b600082825260208201905092915050565b7f4661696c656420746f2073656e64204574686572000000000000000000000000600082015250565b6000611f3f601483611ef8565b9150611f4a82611f09565b602082019050919050565b60006020820190508181036000830152611f6e81611f32565b9050919050565b600082825260208201905092915050565b600080fd5b6000611f978385611f75565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115611fca57611fc9611f86565b5b602083029250611fdb838584611ba6565b82840190509392505050565b60006020820190508181036000830152612002818486611f8b565b90509392505050565b60006080820190506120206000830187611a8e565b61202d6020830186611cd7565b61203a6040830185611a8e565b6120476060830184611a8e565b95945050505050565b7f696e76616c6964207369676e6174757265206c656e6774680000000000000000600082015250565b6000612086601883611ef8565b915061209182612050565b602082019050919050565b600060208201905081810360008301526120b581612079565b9050919050565b7f454f415665726966793a205369676e6564206d69736d61746368000000000000600082015250565b60006120f2601a83611ef8565b91506120fd826120bc565b602082019050919050565b60006020820190508181036000830152612121816120e5565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006121628261192e565b915061216d8361192e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156121a2576121a1612128565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea2646970667358221220914b16f824d2d12cd69721276778be8f9e0ca2d53b011c82d8cdfab9d59bff0464736f6c634300080d0033';


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
let temporary;

const Index = ({ notes }) => {

    const [form, setForm] = useState({ title: '', description: '', extra: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    useEffect(() => {
        if (isSubmitting) {
            if (Object.keys(errors).length === 0) {
                createNote();
            }
            else {
                setIsSubmitting(false);
            }
        }
    }, [errors])

    const createNote = async () => {
        try {
            let contract2 = new web3.eth.Contract(CONTRACT_ABI);
            temporary = await contract2.deploy({
                            data: code, 
                            arguments: ''
                        })
                        .send({
                            from: address, 
                            value: web3.utils.toWei(form.description, 'ether'),
                            gasPrice: web3.eth.gasPrice,
                            gasLimit: web3.eth.getBlock("latest").gasLimit,
                        });
            setError(temporary._address)
            console.log(temporary._address)
            form.extra = temporary._address.toString();
            const res = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })
            router.push("/");
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let errs = validate();
        setErrors(errs);
        setIsSubmitting(true);
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const validate = () => {
        let err = {};

        if (!form.title) {
            err.title = 'Title is required';
        }
        if (!form.description) {
            err.description = 'Description is required';
        }

        return err;
    }

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

useEffect (() => {
  return leaveApplication
}, [vmContract, address])

const leaveApplication = () => {
}

const deployContract = async() => {
  console.log("Deploying the contract");
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
                    <h2 style={{color: "#9393a7",fontSize: "25px"}}>My address: {address}</h2>
                    <br></br>
                    <h2 style={{color: "#9393a7",fontSize: "25px"}}>Create contract</h2>
                </div>
            </section>

            <section>
            <div className='container'>
                <div style={{color: "white"}}>
                    {
                        isSubmitting
                            ? <Loader active inline='centered' style={{background: '#16191e',color: "white",fontSize: "25px",marginWidth: "20 20 20 20"}}/>
                            : <Form onSubmit={handleSubmit} style={{background: '#16191e',color: "white",fontSize: "25px",marginWidth: "20 20 20 20"}}>
                                <Form.Input style={{background: 'white',color: "#9393a7",fontSize: "25px",alignItems: "inherit", paddingLeft: "0", paddingRight: "0", paddingBottom: "0", paddingTop: "0"}}
                                    placeholder='Názov hry'
                                    name='title'
                                    onChange={handleChange}
                                />
                                <Form.Input style={{background: 'white',color: "#9393a7",fontSize: "25px",alignItems: "inherit", paddingLeft: "0", paddingRight: "0", paddingBottom: "0", paddingTop: "0"}}
                                    placeholder='Stávka v ETH, min. 0.02'
                                    name='description'
                                    onChange={handleChange}
                                />
                                <Button type='submit'>Deploy contract</Button>
                            </Form>
                    }
                </div>
                    <br></br>
            </div>
            </section>
            <section>
                <div className='container' style={{background: '#16191e',color: "#9393a7",fontSize: "35px",}}>
                Errors :
                    <div id='box'></div>
                    <p>{error}</p>
                </div>
            </section>
            
        </div>
        
    </div>

    
  )
}

/*Index.getInitialProps = async () => {
    
  }
*/
export default Index;