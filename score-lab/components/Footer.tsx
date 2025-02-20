export default function Footer() {
    return (
        <footer className="bg-background border-t">
            <div className="container mx-auto px-4 py-6 text-center">
                <p className="text-muted-foreground">
                    &copy; {new Date().getFullYear()} FootballPredict. All
                    rights reserved.
                </p>
            </div>
        </footer>
    );
}
