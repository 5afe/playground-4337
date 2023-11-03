// SPDX-License-Identifier: GPL-3.0-or-newer
pragma solidity ^0.8.19;

import {console2} from "forge-std/console2.sol";
import {Vm} from "forge-std/Vm.sol";

Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

library Create2 {
    address internal constant DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function setup() internal {
        if (DEPLOYER.code.length != 0) {
            return;
        }

        // The biggest cheatcode of them all! Basically, this works by building
        // and executing a `curl` command with the FFI cheatcode to deploy the
        // CREATE2 factory contract.
        string memory url = vm.rpcUrl("skynet");
        string memory rpc;
        {
            string[] memory params = new string[](1);
            params[0] =
                "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222";

            vm.serializeString("rpc", "method", "eth_sendRawTransaction");
            vm.serializeString("rpc", "params", params);
            vm.serializeString("rpc", "id", "1337");
            rpc = vm.serializeString("rpc", "jsonrpc", "\"2.0\"");
        }

        string memory curl =
            string(abi.encodePacked("curl -X POST -H 'content-type: application/json' '", url, "' --data '", rpc, "'"));

        console2.log(curl);
    }

    function deploy(bytes32 salt, bytes memory code) internal returns (address instance) {
        instance = address(uint160(uint256(keccak256(abi.encodePacked(hex"ff", DEPLOYER, salt, code)))));
        if (instance.code.length == 0) {
            (bool success,) = DEPLOYER.call(abi.encodePacked(salt, code));
            require(success && instance.code.length != 0);
        }
    }
}
