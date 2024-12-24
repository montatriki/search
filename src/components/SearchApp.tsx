'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, ShoppingCart, Star, Heart } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'

interface Product {
  id: string;
  master_data_name: string;
  customer_friendly_name: string;
  product_category: string;
  sales_price: number;
  shipping_price: number;
  brand: string;
  primary_image: string;
  url: string;
}

interface SearchResult {
  id: string;
  similarity_score: number;
}

const SearchApp = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>('/products.json')
        const productsMap: Record<string, Product> = {}
        response.data.forEach((product: Product) => {
          productsMap[product.id] = product
        })
        setProductDetails(productsMap)
      } catch (err) {
        setError('Failed to load product details')
        console.error('Error loading products:', err)
      }
    }

    fetchProducts()
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('http://154.53.160.42:8564/search', {
        query: query,
        top_k: 10
      })
      
      setResults(response.data.results)
    } catch (err) {
      setError('Failed to perform search')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal-200 to-blue-200 p-8">
      <div className="container mx-auto">
        {/* Search Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-teal-800 mb-6 drop-shadow-sm">
            Product Search
          </h1>
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Discover amazing products..."
                className="flex-1 h-14 text-lg bg-white bg-opacity-50 border-2 border-teal-300 focus:border-teal-500 rounded-full px-6"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-14 px-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Search size={24} />
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-white text-center mb-8 bg-red-500 rounded-lg p-4 max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {results.map((result, index) => {
              const product = productDetails[result.id] || {}
              const similarityPercentage = (result.similarity_score * 100).toFixed(1)
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative pt-[75%] bg-gradient-to-br from-blue-100 to-teal-100">
                      {product.primary_image ? (
                        <Image
                          src={product.primary_image}
                          alt={product.master_data_name}
                          layout="fill"
                          objectFit="contain"
                          className="p-4 transition-transform duration-300 hover:scale-105"
                          onError={() => {
                            const imgElement = document.getElementById(`product-image-${product.id}`) as HTMLImageElement;
                            if (imgElement) {
                              imgElement.src = '/placeholder.png';
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          No Image Available
                        </div>
                      )}
                      <Badge className="absolute top-4 right-4 bg-teal-500 hover:bg-teal-600">
                        {similarityPercentage}% Match
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold text-teal-800 mb-2 line-clamp-2">
                        {product.master_data_name}
                      </h2>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.customer_friendly_name}
                      </p>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                        {product.product_category}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-3xl font-bold text-teal-600">
                          ₺{Number(product.sales_price).toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Shipping: ₺{Number(product.shipping_price).toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Brand: <span className="font-semibold">{product.brand}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={16} />
                          <span className="text-gray-700 font-semibold">4.5</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 flex justify-between items-center p-4">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 hover:underline text-sm font-semibold transition-colors duration-300"
                      >
                        View Details
                      </a>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Heart size={20} />
                        </Button>
                        <Button variant="default" size="icon" className="rounded-full bg-teal-600 hover:bg-teal-700">
                          <ShoppingCart size={20} />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SearchApp
