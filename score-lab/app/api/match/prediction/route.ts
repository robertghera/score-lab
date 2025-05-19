import client from "@/lib/mongo"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const fixtureId = searchParams.get("fixtureId")
    const userId = searchParams.get("userId")

    if (!fixtureId || !userId) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 })
    }

    const dataFromDatabase = await client.db().collection("user-predictions").findOne({ "fixtureId": Number(fixtureId), userId: userId })

    if (!dataFromDatabase) {
        return NextResponse.json({ error: "No game data available" }, { status: 404 })
    }
    return NextResponse.json(dataFromDatabase, { status: 200 })
}

export async function POST(request: NextRequest) {

    try {
        const { userId, fixtureId, prediction } = await request.json()
        console.log("Prediction received:", userId, fixtureId)

        if (!userId || !fixtureId || !prediction) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        console.log(prediction)
        await client.db().collection("user-predictions").updateOne({ fixtureId, userId }, {
            $set: {
                prediction,
            }
        }, { upsert: true })

        return NextResponse.json({
            success: true,
            message: "Prediction received successfully",
        })
    } catch (error) {
        console.error("Error processing prediction:", error)
        return NextResponse.json({ success: false, message: "Failed to process prediction" }, { status: 500 })
    }
}