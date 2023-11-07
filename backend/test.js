// data base connection 
/*
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const db = require('./Database/database_connection')
userSchema = require('./Database/Schemas')

const User = mongoose.model('users', userSchema);

User.find({})
    .then((result) => {
        console.log('res', result);
        db.close();
    }).catch((err) => {
        console.log(err);
    });
*/

// pinata 

/*
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const multer = require('multer');
const JWT = process.env.JWT;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const pinFileToIPFS = async () => {
    const formData = new FormData();
    const src = `uploads/buliding.jpeg`;

    const file = fs.createReadStream(src)
    formData.append('file', file)

    const pinataMetadata = JSON.stringify({
        name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(res.data);
    } catch (error) {
        console.log(error);
    }
}

pinFileToIPFS()

*/

// print all owners 
/*

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

const contractAddress = '0xD973859260E6c696b8D3FF7bcB1F1F0D61Acde57';
const tokenId = 1;
const realestateContractJson = require('./solidiy/build/contracts/RealEstate.json');

const contract = new web3.eth.Contract(realestateContractJson.abi, contractAddress);

async function getPrevOwners() {
    const transfers = await contract.getPastEvents('Transfer', {
        filter: { tokenId },
        fromBlock: 0,
        toBlock: 'latest'
    });

    const owners = transfers.map(event => event.returnValues.from);

    const currentOwner = await contract.methods.ownerOf(tokenId).call();

    owners.push(currentOwner);
    owners.shift();
    console.log(owners);
}

getPrevOwners();

*/


// get all nft owned by a perticular account

/*

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

const contractAddress = '0xD973859260E6c696b8D3FF7bcB1F1F0D61Acde57';
const tokenId = 1;
const realestateContractJson = require('./solidiy/build/contracts/RealEstate.json');

const contract = new web3.eth.Contract(realestateContractJson.abi, contractAddress);
const ownerAddress = "0x4316757F333A6d81116cac3aeA4Aa0238075077c"

async function getOwnedNFTs() {
    const totalSupply = await contract.methods.totalSupply().call();

    const ownedNFTs = [];
    for (let i = 1; i <= totalSupply; i++) {
        const tokenId = i;
        const currentOwner = await contract.methods.ownerOf(tokenId).call();

        if (currentOwner.toLowerCase() === ownerAddress.toLowerCase()) {
            ownedNFTs.push(tokenId);
        }
    }

    return ownedNFTs;
}

getOwnedNFTs().then((nftIds) => {
    console.log(`NFTs owned by ${ownerAddress}:`, nftIds);
});

*/



// get nfts owned both present and previous with timestamp
/*

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

const contractAddress = '0xD973859260E6c696b8D3FF7bcB1F1F0D61Acde57';
const tokenId = 1;
const realestateContractJson = require('./solidiy/build/contracts/RealEstate.json');

const contract = new web3.eth.Contract(realestateContractJson.abi, contractAddress);
const ownerAddress = "0xF3C537a35cFaE525955Aa822Fd8CFa49F74A685B"

async function getNFTOwnershipHistory() {
    const transferEvents = await contract.getPastEvents('Transfer', {
        fromBlock: 0, // Start from the beginning
        toBlock: 'latest', // Up to the latest block
        filter: {
            to: ownerAddress, // Filter for transfers to the owner's address
        },
    });

    const ownershipHistory = [];

    for (const event of transferEvents) {
        const { blockNumber, returnValues, transactionHash } = event;
        const timestamp = (await web3.eth.getBlock(blockNumber)).timestamp;
        ownershipHistory.push({
            tokenId: returnValues.tokenId,
            timestamp,
            transactionHash,
        });
    }

    return ownershipHistory;
}

getNFTOwnershipHistory().then((history) => {
    console.log('NFT Ownership History:', history);
});

*/

const { utils } = require('ethers');
const { ethers } = require("ethers");
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
console.log(tokens(10));