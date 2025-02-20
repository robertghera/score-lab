import Link from "next/link";
import { ArrowRight, Trophy, TrendingUp, Users } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16">
                <section className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4 text-foreground">
                        Football Predictions Master
                    </h1>
                    <p className="text-xl mb-8 text-muted-foreground">
                        Predict, Compete, and Conquer the Beautiful Game!
                    </p>
                    <Link
                        href="/predictions"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Start Predicting
                        <ArrowRight className="ml-2" />
                    </Link>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Trophy className="text-primary w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Compete Globally
                        </h2>
                        <p className="text-muted-foreground">
                            Challenge predictors worldwide and climb the
                            leaderboard.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <TrendingUp className="text-primary w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Advanced Analytics
                        </h2>
                        <p className="text-muted-foreground">
                            Access in-depth stats and trends to inform your
                            predictions.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Users className="text-primary w-12 h-12 mb-4" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Community Insights
                        </h2>
                        <p className="text-muted-foreground">
                            Share strategies and discuss predictions with fellow
                            enthusiasts.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
