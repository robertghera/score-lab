import type React from "react";
import "../globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <main className="mx-auto px-4 py-16 items-center justify-center">
                {children}
            </main>
        </div>
    );
}
