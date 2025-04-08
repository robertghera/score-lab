"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Loader2, MapPin, User } from "lucide-react";

interface GameData {
    fixture: {
        id: number;
        referee: string;
        date: string;
        venue: {
            name: string;
            city: string;
        };
        status: {
            long: string;
            short: string;
            elapsed: number | null;
        };
    };
    league: {
        name: string;
        logo: string;
        round: string;
    };
    teams: {
        home: {
            name: string;
            logo: string;
        };
        away: {
            name: string;
            logo: string;
        };
    };
    goals: {
        home: number;
        away: number;
    };
    score: {
        halftime: { home: number; away: number };
        fulltime: { home: number; away: number };
        extratime: { home: number; away: number };
        penalty: { home: number; away: number };
    };
    statistics: [
        {
            team: {
                id: number;
                name: string;
            };
            statistics: {
                type: string;
                value: string;
            }[];
        },
        {
            team: {
                id: number;
                name: string;
            };
            statistics: {
                type: string;
                value: string;
            }[];
        }
    ];
    final_prediction: string | null;
    prediction: number[] | null;
    prediction_given: string | null;
    result: string | null;
}

// Update the statistics section to use the new layout
const statisticsToShow = [
    "Ball Possession",
    "Total Shots",
    "Shots on Goal",
    "Shots off Goal",
    "Shots insidebox",
    "Shots outsidebox",
    "Corner Kicks",
    "Offsides",
    "Fouls",
    "Yellow Cards",
    "Red Cards",
    "Goalkeeper Saves",
    "Total passes",
    "Passes accurate",
    "Passes %",
    "expected_goals",
];

