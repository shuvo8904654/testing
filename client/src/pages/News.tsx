import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Link } from "wouter";
import type { NewsArticle } from "../../../shared/schema";

export default function News() {
  const { data: newsData, isLoading } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });

  const articles = newsData?.articles || [];

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
        return 'bg-eco-green/10 text-eco-green';
      case 'update':
        return 'bg-youth-blue/10 text-youth-blue';
      case 'reflection':
        return 'bg-yellow-400/20 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="py-20 bg-white" data-testid="news-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">Stories & Updates</h1>
          <p className="text-xl text-gray-600">
            Voices from our community and updates on our journey
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {articles.map((article, index) => (
            <Card 
              key={article.id} 
              className="bg-white shadow-lg overflow-hidden hover-scale"
              data-testid={`news-card-${index}`}
              id={article.id}
            >
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
                data-testid={`news-image-${index}`}
              />
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category || 'general')}`}
                    data-testid={`news-category-${index}`}
                  >
                    {article.category || 'General'}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm ml-auto" data-testid={`news-date-${index}`}>
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <Link href={`/news/${article.id}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-eco-green transition-colors cursor-pointer" data-testid={`news-title-${index}`}>
                    {article.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4" data-testid={`news-excerpt-${index}`}>
                  {article.excerpt}
                </p>
                <div className="border-t pt-4">
                  <p className="text-gray-700 text-sm leading-relaxed" data-testid={`news-content-${index}`}>
                    {article.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!articles || articles.length === 0) && (
          <div className="text-center py-12" data-testid="no-news">
            <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Available</h3>
            <p className="text-gray-600">Check back soon for the latest updates from our community.</p>
          </div>
        )}
      </div>
    </div>
  );
}
