const { Property } = require('../Database/Models');

const get_properties = async (req, res) => {
    const account_address = req.query.nft_id;
    if (account_address == undefined) {
        // return;
        const Properties = await Property.find({});
        res.send(Properties);
    } else {
        const Properties = await Property.find({ account_address });
        console.log('Properties', Properties);
        if (Properties.length == 0) {
            res.status(200).send({ "msg": "No records found" });
        }
        else {
            res.send(Properties);
        }
    }
}

const status_change = async (req, res) => {
    const { id, status } = req.body;
    console.log('status chage', id, status);
    const filter = {nft_id: id}
    const update = { $set : {status: status} }
    
    
    const result = await Property.updateOne(filter, update);
    // console.log(result);
    
    
    if(result["acknowledged"] == true) {
        res.status(200).json({"msg": "Status update successful"})
    }
    else {
        res.json({"msg": "error updating Status"})
    }
}

module.exports = {
    get_properties,
    status_change
}