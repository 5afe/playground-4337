// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.21;

import {_packValidationData} from "account-abstraction/core/Helpers.sol";
import {IAccount} from "account-abstraction/interfaces/IAccount.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";

contract Account is IAccount {
    error Reverted();

    address public immutable OWNER;

    constructor(address owner) payable {
        OWNER = owner;
    }

    receive() external payable {}

    function validateUserOp(UserOperation calldata, bytes32, uint256 missingAccountFunds)
        external
        returns (uint256 validationData)
    {
        execute(payable(msg.sender), missingAccountFunds, "");
        validationData = _packValidationData(false, 0, 0);
    }

    function execute(address payable to, uint256 value, bytes memory data) public {
        (bool success,) = to.call{value: value}(data);
        if (!success) {
            revert Reverted();
        }
    }
}
