import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Image, 
  Users,
  MapPin,
  Clock,
  Tag,
  X
} from "lucide-react";
import { Link } from "wouter";
import type { Project, NewsArticle, Event, GalleryImage, Member } from "@shared/schema";

interface SearchFilters {
  query: string;
  category: string;
  dateRange: string;
  status: string;
  type: 'all' | 'projects' | 'news' | 'events' | 'gallery' | 'members';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'news' | 'event' | 'gallery' | 'member';
  category?: string;
  status?: string;
  date?: Date;
  image?: string;
  location?: string;
  relevanceScore: number;
}

export default function AdvancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    dateRange: "all",
    status: "all",
    type: "all"
  });
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all data
  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
  });
  
  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });
  
  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });
  
  const { data: galleryData } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: membersData } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const allData = useMemo(() => ({
    projects: projectsData?.projects || [],
    articles: newsData?.articles || [],
    events: eventsData?.events || [],
    gallery: galleryData || [],
    members: membersData || []
  }), [projectsData, newsData, eventsData, galleryData, membersData]);

  // Search function
  const performSearch = (searchFilters: SearchFilters) => {
    setIsSearching(true);
    
    try {
      const results: SearchResult[] = [];
      const query = searchFilters.query.toLowerCase().trim();
      
      // Helper function to calculate relevance score
      const calculateRelevance = (text: string, query: string): number => {
        if (!query) return 1;
        const lowerText = text.toLowerCase();
        if (lowerText.includes(query)) {
          // Exact match gets higher score
          if (lowerText === query) return 100;
          // Title/name matches get high scores
          if (lowerText.startsWith(query)) return 80;
          // Partial matches get moderate scores
          return 60;
        }
        return 0;
      };

      // Search projects
      if (searchFilters.type === 'all' || searchFilters.type === 'projects') {
        allData.projects.forEach(project => {
          const relevance = Math.max(
            calculateRelevance(project.title, query),
            calculateRelevance(project.description, query) * 0.7,
            calculateRelevance(project.category || '', query) * 0.5
          );
          
          if (relevance > 0 || !query) {
            // Apply filters
            if (searchFilters.category !== 'all' && project.category !== searchFilters.category) return;
            if (searchFilters.status !== 'all' && project.status !== searchFilters.status) return;
            
            results.push({
              id: project.id,
              title: project.title,
              description: project.description,
              type: 'project',
              category: project.category,
              status: project.status,
              date: project.createdAt,
              image: project.imageUrl,
              relevanceScore: relevance
            });
          }
        });
      }

      // Search news articles
      if (searchFilters.type === 'all' || searchFilters.type === 'news') {
        allData.articles.forEach(article => {
          const relevance = Math.max(
            calculateRelevance(article.title, query),
            calculateRelevance(article.content, query) * 0.6,
            calculateRelevance(article.excerpt || '', query) * 0.8,
            calculateRelevance(article.category || '', query) * 0.5
          );
          
          if (relevance > 0 || !query) {
            if (searchFilters.category !== 'all' && article.category !== searchFilters.category) return;
            if (searchFilters.status !== 'all' && article.status !== searchFilters.status) return;
            
            results.push({
              id: article.id,
              title: article.title,
              description: article.excerpt || article.content.substring(0, 150) + '...',
              type: 'news',
              category: article.category,
              status: article.status,
              date: article.publishedAt,
              image: article.image,
              relevanceScore: relevance
            });
          }
        });
      }

      // Search events
      if (searchFilters.type === 'all' || searchFilters.type === 'events') {
        allData.events.forEach(event => {
          const relevance = Math.max(
            calculateRelevance(event.title, query),
            calculateRelevance(event.description, query) * 0.7,
            calculateRelevance(event.location, query) * 0.6,
            calculateRelevance(event.category, query) * 0.5
          );
          
          if (relevance > 0 || !query) {
            if (searchFilters.category !== 'all' && event.category !== searchFilters.category) return;
            if (searchFilters.status !== 'all' && event.status !== searchFilters.status) return;
            
            results.push({
              id: event.id,
              title: event.title,
              description: event.description,
              type: 'event',
              category: event.category,
              status: event.status,
              date: event.date,
              location: event.location,
              relevanceScore: relevance
            });
          }
        });
      }

      // Search gallery
      if (searchFilters.type === 'all' || searchFilters.type === 'gallery') {
        allData.gallery.forEach(image => {
          const relevance = Math.max(
            calculateRelevance(image.title, query),
            calculateRelevance(image.description || '', query) * 0.7,
            calculateRelevance(image.category || '', query) * 0.5
          );
          
          if (relevance > 0 || !query) {
            if (searchFilters.category !== 'all' && image.category !== searchFilters.category) return;
            if (searchFilters.status !== 'all' && image.status !== searchFilters.status) return;
            
            results.push({
              id: image.id,
              title: image.title,
              description: image.description || 'Gallery image',
              type: 'gallery',
              category: image.category,
              status: image.status,
              date: image.createdAt,
              image: image.imageUrl,
              relevanceScore: relevance
            });
          }
        });
      }

      // Search members
      if (searchFilters.type === 'all' || searchFilters.type === 'members') {
        allData.members.forEach(member => {
          const relevance = Math.max(
            calculateRelevance(member.name, query),
            calculateRelevance(member.bio, query) * 0.6,
            calculateRelevance(member.position, query) * 0.8
          );
          
          if (relevance > 0 || !query) {
            if (searchFilters.status !== 'all' && member.status !== searchFilters.status) return;
            
            results.push({
              id: member.id,
              title: member.name,
              description: `${member.position} - ${member.bio}`,
              type: 'member',
              status: member.status,
              date: member.createdAt,
              image: member.profileImageUrl,
              relevanceScore: relevance
            });
          }
        });
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform search when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, allData]);

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "all",
      dateRange: "all",
      status: "all",
      type: "all"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileText className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'gallery': return <Image className="h-4 w-4" />;
      case 'member': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'gallery': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6" data-testid="advanced-search">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Search</h2>
        <Badge variant="outline">
          {searchResults.length} results
        </Badge>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, news, events, gallery, and members..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            {(filters.query || filters.category !== 'all' || filters.status !== 'all' || filters.type !== 'all') && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                data-testid="clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="gallery">Gallery</SelectItem>
                <SelectItem value="members">Members</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {!isSearching && searchResults.length === 0 && filters.query && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters.</p>
            </CardContent>
          </Card>
        )}

        {!isSearching && searchResults.length === 0 && !filters.query && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
              <p className="text-gray-600">Enter a search term to find projects, news, events, and more.</p>
            </CardContent>
          </Card>
        )}

        {!isSearching && searchResults.map((result) => (
          <SearchResultCard 
            key={`${result.type}-${result.id}`} 
            result={result} 
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResultCard({ 
  result, 
  getTypeIcon, 
  getTypeColor 
}: { 
  result: SearchResult;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
}) {
  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'project': return '/projects';
      case 'news': return `/news/${result.id}`;
      case 'event': return '/projects'; // Events are shown on projects page
      case 'gallery': return '/gallery';
      case 'member': return '/members';
      default: return '/';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {result.image && (
            <img 
              src={result.image} 
              alt={result.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link href={getResultLink(result)}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
                  {result.title}
                </h3>
              </Link>
              
              <div className="flex gap-2 flex-shrink-0">
                <Badge className={getTypeColor(result.type)}>
                  {getTypeIcon(result.type)}
                  <span className="ml-1 capitalize">{result.type}</span>
                </Badge>
                
                {result.relevanceScore > 80 && (
                  <Badge variant="outline" className="text-xs">
                    Best Match
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {result.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {result.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{result.category}</span>
                </div>
              )}
              
              {result.status && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                </div>
              )}
              
              {result.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{result.location}</span>
                </div>
              )}
              
              {result.date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(result.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}