import { Rank } from "."

export const userLeaderBoardRange = [
    {
        name: Rank.BRONZE,
        minCoinEarn: 0,
        maxCoinEarn: 2000000
    },
    {
        name: Rank.SILVER,
        minCoinEarn: 2000001,
        maxCoinEarn: 10000000
    },
    {
        name: Rank.GOLD,
        minCoinEarn: 10000001,
        maxCoinEarn: 16000000
    },
    {
        name: Rank.MASTER,
        minCoinEarn: 16000001,
        maxCoinEarn: 100000000
    },
    {
        name: Rank.EPIC,
        minCoinEarn: 100000001,
        maxCoinEarn: 500000000
    },
    {
        name: Rank.LEGEND,
        minCoinEarn: 500000001
    }
]
