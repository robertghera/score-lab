"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // TODO: treat error case
    const { data, isPending } = authClient.useSession();
    const router = useRouter();

    const toggleMenu = () => setIsOpen(!isOpen);
    return (
        <nav className="border-b bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-foreground font-bold text-xl"
                        >
                            FootballPredict
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/predictions"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Predictions
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Leaderboard
                        </Link>
                        {isPending ? (
                            <Button disabled>
                                <Loader2 className="animate-spin" />
                            </Button>
                        ) : data ? (
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    await authClient.signOut({
                                        fetchOptions: {
                                            onSuccess: () => {
                                                router.push("/");
                                            },
                                        },
                                    });
                                }}
                            >
                                Sign Out
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    href={"/sign-in"}
                                >
                                    <User
                                        className="inline-block mr-1"
                                        size={16}
                                    />
                                    Sign In
                                </Link>
                            </Button>
                        )}
                        <ThemeToggle />
                    </div>
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            onClick={toggleMenu}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden border-t bg-background">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            href="/predictions"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        >
                            Predictions
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        >
                            Leaderboard
                        </Link>
                        <Link
                            href="/login"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                        >
                            <User className="inline-block mr-1" size={16} />
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
