import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  ID: number;
  product_name: string;
  product_code: string;
  category: string;
  price: number;
  retail_price: number;
  quantity_in_stock: number;
  supplier: string;
  unit_per_case: number;
  weight: number;
  weight_unit: string;
}

interface ProductSearchBarProps {
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  onProductSelect,
  placeholder = "Search products by name..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchProducts(searchTerm.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (query: string) => {
    try {
      setIsSearching(true);

      // Split search terms by spaces and create filters for each word
      const words = query.toLowerCase().split(' ').filter((word) => word.length > 0);
      const filters = words.map((word) => ({
        name: 'product_name',
        op: 'StringContains' as const,
        value: word
      }));

      const { data, error } = await window.ezsite.apis.tablePage('11726', {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'product_name',
        IsAsc: true,
        Filters: filters
      });

      if (error) throw error;

      const products = data?.List || [];
      setSearchResults(products);
      setShowResults(products.length > 0);

    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Search Error",
        description: "Failed to search products",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <Search className="w-12 h-12 mx-auto text-blue-600" />
          <h3 className="text-lg font-semibold">Manual Product Search</h3>
          <p className="text-muted-foreground">
            Search for products by name to add them to your order
          </p>
          
          <div ref={searchRef} className="relative w-full max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="pr-20"
                onFocus={() => setShowResults(searchResults.length > 0)} />

              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {isSearching &&
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                }
                {searchTerm &&
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0">

                    <X className="h-3 w-3" />
                  </Button>
                }
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 &&
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.map((product) =>
              <div
                key={product.ID}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleProductClick(product)}>

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <h4 className="font-medium text-sm truncate">
                            {product.product_name}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Code: {product.product_code} | Category: {product.category}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-green-600 font-medium">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Stock: {product.quantity_in_stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            }

            {/* No Results Message */}
            {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching &&
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No products found matching "{searchTerm}"
                </p>
              </div>
            }
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default ProductSearchBar;