const RealEstate = artifacts.require("RealEstate");
// const { ethers, logger } = require("ethers");

// const tokens = (n) => {
//     return ethers.utils.parseUnits(n.toString(), 'ether')
// }

// async function main() {
//     const url = "HTTP://127.0.0.1:7545";

//     const provider = new ethers.providers.JsonRpcProvider(url);

//     // get signer using address 
//     // provider.getSigner('0x3A34a9a15688D4DbC2cf86237924e79754C65516')
    
//     console.log();
// }

// main()

module.exports = function (deployer) {
    deployer.deploy(RealEstate);
};