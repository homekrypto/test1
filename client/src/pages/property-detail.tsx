import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar,
  DollarSign,
  Phone,
  Mail,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    inquirerName: '',
    inquirerEmail: '',
    inquirerPhone: '',
    message: ''
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ['/api/properties', id],
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      if (!response.ok) {
        throw new Error('Property not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof inquiryForm) => {
      return apiRequest('POST', `/api/properties/${id}/inquire`, data);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry sent successfully!",
        description: "The agent will contact you soon.",
      });
      setInquiryForm({
        inquirerName: '',
        inquirerEmail: '',
        inquirerPhone: '',
        message: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send inquiry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inquiryMutation.mutate(inquiryForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
            <Link href="/search">
              <Button>Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.galleryImages && property.galleryImages.length > 0 
    ? [property.coverImage, ...property.galleryImages].filter(Boolean)
    : [property.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/search">
          <Button variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden">
                <img 
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Property Details */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </CardTitle>
                    <p className="text-gray-600 flex items-center text-lg">
                      <MapPin className="w-5 h-5 mr-2" />
                      {property.streetAddress}, {property.city}, {property.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: property.currency || 'USD',
                        minimumFractionDigits: 0
                      }).format(property.price)}
                    </div>
                    <Badge variant={property.listingType === 'for_sale' ? 'default' : 'secondary'}>
                      {property.listingType?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  )}
                  {property.totalArea && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Maximize className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-semibold">{property.totalArea}</div>
                      <div className="text-sm text-gray-600">{property.areaUnit}</div>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-semibold">{property.yearBuilt}</div>
                      <div className="text-sm text-gray-600">Built</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="justify-start">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Places */}
                {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Nearby</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {property.nearbyPlaces.map((place: string, index: number) => (
                        <Badge key={index} variant="secondary" className="justify-start">
                          {place}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {property.agent.profileImageUrl ? (
                    <img 
                      src={property.agent.profileImageUrl}
                      alt={`${property.agent.firstName} ${property.agent.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">
                      {property.agent.firstName} {property.agent.lastName}
                    </div>
                    {property.agent.agencyName && (
                      <div className="text-sm text-gray-600">{property.agent.agencyName}</div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.agent.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span>{property.agent.phoneNumber}</span>
                  </div>
                )}
                {property.agent.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span>{property.agent.email}</span>
                  </div>
                )}

                {/* Inquiry Form */}
                <form onSubmit={handleInquirySubmit} className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Send an Inquiry</h4>
                  
                  <Input
                    placeholder="Your Name"
                    value={inquiryForm.inquirerName}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, inquirerName: e.target.value }))}
                    required
                  />
                  
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={inquiryForm.inquirerEmail}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, inquirerEmail: e.target.value }))}
                    required
                  />
                  
                  <Input
                    placeholder="Your Phone (Optional)"
                    value={inquiryForm.inquirerPhone}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, inquirerPhone: e.target.value }))}
                  />
                  
                  <Textarea
                    placeholder="Your message..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={inquiryMutation.isPending}
                  >
                    {inquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium capitalize">{property.propertyType?.replace('_', ' ')}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                )}
                {property.ownershipType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership</span>
                    <span className="font-medium capitalize">{property.ownershipType}</span>
                  </div>
                )}
                {property.furnishingStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furnished</span>
                    <span className="font-medium capitalize">{property.furnishingStatus}</span>
                  </div>
                )}
                {property.parkingSpaces && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parking</span>
                    <span className="font-medium">{property.parkingSpaces} spaces</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
