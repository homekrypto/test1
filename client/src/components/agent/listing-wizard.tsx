import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema } from "@shared/schema";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye,
  MapPin,
  DollarSign,
  Home,
  Camera,
  FileText,
  User,
  CheckCircle
} from "lucide-react";

const listingSchema = insertPropertySchema.extend({
  // Make some fields optional for draft saving
  price: z.string().min(1, "Price is required"),
  totalArea: z.string().optional(),
  livingArea: z.string().optional(),
  lotSize: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  maintenanceFees: z.string().optional(),
  propertyTaxes: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

const steps = [
  { id: 1, title: "General Information", icon: FileText },
  { id: 2, title: "Location Details", icon: MapPin },
  { id: 3, title: "Price & Financials", icon: DollarSign },
  { id: 4, title: "Property Metrics", icon: Home },
  { id: 5, title: "Features & Amenities", icon: CheckCircle },
  { id: 6, title: "Media Uploads", icon: Camera },
  { id: 7, title: "Availability & Legal", icon: FileText },
  { id: 8, title: "Agent Information", icon: User },
  { id: 9, title: "Review & Publish", icon: Eye },
];

export default function ListingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedNearbyPlaces, setSelectedNearbyPlaces] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      listingType: "for_sale",
      propertyType: "apartment",
      country: "",
      city: "",
      streetAddress: "",
      price: "",
      currency: "USD",
      paymentFrequency: "one_time",
      areaUnit: "sqm",
      isNegotiable: false,
      acceptsCrypto: false,
      hasElevator: false,
      titleDeedAvailable: false,
      exclusiveListing: false,
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/agent/properties', data);
    },
    onSuccess: () => {
      toast({
        title: "Property created successfully!",
        description: "Your listing is now live on the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent/properties'] });
      // Redirect to dashboard
      window.location.href = '/agent/dashboard';
    },
    onError: (error) => {
      toast({
        title: "Failed to create property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleNearbyPlaceToggle = (place: string) => {
    setSelectedNearbyPlaces(prev => 
      prev.includes(place) 
        ? prev.filter(p => p !== place)
        : [...prev, place]
    );
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      // Convert string numbers to actual numbers where needed
      const processedData = {
        ...data,
        price: parseFloat(data.price),
        totalArea: data.totalArea ? parseFloat(data.totalArea) : undefined,
        livingArea: data.livingArea ? parseFloat(data.livingArea) : undefined,
        lotSize: data.lotSize ? parseFloat(data.lotSize) : undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        maintenanceFees: data.maintenanceFees ? parseFloat(data.maintenanceFees) : undefined,
        propertyTaxes: data.propertyTaxes ? parseFloat(data.propertyTaxes) : undefined,
        features: selectedFeatures,
        nearbyPlaces: selectedNearbyPlaces,
      };

      await createPropertyMutation.mutateAsync(processedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const saveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your progress has been saved locally.",
    });
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  const availableFeatures = [
    "Swimming Pool", "Gym", "Parking", "Balcony", "Garden", "Air Conditioning",
    "Heating", "Elevator", "Security System", "Furnished", "Pet Friendly",
    "Smart Home", "Fireplace", "Walk-in Closet", "Laundry Room", "Storage",
    "Terrace", "Sea View", "Mountain View", "City View"
  ];

  const nearbyPlaces = [
    "School", "Hospital", "Metro Station", "Beach", "Shopping Mall",
    "Restaurant", "Park", "Airport", "University", "Pharmacy", "Bank", "Supermarket"
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
  ];

  const cryptos = ["BTC", "ETH", "USDT", "BNB", "ADA", "DOT"];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // General Information
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Luxury Downtown Penthouse with City Views" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your property in detail..."
                      rows={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="for_sale">For Sale</SelectItem>
                        <SelectItem value="for_rent">For Rent</SelectItem>
                        <SelectItem value="pre_sale">Pre-Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2: // Location Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main Street, Apt 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="stateProvince"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">GPS Coordinates (Optional)</Label>
              <p className="text-sm text-gray-600 mb-4">These will be auto-filled when you enter the address above</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Latitude" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Longitude" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Price & Financials
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">One-time (for sales)</SelectItem>
                      <SelectItem value="monthly">Monthly (for rentals)</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="isNegotiable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Negotiable Price</FormLabel>
                      <div className="text-sm text-gray-600">
                        Is the price open to negotiation?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptsCrypto"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Accepts Crypto</FormLabel>
                      <div className="text-sm text-gray-600">
                        Accept cryptocurrency payments?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("acceptsCrypto") && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Accepted Cryptocurrencies</Label>
                <div className="grid grid-cols-3 gap-3">
                  {cryptos.map((crypto) => (
                    <div key={crypto} className="flex items-center space-x-2">
                      <Checkbox id={crypto} />
                      <Label htmlFor={crypto} className="text-sm">{crypto}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="maintenanceFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Fees (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyTaxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Taxes (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 4: // Property Metrics
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="totalArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Area</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="livingArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Living Area</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="areaUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sqm">Square Meters (sqm)</SelectItem>
                      <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floors</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="parkingSpaces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Spaces</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="furnishingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Furnishing Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Fully Furnished</SelectItem>
                        <SelectItem value="partially">Partially Furnished</SelectItem>
                        <SelectItem value="no">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floorNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="hasElevator"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Elevator Access</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="view"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary View</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sea">Sea View</SelectItem>
                        <SelectItem value="mountain">Mountain View</SelectItem>
                        <SelectItem value="city">City View</SelectItem>
                        <SelectItem value="garden">Garden View</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energyRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Rating</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 5: // Features & Amenities
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">Property Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={selectedFeatures.includes(feature)}
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

            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">Nearby Places</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {nearbyPlaces.map((place) => (
                  <div key={place} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nearby-${place}`}
                      checked={selectedNearbyPlaces.includes(place)}
                      onCheckedChange={() => handleNearbyPlaceToggle(place)}
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

            {/* Selected Features Preview */}
            {selectedFeatures.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Selected Features:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedNearbyPlaces.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Selected Nearby Places:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedNearbyPlaces.map((place) => (
                    <Badge key={place} variant="outline">
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Media Uploads
        return (
          <div className="space-y-6">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Property Images</h3>
              <p className="text-gray-600 mb-4">Drag and drop images here, or click to select files</p>
              <Button variant="outline">Choose Files</Button>
              <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, WEBP (Max 10MB each)</p>
            </div>

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoTourUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Tour URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="YouTube or Vimeo URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="virtualTourUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Virtual Tour URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="360° virtual tour URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floorPlanImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor Plan Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/floorplan.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 7: // Availability & Legal
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="availableFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownershipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ownership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="freehold">Freehold</SelectItem>
                      <SelectItem value="leasehold">Leasehold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="titleDeedAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Title Deed Available</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exclusiveListing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Exclusive Listing</FormLabel>
                      <div className="text-sm text-gray-600">
                        Only your agency represents this property
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 8: // Agent Information
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Agent Contact Information</h3>
              <p className="text-blue-700">This information will be automatically filled from your profile and displayed to potential buyers.</p>
            </div>

            <FormField
              control={form.control}
              name="agencyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agency Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your real estate agency" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your professional license number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 9: // Review & Publish
        return (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Your Listing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                  <p><strong>Title:</strong> {form.watch("title") || "Not specified"}</p>
                  <p><strong>Type:</strong> {form.watch("propertyType")?.replace('_', ' ') || "Not specified"}</p>
                  <p><strong>Location:</strong> {form.watch("city")}, {form.watch("country")}</p>
                  <p><strong>Price:</strong> {form.watch("currency")} {form.watch("price")}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Property Details</h4>
                  <p><strong>Bedrooms:</strong> {form.watch("bedrooms") || "Not specified"}</p>
                  <p><strong>Bathrooms:</strong> {form.watch("bathrooms") || "Not specified"}</p>
                  <p><strong>Area:</strong> {form.watch("totalArea")} {form.watch("areaUnit")}</p>
                  <p><strong>Year Built:</strong> {form.watch("yearBuilt") || "Not specified"}</p>
                </div>
              </div>

              {selectedFeatures.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm">
                  I confirm that all information provided is accurate and I accept the platform's terms and conditions for listing properties.
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={saveDraft}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-blue-700"
                disabled={createPropertyMutation.isPending}
              >
                {createPropertyMutation.isPending ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
            Step {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <Link href="/agent/dashboard">
            <Button variant="outline" size="sm">Cancel</Button>
          </Link>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-2 mt-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === step.id 
                    ? 'bg-primary text-white' 
                    : currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button 
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={saveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary hover:bg-blue-700"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending ? 'Publishing...' : 'Publish Listing'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
