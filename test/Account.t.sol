// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.21;

import {Test, console2} from "forge-std/Test.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";

import {Account as AccountContract} from "../src/Account.sol";

contract AccountTest is Test {
    AccountContract public account;

    receive() external payable {}

    function setUp() public {
        account = new AccountContract{value: 1 ether}(address(this));
    }

    function test_TransfersPrefund() public {
        uint256 balance = address(this).balance;
        uint256 missing = 42;

        UserOperation memory op = UserOperation({
            sender: address(account),
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 0,
            verificationGasLimit: 0,
            preVerificationGas: 0,
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 0,
            paymasterAndData: "",
            signature: ""
        });
        account.validateUserOp(op, keccak256(abi.encode(op)), missing);

        assertEq(address(this).balance, balance + missing);
    }
}
