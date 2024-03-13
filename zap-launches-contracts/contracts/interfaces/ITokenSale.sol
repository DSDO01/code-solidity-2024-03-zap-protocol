// SPDX-License-Identifier: UNLICENSED


/**
 * @title ITokenSale.
 * @dev interface of ITokenSale
 * params structure and functions.
 */
pragma solidity ^0.8.19;

interface ITokenSale {

    struct Staked {
        uint amount;
        uint share;
        uint claimed;
        uint left;
        uint vestingPoint;
        uint amountFinal;
    }

    enum Epoch {
        Incoming,
        Private,
        Finished
    }

    /**
     * @dev describe initial params for token sale
     * @param totalSupply set total amount of tokens. (Token decimals)
     * @param saleStart set starting time for private sale.
     * @param saleEnd set finish time for private sale.
     * @param tokenPrice set price for private sale per token in $ (18 decimals).
     * @param airdrop - amount reserved for airdrop
     */
    struct Params {
        address tokenAddress;
        address router;
        uint totalSupply; 
        uint96 saleStart;
        uint96 saleEnd;
        uint64 liqudityPercentage; //with base 10000
        uint tokenLiquidity; //token amount to add to liquid
        uint baseLine; // with 18 decimal
        bool burnUnsold;
    }

    struct Config{
        uint LPLockin; //in seconds
        uint vestingPeriod; //in seconds for vesting starting time
        uint vestingDistribution; //in seconds for vesting distribution duration
        uint NoOfVestingIntervals; //in seconds for vesting
        uint FirstVestPercentage; //with base 10000
        uint LiqGenerationTime;
    }

    struct State {
        uint totalSold;
        uint totalSupplyInValue;
    }

 
    /**
     * @dev initialize implem100entation logic contracts addresses
     * @param _admin for admin contract.
     */
    function initialize(
        Params memory params,
        address _admin,
        address _creator,
        uint256 _maxAllocation,
        uint256 _platformTax,
        bool _isKYC
    ) external;

    /**
     * @dev claim to sell tokens in airdrop.
     */
    // function claim() external;

    function creator() external view returns(address);
    function setConfig(Config memory _config, address _creator) external;

    /**
     * @dev get banned list of addresses from participation in sales in this contract.
     */
    // function epoch() external returns (Epoch);
    // // function destroy() external;
    // function checkingEpoch() external;
    // // function totalTokenSold() external view returns (uint128);
    // function userWhitelistAllocation(address[] calldata users, uint256[] calldata tiers) external;
    // function stakes(address)
    //     external
    //     returns (
    //         uint,
    //         uint,
    //         bool,
    //         uint256
    //     );
    // function claimLP() external ;
    // function takeLocked() external;
    // function removeOtherERC20Tokens(address) external;
    // function canClaim(address) external returns (uint120, uint256);
    // function takeUSDBRaised() external;

    event DepositPrivate(address indexed user, uint256 amount, address instance);
    event Claim(address indexed user, uint256 change);
    event Vest(address indexed user, uint256 change);
    event TransferAirdrop(uint256 amount);
    event TransferLeftovers(uint256 earned);
    event ERC20TokensRemoved(address _tokenAddress, address sender, uint256 balance);
    event RaiseClaimed(address _receiver, uint256 _amountInBUSD);
}
