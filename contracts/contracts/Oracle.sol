// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IOracle.sol";
import "./interfaces/IPair.sol";
import "./interfaces/IFactory.sol";
import "./libraries/UQ112x112.sol";

// TWAP Oracle implementation for price feeds
contract Oracle is IOracle {
    using UQ112x112 for uint224;
    
    address public immutable factory;
    uint256 public constant PERIOD = 1 hours; // TWAP period
    
    struct Observation {
        uint256 timestamp;
        uint256 price0Cumulative;
        uint256 price1Cumulative;
    }
    
    mapping(address => Observation) public observations;
    
    constructor(address _factory) {
        factory = _factory;
    }
    
    function update(address tokenA, address tokenB) external override {
        address pair = IFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Oracle: PAIR_NOT_EXISTS");
        
        (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = IPair(pair).getReserves();
        
        Observation storage observation = observations[pair];
        uint256 timeElapsed = block.timestamp - observation.timestamp;
        
        if (timeElapsed > PERIOD) {
            observation.timestamp = block.timestamp;
            observation.price0Cumulative = price0Cumulative;
            observation.price1Cumulative = price1Cumulative;
        }
    }
    
    function consult(address tokenIn, uint256 amountIn, address tokenOut) external view override returns (uint256 amountOut) {
        address pair = IFactory(factory).getPair(tokenIn, tokenOut);
        require(pair != address(0), "Oracle: PAIR_NOT_EXISTS");
        
        Observation memory observation = observations[pair];
        require(observation.timestamp != 0, "Oracle: NO_OBSERVATION");
        
        (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = IPair(pair).getReserves();
        uint256 timeElapsed = block.timestamp - observation.timestamp;
        
        require(timeElapsed <= PERIOD, "Oracle: PERIOD_NOT_ELAPSED");
        
        bool isToken0 = tokenIn < tokenOut;
        uint256 priceCumulative = isToken0 ? price0Cumulative : price1Cumulative;
        uint256 priceCumulativeLast = isToken0 ? observation.price0Cumulative : observation.price1Cumulative;
        
        uint256 averagePrice = (priceCumulative - priceCumulativeLast) / timeElapsed;
        amountOut = amountIn * averagePrice / 2**112;
    }
    
    function getPrice(address tokenA, address tokenB) external view override returns (uint256 price) {
        address pair = IFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Oracle: PAIR_NOT_EXISTS");
        
        (uint112 reserve0, uint112 reserve1,) = IPair(pair).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Oracle: NO_RESERVES");
        
        bool isToken0 = tokenA < tokenB;
        price = isToken0 ? uint256(reserve1) * 1e18 / reserve0 : uint256(reserve0) * 1e18 / reserve1;
    }
}

