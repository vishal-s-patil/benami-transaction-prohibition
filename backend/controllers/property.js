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

const status_change = async (req, res) => {
    const { id, status } = req.body;
    const filter = {nft_id: id}
    const update = { $set : {status: status} }

    const result = await Property.updateOne(filter, update);

    if(result["acknowledged"] == true) {
        res.status(200).json({"msg": "Status update successful"})
        return;
    }
    else {
        res.json({"msg": "error updating Status"})
    }
}

module.exports = {
    get_properties,
    status_change
}