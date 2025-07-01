import client from "@/lib/mongo"
import { WithId } from "mongodb"
import { type NextRequest, NextResponse } from "next/server"

interface QueryForStats {
    "$or": [
        { "teams.home.name": string },
        { "teams.away.name": string }
    ],
    "hasStats": true // this will be replaced with fixture.status
}

interface QueryResult extends WithId<Document> {
    date: string
    fixture: {
        id: number,
        timestamp: number,
    },
    league: {
        id: number
    }
    teams: {
        home: {
            name: string
        },
        away: {
            name: string
        }
    },
    statistics: Array<{
        statistics: Array<{
            type: string,
            value: string | number | null
        }>
    }>
}

interface StatsObject {
    [key: string]: number
}

const FinalStatsShots = [
    "Shots on Goal",
    "Total Shots",
    "Blocked Shots",
    "Shots insidebox",
    "Shots outsidebox",
]

const FinalStatsPercentages = [
    "Ball Possession",
    "Passes %"
]

const FinalStatsOther = [
    "Fouls",
    "Corner Kicks",
    "Offsides",
    "Yellow Cards",
    "Red Cards",
]

function formatObjectsFromQuery(stat: { type: string, value: string | number | null }, finalObjectShots: StatsObject, finalObjectPercentages: StatsObject, finalObjectOther: StatsObject) {
    const { type, value } = stat

    if (FinalStatsShots.includes(type) && typeof value === "number") {
        finalObjectShots[type] = (finalObjectShots[type] as number ?? 0) + value;
    } else if (FinalStatsPercentages.includes(type) && typeof value === "string") {
        const numericValue = Number(value.replace("%", ""));
        finalObjectPercentages[type] = (finalObjectPercentages[type] as number ?? 0) + numericValue;
    } else if (FinalStatsOther.includes(type) && (typeof value === "number" || value === null)) {
        finalObjectOther[type] = (finalObjectOther[type] as number ?? 0) + (value ?? 0);
    }
}

function formattedStat(divideBy: number, finalObjectShots: StatsObject, finalObjectPercentages: StatsObject, finalObjectOther: StatsObject) {
    Object.keys(finalObjectShots).forEach((key) => {
        finalObjectShots[key] = +(finalObjectShots[key] as number / divideBy).toFixed(2);
    });

    Object.keys(finalObjectPercentages).forEach((key) => {
        finalObjectPercentages[key] = +(finalObjectPercentages[key] as number / divideBy).toFixed(3);
    });

    // Calculate derived stat
    if (
        typeof finalObjectShots["Shots on Goal"] === "number" &&
        typeof finalObjectShots["Total Shots"] === "number" &&
        finalObjectShots["Total Shots"] !== 0
    ) {
        finalObjectPercentages["Shots %"] = +((finalObjectShots["Shots on Goal"] as number) / (finalObjectShots["Total Shots"] as number) * 100).toFixed(3);
    } else {
        finalObjectPercentages["Shots %"] = 0;
    }

    Object.keys(finalObjectOther).forEach((key) => {
        finalObjectOther[key] = +(finalObjectOther[key] as number / divideBy).toFixed(2);
    });

    return [finalObjectShots, finalObjectPercentages, finalObjectOther];
}

function getAverageStats(data: Array<QueryResult>, team: string) {
    const finalObjectShots: StatsObject = {}
    const finalObjectPercentages: StatsObject = {}
    const finalObjectOther: StatsObject = {}

    for (const game of data) {
        let indexTeam
        if (game.teams.home.name === team) {
            indexTeam = 0
        } else {
            indexTeam = 1
        }

        for (const stat of game.statistics[indexTeam].statistics) {
            formatObjectsFromQuery(stat, finalObjectShots, finalObjectPercentages, finalObjectOther)
        }
    }

    const divideBy = data.length;

    return formattedStat(divideBy, finalObjectShots, finalObjectPercentages, finalObjectOther)
}

