"use client";

import { useState } from "react";
import { format } from "date-fns";
import { BarChart3, Filter, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeagueFilter from "@/components/LeagueFilter";
import CalendarBox from "@/components/CalendarBox";

interface summaryContentType {
    totalGames: number;
    gamesGuessed: number;
    totalOddWin: number;
    expectedWinPerGame: number;
}

interface summaryDataType {
    overall: summaryContentType;
    homeWins: summaryContentType;
    draws: summaryContentType;
    awayWins: summaryContentType;
}

export default function SimulationsPage() {
    const [startDate, setStartDate] = useState<Date>(new Date(2025, 0, 1));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [selectedLeague, setSelectedLeague] = useState<string[]>(["all"]);
    const [selectedModel, setSelectedModel] = useState<string>("test");
    const [open, setOpen] = useState(false);
    const [summaryData, setSummaryData] = useState<summaryDataType>();
    const [showResults, setShowResults] = useState(false);

    const handleGenerate = () => {
        setShowResults(false);
        const leagueIds = selectedLeague.includes("all")
            ? undefined
            : selectedLeague.map((id) => Number.parseInt(id));
        const startDateString = format(startDate, "yyyy-MM-dd");
        const endDateString = format(endDate, "yyyy-MM-dd");
        const extraQuery = leagueIds ? `&leagueIds=${leagueIds}` : "";

        fetch(
            `/api/simulations?startDate=${startDateString}&endDate=${endDateString}&modelName=${selectedModel}${extraQuery}`
        )
            .then((res) => res.json())
            .then((data) => {
                setSummaryData(data.predictions);
                setShowResults(true);
            })
            .catch((error) => {
                console.error("Error fetching simulation data:", error);
            });
    };

    // nice background gradient
    // from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950
    return (
        <div className="min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700">
                            Prediction Simulations
                        </h1>
                        {/* Disabled for now
                        <div className="hidden md:block">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset Filters
                            </Button>
                        </div> */}
                    </div>

                    <Card className="mb-8 border-0 shadow-lg bg-card">
                        <CardHeader className="bg-secondary rounded-t-lg border-b">
                            <CardTitle className="text-2xl font-bold flex items-center">
                                <Filter className="mr-2 h-6 w-6" />
                                Simulation Parameters
                            </CardTitle>
                            <CardDescription>
                                Configure your analysis settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">
                                        Start Date
                                    </label>
                                    <CalendarBox
                                        date={startDate}
                                        setDate={setStartDate}
                                        maxWidth={220}
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">
                                        End Date
                                    </label>
                                    <CalendarBox
                                        date={endDate}
                                        setDate={setEndDate}
                                        maxWidth={220}
                                    />
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">
                                        League
                                    </label>
                                    <LeagueFilter
                                        open={open}
                                        setOpen={setOpen}
                                        selectedLeague={selectedLeague}
                                        setSelectedLeague={setSelectedLeague}
                                        maxWidth={220}
                                    ></LeagueFilter>
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">
                                        Prediction Model
                                    </label>
                                    <Select
                                        value={selectedModel}
                                        onValueChange={setSelectedModel}
                                    >
                                        <SelectTrigger className="w-full border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground border-gray-500">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>
                                                    Models
                                                </SelectLabel>
                                                <SelectItem value="test">
                                                    Standard Model
                                                </SelectItem>
                                                <SelectItem
                                                    value="test1"
                                                    disabled
                                                >
                                                    Time Series Model
                                                </SelectItem>
                                                <SelectItem
                                                    value="test2"
                                                    disabled
                                                >
                                                    Enhanced Model
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                                onClick={handleGenerate}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Generate Simulation
                            </Button>
                        </CardContent>
                    </Card>

                    {summaryData && (
                        <div className="space-y-8 mt-8">
                            <div className="bg-card rounded-lg shadow-xl overflow-hidden border">
                                <div className="bg-secondary p-6 border-b">
                                    <h2 className="text-2xl font-bold flex items-center">
                                        <BarChart3 className="mr-2 h-6 w-6" />
                                        Simulation Results
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Performance analysis for predictions
                                        between {format(startDate!, "PPP")} and{" "}
                                        {format(endDate!, "PPP")}
                                    </p>
                                </div>

                                {showResults &&
                                summaryData.overall.totalGames > 0 ? (
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <StatCard
                                                title="Success Rate"
                                                value={`${(
                                                    (summaryData.overall
                                                        .gamesGuessed /
                                                        summaryData.overall
                                                            .totalGames) *
                                                    100
                                                ).toFixed(1)}%`}
                                                subvalue={`${summaryData.overall.gamesGuessed}/${summaryData.overall.totalGames} games`}
                                                color="bg-green-500"
                                            />
                                            <StatCard
                                                title="Total Games"
                                                value={summaryData.overall.totalGames.toString()}
                                                color="bg-blue-500"
                                            />
                                            <StatCard
                                                title="Total Odd Win"
                                                value={`${summaryData.overall.totalOddWin}`}
                                                color="bg-purple-500"
                                            />
                                            <StatCard
                                                title="Expected Win/Game"
                                                value={`${summaryData.overall.expectedWinPerGame}`}
                                                color="bg-yellow-500"
                                            />
                                        </div>

                                        <div className="bg-primary rounded-lg p-4 mb-6">
                                            <h3 className="text-lg font-semibold mb-4">
                                                Outcome Breakdown
                                            </h3>
                                            <Tabs
                                                defaultValue="home"
                                                className="w-full"
                                            >
                                                <TabsList className="grid grid-cols-3 mb-6 bg-secondary">
                                                    <TabsTrigger value="home">
                                                        Home Wins
                                                    </TabsTrigger>
                                                    <TabsTrigger value="draw">
                                                        Draws
                                                    </TabsTrigger>
                                                    <TabsTrigger value="away">
                                                        Away Wins
                                                    </TabsTrigger>
                                                </TabsList>

                                                {summaryData.homeWins
                                                    .totalGames > 0 ? (
                                                    <TabsContent value="home">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <StatCard
                                                                title="Games Guessed"
                                                                value={`${(
                                                                    (summaryData
                                                                        .homeWins
                                                                        .gamesGuessed /
                                                                        summaryData
                                                                            .homeWins
                                                                            .totalGames) *
                                                                    100
                                                                ).toFixed(1)}%`}
                                                                subvalue={`${summaryData.homeWins.gamesGuessed}/${summaryData.homeWins.totalGames} games`}
                                                                color="bg-green-500"
                                                            />
                                                            <StatCard
                                                                title="Total Games"
                                                                value={summaryData.homeWins.totalGames.toString()}
                                                                color="bg-blue-500"
                                                            />
                                                            <StatCard
                                                                title="Total Odd Win"
                                                                value={`${summaryData.homeWins.totalOddWin}`}
                                                                color="bg-purple-500"
                                                            />
                                                            <StatCard
                                                                title="Expected Win/Game"
                                                                value={`${summaryData.homeWins.expectedWinPerGame}`}
                                                                color="bg-yellow-500"
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                ) : (
                                                    <TabsContent value="home">
                                                        <div className="p-6 text-center">
                                                            Unfortunetlly there
                                                            are no home wins in
                                                            the selected
                                                            filters.
                                                        </div>
                                                    </TabsContent>
                                                )}

                                                {summaryData.draws.totalGames >
                                                0 ? (
                                                    <TabsContent value="draw">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <StatCard
                                                                title="Games Guessed"
                                                                value={`${(
                                                                    (summaryData
                                                                        .draws
                                                                        .gamesGuessed /
                                                                        summaryData
                                                                            .draws
                                                                            .totalGames) *
                                                                    100
                                                                ).toFixed(1)}%`}
                                                                subvalue={`${summaryData.draws.gamesGuessed}/${summaryData.draws.totalGames} games`}
                                                                color="bg-green-500"
                                                            />
                                                            <StatCard
                                                                title="Total Games"
                                                                value={summaryData.draws.totalGames.toString()}
                                                                color="bg-blue-500"
                                                            />
                                                            <StatCard
                                                                title="Total Odd Win"
                                                                value={`${summaryData.draws.totalOddWin}`}
                                                                color="bg-purple-500"
                                                            />
                                                            <StatCard
                                                                title="Expected Win/Game"
                                                                value={`${summaryData.draws.expectedWinPerGame}`}
                                                                color="bg-yellow-500"
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                ) : (
                                                    <TabsContent value="draw">
                                                        <div className="p-6 text-center">
                                                            Unfortunetlly there
                                                            are no draws in the
                                                            selected filters.
                                                        </div>
                                                    </TabsContent>
                                                )}

                                                {summaryData.awayWins
                                                    .totalGames > 0 ? (
                                                    <TabsContent value="away">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <StatCard
                                                                title="Games Guessed"
                                                                value={`${(
                                                                    (summaryData
                                                                        .awayWins
                                                                        .gamesGuessed /
                                                                        summaryData
                                                                            .awayWins
                                                                            .totalGames) *
                                                                    100
                                                                ).toFixed(1)}%`}
                                                                subvalue={`${summaryData.awayWins.gamesGuessed}/${summaryData.awayWins.totalGames} games`}
                                                                color="bg-green-500"
                                                            />
                                                            <StatCard
                                                                title="Total Games"
                                                                value={summaryData.awayWins.totalGames.toString()}
                                                                color="bg-blue-500"
                                                            />
                                                            <StatCard
                                                                title="Total Odd Win"
                                                                value={`${summaryData.awayWins.totalOddWin}`}
                                                                color="bg-purple-500"
                                                            />
                                                            <StatCard
                                                                title="Expected Win/Game"
                                                                value={`${summaryData.awayWins.expectedWinPerGame}`}
                                                                color="bg-yellow-500"
                                                            />
                                                        </div>
                                                    </TabsContent>
                                                ) : (
                                                    <TabsContent value="away">
                                                        <div className="p-6 text-center">
                                                            Unfortunetlly there
                                                            are no away wins in
                                                            the selected
                                                            filters.
                                                        </div>
                                                    </TabsContent>
                                                )}
                                            </Tabs>
                                        </div>
                                    </div>
                                ) : summaryData.overall.totalGames == 0 ? (
                                    <div className="p-6 text-center">
                                        Unfortunetlly there are no games in the
                                        selected filters.
                                    </div>
                                ) : (
                                    <div className="p-6 text-center">
                                        <Loader2 className="animate-spin mx-auto mb-4 h-8 w-8 text-gray-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subvalue = null,
    color,
}: {
    title: string;
    value: string;
    subvalue?: string | null;
    color: string;
}) {
    return (
        <div className="bg-secondary rounded-lg shadow p-4 border">
            <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    {title}
                </h3>
            </div>
            <div className="flex flex-col">
                <p className="text-2xl font-bold">{value}</p>
                {subvalue && (
                    <span className="text-sm text-muted-foreground">
                        {subvalue}
                    </span>
                )}
            </div>
        </div>
    );
}
