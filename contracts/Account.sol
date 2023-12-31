// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {_packValidationData} from "@account-abstraction/contracts/core/Helpers.sol";
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

contract Account is IAccount {
    error Reverted();

    address payable public immutable OWNER;

    constructor(address payable owner) payable {
        OWNER = owner;
    }

    receive() external payable {}

    function validateUserOp(
        UserOperation calldata,
        bytes32,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        if (missingAccountFunds > 0) {
            execute(msg.sender, missingAccountFunds, "");
        }
        validationData = _packValidationData(false, 0, 0);
    }

    function execute(address to, uint256 value, bytes memory data) public {
        (bool success, ) = to.call{value: value}(data);
        if (!success) {
            revert Reverted();
        }
    }
}
