import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useDynamicMeta } from "@/hooks/useDynamicMeta";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy,
  Eye,
  Clock
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

  // Update meta tags for social sharing when article loads
  useDynamicMeta({
    title: article?.title || undefined,
    description: article?.excerpt || (article?.content ? article.content.substring(0, 150) + '...' : undefined),
    image: article?.coverImageUrl || article?.imageUrl || undefined,
    url: window.location.href,
    type: 'article',
    siteName: '3ZERO Club Kurigram',
    author: article?.author || undefined,
    publishedTime: article?.createdAt ? new Date(article.createdAt).toISOString() : undefined
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
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/news")}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to</span> News
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              data-testid="button-share"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Article Column */}
          <article className="lg:col-span-8 min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full">
              {/* Hero Image */}
              {(article.coverImageUrl || article.imageUrl) && (
                <div className="relative w-full aspect-[16/9] sm:aspect-[3/2] lg:aspect-[2/1] overflow-hidden">
                  <img
                    src={article.coverImageUrl || article.imageUrl || ''}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    data-testid="img-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              )}
              
              {/* Article Header */}
              <div className="p-4 sm:p-6 lg:p-8 w-full">
                {/* Category and Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {article.category && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full" data-testid="badge-category">
                        {article.category}
                      </span>
                    )}
                    <div className="flex items-center text-sm text-gray-500" data-testid="meta-date">
                      <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <time dateTime={new Date(article.createdAt).toISOString()} className="truncate">
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </time>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {article.author && (
                      <div className="flex items-center" data-testid="meta-author">
                        <User className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">By {article.author}</span>
                      </div>
                    )}
                    
                    {article.readCount !== undefined && (
                      <div className="flex items-center" data-testid="meta-reads">
                        <Eye className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>{article.readCount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {article.estimatedReadTime && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>{article.estimatedReadTime} min</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-6 break-words" data-testid="text-title">
                  {article.title}
                </h1>
                
                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4 sm:pl-6 break-words" data-testid="text-excerpt">
                    {article.excerpt}
                  </p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Article Content */}
                <div 
                  className="prose prose-lg prose-gray w-full max-w-none overflow-hidden break-words prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:break-words prose-a:text-blue-600 prose-a:no-underline prose-a:break-words hover:prose-a:underline prose-strong:text-gray-900 prose-em:text-gray-600 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:break-words prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800 prose-code:break-words prose-code:before:content-none prose-code:after:content-none prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1 prose-img:w-full prose-img:h-auto prose-img:max-w-full"
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  data-testid="content-article"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.replace(/\n/g, '<br>') 
                  }}
                />

                {/* Additional Images Gallery */}
                {article.images && article.images.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {article.images.map((imageUrl: string, index: number) => (
                        <div key={index} className="group relative rounded-lg overflow-hidden bg-gray-100 aspect-[4/3] hover:shadow-lg transition-all duration-300 w-full">
                          <img
                            src={imageUrl}
                            alt={article.title || `Gallery image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ maxWidth: '100%', height: 'auto' }}
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
                
                {/* Social Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSharing(!isSharing)}
                      className="text-gray-700"
                      data-testid="button-toggle-share"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {isSharing ? 'Hide' : 'Show'} Options
                    </Button>
                  </div>

                  {isSharing && (
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => handleShare('facebook')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        data-testid="button-share-facebook"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                      
                      <Button
                        onClick={() => handleShare('twitter')}
                        className="bg-blue-400 hover:bg-blue-500 text-white"
                        size="sm"
                        data-testid="button-share-twitter"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                      
                      <Button
                        onClick={() => handleShare('linkedin')}
                        className="bg-blue-700 hover:bg-blue-800 text-white"
                        size="sm"
                        data-testid="button-share-linkedin"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleShare('copy')}
                        size="sm"
                        data-testid="button-copy-link"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>


          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              {/* Article Meta Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Info</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium">{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {article.author && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Author</span>
                      <span className="font-medium">{article.author}</span>
                    </div>
                  )}
                  {article.readCount !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Views</span>
                      <span className="font-medium">{article.readCount.toLocaleString()}</span>
                    </div>
                  )}
                  {article.estimatedReadTime && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Read time</span>
                      <span className="font-medium">{article.estimatedReadTime} min</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Share */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Article</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleShare('facebook')}
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    data-testid="sidebar-share-facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleShare('twitter')}
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    data-testid="sidebar-share-twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleShare('linkedin')}
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    data-testid="sidebar-share-linkedin"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleShare('copy')}
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    data-testid="sidebar-copy-link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        
        {/* Back to News */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => setLocation("/news")} 
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-50 border-gray-300 px-6 py-3"
            data-testid="button-back-bottom"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All News
          </Button>
        </div>
      </div>
    </div>
  );
}