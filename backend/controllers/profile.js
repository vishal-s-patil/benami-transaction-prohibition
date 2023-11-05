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
            const filename = req.file.filename;
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
                                        res.json({ user_data });
                                    }).catch(err => {
                                        console.log('xml parsing failed', err);
                                    })
                            }).catch(err => {
                                console.log('extraction failed', err);
                            })
                        return;
                    }
                    else {
                        res.json({
                            "msg": "failed"
                        })
                        return;
                    }
                })
        }
    });
}

const is_correct_uuid = (req, res) => {
}

const get_user_data = async (req, res) => {
    const account_address = req.query.account_address;
    if (account_address == undefined) {
        const users = await User.find({});
        res.send(users);
    } else {
        const users = await User.find({ account_address });
        if (users.length == 0) {
            res.status(404).send({ "msg": "No records found" });
        }
        else {
            res.send(users);
        }
    }
}

const get_user_requests = async (req, res) => {
    const { userId } = req.query;
    if (userId == undefined) {
        let all_user_requests = await UserRequests.find();
        // console.log(all_user_requests);
        res.status(200).json(all_user_requests);
        return;
    }
    // console.log(userId);
    let requests = await UserRequests.findOne({ metamaskId: userId });
    // console.log('requests', requests);
    res.status(200).json(requests["data"]);
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
    const { requestFrom, requestTo, nftId, amount } = req.body;

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
    if (account_address == undefined) {
        let all_user_lenders = await LoanRepayment.find();
        // console.log(all_user_lenders);
        res.status(200).json(all_user_lenders);
        return;
    }
    let filter = { metamaskId: account_address }
    const data = await LoanRepayment.findOne(filter);
    res.status(200).json(data["data"]);
}

const add_lenders = async (req, res) => {
    const { buyer, lender, amount } = req.body;
    
    const new_lender = {
        lender : lender,
        amount: amount
    }

    const filter = {metamaskId : buyer}
    const update = {$push: {data: new_lender}}

    const result = await LoanRepayment.updateOne(filter, update);

    // console.log(result);

    if(result["acknowledged"] == true) {
        res.status(200).json({"msg": "lender added successfully"})
        return;
    }
    else {
        res.json({"msg": "error adding lender"})
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

    if (response.data["msg"] == msg) {
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
