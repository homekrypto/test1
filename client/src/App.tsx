import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Search from "@/pages/search";
import PropertyDetail from "@/pages/property-detail";
import AgentDashboard from "@/pages/agent/dashboard";
import AddListing from "@/pages/agent/add-listing";
import Subscribe from "@/pages/agent/subscribe";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/search" component={Search} />
          <Route path="/property/:id" component={PropertyDetail} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/property/:id" component={PropertyDetail} />
          <Route path="/agent/dashboard" component={AgentDashboard} />
          <Route path="/agent/add-listing" component={AddListing} />
          <Route path="/agent/subscribe" component={Subscribe} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
