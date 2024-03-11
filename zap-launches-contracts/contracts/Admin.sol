// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
// import "./interfaces/IAdmin.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IERC20D.sol";

/**
 * @title Admin.
 * @dev contract creates tokenSales.
 *
 */

contract Admin is AccessControl, Initializable {
    using SafeERC20 for IERC20D;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    bytes32 public constant STAKING = keccak256("STAKING");

    uint256 public constant POINT_BASE = 10000;
    uint256 public platformFee;
    uint256 public platformTax;
    address public factory;

    address[] public  tokenSales;
    address public  masterTokenSaleUSDB;
    address public  masterTokenSaleETH;
    address public  wallet;
    address public USDB;

    mapping(address => bool) public  tokenSalesM;
    mapping(address => bool) public  blockClaim;
    mapping(address => uint256) public indexOfTokenSales;
    mapping(address => ITokenSale.Params) params;
    mapping(address => mapping(address => bool)) public  blacklist;
    mapping(address => bool) public isKYCDone;
    mapping(address => bool) public creators;

    /**
     * @dev Emitted when pool is created.
     */
    event CreateTokenSale(address instanceAddress);
    /**
     * @dev Emitted when airdrop is set.
     */
    event SetAirdrop(address airdrop);

    /**
     ** @dev Initialize Function,gives the deployer DEFAULT_ADMIN_ROLE
     ** @param _owner: Owner address
     */
    function initialize(address _owner) public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _owner);
        _setRoleAdmin(OPERATOR, DEFAULT_ADMIN_ROLE);
        wallet = _owner;
        platformFee = 2 * (10 ** 17);
        platformTax = 500;
        USDB = 0xA9F81589Cc48Ff000166Bf03B3804A0d8Cec8114;
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
            params[_instance].saleStart > block.timestamp,
            "TokenSale: Pool already started"
        );
        _;
    }

    /**
     * @dev Set Admin Wallet
     */
    function setWallet(address _address)
        external
        validation(_address)
        onlyAdmin
    {
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
    function getParams(address _instance)
        external
        view
        
        returns (ITokenSale.Params memory)
    {
        return params[_instance];
    }

    /**
     * @dev add users to blacklist
     * @param _blacklist - the list of users to add to the blacklist
     */
    function addToBlackList(address _instance, address[] memory _blacklist)
        external
        
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
    function _checkingParams(ITokenSale.Params memory _params, ITokenSale.Config memory _config) internal view {
        require(_params.totalSupply > 0, "TokenSale: TotalSupply > 0");
        require(
            _params.saleStart >= block.timestamp,
            "TokenSale: Start time > 0"
        );
        require(
            _params.saleEnd > _params.saleStart,
            "TokenSale: End time > start time"
        );
        require(_params.liqudityPercentage > 0 && _params.liqudityPercentage <= POINT_BASE,
            "TokenSale: LiqudityPercentage Invalid");
        require(_config.NoOfVestingIntervals > 0, "NoOfVestingIntervals can't be Zero");
        require(_config.FirstVestPercentage > 0, "FirstVestPercentage can't be Zero");
    }

    /**
     * @dev returns all token sales
     */

    function getTokenSales() external view  returns (address[] memory) {
        return tokenSales;
    }

    /**
     @dev set address for tokensaleUSDB.
     @param _address Address of TokenSale contract
     */
    function setMasterContractUSDB(address _address)
        external
        
        validation(_address)
        onlyAdmin
    {
        masterTokenSaleUSDB = _address;
    }

     /**
     @dev set address for tokensaleETH.
     @param _address Address of TokenSale contract
     */
    function setMasterContractETH(address _address)
        external
        
        validation(_address)
        onlyAdmin
    {
        masterTokenSaleETH = _address;
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

    function setUserKYC(address[] calldata users) public onlyRole(OPERATOR){
          for (uint256 i = 0; i < users.length; i++) {
            isKYCDone[users[i]] = true;
        }
    }

    function setPlatformFee(uint _fee) public onlyRole(OPERATOR){
        platformFee = _fee;
    }

    function setPlatformTax(uint _tax) public onlyRole(OPERATOR){
        platformTax = _tax;
    }

     function createPoolNew(
        ITokenSale.Params memory _params,
        ITokenSale.Config memory _config,
        uint256 _maxAllocation,
        bool _isKYC,
        bool isETHBased
    ) external payable {
        require(msg.value == platformFee,"Invalid platform Fee");
        _checkingParams(_params, _config);
        
        address instance = isETHBased ? Clones.clone(masterTokenSaleETH) : Clones.clone(masterTokenSaleUSDB);
        params[instance] = _params;
        ITokenSale(instance).initialize(
            _params,
            address(this),
            msg.sender,
            _maxAllocation,
            platformTax,
            _isKYC
        );
        ITokenSale(instance).setConfig(_config, msg.sender);
        if(!creators[msg.sender]) creators[msg.sender] = true;
        IERC20D(_params.tokenAddress).transferFrom(msg.sender, instance, (_params.totalSupply + _params.tokenLiquidity));
        (bool suc, ) = payable(wallet).call{value: msg.value}("");             
            require(suc, "platformFee trn failed");
        _addToSales(instance);
        emit CreateTokenSale(instance);
    }
}
