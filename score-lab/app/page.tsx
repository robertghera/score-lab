import Link from "next/link";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";
import UpcomingMatches from "@/components/UpcomingMatches";
import TopPredictors from "@/components/TopPredictors";
import RecentPredictions from "@/components/RecentPredictions";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="container mx-auto px-4 py-16">
                <section className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        Football Predictions Master
                    </h1>
                    <p className="text-xl mb-8 text-gray-300">
                        Predict, Compete, and Conquer the Beautiful Game!
                    </p>
                    <Link
                        href="/predictions"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Start Predicting
                        <ArrowRight className="ml-2" />
                    </Link>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                        <Trophy className="text-yellow-400 w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Compete Globally
                        </h2>
                        <p className="text-gray-400">
                            Challenge predictors worldwide and climb the
                            leaderboard.
                        </p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                        <TrendingUp className="text-green-400 w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Advanced Analytics
                        </h2>
                        <p className="text-gray-400">
                            Access in-depth stats and trends to inform your
                            predictions.
                        </p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
                        <Users className="text-blue-400 w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Community Insights
                        </h2>
                        <p className="text-gray-400">
                            Share strategies and discuss predictions with fellow
                            enthusiasts.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold mb-6">
                            Upcoming Matches
                        </h2>
                        <UpcomingMatches />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6">
                            Top Predictors
                        </h2>
                        <TopPredictors />
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-bold mb-6">
                        Recent Predictions
                    </h2>
                    <RecentPredictions />
                </section>
            </div>
        </div>
    );
}
