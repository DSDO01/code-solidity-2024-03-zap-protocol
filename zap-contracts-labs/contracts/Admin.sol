// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/ITokenSale.sol";

/**
 * @title Admin.
 * @dev contract creates tokenSales.
 *
 */

contract Admin is AccessControl, IAdmin, Initializable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant STAKING = keccak256("STAKING");

    uint256 public constant POINT_BASE = 1000;

    address[] public override tokenSales;
    address public override masterTokenSale;
    address public override stakingContract;
    address public override wallet;
    address public override airdrop;
    address public override superCharge;

    mapping(address => bool) public override tokenSalesM;
    mapping(address => bool) public override blockClaim;
    mapping(address => uint256) public indexOfTokenSales;
    mapping(address => ITokenSale.Params) params;
    mapping(address => mapping(address => bool)) public override blacklist;
    mapping(address => bool) public isKYCDone;

    /**
     ** @dev Initialize Function,gives the deployer DEFAULT_ADMIN_ROLE
     ** @param _owner: Owner address
     */
    function initialize(address _owner) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setRoleAdmin(OPERATOR, DEFAULT_ADMIN_ROLE);
        wallet = _owner;
    }

    /**
     * @dev Modifier that checks address is not ZERO address.
     */
    modifier validation(address _address) {
        require(_address != address(0), "TokenSale: Zero address");
        _;
    }

    /**
     * @dev Only Admin contract can call
     */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "TokenSale: Not admin"
        );
        _;
    }

    /**
     * @dev Only Staking contract can call
     */

    modifier onlyStaking() {
        require(hasRole(STAKING, msg.sender), "TokenSale: Only Staking");
        _;
    }

    /**
     * @dev Checks IDO existence
     */
    modifier onlyExist(address _instance) {
        require(tokenSalesM[_instance], "TokenSale: Pool Not Exist");
        _;
    }

    /**
     * @dev Checks an Incoming Private pool(IDO)
     */
    modifier onlyIncoming(address _instance) {
        require(
            params[_instance].privateStart > block.timestamp,
            "TokenSale: Pool already started"
        );
        _;
    }

    /**
     * @dev Set Admin Wallet
     */
    function setWallet(
        address _address
    ) external validation(_address) onlyAdmin {
        wallet = _address;
    }

    /**
     * @dev Only Admin can add an Operator
     */

    function addOperator(address _address) external virtual onlyAdmin {
        grantRole(OPERATOR, _address);
    }

    /**
     * @dev Only Admin can remove an Operator
     */

    function removeOperator(address _address) external virtual onlyAdmin {
        revokeRole(OPERATOR, _address);
    }

    /**
     ** @dev IDO parameters
     ** @param _instance IDO address
     */
    function getParams(
        address _instance
    ) external view override returns (ITokenSale.Params memory) {
        return params[_instance];
    }

    /**
     ** @dev Destroying IDO
     ** @param _instance IDO address
     */
    function destroyInstance(
        address _instance
    ) external onlyExist(_instance) onlyIncoming(_instance) {
        _removeFromSales(_instance);
        ITokenSale(_instance).destroy();
    }

    /**
     * @dev add users to blacklist
     * @param _blacklist - the list of users to add to the blacklist
     */
    function addToBlackList(
        address _instance,
        address[] memory _blacklist
    )
        external
        override
        onlyIncoming(_instance)
        onlyExist(_instance)
        onlyRole(OPERATOR)
    {
        require(_blacklist.length <= 500, "TokenSale: Too large array");
        for (uint256 i = 0; i < _blacklist.length; i++) {
            blacklist[_instance][_blacklist[i]] = true;
        }
    }

    /**
    @dev returns the total no of IDO's created till now
    */
    function getTokenSalesCount() external view returns (uint256) {
        return tokenSales.length;
    }

    /**
    @dev adds an IDO to an array
    @param _addr - address of an Instance
    */

    function _addToSales(address _addr) internal {
        tokenSalesM[_addr] = true;
        indexOfTokenSales[_addr] = tokenSales.length;
        tokenSales.push(_addr);
    }

    /**
    @dev removes an IDO to an array
    @param _addr - address of an Instance
    */
    function _removeFromSales(address _addr) internal {
        tokenSalesM[_addr] = false;
        tokenSales[indexOfTokenSales[_addr]] = tokenSales[
            tokenSales.length - 1
        ];
        indexOfTokenSales[
            tokenSales[tokenSales.length - 1]
        ] = indexOfTokenSales[_addr];
        tokenSales.pop();
        delete indexOfTokenSales[_addr];
    }

    /**
    @dev Checking parameters of IDO
    @param _params - IDO parameters
    */
    function _checkingParams(ITokenSale.Params memory _params) internal view {
        require(_params.totalSupply > 0, "TokenSale: TotalSupply > 0");
        require(
            _params.privateStart >= block.timestamp,
            "TokenSale: Start time > 0"
        );
        require(
            _params.privateEnd > _params.privateStart,
            "TokenSale: End time > start time"
        );
    }

    /**
       @notice Initializes TokenSale contract.
       @dev creates new pool.
       @param _params describes prices, timeline, limits of new pool.
     */

    function createPool(
        ITokenSale.Params memory _params
    ) external override onlyRole(OPERATOR) {
        require(false, "Not valid");
    }

    /**
     * @dev returns all token sales
     */

    function getTokenSales() external view override returns (address[] memory) {
        return tokenSales;
    }

    /**
     @dev set address for tokensale.
     @param _address Address of TokenSale contract
     */
    function setMasterContract(
        address _address
    ) external override validation(_address) onlyAdmin {
        masterTokenSale = _address;
    }

    /**
     @dev set address for airdrop 
     @param _address Address of Airdrop contract
     */
    function setAirdrop(
        address _address
    ) external override validation(_address) onlyAdmin {
        airdrop = _address;
        emit SetAirdrop(_address);
    }

    /**
    @dev set address for staking contract.
     @param _address Address of Staking contract
     */
    function setStakingContract(
        address _address
    ) external override validation(_address) onlyAdmin {
        stakingContract = _address;
        _setupRole(STAKING, address(_address));
    }

    /**
     @dev Whitelist users
     @param _address Address of User
     */
    function setClaimBlock(address _address) external onlyRole(OPERATOR) {
        blockClaim[_address] = true;
    }

    /**
     @dev Blacklist users
     @param _address Address of User
     */
    function removeClaimBlock(address _address) external onlyRole(OPERATOR) {
        blockClaim[_address] = false;
    }

    function setSuperCharge(
        address _superCharge
    ) external override validation(_superCharge) onlyAdmin {
        superCharge = _superCharge;
    }

    function setUserKYC(address[] calldata users) public onlyRole(OPERATOR) {
        for (uint256 i = 0; i < users.length; i++) {
            isKYCDone[users[i]] = true;
        }
    }

    function createPoolNew(
        ITokenSale.Params memory _params,
        uint256 _maxAllocation,
        uint256 _globalTaxRate,
        bool _isKYC,
        uint256 _whitelistTxRate
    ) external override onlyRole(OPERATOR) {
        _checkingParams(_params);
        address instance = Clones.clone(masterTokenSale);
        params[instance] = _params;
        ITokenSale(instance).initialize(
            _params,
            stakingContract,
            address(this),
            _maxAllocation,
            _globalTaxRate,
            _isKYC,
            _whitelistTxRate
        );

        _addToSales(instance);
        emit CreateTokenSale(instance);
    }
}
