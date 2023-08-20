const Web3 = require('web3');

const web3 = new Web3("HTTP://127.0.0.1:7545");

const contractAddress = "0x0462b22CCBE14A888995899f60e440A024B549Ad";

const contractJson = require('../solidiy/build/contracts/RealEstate.json')

contract = new web3.eth.Contract(contractJson.abi, contractAddress);


const mint_nft_promise = function(tokenURI, account_id) {
    return new Promise(function(resolve, reject) {
        contract.methods.mint(account_id, tokenURI).send({ gasLimit : 3000000, from : account_id}, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        })
    });
}

const total_supply_promise = function(account_id) {
    return new Promise(function(resolve, reject) {
        contract.methods.totalSupply.call({ gasLimit : 3000000, from : account_id}, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}

const mint_nft = (req, res) => {
    tokenURI = req.tokenURI;
    mint_nft_promise(tokenURI)
    .then(() => {})
    .catch(err => {console.log(err);});
}

const total_supply = (req, res) => {
    total_supply_promise
    .then(result => { console.log(result); })
    .catch(err => { console.log(err); });
}

module.exports = {
    mint_nft,
    total_supply
}