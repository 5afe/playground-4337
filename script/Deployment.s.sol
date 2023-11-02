// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.21;

import {Script, console2} from "forge-std/Script.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";

import {Factory} from "../src/Factory.sol";

contract Deployment is Script {
    function run() public {
        uint256 deployer = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployer);
        EntryPoint entrypoint = new EntryPoint();
        Factory factory = new Factory();
        vm.stopBroadcast();

        console2.log("deployed entrypoint", address(entrypoint));
        console2.log("deployed factory", address(factory));
    }
}
