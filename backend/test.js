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

const upload_image = () => {
    var upload = multer({ storage: storage }).single('file');

    upload(req, res, async function (error) {

        if (error) {
            return res.end('Error Uploading File');
        } else {
            const filename = req.file.filename;

            console.log("file uploaded : ", filename);
        }
    });
}

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