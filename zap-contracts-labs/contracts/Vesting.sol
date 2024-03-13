// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import "./interfaces/IAdmin.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Vesting is Initializable, AccessControl {
    using SafeERC20 for IERC20;

    uint256[2][] public vestingPoints;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    address public tokensale;
    address public distributionWallet;

    IERC20 public token;

    struct UserDetails {
        uint256 amountClaimed;
        uint256 userDeposit;
        uint256 index;
    }

    mapping(address => UserDetails) public userdetails;

    modifier validation(address _address) {
        require(_address != address(0), "Zero address");
        _;
    }

    function initialize(
        address operator,
        address _tokenSale,
        IERC20 _token,
        address _distributionWallet,
        uint128[2][] memory _vestingPoints
    ) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, operator);
        tokensale = _tokenSale;
        (vestingPoints, ) = ascendingSort(_vestingPoints);
        token = _token;
        distributionWallet = _distributionWallet;
    }

    function setDistributionWallet(
        address _distributionWallet
    ) external validation(_distributionWallet) onlyRole(DEFAULT_ADMIN_ROLE) {
        distributionWallet = _distributionWallet;
    }

    function updateUserDeposit(
        address[] memory _users,
        uint256[] memory _amount
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_users.length <= 250, "array length should be less than 250");
        require(_users.length == _amount.length, "array length should match");
        uint256 amount;
        for (uint256 i = 0; i < _users.length; i++) {
            userdetails[_users[i]].userDeposit = _amount[i];
            amount += _amount[i];
        }
        token.safeTransferFrom(distributionWallet, address(this), amount);
    }

    function claim() external {
        address sender = msg.sender;

        UserDetails storage s = userdetails[sender];
        require(s.userDeposit != 0, "No Deposit");
        require(s.index != vestingPoints.length, "already claimed");
        uint256 pctAmount;
        uint256 i = s.index;
        for (i; i <= vestingPoints.length - 1; i++) {
            if (block.timestamp >= vestingPoints[i][0]) {
                pctAmount += (s.userDeposit * vestingPoints[i][1]) / 10000;
            } else {
                break;
            }
        }
        if (pctAmount != 0) {
            if (address(token) == address(1)) {
                (bool sent, ) = payable(sender).call{value: pctAmount}("");
                require(sent, "Failed to send BNB to receiver");
            } else {
                token.safeTransfer(sender, pctAmount);
            }
            s.index = uint128(i);
            s.amountClaimed += pctAmount;
        }
    }

    function updateVestingPoints(
        uint128[2][] memory _vestingPoints
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 sum;
        (vestingPoints, sum) = ascendingSort(_vestingPoints);
        require(sum == 10000, "sum not 10000");
        require(block.timestamp <= _vestingPoints[0][0], "Time lapsed");
    }

    function getVestingPoints() external view returns (uint256[2][] memory) {
        return vestingPoints;
    }

    function setTokenSaleContract(
        address _address
    ) external validation(_address) onlyRole(DEFAULT_ADMIN_ROLE) {
        tokensale = _address;
    }

    function takeLockedBNB() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance > 0, "No BNB amount");
        (bool sent, ) = payable(distributionWallet).call{
            value: address(this).balance
        }("");
        require(sent, "Failed to send BNB");
    }

    function removeOtherERC20Tokens(
        address _tokenAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(_tokenAddress).safeTransfer(
            distributionWallet,
            IERC20(_tokenAddress).balanceOf(address(this))
        );
    }

    function ascendingSort(
        uint128[2][] memory arr
    ) internal pure returns (uint128[2][] memory, uint256) {
        uint256 l = arr.length;
        uint256 sum;
        for (uint256 i = 0; i < l; i++) {
            for (uint256 j = i + 1; j < l; j++) {
                if (arr[i][0] > arr[j][0]) {
                    uint128[2] memory temp = arr[j];
                    arr[j] = arr[i];
                    arr[i] = temp;
                }
            }
            sum += arr[i][1];
        }
        return (arr, sum);
    }
}
