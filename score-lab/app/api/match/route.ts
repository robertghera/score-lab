import client from "@/lib/mongo"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 })
    }

    const dataFromDatabase = await client.db().collection(process.env.MONGODB_PREDICTION_COL ?? "predictions").findOne({ "fixture.id": Number(id) })

    if (!dataFromDatabase) {
        return NextResponse.json({ error: "No game data available" }, { status: 404 })
    }
    return NextResponse.json(dataFromDatabase, { status: 200 })
}

