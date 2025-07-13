import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ priceId }: { priceId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/agent/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || !elements}>
        Subscribe
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const subscriptionPlans = [
    {
      id: "bronze",
      name: "Bronze",
      price: 40,
      priceId: "price_bronze_monthly", // This would be set in Stripe
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
      id: "silver",
      name: "Silver",
      price: 60,
      priceId: "price_silver_monthly", // This would be set in Stripe
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
      id: "gold",
      name: "Gold",
      price: 80,
      priceId: "price_gold_monthly", // This would be set in Stripe
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

  const handlePlanSelect = async (plan: typeof subscriptionPlans[0]) => {
    setSelectedPlan(plan.id);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { 
        priceId: plan.priceId 
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm priceId={subscriptionPlans.find(p => p.id === selectedPlan)?.priceId || ""} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Subscription Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Select the perfect plan to showcase your properties globally</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                plan.popular ? 'border-2 border-primary scale-105' : 'border-2 border-gray-200'
              }`}
              onClick={() => handlePlanSelect(plan)}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-primary' : 'text-gray-900'}`}>
                    ${plan.price}<span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500">Save 10% with annual billing</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Need more listings? Contact our sales team for a custom plan.</p>
          <Button variant="link" className="text-primary hover:underline font-semibold">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
