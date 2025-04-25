import client from "@/lib/mongo"
import { type NextRequest, NextResponse } from "next/server"

interface QueryForPredictions {
    date: string
    "league.id"?: { "$in": number[] },
    final_prediction?: {
        "$exists": true
    },
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date")
    const leagueId = searchParams.get("leagueIds")
    const onlyAi = searchParams.get("onlyAi")

    if (!date) {
        return NextResponse.json({ msg: "Date parameter is required", predictions: [] }, { status: 400 }) // maybe 500 ?
    }

    const query: QueryForPredictions = {
        date: date
    }

    if (leagueId) {
        query["league.id"] = { "$in": leagueId.split(",").map(Number) }
    }

    if (onlyAi === "true") {
        query.final_prediction = { "$exists": true }
    }

    if (Date.parse(date) > Date.now()) {
        return NextResponse.json({ msg: "Date cannot be in the future", predictions: [] }, { status: 200 })
    }

    const dataFromDatabase = await client.db().collection("predictions").find(query).toArray()
    if (dataFromDatabase.length === 0) {
        return NextResponse.json({ msg: "No games available", predictions: [] }, { status: 200 })
    }

    return NextResponse.json({ msg: "OK", predictions: dataFromDatabase }, { status: 200 })
}