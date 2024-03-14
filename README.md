
# Zap Protocol contest details

- Join [Sherlock Discord](https://discord.gg/MABEWyASkp)
- Submit findings using the issue page in your private contest repo (label issues as med or high)
- [Read for more details](https://docs.sherlock.xyz/audits/watsons)

# Q&A

### Q: On what chains are the smart contracts going to be deployed?
Blast
___

### Q: Which ERC20 tokens do you expect will interact with the smart contracts? 
any standard ERC20 & our own custom ERC20
___

### Q: Which ERC721 tokens do you expect will interact with the smart contracts? 
None
___

### Q: Do you plan to support ERC1155?
No
___

### Q: Which ERC777 tokens do you expect will interact with the smart contracts? 
None
___

### Q: Are there any FEE-ON-TRANSFER tokens interacting with the smart contracts?

No
___

### Q: Are there any REBASING tokens interacting with the smart contracts?

No
___

### Q: Are the admins of the protocols your contracts integrate with (if any) TRUSTED or RESTRICTED?
TRUSTED
___

### Q: Is the admin/owner of the protocol/contracts TRUSTED or RESTRICTED?
TRUSTED
___

### Q: Are there any additional protocol roles? If yes, please explain in detail:
No
___

### Q: Is the code/contract expected to comply with any EIPs? Are there specific assumptions around adhering to those EIPs that Watsons should be aware of?
Only ERC20
___

### Q: Please list any known issues/acceptable risks that should not result in a valid finding.
As per the business requirement, we have only one instance that is being controlled by the admin i.e. allocation based on completed missions
___

### Q: Please provide links to previous audits (if any).
N/A - One ongoing
___

### Q: Are there any off-chain mechanisms or off-chain procedures for the protocol (keeper bots, input validation expectations, etc)?
Yes, there are certain missions which are being tracked off-chain and based on the completed missions users/investors will get allocations.
___

### Q: In case of external protocol integrations, are the risks of external contracts pausing or executing an emergency withdrawal acceptable? If not, Watsons will submit issues related to these situations that can harm your protocol's functionality.
Acceptable
___

### Q: Do you expect to use any of the following tokens with non-standard behaviour with the smart contracts?
No
___

### Q: Add links to relevant protocol resources
https://zap-2.gitbook.io/zaponblast/
___



# Audit scope


[zap-launches-contracts @ 671cf33bc2e6588542fe85a9cf7004e4a2b77d81](https://github.com/Lithium-Ventures/zap-launches-contracts/tree/671cf33bc2e6588542fe85a9cf7004e4a2b77d81)
- [zap-launches-contracts/contracts/Admin.sol](zap-launches-contracts/contracts/Admin.sol)
- [zap-launches-contracts/contracts/interfaces/ITokenSale.sol](zap-launches-contracts/contracts/interfaces/ITokenSale.sol)

[zap-contracts-labs @ 1e0e114f8296c0fff62b8a2a96681eb357b0c0aa](https://github.com/Lithium-Ventures/zap-contracts-labs/tree/1e0e114f8296c0fff62b8a2a96681eb357b0c0aa)
- [zap-contracts-labs/contracts/Admin.sol](zap-contracts-labs/contracts/Admin.sol)
- [zap-contracts-labs/contracts/ERC20Factory.sol](zap-contracts-labs/contracts/ERC20Factory.sol)
- [zap-contracts-labs/contracts/SimpleERC20.sol](zap-contracts-labs/contracts/SimpleERC20.sol)
- [zap-contracts-labs/contracts/TokenSale.sol](zap-contracts-labs/contracts/TokenSale.sol)
- [zap-contracts-labs/contracts/Vesting.sol](zap-contracts-labs/contracts/Vesting.sol)
- [zap-contracts-labs/contracts/VestingFactory.sol](zap-contracts-labs/contracts/VestingFactory.sol)
- [zap-contracts-labs/contracts/interfaces/ITokenSale.sol](zap-contracts-labs/contracts/interfaces/ITokenSale.sol)




[zap-launches-contracts @ 671cf33bc2e6588542fe85a9cf7004e4a2b77d81](https://github.com/Lithium-Ventures/zap-launches-contracts/tree/671cf33bc2e6588542fe85a9cf7004e4a2b77d81)
- [zap-launches-contracts/contracts/Admin.sol](zap-launches-contracts/contracts/Admin.sol)
- [zap-launches-contracts/contracts/interfaces/ITokenSale.sol](zap-launches-contracts/contracts/interfaces/ITokenSale.sol)

