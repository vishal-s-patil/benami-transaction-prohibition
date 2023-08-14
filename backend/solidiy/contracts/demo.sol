// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

contract demo {
    string public message;

    constructor() {
        message = "hi";
    }

    function setMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}