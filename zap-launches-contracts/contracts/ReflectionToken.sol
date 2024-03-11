// SPDX-License-Identifier: NOLICENSE
pragma solidity ^0.8.10;
import "contracts/mock_router/interfaces/IUniswapV2Factory.sol";
import "contracts/mock_router/interfaces/IUniswapV2Router01.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ReflectionToken is ERC20, Ownable {
  mapping(address => uint256) private _rOwned;
  mapping(address => uint256) private _tOwned;
  mapping(address => mapping(address => uint256)) private _allowances;
  mapping(address => bool) private _isExcludedFromFee;
  mapping(address => bool) private _isExcluded;
  mapping(address => bool) private _isBot;
  mapping(address => bool) private _isPair;

  address[] private _excluded;
  bool private swapping;
  IUniswapV2Router01 public router;
  address public pair;
  uint8 private constant _decimals = 9;
  uint256 private constant MAX = ~uint256(0);

  uint256 private _tTotal;
  uint256 private _rTotal;
  uint256 public maxTxAmount;
  mapping(address => uint256) public _lastTrade;
  bool public coolDownEnabled = true;
  uint256 public coolDownTime = 30 seconds;

  struct Taxes {
    uint256 transaction;
    uint256 buy;
    uint256 sell;
  }

  Taxes private taxes;

  struct TotFeesPaidStruct {
    uint256 reflection;
  }

  TotFeesPaidStruct public totFeesPaid;

  struct valuesFromGetValues {
    uint256 rAmount;
    uint256 rTransferAmount;
    uint256 rReflection;
    uint256 tTransferAmount;
    uint256 tReflection;
  }
  event FeesChanged();

  modifier lockTheSwap() {
    swapping = true;
    _;
    swapping = false;
  }

  modifier addressValidation(address _addr) {
    require(_addr != address(0), "Zero address");
    _;
  }

  constructor(
    address routerAddress,
    address owner_,
    uint256 tTotal_,
    string memory _name,
    string memory _symbol,
    uint256 _maxTxAmount,
    Taxes memory _taxes
  ) ERC20(_name, _symbol) {
    _tTotal = tTotal_;
    _rTotal = (MAX - (MAX % _tTotal));
    maxTxAmount = _maxTxAmount * 10**_decimals;
    taxes = _taxes;
    IUniswapV2Router01 _router = IUniswapV2Router01(routerAddress);
    address _pair = IUniswapV2Factory(_router.factory()).createPair(
      address(this),
      _router.WETH()
    );
    router = _router;
    pair = _pair;
    addPair(pair);

    excludeFromReward(pair);
    _transferOwnership(owner_);
    _rOwned[owner()] = _rTotal;
    _isExcludedFromFee[owner()] = true;
    _isExcludedFromFee[address(this)] = true;
    emit Transfer(address(0), owner(), _tTotal);
  }

  function totalSupply() public view override returns (uint256) {
    return _tTotal;
  }

  function balanceOf(address account) public view override returns (uint256) {
    if (_isExcluded[account]) return _tOwned[account];
    return tokenFromReflection(_rOwned[account]);
  }

  function transfer(address recipient, uint256 amount)
    public
    override
    returns (bool)
  {
    _transferto(_msgSender(), recipient, amount);
    return true;
  }

  function allowance(address owner, address spender)
    public
    view
    override
    returns (uint256)
  {
    return _allowances[owner][spender];
  }

  function approve(address spender, uint256 amount)
    public
    override
    returns (bool)
  {
    _approveto(_msgSender(), spender, amount);
    return true;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public virtual override returns (bool) {
    uint256 currentAllowance = _allowances[sender][_msgSender()];
    require(
      currentAllowance >= amount,
      "ERC20: transfer amount exceeds allowance"
    );

    _transferto(sender, recipient, amount);
    _approveto(sender, _msgSender(), currentAllowance - amount);

    return true;
  }

  function increaseAllowanceto(address spender, uint256 addedValue)
    public
    virtual
    returns (bool)
  {
    _approveto(
      _msgSender(),
      spender,
      _allowances[_msgSender()][spender] + addedValue
    );
    return true;
  }

  function decreaseAllowanceto(address spender, uint256 subtractedValue)
    public
    virtual
    returns (bool)
  {
    uint256 currentAllowance = _allowances[_msgSender()][spender];
    require(
      currentAllowance >= subtractedValue,
      "ERC20: decreased allowance below zero"
    );
    _approveto(_msgSender(), spender, currentAllowance - subtractedValue);

    return true;
  }

  function isExcludedFromReward(address account) public view returns (bool) {
    return _isExcluded[account];
  }

  function tokenFromReflection(uint256 rAmount) public view returns (uint256) {
    require(rAmount <= _rTotal, "Amount must be less than total reflections");
    uint256 currentRate = _getRate();

    return rAmount / currentRate;
  }

  function excludeFromReward(address account) public onlyOwner {
    require(!_isExcluded[account], "Account is already excluded");
    require(_excluded.length <= 200, "Invalid length");
    require(account != owner(), "Owner cannot be excluded");
    if (_rOwned[account] > 0) {
      _tOwned[account] = tokenFromReflection(_rOwned[account]);
    }
    _isExcluded[account] = true;
    _excluded.push(account);
  }

  function includeInReward(address account) external onlyOwner {
    require(_isExcluded[account], "Account is not excluded");
    for (uint256 i = 0; i < _excluded.length; i++) {
      if (_excluded[i] == account) {
        _excluded[i] = _excluded[_excluded.length - 1];
        _tOwned[account] = 0;
        _isExcluded[account] = false;
        _excluded.pop();
        break;
      }
    }
  }

  function excludeFromFee(address account) public onlyOwner {
    _isExcludedFromFee[account] = true;
  }

  function includeInFee(address account) public onlyOwner {
    _isExcludedFromFee[account] = false;
  }

  function isExcludedFromFee(address account) public view returns (bool) {
    return _isExcludedFromFee[account];
  }

  function addPair(address _pair) public onlyOwner {
    _isPair[_pair] = true;
  }

  function removePair(address _pair) public onlyOwner {
    _isPair[_pair] = false;
  }

  function isPair(address account) public view returns (bool) {
    return _isPair[account];
  }

  function setTaxes(Taxes memory _taxes) public onlyOwner {
    taxes = _taxes;

    emit FeesChanged();
  }

  function _reflectReflection(uint256 rReflection, uint256 tReflection)
    private
  {
    _rTotal -= rReflection;
    totFeesPaid.reflection += tReflection;
  }

  function _getValues(uint256 tAmount, uint8 takeFee)
    private
    returns (valuesFromGetValues memory to_return)
  {
    to_return = _getTValues(tAmount, takeFee);
    (
      to_return.rAmount,
      to_return.rTransferAmount,
      to_return.rReflection
    ) = _getRValues(to_return, tAmount, takeFee, _getRate());

    return to_return;
  }

  function _getTValues(uint256 tAmount, uint8 takeFee)
    private
    returns (valuesFromGetValues memory s)
  {
    if (takeFee == 0) {
      s.tTransferAmount = tAmount;
      return s;
    } else if (takeFee == 1) {
      s.tReflection = (tAmount * taxes.buy) / 1000;
      s.tTransferAmount = tAmount - s.tReflection;
      return s;
    } else if (takeFee == 2) {
      s.tReflection = (tAmount * taxes.sell) / 1000;
      s.tTransferAmount = tAmount - s.tReflection;
      return s;
    } else {
      s.tReflection = (tAmount * taxes.transaction) / 1000;
      s.tTransferAmount = tAmount - s.tReflection;
      return s;
    }
  }

  function _getRValues(
    valuesFromGetValues memory s,
    uint256 tAmount,
    uint8 takeFee,
    uint256 currentRate
  )
    private
    pure
    returns (
      uint256 rAmount,
      uint256 rTransferAmount,
      uint256 rReflection
    )
  {
    rAmount = tAmount * currentRate;

    if (takeFee == 0) {
      return (rAmount, rAmount, 0);
    } else {
      rReflection = s.tReflection * currentRate;
      rTransferAmount = rAmount - rReflection;
      return (rAmount, rTransferAmount, rReflection);
    }
  }

  function _getRate() private view returns (uint256) {
    (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
    return rSupply / tSupply;
  }

  function _getCurrentSupply() private view returns (uint256, uint256) {
    uint256 rSupply = _rTotal;
    uint256 tSupply = _tTotal;
    for (uint256 i = 0; i < _excluded.length; i++) {
      if (_rOwned[_excluded[i]] > rSupply || _tOwned[_excluded[i]] > tSupply)
        return (_rTotal, _tTotal);
      rSupply = rSupply - _rOwned[_excluded[i]];
      tSupply = tSupply - _tOwned[_excluded[i]];
    }
    if (rSupply < _rTotal / _tTotal) return (_rTotal, _tTotal);
    return (rSupply, tSupply);
  }

  function _approveto(
    address owner,
    address spender,
    uint256 amount
  ) private {
    require(owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");
    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  function _transferto(
    address from,
    address to,

    uint256 amount
  ) private {
    require(from != address(0), "ERC20: transfer from the zero address");
    require(to != address(0), "ERC20: transfer to the zero address");
    require(amount > 0, "Zero amount");
    require(amount <= balanceOf(from), "Insufficient balance");
    require(!_isBot[from] && !_isBot[to], "You are a bot");
    require(amount <= maxTxAmount, "Amount is exceeding maxTxAmount");

    if (coolDownEnabled) {
      uint256 timePassed = block.timestamp - _lastTrade[from];
      require(timePassed > coolDownTime, "You must wait coolDownTime");
    }

    if (!_isExcludedFromFee[from] && !_isExcludedFromFee[to] && !swapping) {
      //check this !swapping
      if (_isPair[from] || _isPair[to]) {
        _isPair[from]
          ? _tokenTransfer(from, to, amount, 1)
          : _tokenTransfer(from, to, amount, 2);
      } else {
        _tokenTransfer(from, to, amount, 3);
      }
    } else {
      _tokenTransfer(from, to, amount, 0);
    }

    _lastTrade[from] = block.timestamp;
  }

  function _tokenTransfer(
    address sender,
    address recipient,
    uint256 tAmount,
    uint8 takeFee
  ) private {
    valuesFromGetValues memory s = _getValues(tAmount, takeFee);

    if (_isExcluded[sender]) {
      //from excluded
      _tOwned[sender] = _tOwned[sender] - tAmount;
    }
    if (_isExcluded[recipient]) {
      //to excluded
      _tOwned[recipient] = _tOwned[recipient] + s.tTransferAmount;
    }

    _rOwned[sender] = _rOwned[sender] - s.rAmount;
    _rOwned[recipient] = _rOwned[recipient] + s.rTransferAmount;

    if (s.rReflection > 0 || s.tReflection > 0)
      _reflectReflection(s.rReflection, s.tReflection);
    emit Transfer(sender, recipient, s.tTransferAmount);
  }

  function updateCoolDownSettings(bool _enabled, uint256 _timeInSeconds)
    external
    onlyOwner
  {
    coolDownEnabled = _enabled;
    coolDownTime = _timeInSeconds * 1 seconds;
  }

  function setAntibot(address account, bool state) external onlyOwner {
    require(_isBot[account] != state, "Value already set");
    _isBot[account] = state;
  }

  function updateRouterAndPair(address newRouter, address newPair)
    external
    onlyOwner
  {
    router = IUniswapV2Router01(newRouter);
    pair = newPair;
    addPair(pair);
  }

  function isBot(address account) public view returns (bool) {
    return _isBot[account];
  }

  receive() external payable {}
}
