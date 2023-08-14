const Web3 = require('web3');

const web3 = new Web3("HTTP://127.0.0.1:7545");

const realEstateContractAddress = "0x0462b22CCBE14A888995899f60e440A024B549Ad";

contractJson = require('../build/contracts/RealEstate.json')

contract = new web3.eth.Contract(contractJson.abi, realEstateContractAddress);

const seller = "0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262";

async function main() {
    for (let i = 0; i < 3; i++) {
        let tokenURI = `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`;
        txn = await contract.methods.mint(seller, tokenURI).call({ gasLimit : 3000000, from : '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262'});
    }
}

contract.methods.totalSupply().call({ from: '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262' }, function (error, result) {
    if (error) {
        console.log(error);
    }
    else {
        console.log(result);

    }
});

main();

//////////////////////////////////

// const { ethers } = require('ethers');
// const contractJson = require('../build/contracts/RealEstate.json'); // Replace with the actual path
// const { error } = require('console');

// async function deployContract() {
//     const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545'); // Ganache RPC URL
//     const signer = provider.getSigner(0);

//     // const ContractFactory = new ethers.ContractFactory(
//     //     contractJson.abi,
//     //     contractJson.bytecode,
//     //     signer
//     // );

//     // const contract = await ContractFactory.deploy();
//     // await contract.deployed();

//     const contract = new ethers.Contract(
//         '0x0462b22CCBE14A888995899f60e440A024B549Ad', // Replace with the actual contract address
//         contractJson.abi,
//         signer
//     );

//     console.log('Contract deployed at address:', contract.address);

//     try {
//         const recipientAddress = '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262'; 

//         for (let i = 0; i < 3; i++) {
//             const transaction = await contract.mint(recipientAddress, `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`, { gasLimit : 3000000, from : '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262'});
//             await transaction.wait()
//         }

//         console.log('NFT minted successfully');
//         txn = contract.totalSupply();
//         txn.then((result) => {
//             console.log(result);
//         }).catch((err) => {
//             console.log(error);
//         });

//     } catch (error) {
//         console.error('Error minting NFT:', error);
//     }
// }

// deployContract().catch(error => {
//     console.error('Error deploying contract:', error);
// });