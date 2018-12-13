# Zoi
FarmaTrust supply chain exchange.
## Zoi platform smart contracts overview 
**ZoiToken.sol** - ERC20 token with an ability to issue ZOI from the staking contract. 
**Staking.sol** - basic staking smart contract for FTT token to receive ZOI.
### Steps to work with staking contract
- Set proper Zoi token address via `setZoiToken()` function which is available only for the contract's owner 
- Set proper Ftt token address via `setFttToken()` function which is available only for the contract's owner. For the testing & demo purpose here's being used a `TestFtt.sol` contract that is representing a basic Ftt token.
- Call a `fallback` function and send some Ether to make contract able to call Zoi token contract (basically to fuel it up to pay gas)
- Set an allowance for the Staking contract to withdraw Ftt tokens from user wallet. This operation should be done using `Ftt smart contract` and `approve(spender, amount)` function, outside of this service. Due to security reasons this feature cannot be done via Staking contract or somehow automated. User manually inputs desirable amount of Ftt tokens that contract could withdraw and than goes back to the `Staking contract`
- After spending amount was approved, `stakeFtt` function could be called. Users could stake >= 100 Ftt tokens, after the stake was finished, this information is being written in the `StakeMap` with information about the staker address and the staked amount
- Zoi token claim is done manually with the `claim()` function. This is done beause an external services (such as oracle or crone) will call this function to supply with Zoi tokens all the stakers due to calculation (for 100 FTT there's 500 ZOI)
- Any staked amount could be released any time using `releaseStake()` function, where the sender can input the desirable amount to withdraw from the contract
