export interface Prediction {
    _id: { $oid: string }
    date: string
    fixture: {
        id: number
        referee: string
        timezone: string
        date: string
        timestamp: number
        venue: {
            id: number
            name: string
            city: string
        }
        status: {
            long: string
            short: string
            elapsed: number | null
        }
    }
    league: {
        id: number
        name: string
        country: string
        logo: string
        flag: string | null
        season: number
        round: string
    }
    teams: {
        home: {
            id: number
            name: string
            logo: string
            winner: boolean | null
        }
        away: {
            id: number
            name: string
            logo: string
            winner: boolean | null
        }
    }
    final_prediction: {
        [key: string]: string
    } | null
}