function getAverageStatForLeague(data: Array<QueryResult>) {
    const finalObjectShots: StatsObject = {}
    const finalObjectPercentages: StatsObject = {}
    const finalObjectOther: StatsObject = {}

    for (const game of data) {
        for (const team of Object.values(game.statistics))
            for (const stat of team.statistics) {
                formatObjectsFromQuery(stat, finalObjectShots, finalObjectPercentages, finalObjectOther)
            }
    }

    const divideBy = data.length * 2;

    return formattedStat(divideBy, finalObjectShots, finalObjectPercentages, finalObjectOther)
}

function convertToStats(dataHomeTeam: StatsObject[], dataAwayTeam: StatsObject[], dataLastGames: StatsObject[], homeTeam: string, awayTeam: string) {
    const finalStats: Array<Array<{ stat: string;[team: string]: number | string }>> = []
    dataHomeTeam.forEach((category: object, indexCategory: number) => {
        Object.keys(category).forEach((key: string, indexStat: number) => {
            if (finalStats[indexCategory] === undefined) {
                finalStats[indexCategory] = []
            }

            finalStats[indexCategory][indexStat] = {
                stat: key
            }

            finalStats[indexCategory][indexStat][homeTeam] = dataHomeTeam[indexCategory][key]
            finalStats[indexCategory][indexStat][awayTeam] = dataAwayTeam[indexCategory][key]
            finalStats[indexCategory][indexStat]["League Average"] = dataLastGames[indexCategory][key]
        })
    })

    return finalStats
}


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const homeTeam = searchParams.get("homeTeam")
    const awayTeam = searchParams.get("awayTeam")

    if (homeTeam === null || awayTeam === null) {
        return NextResponse.json({ msg: "Home team and away team parameters are required", predictions: [] }, { status: 400 }) // maybe 500 ?
    }
    const queryHomeTeam: QueryForStats = {
        "$or": [
            { "teams.home.name": homeTeam },
            { "teams.away.name": homeTeam }
        ],
        "hasStats": true
    }
    const queryAwayTeam: QueryForStats = {
        "$or": [
            { "teams.home.name": awayTeam },
            { "teams.away.name": awayTeam }
        ],
        "hasStats": true
    }

    const resultHomeTeam = await client.db().collection(process.env.MONGODB_PREDICTION_COL ?? "predictions").find(queryHomeTeam)
        .project({
            "_id": 1,
            "date": 1,
            "fixture": 1,
            "league": 1,
            "teams": 1,
            "statistics": 1,
        })
        .sort({ date: -1 })
        .limit(4)
        .toArray() as QueryResult[]
    const resultAwayTeam = await client.db().collection(process.env.MONGODB_PREDICTION_COL ?? "predictions").find(queryAwayTeam)
        .project({
            "_id": 1,
            "date": 1,
            "fixture": 1,
            "league": 1,
            "teams": 1,
            "statistics": 1,
        })
        .sort({ date: -1 })
        .limit(4)
        .toArray() as QueryResult[]

    const leagueId = resultHomeTeam[0]?.league?.id ?? resultAwayTeam[0]?.league?.id
    const currentDateTimetamp = resultHomeTeam[0]?.fixture.timestamp ?? resultAwayTeam[0]?.fixture.timestamp
    const INTERVAL_LIMIT = 30 * 24 * 60 * 60 // 30 days in seconds

    const resultLastGames = await client.db().collection(process.env.MONGODB_PREDICTION_COL ?? "predictions").find({ "league.id": leagueId, hasStats: true, "fixture.timestamp": { "$lt": currentDateTimetamp, "$gt": currentDateTimetamp - INTERVAL_LIMIT } })
        .sort({ date: -1 })
        .toArray() as QueryResult[]


    const dataHomeTeam = getAverageStats(resultHomeTeam, homeTeam)
    const dataAwayTeam = getAverageStats(resultAwayTeam, awayTeam)
    const dataLastGames = getAverageStatForLeague(resultLastGames)

    const toReturn = convertToStats(dataHomeTeam, dataAwayTeam, dataLastGames, homeTeam, awayTeam)

    if (dataHomeTeam.length === 0 || dataAwayTeam.length === 0) {
        return NextResponse.json({ msg: "No games available", predictions: [] }, { status: 200 })
    }

    return NextResponse.json(toReturn, { status: 200 })
}