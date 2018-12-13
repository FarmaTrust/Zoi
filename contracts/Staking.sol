pragma solidity ^0.4.20;
import "./Ownable.sol";
import "./SafeMath.sol";
import "./IZoiToken.sol";
import "./ERC20.sol";


contract Staking is Ownable {

  using SafeMath for uint256;

  struct stakingInfo {
    uint256 amount;
    bool requested;
  }

  IZoiToken public zoiToken;
  ERC20 public fttToken;

  mapping (address => mapping(address => stakingInfo)) public StakeMap;
  mapping (address => uint) public tokenTotalStaked;

  event Claimed(uint256 _claimableAmount, uint256 _stakedAmount);
  event Staked(uint256 _fttAmount, uint256 _stakeMapAmount, uint256 _totalStakedAmount);

  constructor() public {
  }

  /**
    * @dev set an address for ZOI token to be able to call issueZoi() function while claiming tokens
    * @param newZoi proper address of ZOI token. Could be upgraded in case of different versions/releases
    */
  function setZoiToken(IZoiToken newZoi) public onlyOwner {
    zoiToken = IZoiToken(newZoi);
  }

  /**
    * @dev set an address for FTT token to be able to call issueZoi() function while claiming tokens
    * @param newFtt proper address of FTT token. Could be upgraded in case of different versions/releases
    */
  function setFttToken(address newFtt) public onlyOwner {
    fttToken = ERC20(newFtt);
  }

  /**
    * @dev stake a specific amount to a token
    * @param _amount the amount to be staked.
    * To meet track and trace regulatory requirements, pharmaceutical companies can stake 100 FTT tokens to
    * generate a batch*** of Compliance Tracking tokens
    */
  function stakeFtt(uint256 _amount) public returns (bool) {
    require(_amount >= 100000000000000000000); //TODO: proper representation of 18 decimals
    fttToken.transferFrom(msg.sender, address(this), _amount);
    StakeMap[fttToken][msg.sender].amount = StakeMap[fttToken][msg.sender].amount.add(_amount);
    tokenTotalStaked[fttToken] = tokenTotalStaked[fttToken].add(_amount);
    emit Staked(_amount, StakeMap[fttToken][msg.sender].amount, tokenTotalStaked[fttToken]);
    return true;
  }

  /**
    * @dev returns staked amount per user
    * @param _user the specific address of person who staked
    */
  function getStakedAmount(address _user) public view returns(uint256) {
    return StakeMap[fttToken][_user].amount;
  }

  /**
    * @dev claim dividends for a particular token that user has stake in
    * @param _receiver the address which the claim is paid to
    */
  function claim(address _receiver) public returns (uint) {
    uint256 stakedAmount = StakeMap[fttToken][msg.sender].amount;
    //the amount per token for this user for this claim
    uint256 claimableAmount = stakedAmount.mul(5); //total amount that can be claimed by this user
    zoiToken.issueZoi(_receiver, claimableAmount);
    emit Claimed(claimableAmount, stakedAmount);
    return claimableAmount;

  }

  /**
    * @dev releases staked FTT tokens to the sender
    * @param _amount amount of FTT to be released to owner
    */
  function releaseStake(uint256 _amount) public returns (bool) {
    require(StakeMap[fttToken][msg.sender].amount > 0);
    tokenTotalStaked[fttToken] = tokenTotalStaked[fttToken].sub(_amount);
    fttToken.transfer(msg.sender, _amount);
    StakeMap[fttToken][msg.sender].amount = StakeMap[fttToken][msg.sender].amount.sub(_amount);
  }

  /**
    * @dev for receiving a plain Ether for the contract to be able to call ZoiToken. Could be used only by contract owner
    */
  function() payable public onlyOwner {}
}
