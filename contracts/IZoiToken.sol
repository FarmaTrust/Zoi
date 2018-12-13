pragma solidity ^0.4.20;

import "./ERC20.sol";

contract IZoiToken is ERC20 {
  function setZoiIssuer(address _zoiIssuer) external returns(address);
  function issueZoi(address _user, uint256 _zoiAmount) external returns(bool);
  function zoiIssued() external view returns (uint256);
}
