import Link from "next/link";
import {
    ArrowRight,
    Trophy,
    TrendingUp,
    Users,
    Target,
    Zap,
    Star,
} from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-black transition-all duration-100">
            <div className="container mx-auto px-4 py-16">
                <section className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4 text-foreground">
                        ScoreLab
                    </h1>
                    <p className="text-xl mb-8 text-muted-foreground">
                        Elevate Your Predictions with Cutting-Edge Analytics
                    </p>
                    <Link
                        href="/predictions"
                        className="bg-blue-600 dark:bg-blue-500 text-primary-foreground hover:bg-blue-600/90 dark:hover:bg-blue-500/90 font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105"
                    >
                        Start Predicting
                        <ArrowRight className="ml-2" />
                    </Link>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Trophy className="text-primary w-12 h-12 mb-4 text-yellow-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Compete Globally
                        </h2>
                        <p className="text-muted-foreground">
                            Engage in predictions contests with professionals
                            worldwide.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <TrendingUp className="w-12 h-12 mb-4 text-green-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Advanced Analytics
                        </h2>
                        <p className="text-muted-foreground">
                            Access in-depth stats and trends to inform your
                            predictions.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Users className="w-12 h-12 mb-4 text-blue-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Community Insights
                        </h2>
                        <p className="text-muted-foreground">
                            Share strategies and discuss predictions with fellow
                            enthusiasts.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Zap className="w-12 h-12 mb-4 text-blue-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Real-Time Data
                        </h2>
                        <p className="text-muted-foreground">
                            Access live match statistics and player performance
                            metrics.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Target className="w-12 h-12 mb-4 text-red-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Precision Forecasting
                        </h2>
                        <p className="text-muted-foreground">
                            Utilize machine learning models for superior
                            predictions.
                        </p>
                    </div>
                    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border">
                        <Star className="text-primary w-12 h-12 mb-4 text-yellow-500" />
                        <h2 className="text-2xl font-semibold mb-4">
                            Performance Tracking
                        </h2>
                        <p className="text-muted-foreground">
                            Monitor your prediction accuracy and climb the
                            leaderboards.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
