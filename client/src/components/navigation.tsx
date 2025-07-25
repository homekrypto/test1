import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavigationProps {
  onLoginClick?: () => void;
}

export default function Navigation({ onLoginClick }: NavigationProps) {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">PropertyGlobal</h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link href="/search" className="text-foreground hover:text-primary transition-colors duration-200">
                Browse Properties
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/agent/dashboard" className="text-foreground hover:text-primary transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link href="/agent/add-listing" className="text-foreground hover:text-primary transition-colors duration-200">
                    Add Listing
                  </Link>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <span className="text-sm text-muted-foreground">
                      Welcome, {user?.firstName || 'Agent'}
                    </span>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/api/logout'}
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <button className="text-foreground hover:text-primary transition-colors duration-200">
                    For Agents
                  </button>
                  <button className="text-foreground hover:text-primary transition-colors duration-200">
                    About
                  </button>
                  
                  <ThemeToggle />
                  
                  <Button 
                    onClick={onLoginClick || (() => window.location.href = '/api/login')}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            <Link href="/search" className="block px-3 py-2 text-foreground hover:text-primary">
              Browse Properties
            </Link>
            
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            
            {isAuthenticated ? (
              <>
                <Link href="/agent/dashboard" className="block px-3 py-2 text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/agent/add-listing" className="block px-3 py-2 text-foreground hover:text-primary">
                  Add Listing
                </Link>
                <button 
                  onClick={() => window.location.href = '/api/logout'}
                  className="block w-full text-left px-3 py-2 text-foreground hover:text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="block px-3 py-2 text-foreground hover:text-primary">
                  For Agents
                </button>
                <button className="block px-3 py-2 text-foreground hover:text-primary">
                  About
                </button>
                <Button 
                  onClick={onLoginClick || (() => window.location.href = '/api/login')}
                  className="mx-3 my-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
