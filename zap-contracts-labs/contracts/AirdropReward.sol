// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IAirdropReward.sol";
import "./interfaces/IERC20D.sol";
import "./libraries/airdropLib.sol";

contract ProjectReward is AccessControl, IAirdropReward, Initializable {
    using SafeERC20 for IERC20D;
    using airdropLIb for airdropLIb.airdropDetail;
    using airdropLIb for airdropLIb.userAirdropDetail;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    uint256 public airdropCount;
    uint256 public nativeTokenAmount;

    address public override wallet;

    address public override multisig;

    mapping(uint256 => airdropLIb.airdropDetail) public airdropsDetails; //id => airsropStruct
    mapping(address => airdropLIb.userAirdropDetail) public userAirdropDetails; //id => userAirdropStruct

    event ClaimedAirdrop(address token, address receiver, uint256 amount);
    event ERC20TokensRemoved(
        address _tokenAddress,
        address sender,
        uint256 balance
    );

    /**
    @dev Initialize function
    @param _owner Owner address
     */
    function initialize(address _owner, address _multisig) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setRoleAdmin(OPERATOR, DEFAULT_ADMIN_ROLE);
        wallet = _owner;
        multisig = _multisig;
    }

    receive() external payable {}

    modifier validation(address _address) {
        require(_address != address(0), "AirdropReward: Zero address");
        _;
    }
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "AirdropReward: Not admin"
        );
        _;
    }
    modifier onlyOperator() {
        require(hasRole(OPERATOR, msg.sender), "sender is not an operator");
        _;
    }

    function setMultisig(address _multisig)
        external
        validation(_multisig)
        onlyAdmin
    {
        multisig = _multisig;
    }

    /**
    @dev Sets Wallet
    @param _address Wallet Address
     */
    function setWallet(address _address)
        external
        validation(_address)
        onlyAdmin
    {
        wallet = _address;
    }

    function addOperator(address _address) external virtual onlyAdmin {
        grantRole(OPERATOR, _address);
    }

    /**
    @dev Add airdrop 
    @param token token address
    @param _URL  URL link
    @param _fromDetail Project Details in string
    @param users[] array of users addresses
    @param amounts[] array of amount 
     */
    function addAirdrop(
        address token,
        string calldata _URL,
        string calldata _fromDetail,
        address[] calldata users,
        uint256[] calldata amounts
    ) external payable onlyOperator {
        require(token != address(0), "Invalid address");
        require(users.length == amounts.length, "length not match");
        airdropCount++;
        airdropsDetails[airdropCount].setAirdrop(token, _URL, _fromDetail);
        uint256 totalAmount;
        for (uint256 i = 0; i < users.length; i++) {
            userAirdropDetails[users[i]].setUserInfo(airdropCount, amounts[i]);
            totalAmount += amounts[i];
        }
        if (token != address(1)) {
            IERC20D(token).safeTransferFrom(
                multisig,
                address(this),
                totalAmount
            );
        } else {
            require(msg.value == totalAmount, "invalid amount");
            nativeTokenAmount += totalAmount;
        }
    }

    /**
     @dev returns User airdrop details
     */
    function getAirdropsOfUser(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return (userAirdropDetails[_user].getAirdrops());
    }

    /**
     @dev returns User Airdrop amount
     @param id Airdrop ID
     */
    function getUserAmountForAirdrop(uint256 id, address _user)
        external
        view
        returns (uint256)
    {
        return (userAirdropDetails[_user].getAmountAirdrop(id));
    }

    /**
     @dev returns user eligibility in bool
     */
    function isUserEligibleForAirdrop(address _user)
        public
        view
        returns (bool)
    {
        return (userAirdropDetails[_user].claimedIndex <
            userAirdropDetails[_user].airdrops.length);
    }

    /**
     * @dev Claim airdrop reward
     */
    function claimAirdrop() external {
        require(isUserEligibleForAirdrop(msg.sender), "nothing to claim");
        uint256 i = userAirdropDetails[msg.sender].claimedIndex;
        uint256 lastIndex = userAirdropDetails[msg.sender].airdrops.length;
        uint256 end = lastIndex > i + 100 ? i + 100 : lastIndex;
        uint256 lastClaimed;
        for (; i < end; i++) {
            (uint256 airdropId, uint256 _amount) = this.getAirdropDetailsByIndex(i, msg.sender);
            if (_amount > 0) {
                address token = airdropsDetails[airdropId].token;
                require(token != address(0), "ProjectRewards: Invalid address");
                if (token != address(1)) {
                    IERC20D(token).safeTransfer(
                        msg.sender,
                        _amount
                    );
                } else {
                    (bool sent, ) = payable(msg.sender).call{
                        value: _amount
                    }("");
                    require(sent, "Failed to send MATIC");
                    nativeTokenAmount -= _amount;
                }

                lastClaimed = i+1;
                emit ClaimedAirdrop(
                    token,
                    msg.sender,
                    _amount
                );
            }
        }
        userAirdropDetails[msg.sender].claimedIndex = lastClaimed;
    }

    function getAirdropDetailsByIndex(uint256 index, address _user) public view returns (uint256 _airdropId, uint256 _amount) {
        _airdropId = userAirdropDetails[_user].airdrops[index];
        _amount = userAirdropDetails[_user].airdropAmount[_airdropId];
    }

    /**
     @dev Transfers extra MATIC to wallet
     */
    function takeLockedNative() external onlyAdmin {
        require(address(this).balance > nativeTokenAmount, "No MATIC amount");
        uint256 MATICValue = address(this).balance - nativeTokenAmount;
        (bool sent, ) = payable(wallet).call{value: MATICValue}("");
        require(sent, "Failed to send MATIC");
    }

    /**
     @dev Transfers extra ERC20 tokens to wallet
     @param _tokenAddress Token address
     */
    function removeOtherERC20Tokens(address _tokenAddress) external onlyAdmin {
        uint256 balance = IERC20D(_tokenAddress).balanceOf(address(this));
        IERC20D(_tokenAddress).safeTransfer(wallet, balance);
        emit ERC20TokensRemoved(_tokenAddress, wallet, balance);
    }
}
