const Web3 = require("web3");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
require('./Database/database_connection')

const port = 8000;
const app = express();

// json parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


// routes
const profile_route = require('./routes/profile_route');
const property_route = require('./routes/property_route');
const nft_interaction_route = require('./routes/nft_interaction_route');
const escrow_interaction_route = require('./routes/escrow_interaction_route');

app.use('/profile', profile_route);
app.use('/property', property_route);
app.use('/nft', nft_interaction_route);
app.use('/escrow', escrow_interaction_route);

app.post('/upload', (req, res) => {
  console.log(req.body);
  res.send('hi');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
