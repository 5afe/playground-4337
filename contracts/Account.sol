// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

import {Flag} from "./Flag.sol";

contract Account is IAccount {
    error Reverted();

    Flag public immutable FLAG;
    address payable public immutable OWNER;

    constructor(Flag flag, address payable owner) payable {
        FLAG = flag;
        OWNER = owner;
    }

    receive() external payable {}

    function validateUserOp(
        UserOperation calldata,
        bytes32,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        (, bytes memory value) = address(FLAG).call(
            abi.encodeCall(FLAG.get, ())
        );

        if (value.length == 0) {
            assembly ("memory-safe") {
                invalid()
            }
        } else {
            if (missingAccountFunds > 0) {
                execute(msg.sender, missingAccountFunds, "");
            }
            (validationData) = abi.decode(value, (uint256));
        }
    }

    function execute(address to, uint256 value, bytes memory data) public {
        (bool success, ) = to.call{value: value}(data);
        if (!success) {
            revert Reverted();
        }
    }
}
