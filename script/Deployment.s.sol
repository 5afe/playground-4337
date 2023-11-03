// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";

import {EntryPoint} from "./artifacts/EntryPoint.sol";
import {Create2} from "./util/Create2.sol";
import {Factory} from "../src/Factory.sol";

contract Deployment is Script {
    function run() public {
        Create2.setup();

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        address factory = Create2.deploy(0, type(Factory).creationCode);
        address entrypoint = Create2.deploy(EntryPoint.SALT, EntryPoint.CODE);
        require(entrypoint == EntryPoint.ADDRESS);
        vm.stopBroadcast();

        console2.log("deployed factory", factory);
        console2.log("deployed entrypoint", entrypoint);
    }
}
