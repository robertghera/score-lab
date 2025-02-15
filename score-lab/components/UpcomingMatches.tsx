import { Calendar } from "lucide-react";

export default function UpcomingMatches() {
    const matches = [
        {
            id: 1,
            homeTeam: "Liverpool",
            awayTeam: "Manchester City",
            date: "2023-06-01",
            time: "20:00",
        },
        {
            id: 2,
            homeTeam: "Barcelona",
            awayTeam: "Real Madrid",
            date: "2023-06-02",
            time: "21:00",
        },
        {
            id: 3,
            homeTeam: "Bayern Munich",
            awayTeam: "Borussia Dortmund",
            date: "2023-06-03",
            time: "19:30",
        },
    ];

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {matches.map((match) => (
                <div
                    key={match.id}
                    className="mb-4 last:mb-0 p-4 bg-gray-700 rounded-lg"
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                            <Calendar className="inline mr-1" size={14} />
                            {match.date} - {match.time}
                        </span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded">
                            Predict
                        </button>
                    </div>
                    <div className="text-lg font-semibold">
                        {match.homeTeam} vs {match.awayTeam}
                    </div>
                </div>
            ))}
        </div>
    );
}
