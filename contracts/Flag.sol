// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {_packValidationData} from "@account-abstraction/contracts/core/Helpers.sol";

contract Flag {
    function get() external pure returns (uint256 validationData) {
        validationData = _packValidationData(false, 0, 0);
    }

    function reset() external {
        assembly ("memory-safe") {
            selfdestruct(0)
        }
    }
}
