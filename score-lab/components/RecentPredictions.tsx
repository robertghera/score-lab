import { CheckCircle, XCircle } from "lucide-react";

export default function RecentPredictions() {
    const predictions = [
        {
            id: 1,
            user: "Alice",
            match: "Chelsea vs Arsenal",
            prediction: "Chelsea",
            result: "Correct",
        },
        {
            id: 2,
            user: "Bob",
            match: "PSG vs Marseille",
            prediction: "Draw",
            result: "Incorrect",
        },
        {
            id: 3,
            user: "Charlie",
            match: "Juventus vs Inter",
            prediction: "Juventus",
            result: "Correct",
        },
    ];

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction) => (
                <div key={prediction.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{prediction.user}</span>
                        {prediction.result === "Correct" ? (
                            <CheckCircle className="text-green-400" size={20} />
                        ) : (
                            <XCircle className="text-red-400" size={20} />
                        )}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                        {prediction.match}
                    </div>
                    <div className="text-sm">
                        Predicted: {prediction.prediction}
                    </div>
                </div>
            ))}
        </div>
    );
}
