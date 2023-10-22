const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const multer = require('multer');
const Web3 = require('web3');
const { ethers } = require("ethers");
const { Property } = require('../Database/Models');
const { storage } = require('./utils');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const web3 = new Web3("HTTP://127.0.0.1:7545");
const realJsonString = fs.readFileSync('solidiy/contractAddr/Real.json', 'utf-8');
const realObject = JSON.parse(realJsonString);
const realestateContractAddress = realObject.addr;
const escrowJsonString = fs.readFileSync('solidiy/contractAddr/Escrow.json', 'utf-8');
const escrowObject = JSON.parse(escrowJsonString);
const escrowContractAddress = escrowObject.addr;
const realestateContractJson = require('../solidiy/build/contracts/RealEstate.json');
const realestateContract = new web3.eth.Contract(realestateContractJson.abi, realestateContractAddress);

const total_supply_promise = function (account_id) {
    return new Promise(function (resolve, reject) {
        realestateContract.methods.totalSupply().call({ gasLimit: 3000000, from: account_id }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}

const upload_image_promise = function (filename) {
    return new Promise(async function (resolve, reject) {
        const formData = new FormData();
        const src = `uploads/${filename}`;

        const file = fs.createReadStream(src)
        formData.append('file', file)

        const pinataMetadata = JSON.stringify({
            name: filename,
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
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`
                }
            });
            resolve(res.data);
        } catch (error) {
            reject(error);
        }
    })
}

const upload_json_promise = function (content) {
    return new Promise(async function (resolve, reject) {
        try {
            const data = JSON.stringify({
                pinataContent: content,
                pinataMetadata: {
                    name: "Pinnie NFT Metadata",
                },
            });

            const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PINATA_JWT}`
                },
                body: data
            })
            const resData = await res.json()
            resolve(resData.IpfsHash);
        } catch (error) {
            reject(error)
        }
    })
}

const mint_nft_promise = function (tokenURI, from) {
    return new Promise(async function (resolve, reject) {
        realestateContract.methods.mint(from, tokenURI).send({ gasLimit: 3000000, from: from }, async (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
}

const mint_nft = (req, res) => {
    var upload = multer({ storage: storage }).single('file');

    upload(req, res, async function (error) {
        if (error) {
            return res.end('Error Uploading File');
        }
        else {
            data = {
                "name": "Luxury NYC Penthouse",
                "address": "157 W 57th St APT 49B, New York, NY 10019",
                "description": "Luxury Penthouse located in the heart of NYC",
                "image": "",
                "id": "",
                "attributes": [
                    {
                        "trait_type": "price",
                        "value": 20
                    },
                    {
                        "trait_type": "type",
                        "value": "1bhk"
                    },
                    {
                        "trait_type": "Bed Rooms",
                        "value": 2
                    },
                    {
                        "trait_type": "Bathrooms",
                        "value": 3
                    },
                    {
                        "trait_type": "sqft",
                        "value": 123
                    },
                    {
                        "trait_type": "emi",
                        "value": 10
                    }
                ]
            }
            const pinatabaseurl = `https://gateway.pinata.cloud/ipfs/`
            const filename = req.file.filename;
            const owner = req.body.account_address

            const image_upload_response = await upload_image_promise(filename);
            const IpfsHash = image_upload_response.IpfsHash
            // const IpfsHash = "QmXGFPvcdQvTH1yiPYFbGa384Epu7qgE1nWwvVEKa9aKNS" //image_upload_response.IpfsHash
            const imageurl = pinatabaseurl + IpfsHash;
            data["image"] = imageurl;
            const id = await total_supply_promise(owner);
            data["id"] = 1 + +id;

            const json_upload_response = await upload_json_promise(data);
            const jsonurl = pinatabaseurl + json_upload_response;
            // const jsonurl = pinatabaseurl + "QmSCgBBCjon2SAbvXpqGLhmGci7EnKbf21R3sywzaxEcmE";

            const property_data = {
                nft_id: data["id"],
                owner: owner,
                price: data["attributes"][0].value,
                emi: data["attributes"][5].value,
                addr: data["address"],
                type: data["attributes"][1].value,
                sqft: data["attributes"][4].value,
                status: "owned",
                bed_rooms: data["attributes"][2].value,
                bath_rooms: data["attributes"][3].value,
                image: data["image"],
                metadata: jsonurl
            }

            const mint_response = await mint_nft_promise(jsonurl, owner);

            const property = new Property(property_data);
            property.save();

            res.send({ "msg": "property added/minted successfully", "txn": mint_response });
        }
    });
}

// approve
const approve_promise = function (nftID, current_owner) {
    return new Promise(async function (resolve, reject) {
        realestateContract.methods.approve(escrowContractAddress, nftID).send({ from: current_owner }, function (err, res) {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    })
}

const approve = async (req, res) => {
    const { nftID, current_owner } = req.body;

    const approve_response = await approve_promise(nftID, current_owner);
    console.log(approve_response);

    res.send({ "msg": `approved` })
}

// ownerOf
const owner_of_primse = function(nftID, from) {
    return new Promise(async function(resolve, reject) {
        realestateContract.methods.ownerOf(nftID).call({ from: from }, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
}

const owner_of = async (req, res) => {
    const {nftID, from} = req.body;
    const owner_of_response = await owner_of_primse(nftID, from); 
    console.log(owner_of_response);;
    res.send({"owner": `${owner_of_response}`});
}


// print all previous and current owners of a perticular nft

async function getAllOwners(tokenId) {
    const transfers = await realestateContract.getPastEvents('Transfer', {
        filter: { tokenId },
        fromBlock: 0,
        toBlock: 'latest'
    });

    const owners = transfers.map(event => event.returnValues.from);

    const currentOwner = await realestateContract.methods.ownerOf(tokenId).call();

    owners.push(currentOwner);
    owners.shift();
    return owners;
}

const get_all_owners = async (req, res) => {
    const tokenId = req.query.tokenId;
    const owners = await getAllOwners(tokenId);
    res.json(owners)
}


// get all nft owned by a perticular account presently


async function getOwnedNFTs(ownerAddress) {
    const totalSupply = await realestateContract.methods.totalSupply().call();

    const ownedNFTs = [];
    for (let i = 1; i <= totalSupply; i++) {
        const tokenId = i;
        const currentOwner = await realestateContract.methods.ownerOf(tokenId).call();

        if (currentOwner.toLowerCase() === ownerAddress.toLowerCase()) {
            ownedNFTs.push(tokenId);
        }
    }

    return ownedNFTs;
}

const get_owned_nfts = async (req, res) => {
    const account = req.query.account_address;
    const nftIds = await getOwnedNFTs(account);

    res.json(nftIds);
} 


// get nfts owned both present and previous with timestamp

async function getNFTOwnershipHistory(ownerAddress) {
    const transferEvents = await realestateContract.getPastEvents('Transfer', {
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

const get_ownership_history = async (req, res) => {
    const acc = req.query.account_address;
    const history = await getNFTOwnershipHistory(acc);

    res.json(history);
}


module.exports = {
    mint_nft,
    approve,
    owner_of,
    get_all_owners,
    get_owned_nfts,
    get_ownership_history
}

/*

API Key: 75b0b1f0334a1630f2e3
 API Secret: 89f595beaa54a58eca303118d57bf610362eb34e424441b8477fab03280a037e
 JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzOTQ0Y2Q0MC1iODM1LTQ1ZDYtYTNmYy0wNGNhZTFiMmVjOWQiLCJlbWFpbCI6InZzcGF0aWw4MTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3NWIwYjFmMDMzNGExNjMwZjJlMyIsInNjb3BlZEtleVNlY3JldCI6Ijg5ZjU5NWJlYWE1NGE1OGVjYTMwMzExOGQ1N2JmNjEwMzYyZWIzNGU0MjQ0NDFiODQ3N2ZhYjAzMjgwYTAzN2UiLCJpYXQiOjE2OTc5OTU2MDV9.CvSRPANzHH4azN242DW977tGT8QO5xGILlfIV6kFACM

*/