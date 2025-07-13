import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: {
    location: string;
    minPrice: string;
    maxPrice: string;
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    features: string[];
  };
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export default function SearchFilters({ filters, onFiltersChange, className }: SearchFiltersProps) {
  const propertyTypes = [
    { value: "", label: "Any Type" },
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" },
  ];

  const bedroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
  ];

  const bathroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ];

  const availableFeatures = [
    "Swimming Pool",
    "Gym",
    "Parking",
    "Balcony",
    "Garden",
    "Air Conditioning",
    "Heating",
    "Elevator",
    "Security System",
    "Furnished",
    "Pet Friendly",
    "Smart Home",
    "Fireplace",
    "Walk-in Closet",
    "Laundry Room",
    "Storage",
    "Terrace",
    "Sea View",
    "Mountain View",
    "City View",
  ];

  const nearbyPlaces = [
    "School",
    "Hospital",
    "Metro Station",
    "Beach",
    "Shopping Mall",
    "Restaurant",
    "Park",
    "Airport",
    "University",
    "Pharmacy",
    "Bank",
    "Supermarket",
  ];

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = filters.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    onFiltersChange({
      ...filters,
      features: newFeatures,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      features: [],
    });
  };

  return (
    <Card className={cn("bg-card rounded-2xl shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Filter Properties</h3>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Price Range */}
          <div className="lg:col-span-2">
            <Label className="block text-sm font-medium text-card-foreground mb-2">Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
              />
              <Input
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Property Type</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => onFiltersChange({ ...filters, propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</Label>
            <Select
              value={filters.bedrooms}
              onValueChange={(value) => onFiltersChange({ ...filters, bedrooms: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bathrooms */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</Label>
            <Select
              value={filters.bathrooms}
              onValueChange={(value) => onFiltersChange({ ...filters, bathrooms: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {bathroomOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <Button className="w-full bg-primary text-white hover:bg-blue-700">
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-3">Features & Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={filters.features?.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label 
                  htmlFor={`feature-${feature}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Places Section */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-3">Nearby Places</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {nearbyPlaces.map((place) => (
              <div key={place} className="flex items-center space-x-2">
                <Checkbox
                  id={`nearby-${place}`}
                  checked={filters.features?.includes(place)}
                  onCheckedChange={() => handleFeatureToggle(place)}
                />
                <Label 
                  htmlFor={`nearby-${place}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {place}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
