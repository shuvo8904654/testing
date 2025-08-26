import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, User, ArrowRight, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { NewsArticle } from "../../../shared/schema";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: newsData, isLoading } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });

  const articles = newsData?.articles || [];
  
  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = Array.from(new Set(articles.map(article => article.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'success story':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'update':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'reflection':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'announcement':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'event':
        return 'bg-pink-100 text-pink-700 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };
  
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="news-page">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="page-title">
              Latest Stories
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12">
              Stay updated with our community's journey, achievements, and impactful stories
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300 focus:bg-white/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Filter className="w-5 h-5 text-blue-200" />
                  <Button
                    variant={selectedCategory === null ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={selectedCategory === null ? 
                      "bg-white text-blue-700 hover:bg-gray-100" : 
                      "border-white/30 text-white hover:bg-white/10"}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? 
                        "bg-white text-blue-700 hover:bg-gray-100" : 
                        "border-white/30 text-white hover:bg-white/10"}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Articles Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured Article (First Article) */}
          {filteredArticles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Story</h2>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                  {(filteredArticles[0].coverImageUrl || filteredArticles[0].imageUrl) && (
                    <div className="relative h-64 lg:h-auto overflow-hidden">
                      <img
                        src={filteredArticles[0].coverImageUrl || filteredArticles[0].imageUrl}
                        alt={filteredArticles[0].title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        data-testid="featured-image"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className={getCategoryColor(filteredArticles[0].category || 'general')}>
                        {filteredArticles[0].category || 'General'}
                      </Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {format(new Date(filteredArticles[0].createdAt), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {getReadTime(filteredArticles[0].content)} min read
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {filteredArticles[0].title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {filteredArticles[0].excerpt || truncateText(filteredArticles[0].content, 150)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        <span className="text-sm">{filteredArticles[0].author}</span>
                      </div>
                      <Link href={`/news/${filteredArticles[0].id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">
                          Read Full Story
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Regular Articles Grid */}
          {filteredArticles.length > 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">More Stories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.slice(1).map((article, index) => {
                  const displayImage = article.coverImageUrl || article.imageUrl;
                  const actualIndex = index + 1;
                  return (
                    <Card 
                      key={article.id} 
                      className="bg-white shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 group"
                      data-testid={`news-card-${actualIndex}`}
                    >
                      {displayImage && (
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img 
                            src={displayImage} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-testid={`news-image-${actualIndex}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={getCategoryColor(article.category || 'general')} data-testid={`news-category-${actualIndex}`}>
                            {article.category || 'General'}
                          </Badge>
                          <div className="flex items-center text-gray-400 text-xs" data-testid={`news-date-${actualIndex}`}>
                            <CalendarDays className="w-3 h-3 mr-1" />
                            {format(new Date(article.createdAt), 'MMM d')}
                          </div>
                        </div>
                        <Link href={`/news/${article.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2" data-testid={`news-title-${actualIndex}`}>
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3" data-testid={`news-excerpt-${actualIndex}`}>
                          {article.excerpt || truncateText(article.content, 120)}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center text-gray-500 text-xs">
                            <User className="w-3 h-3 mr-1" />
                            <span>{article.author}</span>
                            <Clock className="w-3 h-3 ml-3 mr-1" />
                            <span>{getReadTime(article.content)} min</span>
                          </div>
                          <Link href={`/news/${article.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                              Read More
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Articles Found */}
          {(!filteredArticles || filteredArticles.length === 0) && (
            <div className="text-center py-16" data-testid="no-news">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <CalendarDays className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchQuery || selectedCategory ? 'No matches found' : 'No articles yet'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {searchQuery || selectedCategory ? 
                    'Try adjusting your search or filter criteria.' : 
                    'Check back soon for the latest updates from our community.'}
                </p>
                {(searchQuery || selectedCategory) && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    variant="outline" 
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
