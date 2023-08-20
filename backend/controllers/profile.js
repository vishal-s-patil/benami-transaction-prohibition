const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { extract } = require("./Extract");
const { get_structured_data } = require("./get_structured_data")
const { User } = require('../Database/Models')

data = {
    users: [{
        account_id: 1234
    }],
}

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
upload_xml = async (req, res) => {
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

is_correct_uuid = (req, res) => {

}

get_user_data = (req, res) => {
    let users = data.users;
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.account_id === req.body.account_id) {
            res.send({
                user_details: user
            })
            return;
        }
    }
    res.send({
        "message": "user not found"
    })
}

module.exports = {
    get_user_data,
    is_correct_uuid,
    upload_xml
}
