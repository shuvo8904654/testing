import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { NewsArticle as NewsArticleType } from "@shared/schema";

export default function NewsArticle() {
  const [, params] = useRoute("/news/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const { data: article, isLoading, error } = useQuery<NewsArticleType>({
    queryKey: ["/api/news", params?.id],
    enabled: !!params?.id,
  });

  const handleShare = (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const title = article.title;
    const description = article.excerpt || article.content.substring(0, 150) + '...';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Article link has been copied to your clipboard.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (!article) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.content.substring(0, 150) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setIsSharing(!isSharing);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/news")} data-testid="button-back-news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/news")}
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                className="bg-white hover:bg-gray-50 border-gray-200"
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto">
        {/* Hero Section */}
        {(article.coverImageUrl || article.imageUrl) && (
          <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
            <img
              src={article.coverImageUrl || article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              data-testid="img-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Title Overlay on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="max-w-4xl mx-auto">
                {article.category && (
                  <span className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full border border-white/30" data-testid="badge-category">
                    {article.category}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4" data-testid="text-title">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-xl md:text-2xl text-gray-100 leading-relaxed mb-6 max-w-3xl" data-testid="text-excerpt">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Article Header (when no cover image) */}
        {!(article.coverImageUrl || article.imageUrl) && (
          <header className="px-8 pt-12 pb-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-4xl mx-auto">
              {article.category && (
                <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full" data-testid="badge-category">
                  {article.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6" data-testid="text-title">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed" data-testid="text-excerpt">
                  {article.excerpt}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Article Meta */}
        <div className="px-8 py-6 bg-gray-50 border-b">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center" data-testid="meta-date">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={article.createdAt.toISOString()}>
                  {format(new Date(article.createdAt), 'EEEE, MMMM d, yyyy')}
                </time>
              </div>
              
              {article.author && (
                <div className="flex items-center" data-testid="meta-author">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">By {article.author}</span>
                </div>
              )}
              
              {article.readCount !== undefined && (
                <div className="flex items-center" data-testid="meta-reads">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{article.readCount.toLocaleString()} reads</span>
                </div>
              )}
              
              {article.estimatedReadTime && (
                <div className="flex items-center">
                  <span>{article.estimatedReadTime} min read</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="px-8 py-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-xl prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-8 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-em:text-gray-800 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none"
              data-testid="content-article"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br>') 
              }}
            />

            {/* Additional Images Gallery */}
            {article.images && article.images.length > 0 && (
              <div className="mt-16 pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {article.images.map((imageUrl: string, index: number) => (
                    <div key={index} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-lg hover:shadow-2xl transition-all duration-300">
                      <img
                        src={imageUrl}
                        alt={article.title || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        data-testid={`gallery-image-${index}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Share Section */}
        <div className="px-8 py-12 bg-gray-50 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Share this article</h3>
              <p className="text-gray-600 mb-8">Found this article interesting? Share it with your network</p>
              
              <div className="flex items-center justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setIsSharing(!isSharing)}
                  className="bg-white hover:bg-gray-50 border-gray-200 px-6 py-3"
                  data-testid="button-toggle-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? 'Hide' : 'Show'} Share Options
                </Button>
              </div>

              {/* Share Buttons */}
              {isSharing && (
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button
                    onClick={() => handleShare('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
                    data-testid="button-share-facebook"
                  >
                    <Facebook className="w-5 h-5 mr-2" />
                    Facebook
                  </Button>
                  
                  <Button
                    onClick={() => handleShare('twitter')}
                    className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-full"
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Twitter
                  </Button>
                  
                  <Button
                    onClick={() => handleShare('linkedin')}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-full"
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin className="w-5 h-5 mr-2" />
                    LinkedIn
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleShare('copy')}
                    className="bg-white hover:bg-gray-50 border-gray-200 px-6 py-3 rounded-full"
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to News */}
        <div className="px-8 py-12 bg-white text-center">
          <Button 
            onClick={() => setLocation("/news")} 
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full"
            data-testid="button-back-bottom"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to All News
          </Button>
        </div>
      </article>
    </div>
  );
}