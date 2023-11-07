const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const { extract } = require("./Extract");
const { get_structured_data } = require("./get_structured_data")
const { User, UserRequests, LoanRepayment } = require('../Database/Models');


// storage 

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const send_xml_promise = function (filename) {
    return new Promise(function (resolve, reject) {
        try {
            const file = fs.createReadStream(`uploads/${filename}`);
            const title = 'digital kyc xml file';

            const form = new FormData();
            form.append('title', title);
            form.append('file', file);

            axios.post('http://localhost:5000/verify/upload', form, {
                headers: {
                    ...form.getHeaders(),
                }
            })
                .then(resp => {
                    if (resp.data.msg === 'OK') {
                        resolve("OK");
                    }
                    else {
                        resolve("failed")
                    }
                })
        } catch (err) {
            reject(err);
            return new Error(err.message);
        }
    });
}

// function for route handling  
const upload_xml = async (req, res) => {
    var upload = multer({ storage: storage }).single('file');

    upload(req, res, async function (error) {

        if (error) {
            return res.end('Error Uploading File');
        } else {
            const filename = req.file.originalname;
            const pass = req.body.pass;
            const account_address = req.body.account_address;

            console.log("file uploaded : ", filename);

            send_xml_promise(filename)
                .then((x) => {
                    if (x == "OK") {
                        console.log('signature verified');
                        extract(filename.slice(0, -4), pass)
                            .then(() => {
                                get_structured_data(filename.slice(0, -4))
                                    .then((user_data) => {
                                        user_data.account_address = account_address;
                                        const user = new User(user_data);
                                        user.save();
                                        delete user_data.account_address;
                                        user_data.metamaskId = account_address;
                                        console.log('user_data upload xml'); //user_data
                                        res.json({ user_data });
                                    }).catch(err => {
                                        console.log('xml parsing failed', err);
                                    })
                            }).catch(err => {
                                console.log('extraction failed', err);
                            })
                    }
                    else {
                        res.json({
                            "msg": "failed"
                        })
                        return;
                    }
                }).catch(err => {
                    console.log("send_xml_promise failed");
                })
        }
    });
}

const is_correct_uuid = (req, res) => {
}

const get_user_data = async (req, res) => {
    const account_address = req.query.account_address;
    if (account_address == undefined) {
        // return;
        const users = await User.find({});
        res.send(users);
    } else {
        // console.log('account_address', req.query.account_address)
        let user = await User.findOne({ account_address: req.query.account_address });
        //console.log('users', user);
        // res.status(200).send({ "msg": "No records found" });
        // return;
        if (user == null) {
            res.status(200).send({ "msg": "No records found" });
        }
        else {
            user = user.toJSON();
            user.metamaskId = user.account_address;
            delete user.account_address

            // for(let x in user.toJSON()) {
            //     console.log('x', x);
            //     new_user.x = user[x];
            // }
            // new_user.metamaskId = user.account_address;
            // delete new_user.account_address;
            // console.log("user form get user data ", user);
            res.send(user);
        }
    }
}

const get_user_requests = async (req, res) => {
    const { userId } = req.query;

    // console.log('get user requests', userId);

    if (userId == undefined) {
        // return;
        let all_user_requests = await UserRequests.find();
        console.log("all_user_requests sent");
        res.status(200).json(all_user_requests);
        return;
    }
    // console.log(userId);
    let requests = await UserRequests.findOne({ metamaskId: userId });
    // console.log('requests', requests);
    if (requests != null) {
        console.log(userId, "user request sent");
        res.status(200).json(requests["data"]);
    }
    else res.status(200).json({ "msg": "no user found with requested user id" });
}

const remove_user_request = async (req, res) => {
    const { buyer, lender } = req.body;
    // console.log('body', buyer, lender);
    let result = await UserRequests.findOne({ metamaskId: lender });
    // console.log('result', result);
    let user_requests = result["data"];
    // console.log('user_requests', user_requests);

    const updated_user_requests = user_requests.filter((request) => {
        return request.requestFrom !== buyer;
    });

    // console.log('new_user_requests', updated_user_requests);

    const filter = { metamaskId: lender };
    const update = { $set: { data: updated_user_requests } }

    await UserRequests.updateOne(filter, update);

    res.status(200).json(updated_user_requests);
}

