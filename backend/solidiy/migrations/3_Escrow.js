const Escrow = artifacts.require("Escrow");
const fs = require('fs');

module.exports = function (deployer) {
    const realJsonString = fs.readFileSync('contractAddr/Real.json', 'utf-8');
    const realObject = JSON.parse(realJsonString);
    //const acc = "0xcA602321e9dc0c6247cD3a264CeFB610DD1075eE";
    deployer.deploy(Escrow)
    .then(() => {
        let obj = {
            addr: Escrow.address
        };
        const jsonString = JSON.stringify(obj);
        fs.writeFileSync('contractAddr/Escrow.json', jsonString, (err) => {
            if (err) {
                console.log(err);
                return;
            }
        });
    })
};