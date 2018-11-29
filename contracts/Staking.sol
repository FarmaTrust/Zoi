pragma solidity ^0.4.23;
import "./Ownable.sol";
import "./SafeMath.sol";
import "./ZoiToken.sol";
import "./ERC20.sol";


contract Staking is Ownable {

  using SafeMath for uint256;

  uint BIG_NUMBER = 10**18;
  uint DECIMAL = 10**3;

  struct stakingInfo {
    uint256 amount;
    bool requested;
    uint releaseDate;
  }

  ZoiToken private zoiToken;
  ERC20 private fttToken;

  mapping (address => mapping(address => stakingInfo)) public StakeMap;
  mapping (address => uint) public tokenTotalStaked;

  event Claimed(uint256 _claimableAmount, uint256 _stakedAmount);
  event Staked(uint256 _fttAmount, uint256 _stakeMapAmount, uint256 _totalStakedAmount);

  constructor() public {
  }

  function setZoiToken(address newZoi) onlyOwner {
    zoiToken = ZoiToken(newZoi);
  }

  function setFttToken(address newFtt) onlyOwner {
    fttToken = ERC20(newFtt);
  }


  //for tests only
  function setZoiIssuer(address issuer) external {
    zoiToken.setZoiIssuer(issuer);
  }

  /**
    * @dev stake a specific amount to a token
    * @param _amount the amount to be staked.
    * To meet track and trace regulatory requirements, pharmaceutical companies can stake 100 FTT tokens to
    * generate a batch*** of Compliance Tracking tokens
    */

  function stakeFtt(uint256 _amount) external returns (bool) {
    require(_amount >= 100 ether); //convert properly from wei
    fttToken.transferFrom(msg.sender, address(this), _amount);
    claim(msg.sender);
    StakeMap[fttToken][msg.sender].amount = StakeMap[fttToken][msg.sender].amount.add(_amount);
    tokenTotalStaked[fttToken] = tokenTotalStaked[fttToken].add(_amount);
    emit Staked(_amount, StakeMap[fttToken][msg.sender].amount, tokenTotalStaked[fttToken]);
    return true;
  }

  /**
    * @dev claim dividends for a particular token that user has stake in
    * @param _receiver the address which the claim is paid to
    */
  function claim(address _receiver) public returns (uint) {
    uint256 stakedAmount = StakeMap[fttToken][msg.sender].amount;
    //the amount per token for this user for this claim
    uint256 claimableAmount = stakedAmount.mul(5); //total amount that can be claimed by this user
    claimableAmount = claimableAmount.mul(DECIMAL); //simulate floating point operations
    claimableAmount = claimableAmount.div(BIG_NUMBER); //simulate floating point operations
    zoiTokenContract.issueZoi(_receiver, claimableAmount);
    emit Claimed(claimableAmount, stakedAmount);
    return claimableAmount;

  }
}