const add_user_request = async (req, res) => {
    let { requestFrom, requestTo, nftId, amount } = req.body;
    console.log('add user request', requestFrom, requestTo, nftId, amount);
    requestFrom = requestFrom.toLowerCase();
    requestTo = requestTo.toLowerCase();

    let user = await UserRequests.findOne({ metamaskId: requestTo });
    if (!user) {
        const new_user = {
            metamaskId: requestTo,
            data: {
                requestFrom: requestFrom,
                nftId: nftId,
                amount: amount
            }
        }
        user = new UserRequests(new_user);
        user.save();
        res.status(200).json({ "msg": "request added successfully" });
    }
    else {
        const new_request = {
            requestFrom: requestFrom,
            nftId: nftId,
            amount: amount
        }

        const filter = { metamaskId: requestTo };

        const update = { $push: { data: new_request } };

        let result = await UserRequests.updateOne(filter, update);

        if (result["acknowledged"] == true) {
            res.status(200).json({ "msg": "request added successfully" });
        }
        else {
            console.log('error adding request');
            res.status(200).json({ "msg": "error adding request" });
        }
    }
    /*
    let data = {
        metamaskId: "metamask id1",
        data: [
            {
                requestFrom: "String 11",
                nftId: 11,
                amount: 11
            },
            {
                requestFrom: "String 12",
                nftId: 12,
                amount: 12
            }
        ]
    }

    let new_request = new UserRequests(data);
    new_request.save();

    data = {
        metamaskId: "metamask id2",
        data: [
            {
                requestFrom: "String 21",
                nftId: 21,
                amount: 21
            },
            {
                requestFrom: "String 22",
                nftId: 22,
                amount: 22
            }
        ]
    }
    new_request = new UserRequests(data);
    new_request.save();

    res.send("data added");
    */

}

const get_lenders = async (req, res) => {
    const { account_address } = req.query;
    console.log('get lenders', account_address);
    if (account_address == undefined) {
        // return;
        let all_user_lenders = await LoanRepayment.find();
        // console.log(all_user_lenders);
        res.status(200).json(all_user_lenders);
        return;
    }
    let filter = { metamaskId: account_address }
    const data = await LoanRepayment.findOne(filter);
    if(!data) {
        res.send('lender not found');
        return;
    }
    res.status(200).json(data["data"]);
}

const add_lenders = async (req, res) => {
    let { buyer, lender, amount } = req.body;
    buyer = buyer.toLowerCase();
    lender = lender.toLowerCase();

    console.log('add lenders', buyer, lender, amount);
    // metamaskId: String,
    // data: [{
    //     lender: String,
    //     loan: Number
    // }]
    let user = await LoanRepayment.findOne({metamaskId: buyer});
    
    if(!user) {
        const new_user = {
            metamaskId: buyer,
            data: {
                lender: lender,
                loan: amount
            }
        }

        user = new LoanRepayment(new_user);
        user.save();
        res.status(200).json({ "msg": "lender added successfully" })
    }
    else {
        const new_lender = {
            lender: lender,
            amount: amount
        }

        const filter = { metamaskId: buyer }
        const update = { $push: { data: new_lender } }

        const result = await LoanRepayment.updateOne(filter, update);

        // console.log(result);

        if (result["acknowledged"] == true) {
            res.status(200).json({ "msg": "lender added successfully" })
        }
        else {
            res.json({ "msg": "error adding lender" })
        }
    }

    /*
    let data = [
        {
            metamaskId: "String 21",
            data: [{
                lender: "metamask id2",
                loan: 21
            }]
        },
        {
            metamaskId: "String 12",
            data: [{
                lender: "metamask id1",
                loan: 12
            }]
        }
    ]

    const insertedData = await LoanRepayment.insertMany(data);

    res.status(200).json(insertedData);
    */
}

const pay_loan = async (req, res) => {
    const { buyer, lender, amount } = req.body;
    const msg = "loan repayment successful";

    const postData = {
        from: buyer,
        to: lender,
        amt: amount
    };

    const response = await axios.post("http://localhost:8000/escrow/loan_repayment", postData);

    console.log('rep', response.data["msg"]);

    if (response.data["msg"] == msg) { //
        const UserRequests_data = await UserRequests.findOne({ metamaskId: lender });
        // console.log('data', UserRequests_data);

        const updated_UserRequests_data = UserRequests_data?.data.filter((ele) => {
            return ele["requestFrom"] !== buyer;
        })
        // console.log('data', updated_UserRequests_data);
        // console.log();

        const lenders_data = await LoanRepayment.findOne({ metamaskId: buyer });
        // console.log('lenders_data', lenders_data);

        const updated_lenders_data = lenders_data?.data.filter(ele => {
            return ele.lender !== lender;
        })

        const UserRequests_update_resp = await UserRequests.updateOne({ metamaskId: lender }, { $set: { data: updated_UserRequests_data } });
        const LoanRepayment_update_resp = await LoanRepayment.updateOne({ metamaskId: buyer }, { $set: { data: updated_lenders_data } });

        if (UserRequests_update_resp["acknowledged"] != true) {
            console.log('error removing UserRequests');
            res.status(200).json({ "msg": "error removing UserRequests" });
        }
        if (LoanRepayment_update_resp["acknowledged"] != true) {
            console.log('error removing loanRequests');
            res.status(200).json({ "msg": "error removing loanRequests" });
        }

        // console.log('updated_lenders_data', updated_lenders_data);


        res.send('amount paid successfully');
    }
}

module.exports = {
    get_user_data,
    is_correct_uuid,
    upload_xml,
    get_user_requests,
    add_user_request,
    remove_user_request,
    get_lenders,
    add_lenders,
    pay_loan
}
