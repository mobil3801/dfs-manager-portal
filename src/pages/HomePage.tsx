import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
            <header className="py-6 px-8 border-b">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Logo />
                        <h1 className="text-xl font-bold">DFS Manager Portal</h1>
                    </div>
                    <nav className="space-x-4">
                        <Button variant="link" asChild>
                            <Link to="/login">Login</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto py-12 px-4">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">Welcome to DFS Manager Portal</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Complete gas station management solution for MOBIL, AMOCO ROSEDALE, and AMOCO BROOKLYN stations.
                    </p>
                    <Button asChild size="lg">
                        <Link to="/login">Get Started</Link>
                    </Button>
                </section>
            </main>

            <footer className="border-t py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} DFS Manager Portal. All rights reserved.</p>
                </div>
            </footer>
        </div>);

};

export default HomePage;