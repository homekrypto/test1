import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import LoginModal from "@/components/login-modal";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Bed, Bath, Maximize, Globe, Shield, TrendingUp } from "lucide-react";

export default function Landing() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredProperties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const response = await fetch("/api/properties?limit=6");
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?location=${encodeURIComponent(searchQuery)}`;
    }
  };

  const subscriptionPlans = [
    {
      name: "Bronze",
      price: 40,
      description: "Perfect for new agents",
      features: [
        "Up to 5 property listings",
        "Basic analytics",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Silver",
      price: 60,
      description: "For growing agencies",
      features: [
        "Up to 10 property listings",
        "Advanced analytics",
        "Priority support",
        "Featured listings",
        "Lead management tools"
      ],
      popular: true
    },
    {
      name: "Gold",
      price: 80,
      description: "For established agencies",
      features: [
        "Up to 20 property listings",
        "Premium analytics & insights",
        "24/7 phone support",
        "Priority featured listings",
        "Custom branding",
        "API access"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onLoginClick={() => setIsLoginModalOpen(true)} />
      {/* Hero Section */}
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center lg:text-left max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Premium Properties <span className="text-amber-400">Worldwide</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Connect with verified agents and explore luxury real estate opportunities across the globe.
            </p>
            
            {/* Search Bar */}
            <div className="bg-card rounded-2xl p-4 shadow-2xl max-w-2xl">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    type="text" 
                    placeholder="Enter city or country..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm text-muted-foreground">Popular:</span>
                <button 
                  onClick={() => setSearchQuery("New York")}
                  className="text-sm text-primary hover:underline"
                >
                  New York
                </button>
                <button 
                  onClick={() => setSearchQuery("London")}
                  className="text-sm text-primary hover:underline"
                >
                  London
                </button>
                <button 
                  onClick={() => setSearchQuery("Dubai")}
                  className="text-sm text-primary hover:underline"
                >
                  Dubai
                </button>
                <button 
                  onClick={() => setSearchQuery("Tokyo")}
                  className="text-sm text-primary hover:underline"
                >
                  Tokyo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Properties */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Featured Properties</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Handpicked premium properties from our verified agents worldwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(featuredProperties) && featuredProperties.slice(0, 3).map((property: any) => (
              <Card key={property.id} className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img 
                    src={property.coverImage || `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop`}
                    alt={property.title}
                    className="w-full h-64 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-white">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: property.currency || 'USD',
                        minimumFractionDigits: 0
                      }).format(property.price)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{property.title}</h3>
                  <p className="text-muted-foreground mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.city}, {property.country}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {property.bedrooms && (
                      <span className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms} Beds
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms} Baths
                      </span>
                    )}
                    {property.totalArea && (
                      <span className="flex items-center">
                        <Maximize className="w-4 h-4 mr-1" />
                        {property.totalArea} {property.areaUnit}
                      </span>
                    )}
                  </div>
                  <Link href={`/property/${property.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/search">
              <Button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Value Propositions */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Choose PropertyGlobal?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Your trusted partner in international real estate</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-card">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Global Reach</h3>
              <p className="text-muted-foreground">Access premium properties in over 50 countries with verified international agents.</p>
            </Card>
            
            <Card className="text-center p-8 bg-card">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Verified Agents</h3>
              <p className="text-muted-foreground">All our agents are thoroughly vetted and certified professionals you can trust.</p>
            </Card>
            
            <Card className="text-center p-8 bg-card">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-white text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4">Market Insights</h3>
              <p className="text-muted-foreground">Get real-time market data and trends to make informed investment decisions.</p>
            </Card>
          </div>
        </div>
      </section>
      {/* Agent Subscription Plans */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Agent Subscription Plans</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the perfect plan to showcase your properties globally</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative hover:shadow-2xl transition-all duration-300 bg-card ${
                  plan.popular ? 'border-2 border-primary scale-105' : 'border-2 border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-primary' : 'text-card-foreground'}`}>
                      ${plan.price}<span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Save 10% with annual billing</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-card-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary text-white hover:bg-blue-700' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Need more listings? Contact our sales team for a custom plan.</p>
            <Button variant="link" className="text-primary hover:underline font-semibold">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">PropertyGlobal</h3>
              <p className="text-muted-foreground mb-6">Your trusted partner in international real estate investment and property discovery.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Properties</h4>
              <ul className="space-y-3">
                <li><Link href="/search" className="text-muted-foreground hover:text-primary transition-colors duration-200">Buy Properties</Link></li>
                <li><Link href="/search?listingType=for_rent" className="text-muted-foreground hover:text-primary transition-colors duration-200">Rent Properties</Link></li>
                <li><Link href="/search?propertyType=commercial" className="text-muted-foreground hover:text-primary transition-colors duration-200">Commercial</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">For Agents</h4>
              <ul className="space-y-3">
                <li><button onClick={() => setIsLoginModalOpen(true)} className="text-muted-foreground hover:text-primary transition-colors duration-200">Agent Dashboard</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors duration-200">Pricing Plans</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors duration-200">Support</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><button className="text-muted-foreground hover:text-primary transition-colors duration-200">Help Center</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors duration-200">Contact Us</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground">© 2024 PropertyGlobal. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-muted-foreground">Available currencies:</span>
                <div className="flex space-x-2">
                  <span className="bg-accent px-3 py-1 rounded text-sm text-accent-foreground">USD</span>
                  <span className="bg-accent px-3 py-1 rounded text-sm text-accent-foreground">EUR</span>
                  <span className="bg-accent px-3 py-1 rounded text-sm text-accent-foreground">GBP</span>
                  <span className="bg-accent px-3 py-1 rounded text-sm text-accent-foreground">JPY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
