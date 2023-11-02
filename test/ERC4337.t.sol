// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.21;

import {Test, console2} from "forge-std/Test.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";

import {Account as AccountContract} from "../src/Account.sol";
import {Factory} from "../src/Factory.sol";

contract ERC4337Test is Test {
    EntryPoint public entrypoint;
    Factory public factory;

    receive() external payable {}

    function setUp() public {
        entrypoint = new EntryPoint();
        factory = new Factory();
    }

    function test_UserOperation() public {
        address account = factory.getAccountAddress(address(this), 0);
        payable(account).transfer(1 ether);

        address receiver = address(uint160(uint256(keccak256("beneficiary"))));
        address payable beneficiary = payable(address(uint160(uint256(keccak256("beneficiary")))));

        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = UserOperation({
            sender: account,
            nonce: 0,
            initCode: abi.encodePacked(factory, abi.encodeCall(factory.create, (address(this), 0))),
            callData: abi.encodeCall(AccountContract.execute, (receiver, 0.1 ether, "")),
            callGasLimit: 50000,
            verificationGasLimit: 300000,
            preVerificationGas: 0,
            maxFeePerGas: 1 gwei,
            maxPriorityFeePerGas: 0,
            paymasterAndData: "",
            signature: ""
        });
        entrypoint.handleOps(ops, beneficiary);

        uint256 fee = (ops[0].callGasLimit + ops[0].verificationGasLimit) * ops[0].maxFeePerGas;
        assertEq(account.balance, 0.9 ether - fee);
        assertEq(receiver.balance, 0.1 ether);
        assert(beneficiary.balance > 0);
    }
}
