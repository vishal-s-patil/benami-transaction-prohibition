//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    // constructor(address _nftAddress, address payable _seller, address _inspector, address _lender) {
    //     nftAddress = _nftAddress;
    //     seller = _seller;
    //     inspector = _inspector;
    //     lender = _lender;
    // }

    constructor(){}

    function init (address _nftAddress, address payable _seller, address _inspector) public returns(address) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        return nftAddress;
    }

    function setLender(address _lender) public {
        lender = _lender;
    }

    function list(uint256 _nftID, uint256 _purchasePrice, uint256 _escrowAmount) public payable returns(address){
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;

        return seller;
    }

    function setByuer(uint256 _nftID, address _buyer) public {
        buyer[_nftID] = _buyer;
    }

    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID], 'deposit amount is less');
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = true;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    function finalizeSale(uint256 _nftID) public {
        // require(inspectionPassed[_nftID], 'insepction failed');
        require(approval[_nftID][buyer[_nftID]], 'approval required');
        require(approval[_nftID][seller], ' approval required');
        require(approval[_nftID][lender], 'lender approval required');
        require(address(this).balance >= purchasePrice[_nftID], 'no enough balance');

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success, 'payable failed in finalizeSale');

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}