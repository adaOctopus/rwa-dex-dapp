// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IRouter.sol";
import "./interfaces/IPair.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IERC20.sol";
import "./libraries/RouterLibrary.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Router is IRouter, ReentrancyGuard {
    
    address public immutable override factory;
    address public immutable override WETH;
    
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "Router: EXPIRED");
        _;
    }
    
    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }
    
    receive() external payable {
        assert(msg.sender == WETH); // Only accept ETH via fallback from the WETH contract
    }
    
    // Add liquidity to a pair
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        address pair = IFactory(factory).getPair(tokenA, tokenB);
        if (pair == address(0)) {
            IFactory(factory).createPair(tokenA, tokenB);
            pair = IFactory(factory).getPair(tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = RouterLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = RouterLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Router: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = RouterLibrary.quote(amountBDesired, reserveA, reserveB);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "Router: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
        _safeTransferFrom(tokenA, msg.sender, pair, amountA);
        _safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IPair(pair).mint(to);
    }
    
    // Remove liquidity from a pair
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) public override ensure(deadline) nonReentrant returns (uint256 amountA, uint256 amountB) {
        address pair = IFactory(factory).getPair(tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = IPair(pair).burn(to);
        (address token0,) = RouterLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "Router: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "Router: INSUFFICIENT_B_AMOUNT");
    }
    
    // Swap exact tokens for tokens
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        amounts = RouterLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Router: INSUFFICIENT_OUTPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, IFactory(factory).getPair(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }
    
    // Swap tokens for exact tokens
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant returns (uint256[] memory amounts) {
        amounts = RouterLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "Router: EXCESSIVE_INPUT_AMOUNT");
        _safeTransferFrom(path[0], msg.sender, IFactory(factory).getPair(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }
    
    // Get amounts out
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view override returns (uint256[] memory) {
        return RouterLibrary.getAmountsOut(factory, amountIn, path);
    }
    
    // Get amounts in
    function getAmountsIn(uint256 amountOut, address[] calldata path) external view override returns (uint256[] memory) {
        return RouterLibrary.getAmountsIn(factory, amountOut, path);
    }
    
    // Internal swap function
    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = RouterLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address pair = IFactory(factory).getPair(input, output);
            address to = i < path.length - 2 ? IFactory(factory).getPair(output, path[i + 2]) : _to;
            IPair(pair).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }
    
    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Router: TRANSFER_FROM_FAILED");
    }
}

