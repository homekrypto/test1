import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Home, 
  Eye,
  Mail,
  DollarSign,
  TrendingUp,
  Edit
} from "lucide-react";

export default function AgentDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/agent/properties"],
    retry: false,
    onError: (error) => {
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
    },
  });

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ["/api/agent/inquiries"],
    retry: false,
    onError: (error) => {
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
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeProperties = properties.filter((p: any) => p.status === 'active').length;
  const totalViews = properties.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  const recentInquiries = inquiries.filter((i: any) => {
    const inquiryDate = new Date(i.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return inquiryDate > weekAgo;
  }).length;

  const hasSubscription = user?.subscriptionStatus === 'active';
  const subscriptionPlan = user?.subscriptionPlan;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Agent'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your properties and grow your business
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/agent/add-listing">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Subscription Status */}
        {!hasSubscription && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    Subscription Required
                  </h3>
                  <p className="text-amber-700">
                    Subscribe to start listing your properties and connect with buyers worldwide.
                  </p>
                </div>
                <Link href="/agent/subscribe">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Subscribe Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {hasSubscription && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {subscriptionPlan?.toUpperCase()} Plan Active
                  </h3>
                  <p className="text-green-700">
                    Your subscription is active and ready to use.
                  </p>
                </div>
                <Badge className="bg-green-600">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{activeProperties}</p>
                </div>
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{recentInquiries}</p>
                </div>
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-4">Create your first listing to get started.</p>
                  <Link href="/agent/add-listing">
                    <Button>Add Your First Property</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.slice(0, 5).map((property: any) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.city}, {property.country}</p>
                        <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                          {property.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: property.currency || 'USD',
                            minimumFractionDigits: 0
                          }).format(property.price)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/agent/edit-listing/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/property/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiriesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries yet</h3>
                  <p className="text-gray-600">Inquiries from potential buyers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.slice(0, 5).map((inquiry: any) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{inquiry.inquirerName}</h4>
                        <Badge variant="outline">
                          {inquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{inquiry.inquirerEmail}</p>
                      {inquiry.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {inquiry.message.length > 100 
                            ? `${inquiry.message.substring(0, 100)}...` 
                            : inquiry.message
                          }
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
