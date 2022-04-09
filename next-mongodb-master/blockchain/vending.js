//import Web3 from 'web3'
//const provider = new Web3.providers.HttpProvider(
//    "https://rinkeby.infura.io/v3/5dbf937810e2430686801e5e3b76dcd3"
//)
//const web3 = new Web3(provider)

const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donutBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getP2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVendingMachineBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"join","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"restock","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const vendingMachineContract = web3 => {
    return new web3.eth.Contract(
        abi,
        "0xC612cb71D938960F79f3e773EcABdc352FB6b566"
    )
}

// 0xB0c1b93b0a6Ca6678796A6b6266d0c8D7Be7961a
// 
// 0xB0c1b93b0a6Ca6678796A6b6266d0c8D7Be7961a

// správny
// 0x2519933cBe90d1aA1Ec304663241d98833F51BB7
//const vmContract = new web3.eth.Contract(abi, "0xD711ecA8DC242A886b962078b8c0CdFf83EBEB59")

export default vendingMachineContract