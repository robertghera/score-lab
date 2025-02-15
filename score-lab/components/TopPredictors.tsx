import { Trophy } from "lucide-react";

export default function TopPredictors() {
    const predictors = [
        { id: 1, name: "John Doe", score: 150 },
        { id: 2, name: "Jane Smith", score: 145 },
        { id: 3, name: "Bob Johnson", score: 140 },
    ];

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {predictors.map((predictor, index) => (
                <div
                    key={predictor.id}
                    className="flex items-center justify-between mb-4 last:mb-0"
                >
                    <div className="flex items-center">
                        <Trophy
                            className={`mr-2 ${
                                index === 0
                                    ? "text-yellow-400"
                                    : index === 1
                                    ? "text-gray-400"
                                    : "text-yellow-700"
                            }`}
                            size={20}
                        />
                        <span>{predictor.name}</span>
                    </div>
                    <span className="font-bold">{predictor.score}</span>
                </div>
            ))}
        </div>
    );
}
