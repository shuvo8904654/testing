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

export default function NewsArticle() {
  const [, params] = useRoute("/news/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const { data: article, isLoading, error } = useQuery({
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/news")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Cover Image */}
          {(article.coverImageUrl || article.imageUrl) && (
            <div className="relative h-64 md:h-96 overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}

          <CardHeader className="space-y-4">
            {/* Category Badge */}
            {article.category && (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" data-testid="badge-category">
                  {article.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" data-testid="text-title">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed" data-testid="text-excerpt">
                {article.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center" data-testid="meta-date">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(article.createdAt), 'MMMM d, yyyy')}
              </div>
              
              {article.author && (
                <div className="flex items-center" data-testid="meta-author">
                  <User className="w-4 h-4 mr-2" />
                  {article.author}
                </div>
              )}
              
              {article.readCount !== undefined && (
                <div className="flex items-center" data-testid="meta-reads">
                  <Eye className="w-4 h-4 mr-2" />
                  {article.readCount} reads
                </div>
              )}
            </div>

            <Separator />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              data-testid="content-article"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br>') 
              }}
            />

            {/* Additional Images Gallery */}
            {article.images && article.images.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {article.images.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                      <img
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        data-testid={`gallery-image-${index}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  {article.tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300" 
                      data-testid={`tag-${index}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share this article</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSharing(!isSharing)}
                  data-testid="button-toggle-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Options
                </Button>
              </div>

              {/* Share Buttons */}
              {isSharing && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center"
                    data-testid="button-share-facebook"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center"
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center"
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleShare('copy')}
                    className="flex items-center justify-center"
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles or Back to News */}
        <div className="mt-8 text-center">
          <Button onClick={() => setLocation("/news")} data-testid="button-back-bottom">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All News
          </Button>
        </div>
      </div>
    </div>
  );
}