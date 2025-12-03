// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function update(address tokenA, address tokenB) external;
    function consult(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256 amountOut);
    function getPrice(address tokenA, address tokenB) external view returns (uint256 price);
}

