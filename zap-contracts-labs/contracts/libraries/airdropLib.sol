// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

library airdropLIb {
    struct airdropDetail {
        address token;
        string URL;
        string fromDetail;
    }

    struct userAirdropDetail {
        uint256 claimedIndex;
        uint256[] airdrops;
        mapping(uint256 => uint256) airdropAmount; //airdropID => amount
    }

    function setAirdrop(
        airdropDetail storage self,
        address _token,
        string calldata _URL,
        string calldata _fromData
    ) internal {
        self.token = _token;
        self.URL = _URL;
        self.fromDetail = _fromData;
    }

    function setUserInfo(
        userAirdropDetail storage self,
        uint256 airdropId,
        uint256 amount
    ) internal {
        self.airdropAmount[airdropId] = amount;
        self.airdrops.push(airdropId);
    }

    function claimAirdropUser(userAirdropDetail storage self, uint256 id)
        internal
    {
        self.claimedIndex = id;
    }

    function getAirdrops(userAirdropDetail storage self)
        internal
        view
        returns (uint256[] memory)
    {
        return (self.airdrops);
    }

    function getAmountAirdrop(userAirdropDetail storage self, uint256 id)
        internal
        view
        returns (uint256)
    {
        return (self.airdropAmount[id]);
    }
}
