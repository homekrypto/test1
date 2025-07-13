import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.firstName || 'Agent'}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your properties and grow your real estate business
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/agent/dashboard">
              <Button className="w-full h-32 flex flex-col items-center justify-center text-lg">
                <span className="text-2xl mb-2">🏢</span>
                Agent Dashboard
              </Button>
            </Link>
            
            <Link href="/agent/add-listing">
              <Button className="w-full h-32 flex flex-col items-center justify-center text-lg">
                <span className="text-2xl mb-2">➕</span>
                Add New Listing
              </Button>
            </Link>
            
            <Link href="/search">
              <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center text-lg">
                <span className="text-2xl mb-2">🔍</span>
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
