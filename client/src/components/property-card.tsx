import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    price: number;
    currency: string;
    city: string;
    country: string;
    coverImage?: string;
    bedrooms?: number;
    bathrooms?: number;
    totalArea?: number;
    areaUnit?: string;
    listingType: string;
    status: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sold':
      case 'removed':
        return <Badge variant="destructive">{status.toUpperCase()}</Badge>;
      case 'pending':
        return <Badge variant="secondary">PENDING</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative">
        <img 
          src={property.coverImage || `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop`}
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4">
          {getStatusBadge(property.status)}
        </div>
        {property.listingType && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-white">
              {property.listingType.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
          {property.title}
        </h3>
        
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
          <Button 
            variant="outline" 
            className="w-full hover:bg-gray-50 transition-colors duration-200"
            disabled={property.status === 'sold' || property.status === 'removed'}
          >
            {property.status === 'sold' || property.status === 'removed' ? 'Unavailable' : 'View Details'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
