// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

library StakingLibrary {

    struct TierDetails {
        uint128 amount;
        uint128 allocations;
    }

    struct LevelDetails {
        uint128 duration;
        uint128 numberOfTiers;
    }

    struct UserState {
        uint32 Tier;
        uint32 lock;
        uint64 lockTime;
        uint128 amount;
    }

    function _updateUserState(UserState storage self, uint256 _amount, uint256 _lockLevel, uint256 _lockTime) internal {
        if (_amount > 0) {
            self.amount += uint128(_amount);
        }

        self.lock = uint32(_lockLevel);
        self.lockTime = uint64(_lockTime);
    }
}