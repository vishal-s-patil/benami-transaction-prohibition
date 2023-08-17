const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { extract } = require("./Extract");
const { get_structured_data } = require("./get_structured_data")

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

const send_xml = async (filename) => {
    try {
        const file = fs.createReadStream(`uploads/${filename}`);
        const title = 'digital kyc xml file';

        const form = new FormData();
        form.append('title', title);
        form.append('file', file);

        const resp = await axios.post('http://localhost:5000/verify/upload', form, {
            headers: {
                ...form.getHeaders(),
            }
        });

        if (resp.status === 200) {
            return true; // signature is valid
        }
        else if (resp.status === 406) {
            return false; //signature is not valid
        }
    } catch (err) {
        return new Error(err.message);
    }
}


// function for route handling  
upload_xml = async (req, res) => {
    var upload = multer({ storage: storage }).single('file');

    upload(req, res, function async(error) {

        if (error) {
            return res.end('Error Uploading File');
        } else {
            const filename = req.file.filename;
            console.log("file uploaded : ", filename);

            send_xml(filename).then(async (resp) => {
                if (resp) {
                    extract(filename.slice(0, -4), '2580')
                    .then(() => {
                        get_structured_data(filename.slice(0, -4))
                        .then((user_data) => {
                            res.json({user_data});
                            // console.log(user_data);
                        }).catch(err => {
                            console.log('xml parsing failed', err);
                        })
                    }).catch(err => {
                        console.log('extraction failed', err);
                    })

                    console.log('signature is valid');
                }
                else {
                    res.status(406).send('Invalid signature');
                    console.log('signature is not valid');
                }
            });
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
