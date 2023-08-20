const Web3 = require('web3');

const web3 = new Web3("HTTP://127.0.0.1:7545");

const contractAddress = "0x99685637057cF02C1e704803098a59C6B092276a";

const contractJson = require('../build/contracts/RealEstate.json')

contract = new web3.eth.Contract(contractJson.abi, contractAddress);

// const Contract = web3.eth.contract(contractJson.abi);
// const contract = Contract.at(contractAddress);

const seller = "0x23282554FFDB6E3270050a81bB84Eb410523f8BF";

async function main() {
    for (let i = 0; i < 1; i++) {
        let tokenURI = `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`;
        contract.methods.mint(seller, tokenURI).send({ gasLimit : 3000000, from : '0x23282554FFDB6E3270050a81bB84Eb410523f8BF'}, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {

            }
        })
    }
}

// contract.methods.totalSupply().call({ from: '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262' }, function (error, result) {
//     if (error) {
//         console.log(error);
//     }
//     else {
//         console.log(result);

//     }
// });

// main();

contract.methods.totalSupply().call({ gasLimit : 3000000, from : '0x23282554FFDB6E3270050a81bB84Eb410523f8BF'}, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
})

//////////////////////////////////

// const { ethers } = require('ethers');
// const contractJson = require('../build/contracts/RealEstate.json'); // Replace with the actual path
// const { error } = require('console');

// async function deployContract() {
//     const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545'); // Ganache RPC URL
//     const signer = provider.getSigner('0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262');

//     // const ContractFactory = new ethers.ContractFactory(
//     //     contractJson.abi,
//     //     contractJson.bytecode,
//     //     signer
//     // );

//     // const contract = await ContractFactory.deploy();
//     // await contract.deployed();

//     const contract = new ethers.Contract(
//         '0x7bb11a86336A17CA72c073bDC9B16aF6AE3e7f97', // Replace with the actual contract address
//         contractJson.abi,
//         signer
//     );

//     console.log('Contract deployed at address:', contract.address);

//     try {
//         const recipientAddress = '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262'; 

//         for (let i = 0; i < 3; i++) {
//             contract.mint(recipientAddress, `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`, { gasLimit : 3000000, from : '0x2Da7B4b9dDaef064bBBD7b2C4C90adD55498f262'})
//             .then(res => {
//                 console.log(res);
//             })
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