// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Lending pool with cToken pattern (like Compound)
contract LendingPool is ERC20, ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable underlying;
    
    uint256 public constant INITIAL_EXCHANGE_RATE = 1e18; // 1:1 initial rate
    uint256 public exchangeRateStored;
    uint256 public totalBorrows;
    uint256 public totalReserves;
    uint256 public reserveFactor = 0.1e18; // 10% reserve factor
    
    // Interest rate model parameters
    uint256 public baseRate = 0.02e18; // 2% base rate
    uint256 public multiplier = 0.2e18; // 20% multiplier
    uint256 public constant MAX_BORROW_RATE = 0.5e18; // 50% max
    
    // Collateralization
    uint256 public constant COLLATERAL_FACTOR = 0.75e18; // 75% collateral factor
    uint256 public constant LIQUIDATION_THRESHOLD = 0.8e18; // 80% liquidation threshold
    
    mapping(address => uint256) public borrowBalanceStored;
    mapping(address => uint256) public lastUpdateBlock;
    
    event Mint(address indexed minter, uint256 mintAmount, uint256 mintTokens);
    event Redeem(address indexed redeemer, uint256 redeemAmount, uint256 redeemTokens);
    event Borrow(address indexed borrower, uint256 borrowAmount);
    event RepayBorrow(address indexed payer, address indexed borrower, uint256 repayAmount);
    event LiquidateBorrow(address indexed liquidator, address indexed borrower, uint256 repayAmount);
    
    constructor(address _underlying) ERC20("cToken", "cTKN") Ownable(msg.sender) {
        underlying = IERC20(_underlying);
        exchangeRateStored = INITIAL_EXCHANGE_RATE;
    }
    
    // Supply assets to the pool
    function mint(uint256 mintAmount) external nonReentrant whenNotPaused {
        require(mintAmount > 0, "LendingPool: INVALID_AMOUNT");
        
        _accrueInterest();
        uint256 exchangeRate = exchangeRateStored;
        uint256 mintTokens = (mintAmount * 1e18) / exchangeRate;
        
        require(mintTokens > 0, "LendingPool: MINT_ERROR");
        
        _mint(msg.sender, mintTokens);
        require(IERC20(underlying).transferFrom(msg.sender, address(this), mintAmount), "LendingPool: TRANSFER_FAILED");
        
        emit Mint(msg.sender, mintAmount, mintTokens);
    }
    
    // Redeem cTokens for underlying
    function redeem(uint256 redeemTokens) external nonReentrant {
        require(redeemTokens > 0, "LendingPool: INVALID_AMOUNT");
        require(balanceOf[msg.sender] >= redeemTokens, "LendingPool: INSUFFICIENT_BALANCE");
        
        _accrueInterest();
        uint256 exchangeRate = exchangeRateStored;
        uint256 redeemAmount = (redeemTokens * exchangeRate) / 1e18;
        
        require(redeemAmount > 0, "LendingPool: REDEEM_ERROR");
        require(IERC20(underlying).balanceOf(address(this)) >= redeemAmount, "LendingPool: INSUFFICIENT_LIQUIDITY");
        
        _burn(msg.sender, redeemTokens);
        require(IERC20(underlying).transfer(msg.sender, redeemAmount), "LendingPool: TRANSFER_FAILED");
        
        emit Redeem(msg.sender, redeemAmount, redeemTokens);
    }
    
    // Borrow assets from the pool
    function borrow(uint256 borrowAmount) external nonReentrant whenNotPaused {
        require(borrowAmount > 0, "LendingPool: INVALID_AMOUNT");
        
        _accrueInterest();
        require(_checkCollateral(msg.sender, borrowAmount), "LendingPool: INSUFFICIENT_COLLATERAL");
        require(IERC20(underlying).balanceOf(address(this)) >= borrowAmount, "LendingPool: INSUFFICIENT_LIQUIDITY");
        
        borrowBalanceStored[msg.sender] += borrowAmount;
        totalBorrows += borrowAmount;
        lastUpdateBlock[msg.sender] = block.number;
        
        require(IERC20(underlying).transfer(msg.sender, borrowAmount), "LendingPool: TRANSFER_FAILED");
        
        emit Borrow(msg.sender, borrowAmount);
    }
    
    // Repay borrowed amount
    function repayBorrow(uint256 repayAmount) external nonReentrant {
        uint256 borrowBalance = borrowBalanceStored[msg.sender];
        require(borrowBalance > 0, "LendingPool: NO_BORROW");
        
        _accrueInterest();
        uint256 actualRepayAmount = repayAmount > borrowBalance ? borrowBalance : repayAmount;
        
        require(IERC20(underlying).transferFrom(msg.sender, address(this), actualRepayAmount), "LendingPool: TRANSFER_FAILED");
        
        borrowBalanceStored[msg.sender] -= actualRepayAmount;
        totalBorrows -= actualRepayAmount;
        
        emit RepayBorrow(msg.sender, msg.sender, actualRepayAmount);
    }
    
    // Liquidate undercollateralized position
    function liquidateBorrow(address borrower, uint256 repayAmount) external nonReentrant {
        require(_isLiquidatable(borrower), "LendingPool: NOT_LIQUIDATABLE");
        
        _accrueInterest();
        uint256 borrowBalance = borrowBalanceStored[borrower];
        uint256 actualRepayAmount = repayAmount > borrowBalance ? borrowBalance : repayAmount;
        
        require(IERC20(underlying).transferFrom(msg.sender, address(this), actualRepayAmount), "LendingPool: TRANSFER_FAILED");
        
        borrowBalanceStored[borrower] -= actualRepayAmount;
        totalBorrows -= actualRepayAmount;
        
        // Liquidator gets collateral at discount
        uint256 collateralSeized = (actualRepayAmount * 1e18) / (exchangeRateStored * LIQUIDATION_THRESHOLD / 1e18);
        _transfer(borrower, msg.sender, collateralSeized);
        
        emit LiquidateBorrow(msg.sender, borrower, actualRepayAmount);
    }
    
    function _accrueInterest() internal {
        if (totalBorrows == 0) return;
        
        uint256 borrowRate = getBorrowRate();
        uint256 interestAccumulated = (totalBorrows * borrowRate * (block.number - lastUpdateBlock[address(this)])) / (1e18 * 1e18);
        
        totalBorrows += interestAccumulated;
        uint256 reservesAdded = (interestAccumulated * reserveFactor) / 1e18;
        totalReserves += reservesAdded;
        
        // Update exchange rate
        uint256 totalSupply = totalSupply;
        if (totalSupply > 0) {
            exchangeRateStored = ((IERC20(underlying).balanceOf(address(this)) + totalBorrows - totalReserves) * 1e18) / totalSupply;
        }
        
        lastUpdateBlock[address(this)] = block.number;
    }
    
    function getBorrowRate() public view returns (uint256) {
        if (totalBorrows == 0) return baseRate;
        
        uint256 utilizationRate = (totalBorrows * 1e18) / IERC20(underlying).balanceOf(address(this));
        uint256 borrowRate = baseRate + (utilizationRate * multiplier) / 1e18;
        
        return borrowRate > MAX_BORROW_RATE ? MAX_BORROW_RATE : borrowRate;
    }
    
    function _checkCollateral(address borrower, uint256 borrowAmount) internal view returns (bool) {
        uint256 collateralValue = (balanceOf[borrower] * exchangeRateStored) / 1e18;
        uint256 newBorrowBalance = borrowBalanceStored[borrower] + borrowAmount;
        return (newBorrowBalance * 1e18) <= (collateralValue * COLLATERAL_FACTOR);
    }
    
    function _isLiquidatable(address borrower) internal view returns (bool) {
        uint256 collateralValue = (balanceOf[borrower] * exchangeRateStored) / 1e18;
        uint256 borrowBalance = borrowBalanceStored[borrower];
        return (borrowBalance * 1e18) > (collateralValue * LIQUIDATION_THRESHOLD);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

