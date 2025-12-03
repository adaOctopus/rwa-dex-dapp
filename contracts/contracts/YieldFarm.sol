// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Yield farming contract for staking tokens and earning rewards
contract YieldFarm is ERC20, ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    
    uint256 public rewardRate; // Rewards per block
    uint256 public periodFinish;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    
    uint256 public constant DURATION = 7 days; // Staking period
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) ERC20("Staked Token", "sTKN") Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }
    
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + 
            (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / totalSupply);
    }
    
    function earned(address account) public view returns (uint256) {
        return ((balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
    }
    
    // Stake tokens
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) whenNotPaused {
        require(amount > 0, "YieldFarm: CANNOT_STAKE_0");
        require(IERC20(stakingToken).transferFrom(msg.sender, address(this), amount), "YieldFarm: TRANSFER_FAILED");
        _mint(msg.sender, amount);
        emit Staked(msg.sender, amount);
    }
    
    // Withdraw staked tokens
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "YieldFarm: CANNOT_WITHDRAW_0");
        require(balanceOf[msg.sender] >= amount, "YieldFarm: INSUFFICIENT_BALANCE");
        _burn(msg.sender, amount);
        require(IERC20(stakingToken).transfer(msg.sender, amount), "YieldFarm: TRANSFER_FAILED");
        emit Withdrawn(msg.sender, amount);
    }
    
    // Claim rewards
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(IERC20(rewardToken).transfer(msg.sender, reward), "YieldFarm: TRANSFER_FAILED");
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    // Exit: withdraw and claim rewards
    function exit() external {
        withdraw(balanceOf[msg.sender]);
        getReward();
    }
    
    // Notify reward amount (owner only)
    function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward / DURATION;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / DURATION;
        }
        
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        require(rewardRate <= balance / DURATION, "YieldFarm: REWARD_TOO_HIGH");
        
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + DURATION;
        emit RewardAdded(reward);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