export default function MatchPage() {
    const { id } = useParams();
    const [gameData, setGameData] = useState<GameData | null>(null);

    useEffect(() => {
        fetch(`/api/match?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                setGameData(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [id]);

    if (!gameData) {
        return <Loader2 className="animate-spin mx-auto my-10" />;
    }

    const isLive =
        gameData.fixture.status.short === "1H" ||
        gameData.fixture.status.short === "2H" ||
        gameData.fixture.status.short === "HT";

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8 overflow-hidden bg-card">
                <div className="relative">
                    {isLive && (
                        <div className="absolute top-4 right-4 flex items-center">
                            <span className="animate-pulse inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-red-500 text-sm font-medium">
                                LIVE
                            </span>
                        </div>
                    )}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-center mb-8">
                            {gameData.teams.home.name} vs{" "}
                            {gameData.teams.away.name}
                        </h1>

                        <div className="flex justify-between items-center mb-12">
                            <div className="text-center flex-1">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                    <Image
                                        src={
                                            gameData.teams.home.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={gameData.teams.home.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold">
                                    {gameData.teams.home.name}
                                </h2>
                            </div>

                            {gameData?.goals?.home !== undefined &&
                            gameData?.goals?.away !== undefined ? (
                                <div className="text-4xl font-bold mx-8 flex items-center">
                                    <span className="text-5xl">
                                        {gameData.goals.home}
                                    </span>
                                    <span className="mx-3">-</span>
                                    <span className="text-5xl">
                                        {gameData.goals.away}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-4xl font-bold mx-8">
                                    vs
                                </div>
                            )}

                            <div className="text-center flex-1">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                    <Image
                                        src={
                                            gameData.teams.away.logo ||
                                            "/placeholder.svg"
                                        }
                                        alt={gameData.teams.away.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold">
                                    {gameData.teams.away.name}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-3" />
                                <span>
                                    {format(
                                        new Date(gameData.fixture.date),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-3" />
                                <span>
                                    {format(
                                        new Date(gameData.fixture.date),
                                        "HH:mm 'UTC'"
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-3" />
                                <span>
                                    {gameData.fixture.venue.name},{" "}
                                    {gameData.fixture.venue.city}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-3" />
                                <span>Referee: {gameData.fixture.referee}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center space-x-4">
                            <div className="league-logo-wrapper">
                                <Image
                                    src={
                                        gameData.league.logo ||
                                        "/placeholder.svg"
                                    }
                                    alt={gameData.league.name}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-sm">
                                {gameData.league.name} - {gameData.league.round}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {gameData?.statistics !== undefined && (
                <Card className="mb-8 bg-card">
                    <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-6">
                            Match Statistics
                        </h3>
                        <div className="space-y-4">
                            {statisticsToShow.map((type) => {
                                // TODO FIND A NICER WAY TO DO THIS
                                const homeStat =
                                    gameData.statistics[0].statistics.find(
                                        (stat) => stat.type === type
                                    );
                                const awayStat =
                                    gameData.statistics[1].statistics.find(
                                        (stat) => stat.type === type
                                    );

                                // Handle percentage stats differently
                                if (
                                    type === "Ball Possession" ||
                                    type === "Passes %"
                                ) {
                                    const homeValue = Number.parseInt(
                                        homeStat?.value?.toString() || "0"
                                    );
                                    const awayValue = Number.parseInt(
                                        awayStat?.value?.toString() || "0"
                                    );

                                    return (
                                        <div key={type} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    {homeStat?.value || "0%"}
                                                </span>
                                                <span className="font-medium">
                                                    {type}
                                                </span>
                                                <span>
                                                    {awayStat?.value || "0%"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="h-2 w-full text-foreground rounded-l overflow-hidden flex justify-end">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${homeValue}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="h-2 w-full text-foregroundrounded-r overflow-hidden flex justify-start">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{
                                                            width: `${awayValue}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Handle numeric stats
                                const homeValue = Number(homeStat?.value || 0);
                                const awayValue = Number(awayStat?.value || 0);
                                const total = homeValue + awayValue;
                                const homePercentage =
                                    total > 0 ? (homeValue / total) * 100 : 0;
                                const awayPercentage =
                                    total > 0 ? (awayValue / total) * 100 : 0;

                                if (type === "expected_goals") {
                                    type = "Expected Goals";
                                }

                                return (
                                    <div key={type} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{homeValue}</span>
                                            <span className="font-medium">
                                                {type}
                                            </span>
                                            <span>{awayValue}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-2 w-full text-foreground rounded-l overflow-hidden flex justify-end">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${homePercentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="h-2 w-full text-foreground rounded-r overflow-hidden flex justify-start">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${awayPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="mb-8 bg-card">
                <CardContent className="pt-6">
                    {gameData.final_prediction ? (
                        <>
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                AI Predictions:
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500 text-white">
                                    {gameData.final_prediction === "W"
                                        ? "Home Win"
                                        : gameData.final_prediction === "D"
                                        ? "Draw"
                                        : gameData.final_prediction === "L"
                                        ? "Away Win"
                                        : gameData.final_prediction}
                                </span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        {gameData.teams.home.name} Win
                                    </span>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold mr-2">
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction[2] *
                                                          100
                                                  )}%`
                                                : "45%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction[2] *
                                                                  100
                                                          )}%`
                                                        : "45%",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        Draw
                                    </span>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold mr-2">
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction[1] *
                                                          100
                                                  )}%`
                                                : "30%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction[1] *
                                                                  100
                                                          )}%`
                                                        : "30%",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        {gameData.teams.away.name} Win
                                    </span>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold mr-2">
                                            {gameData.prediction
                                                ? `${Math.round(
                                                      gameData.prediction[0] *
                                                          100
                                                  )}%`
                                                : "25%"}
                                        </span>
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{
                                                    width: gameData.prediction
                                                        ? `${Math.round(
                                                              gameData
                                                                  .prediction[0] *
                                                                  100
                                                          )}%`
                                                        : "25%",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {gameData.result && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">
                                        Match Result
                                    </h4>
                                    <div className="flex items-center">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                gameData.result ===
                                                gameData.prediction_given
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            }`}
                                        >
                                            {gameData.result === "W"
                                                ? "Home Win"
                                                : gameData.result === "D"
                                                ? "Draw"
                                                : gameData.result === "L"
                                                ? "Away Win"
                                                : gameData.result}
                                        </span>
                                        {gameData.result ===
                                        gameData.prediction_given ? (
                                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                Prediction correct
                                            </span>
                                        ) : (
                                            <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                                Prediction incorrect
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold mb-4">
                                AI Prediction Pending
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Our AI is analyzing this match and will provide
                                predictions soon.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
