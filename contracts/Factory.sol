// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {Account} from "./Account.sol";

contract Factory {
    function create(address owner, uint256 salt) public payable returns (Account account) {
        account = Account(payable(getAccountAddress(owner, salt)));
        if (address(account).code.length == 0) {
            Account deployed = new Account{salt: bytes32(salt), value: msg.value}(owner);
            require(account == deployed);
        } else {
            (bool success,) = payable(account).call{value: msg.value}("");
            require(success);
        }
    }

    function getAccountAddress(address owner, uint256 salt) public view returns (address account) {
        bytes32 code = keccak256(abi.encodePacked(type(Account).creationCode, abi.encode(owner)));
        account = address(uint160(uint256(keccak256(abi.encodePacked(hex"ff", this, salt, code)))));
    }
}
