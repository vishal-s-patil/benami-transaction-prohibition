// sepolia Contract : address // 0xb09d6c6bFc75DA451DcD09925EB57137a97791e5

const Web3 = require('web3');
const fs = require('fs');
const { ethers } = require("ethers");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const web3 = new Web3("HTTP://127.0.0.1:7545");

const realJsonString = fs.readFileSync('contractAddr/Real.json', 'utf-8');
const escrowJsonString = fs.readFileSync('contractAddr/Escrow.json', 'utf-8');

const realObject = JSON.parse(realJsonString);
const escrowObject = JSON.parse(escrowJsonString);

const realestateContractAddress = realObject.addr;
const escrowContractAddress = escrowObject.addr;

const realestateContractJson = require('../build/contracts/RealEstate.json')
const escrowContractJson = require('../build/contracts/Escrow.json');

const realestateContract = new web3.eth.Contract(realestateContractJson.abi, realestateContractAddress);
const escrowContract = new web3.eth.Contract(escrowContractJson.abi, escrowContractAddress);


let accounts;
let seller;

async function getAcc() {
    accounts = await web3.eth.getAccounts();
    seller = accounts[0];
}

async function main() {
    for (let i = 0; i < 3; i++) {
        let tokenURI = `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`;
        realestateContract.methods.mint(seller, tokenURI).send({ gasLimit: 3000000, from: seller }, async (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('minted : ', result);
                await total_supply();
            }
        })
    }
}

async function init(nftAddress, seller, inspector) {
    escrowContract.methods.init(nftAddress, seller, inspector).send({ gasLimit: 3000000, from: seller }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('inited : ', result);
        }
    })
}

async function list(nftID, purchasePrice, escrowAmount, seller) {
    escrowContract.methods.list(nftID, tokens(purchasePrice), tokens(escrowAmount)).send({ gasLimit: 3000000, from: seller }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('listed : ', result);
        }
    })
}

async function total_supply() {
    realestateContract.methods.totalSupply().call({ gasLimit: 3000000, from: seller }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('total supply : ', result);
        }
    })
}

async function approve(address, nftID, current_owner) {
    realestateContract.methods.approve(address, nftID).send({ from: current_owner }, function (err, res) {
        if (err) {
            console.log(err);
        }
        console.log('approved : ', res);
    });
}


async function ownerOf(nftID) {
    realestateContract.methods.ownerOf(nftID).call({ from: seller }, function (err, res) {
        if (err) {
            console.log(err);
        }
        console.log('owner : ', res);
    });
}

async function approveSale(nftID, from) {
    escrowContract.methods.approveSale(nftID).send({ gasLimit: 3000000, from: from }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('sale approeved : ', result);
        }
    })
}

async function setBuyer(nftID, buyer, seller) {
    escrowContract.methods.setByuer(nftID, buyer).send({ gasLimit: 3000000, from: seller }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('set buyer : ', result);
        }
    })
}

async function setLender(lender, buyer) {
    escrowContract.methods.setLender(lender).send({ gasLimit: 3000000, from: buyer }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('set lender : ', result);
        }
    })
}


async function depositEarnest(nftID, buyer) {
    escrowContract.methods.depositEarnest(nftID).send({ gasLimit: 3000000, from: buyer, value: tokens(10) }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('deposited : ', result);
        }
    })
} 

async function updateInspectionStatus(nftID, isPassed) {
    escrowContract.methods.updateInspectionStatus(nftID, isPassed).send({ gasLimit: 3000000, from: accounts[1]}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('inspected : ', result);
        }
    })
}

async function getBalanceInContract() {
    escrowContract.methods.getBalance().call({ gasLimit: 3000000 }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('balance in contract : ', result);
        }
    })
}

async function sendAmount(from, to, amt) {
    web3.eth.sendTransaction({ from: from, to: to, value: tokens(amt) } );
}


async function finalizeSale(nftID, seller) {
    escrowContract.methods.finalizeSale(nftID).send({ gasLimit: 3000000, from: seller }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('finilized : ', result);
        }
    })
}


///////////////////

(async function () {
    await getAcc()
    // await main()
    // await total_supply()
    // await approve(escrowContractAddress, 1, accounts[0]);
    // await init(realestateContractAddress, accounts[0], accounts[1]);
    // await list(1, 20, 10, accounts[0]);
    // await setBuyer(1, accounts[3], accounts[0]);
    // await setLender(accounts[2], accounts[3]);
    // await depositEarnest(1, accounts[3]);
    // await updateInspectionStatus(1, true);
    // await approveSale(1, accounts[0]);
    // await approveSale(1, accounts[1]);  
    // await approveSale(1, accounts[2]);
    // await approveSale(1, accounts[3]);  
    // await getBalanceInContract();
    // await ownerOf(1);
    // await sendAmount(accounts[2], escrowContractAddress, 10);
    // await finalizeSale(1, accounts[0]);
})();

// console.log(escrowContract.methods);
// escrowContract.methods.inspector().call(function(err, res){
//     if(err) {
//         console.log(err);
//     }
//     console.log(res);
// });