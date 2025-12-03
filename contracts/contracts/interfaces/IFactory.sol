// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint256) external view returns (address pair);
    function allPairsLength() external view returns (uint256);
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function setFeeTo(address) external;
    function feeTo() external view returns (address);
}

