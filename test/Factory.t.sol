// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";

import {Factory} from "../src/Factory.sol";

contract FactoryTest is Test {
    Factory public factory;

    function setUp() public {
        factory = new Factory();
    }

    function test_CreateAccount() public {
        address account = factory.getAccountAddress(address(this), 42);
        assertEq(account.balance, 0);
        assertEq(account.code, "");

        address deployed = address(factory.create{value: 1 ether}(address(this), 42));
        assertEq(account, deployed);
        assertEq(account.balance, 1 ether);
        assert(account.code.length != 0);
    }

    function test_RecreateAccount() public {
        address account1 = address(factory.create{value: 1 ether}(address(this), 42));
        address account2 = address(factory.create{value: 2 ether}(address(this), 42));
        assertEq(account1, account2);
        assertEq(account1.balance, 3 ether);
    }
}
