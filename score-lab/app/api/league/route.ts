import client from "@/lib/mongo"
import { NextResponse } from "next/server"

export async function GET() {
    const dataFromDatabase = await client.db().collection("leagues").find({}).sort("id", 1).toArray()

    if (!dataFromDatabase) {
        return NextResponse.json({ error: "No leagues data available" }, { status: 404 })
    }
    return NextResponse.json(dataFromDatabase, { status: 200 })
}

