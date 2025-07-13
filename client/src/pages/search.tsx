import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import SearchFilters from "@/components/search-filters";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid3X3, Map, Filter, Search } from "lucide-react";

export default function SearchPage() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    location: urlParams.get('location') || '',
    minPrice: urlParams.get('minPrice') || '',
    maxPrice: urlParams.get('maxPrice') || '',
    propertyType: urlParams.get('propertyType') || '',
    bedrooms: urlParams.get('bedrooms') || '',
    bathrooms: urlParams.get('bathrooms') || '',
    features: urlParams.get('features')?.split(',') || [],
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && (typeof value === 'string' ? value.trim() : value.length > 0)) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/properties?${params.toString()}`);
      return response.json();
    },
  });

  const handleSearch = () => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (typeof value === 'string' ? value.trim() : value.length > 0)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Search by location..." 
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid View
              </Button>
              <Button 
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
                className="flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Map View
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <SearchFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            className="mb-8"
          />
        )}

        {/* Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results Count & Sorting */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Searching...' : `${properties.length} Properties Found`}
              </h2>
            </div>

            {/* Properties Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
              <div className="bg-white rounded-lg shadow-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">Map view integration would go here</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && properties.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or explore different locations.</p>
              </div>
            )}
          </div>

          {/* Sidebar - could contain saved searches, recent views etc */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Try searching by city, country, or neighborhood</li>
                <li>• Use filters to narrow down your results</li>
                <li>• Save properties you're interested in</li>
                <li>• Contact agents directly for more information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
