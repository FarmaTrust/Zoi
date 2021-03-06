pragma solidity ^0.4.0;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./ERC20.sol";

/** This contract is written strictly in testing purposes as an example of a simple ERC20 token
  * Will be replaced with real FTT in production
  */

contract TestFTT is Ownable, ERC20 {

  using SafeMath for uint256;

  string public constant name = "TestFTT";
  string public symbol = "TFTT";
  uint8 public constant decimals = 18;
  uint256 constant TFTT_AMOUNT = 10000000000000000000000;

  mapping(address => uint256) public balances;
  mapping (address => mapping (address => uint256)) internal allowed;

  event Approval(address indexed owner, address indexed spender, uint256 value);
  event Transfer(address indexed from, address indexed to, uint256 value);
  event TfttIssued(address indexed from, address indexed to, uint256 indexed amount, uint256 timestamp);

  uint256 public tfttIssued = 0;

  address public tfttIssuer;

  constructor(address _user) public {
    uint256 newAmountIssued = tfttIssued.add(TFTT_AMOUNT);
    require(_user != address(0));
    balances[_user] = balances[_user].add(TFTT_AMOUNT);
    tfttIssued = newAmountIssued;
    emit TfttIssued(tfttIssuer, _user, TFTT_AMOUNT, block.timestamp);
  }


  modifier onlyTfttIssuer {
    require(msg.sender == tfttIssuer);
    _;
  }

  function issueTftt(address _user, uint256 _tfttAmount)
      onlyTfttIssuer
      public
      returns(bool)
  {
    uint256 newAmountIssued = tfttIssued.add(_tfttAmount);
    require(_user != address(0));
    require(_tfttAmount > 0);

    balances[_user] = balances[_user].add(_tfttAmount);
    tfttIssued = newAmountIssued;
    emit TfttIssued(tfttIssuer, _user, _tfttAmount, block.timestamp);

    return true;
  }

  /**
   * @dev Transfer tokens from one address to another.
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value)
      public
      returns (bool)
  {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
  * @dev Transfer token for a specified address.
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value)
      public
      returns (bool)
  {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value)
      public
      returns (bool)
  {
    require(_spender != address(0));
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner)
      public
      view
      returns (uint256 balance)
  {
    return balances[_owner];
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender)
      public
      view
      returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  /**
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value, it is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   */
  function increaseApproval (address _spender, uint _addedValue)
      public
      returns (bool success)
  {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  function decreaseApproval (address _spender, uint _subtractedValue)
      public
      returns (bool success)
  {
    uint oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
    allowed[msg.sender][_spender] = 0;
    } else {
    allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }
}
