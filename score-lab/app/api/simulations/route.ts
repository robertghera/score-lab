import client from "@/lib/mongo"
import { WithId, Document } from 'mongodb';
import { type NextRequest, NextResponse } from "next/server"

interface QueryForPredictions {
    date: { "$gte": string, "$lte": string }
    "league.id"?: { "$in": number[] }
    [key: string]: unknown
}

interface gameTypeObject {
    W: number;
    D: number;
    L: number;
}

interface objectFromDatabase extends WithId<Document> {
    final_prediction: {
        [key: string]: "W" | "D" | "L"
    }
    result: "W" | "D" | "L"
    odds: {
        [key: string]: number
    }
}

// Maybe a POST is nicer and also save data ??
export async function GET(request: NextRequest) {
    // checks made at client side, but still check here
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const leagueIds = searchParams.get("leagueIds")
    const modelName = searchParams.get("modelName")

    if (!startDate || !endDate || modelName === null) {
        return NextResponse.json({ msg: "Required data is missing", predictions: [] }, { status: 400 })
    }

    const query: QueryForPredictions = {
        date: { "$gte": startDate, "$lte": endDate },
        [`final_prediction.${modelName}`]: { "$exists": true }
    }

    if (leagueIds) {
        query["league.id"] = { "$in": leagueIds.split(",").map(Number) }
    }

    console.log("query: ", query)
    const dataFromDatabase = await client.db().collection(process.env.MONGODB_PREDICTION_COL ?? "predictions")
        .find(query)
        .project({
            final_prediction: 1,
            result: 1,
            odds: 1,
        })
        .toArray() as objectFromDatabase[]
    console.log("dataFromDatabase: ", dataFromDatabase.length)

    const totalGames = dataFromDatabase.length
    const totalGamesPerCategory: gameTypeObject = {
        "W": 0,
        "D": 0,
        "L": 0
    }
    const totalCorrectPredictions: gameTypeObject = {
        "W": 0,
        "D": 0,
        "L": 0
    }
    const totalOddWin: gameTypeObject = {
        "W": 0,
        "D": 0,
        "L": 0
    }
    const queryForOdds = {
        "W": "B365H",
        "D": "B365D",
        "L": "B365A"
    }
    dataFromDatabase.forEach((game) => {
        if (game.final_prediction[modelName] === game.result) {
            totalCorrectPredictions[game.result]++
            if (game.odds) {
                // TODO: maybe count games without odds as well
                totalOddWin[game.result] += game.odds[queryForOdds[game.result]]
            } else {
                totalOddWin[game.result] += 1 // at least 1 for the game
            }
        }
        totalGamesPerCategory[game.final_prediction[modelName]]++
    })

    const toReturn = {
        overall: {
            gamesGuessed: totalCorrectPredictions["W"] + totalCorrectPredictions["D"] + totalCorrectPredictions["L"],
            totalGames: totalGames,
            totalOddWin: (totalOddWin["W"] + totalOddWin["D"] + totalOddWin["L"] - totalGames).toFixed(2),
            expectedWinPerGame: ((totalOddWin["W"] + totalOddWin["D"] + totalOddWin["L"] - totalGames) / totalGames).toFixed(2),
        },
        homeWins: {
            gamesGuessed: totalCorrectPredictions["W"],
            totalGames: totalGamesPerCategory["W"],
            totalOddWin: (totalOddWin["W"] - totalGamesPerCategory["W"]).toFixed(2),
            expectedWinPerGame: ((totalOddWin["W"] - totalGamesPerCategory["W"]) / totalGamesPerCategory["W"]).toFixed(2),
        },
        draws: {
            gamesGuessed: totalCorrectPredictions["D"],
            totalGames: totalGamesPerCategory["D"],
            totalOddWin: (totalOddWin["D"] - totalGamesPerCategory["D"]).toFixed(2),
            expectedWinPerGame: ((totalOddWin["D"] - totalGamesPerCategory["D"]) / totalGamesPerCategory["D"]).toFixed(2),
        },
        awayWins: {
            gamesGuessed: totalCorrectPredictions["L"],
            totalGames: totalGamesPerCategory["L"],
            totalOddWin: (totalOddWin["L"] - totalGamesPerCategory["L"]).toFixed(2),
            expectedWinPerGame: ((totalOddWin["L"] - totalGamesPerCategory["L"]) / totalGamesPerCategory["L"]).toFixed(2),
        },
    }

    console.log("toReturn: ", toReturn)

    // if (dataFromDatabase.length === 0) {
    //     return NextResponse.json({ msg: "No games available", predictions: [] }, { status: 200 })
    // }

    return NextResponse.json({ msg: "OK", predictions: toReturn }, { status: 200 })
}