const { Property } = require('../Database/Models');

const get_properties = async (req, res) => {
    const account_address = req.query.nft_id;
    if (account_address == undefined) {
        const Properties = await Property.find({});
        res.send(Properties);
    } else {
        const Properties = await Property.find({ account_address });
        if (Properties.length == 0) {
            res.status(404).send({ "msg": "No records found" });
        }
        else {
            res.send(Properties);
        }
    }
}

module.exports = {
    get_properties
}