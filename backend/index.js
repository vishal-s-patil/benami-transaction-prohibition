const Web3 = require("web3");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const { extract } = require("./Extract");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest: "uploads/" });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const port = 8000;

const contractABI = require("./contractABI.json");
const contractAddress = "0x38A3F10Acbe84585C6Ec41A34e33EaC3C7852084";

async function callContractFunction() {
  const web3 = new Web3("http://localhost:7545");
  const accounts = await web3.eth.getAccounts();

  const contract = new web3.eth.Contract(contractABI, contractAddress);

  try {
    const result = await contract.methods
      .getMessage()
      .call({ from: accounts[0] });
    console.log("Function result:", result);
    return result;
  } catch (error) {
    console.error("Error calling contract function:", error);
  }
}

app.get("/", async (req, res) => {
  const message = await callContractFunction();
  res.json({ message: message });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
  } else {
    const file = req.file;
    const pass = req.body.password;

    const fileName = file.filename;

    extract(fileName, pass);

    res.send(`${req.file.originalname} uploaded successfully.`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});