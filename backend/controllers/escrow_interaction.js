const Web3 = require('web3');
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const multer = require('multer');
const { ethers } = require("ethers");
const { utils } = require('ethers');
const { Property, User } = require('../Database/Models');
const { storage } = require('./utils');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const web3 = new Web3("HTTP://127.0.0.1:7545");
const escrowJsonString = fs.readFileSync('solidiy/contractAddr/Escrow.json', 'utf-8');
const escrowObject = JSON.parse(escrowJsonString);
const escrowContractAddress = escrowObject.addr;
const realJsonString = fs.readFileSync('solidiy/contractAddr/Real.json', 'utf-8');
const realObject = JSON.parse(realJsonString);
const realestateContractAddress = realObject.addr;
const escrowContractJson = require('../solidiy/build/contracts/Escrow.json');
const escrowContract = new web3.eth.Contract(escrowContractJson.abi, escrowContractAddress);


// init
const init_promise = function (nftAddress, seller, inspector) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.init(nftAddress, seller, inspector).send({ gasLimit: 3000000, from: seller }, (err, result) => {
            if (err) {
                console.log('error in init promise');
                // reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const init = async (req, res) => {
    const { seller, inspector } = req.body;
    try {
        const init_response = await init_promise(realestateContractAddress, seller, inspector);
        // console.log(init_response);
        console.log('success full init');
        res.send({ "msg": "initialized successfully" });
    }
    catch(err) {
        console.log('error in init');
    }
}

// list
const list_promise = function (nftID, purchasePrice, escrowAmount, seller) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.list(nftID, tokens(purchasePrice), tokens(escrowAmount)).send({ gasLimit: 3000000, from: seller }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const list = async (req, res) => {
    const { nftID, purchasePrice, escrowAmount, seller } = req.body;
    console.log("list");
    console.log("nftID", nftID);
    console.log("purchasePrice", purchasePrice);
    console.log("escrowAmount", escrowAmount);
    console.log("seller", seller);
    console.log();


    try {
        const filter = {nft_id: nftID}
        const update = {$set: {emi: escrowAmount}}
        await Property.updateOne(filter, update);
    }
    catch {
        console.log('err in updatin emi');
        res.send('err');
    }

    try {
        const list_response = await list_promise(nftID, purchasePrice, escrowAmount, seller);
        // console.log(list_response);
        console.log('listed');
        res.send({ "msg": `listed successfully` });
    }
    catch(err){
        console.log('error in list', err);
        res.send('err');
    }
}

// setBuyer
const set_buyer_promise = function (nftID, buyer, seller) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.setByuer(nftID, buyer).send({ gasLimit: 3000000, from: seller }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const set_buyer = async (req, res) => {
    const { nftID, buyer, seller } = req.body;

    // console.log('set buyer', nftID, buyer, seller);
    try {
        const set_buyer_response = await set_buyer_promise(nftID, buyer, seller);
        // console.log(set_buyer_response);
        console.log('set buyer successfully');
        res.send({ "msg": `buyer set` });
    }
    catch(err) {
        console.log('err in set buyer', err);
        res.send('err');
    }
}

// setLender
const set_lender_promise = function (lender, buyer) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.setLender(lender).send({ gasLimit: 3000000, from: buyer }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const set_lender = async (req, res) => {
    const { lender, buyer } = req.body;

    // console.log('set lender', lender, buyer);

    try {
        const set_lender_response = await set_lender_promise(lender, buyer);
        // console.log(set_lender_response);
        console.log('set lender successful');
        res.send({ "msg": `lender set` });
    }
    catch(err) {
        console.log('err in set lender', err);
        res.send('err');
    }
}

// depositEarnest
const deposit_earnest_promise = function (nftID, buyer, amt) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.depositEarnest(nftID).send({ gasLimit: 3000000, from: buyer, value: tokens(amt) }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const deposit_earnest = async (req, res) => {
    const { nftID, buyer, amt, seller, lender, inspector } = req.body;

    console.log('deposit earnest');
    console.log("nftID", nftID);
    console.log('buyer', buyer);
    console.log("amt", amt);
    console.log('seller', seller);
    console.log("lender", lender);
    console.log('inspector', inspector);
    console.log();

    try {
        const deposit_earnest_response = await deposit_earnest_promise(nftID, buyer, amt);
        // console.log('deposit_earnest_response', deposit_earnest_response);
        await updateInspectionStatus(nftID, true, inspector);
        const buyer_aprove_sale_response = await approve_sale_promise(nftID, buyer);
        const seller_aprove_sale_response = await approve_sale_promise(nftID, seller);
        const lender_aprove_sale_response = await approve_sale_promise(nftID, lender);
        // console.log('buyer_aprove_sale_response', buyer_aprove_sale_response);
        // console.log('seller_aprove_sale_response', seller_aprove_sale_response);
        // console.log('lender_aprove_sale_response', lender_aprove_sale_response);
        console.log("buyer approved", buyer);
        console.log("seller approved", seller);
        console.log("lender approved", lender);
        console.log('deposit done', nftID);
        res.send({ "msg": `deposit done` });
    }
    catch(err) {
        console.log('err in depoit earnest', err);
        res.send('err');
    }
}

// updateInspectionStatus
async function updateInspectionStatus(nftID, isPassed, inspector) {
    escrowContract.methods.updateInspectionStatus(nftID, isPassed).send({ gasLimit: 3000000, from: inspector }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log('inspected : ', result);
        }
    })
}

// approve sale
const approve_sale_promise = function (nftID, user) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.approveSale(nftID).send({ gasLimit: 3000000, from: user }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

// getBalanceInContract
const get_balance_in_contract_promise = function () {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.getBalance().call({ gasLimit: 3000000 }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const get_balance_in_contract = async (req, res) => {
    const get_balance_in_contract_respose = await get_balance_in_contract_promise();
    const amt = utils.formatUnits(get_balance_in_contract_respose, 'ether')
    console.log('balance in contract', amt);
    res.send({ "value": `${tokens(amt)}` });
}

// sendAmount
const send_amount = async (req, res) => {
    const { from, amt } = req.body;
    web3.eth.sendTransaction({ from: from, to: escrowContractAddress, value: tokens(amt) });
    console.log('amount sent from', from);
    res.send({ "msg": "amount sent" });
}

// repayment of loan
const loan_repayment = async (req, res) => {
    const { from, to, amt } = req.body;
    web3.eth.sendTransaction({ from: from, to: to, value: tokens(amt) });
    console.log('loan repayment from', from);
    console.log('to', to);
    res.json({ "msg": "loan repayment successful" });
}

// finalizeSale
const finalize_sale_promise = function (nftID, seller) {
    return new Promise(async function (resolve, reject) {
        escrowContract.methods.finalizeSale(nftID).send({ gasLimit: 3000000, from: seller }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const finalize_sale = async (req, res) => {
    const { nftID, from, buyer} = req.body;
    // console.log('finailize sale', nftID, from);
    try {
        const finalize_sale_response = await finalize_sale_promise(nftID, from);
        // console.log(finalize_sale_response);
        const result = await Property.updateOne({nft_id: nftID}, {$set: {owner: buyer}});
        if(result["acknowledged"] == true) {
            console.log('sale finalised');
            res.send({ "msg": "propety transfered" });
        }
        else {
            console.log('err updaitng db in finalize sale');
            res.send('err');
        }
    }
    catch(err) {
        console.log('err in finalize sale', err);
        res.send('err');
    }
}

module.exports = {
    init,
    list,
    set_buyer,
    set_lender,
    deposit_earnest,
    get_balance_in_contract,
    send_amount,
    finalize_sale,
    loan_repayment
}