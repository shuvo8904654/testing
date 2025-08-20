import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Square, Filter, Zap, BarChart3, FileText, Image, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { NewsArticle, Project, GalleryImage, Event } from '@shared/schema';

interface BulkActions {
  selectedItems: string[];
  action: 'approve' | 'reject' | 'archive' | 'categorize' | 'priority';
  value?: string;
}

export default function BulkContentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('news');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch content data
  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ['/api/news'],
  });
  
  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ['/api/projects'],
  });
  
  const { data: galleryData } = useQuery<{images: GalleryImage[], analytics: any}>({
    queryKey: ['/api/gallery'],
  });
  
  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ['/api/events'],
  });

  const news = newsData?.articles || [];
  const projects = projectsData?.projects || [];
  const gallery = galleryData?.images || [];
  const events = eventsData?.events || [];

  // Get current content based on active tab
  const getCurrentContent = () => {
    let content: any[] = [];
    switch (activeTab) {
      case 'news': content = news; break;
      case 'projects': content = projects; break;
      case 'gallery': content = gallery; break;
      case 'events': content = events; break;
    }
    
    // Apply filters
    return content.filter(item => {
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  };

  const currentContent = getCurrentContent();

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async (action: BulkActions) => {
      const endpoint = `/api/${activeTab}/bulk`;
      return await apiRequest('POST', endpoint, action);
    },
    onSuccess: (data) => {
      toast({
        title: 'Bulk Operation Successful',
        description: `Updated ${selectedItems.length} items`,
      });
      setSelectedItems([]);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/${activeTab}`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Bulk Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedItems.length === currentContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentContent.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action: string, value?: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to perform bulk actions',
        variant: 'destructive',
      });
      return;
    }

    bulkOperationMutation.mutate({
      selectedItems,
      action: action as any,
      value,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContentItem = (item: any, index: number) => (
    <div key={item.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={() => handleSelectItem(item.id)}
            data-testid={`checkbox-${item.id}`}
          />
          <div className="flex-1">
            <h3 className="font-medium" data-testid={`title-${item.id}`}>
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1" data-testid={`description-${item.id}`}>
              {item.description || item.content || item.excerpt}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {item.category && (
            <Badge variant="outline" data-testid={`category-${item.id}`}>
              {item.category}
            </Badge>
          )}
          <Badge className={getStatusColor(item.status)} data-testid={`status-${item.id}`}>
            {item.status}
          </Badge>
          {item.priorityScore && (
            <Badge variant="secondary" data-testid={`priority-${item.id}`}>
              Priority: {item.priorityScore}
            </Badge>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Created: {new Date(item.createdAt).toLocaleDateString()} by {item.createdBy}
      </div>
    </div>
  );

  return (
    <Card className="w-full" data-testid="bulk-content-manager">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bulk Content Manager
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid="selected-count">
              {selectedItems.length} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              data-testid="button-select-all"
            >
              {selectedItems.length === currentContent.length ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Filters and Bulk Actions */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium">Bulk Actions:</span>
              <Button
                size="sm"
                onClick={() => handleBulkAction('approve')}
                disabled={bulkOperationMutation.isPending || selectedItems.length === 0}
                data-testid="button-bulk-approve"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('archive')}
                disabled={bulkOperationMutation.isPending || selectedItems.length === 0}
                data-testid="button-bulk-archive"
              >
                Archive
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('reject')}
                disabled={bulkOperationMutation.isPending || selectedItems.length === 0}
                data-testid="button-bulk-reject"
              >
                Reject
              </Button>
            </div>
          </div>

          {/* Content Lists */}
          <TabsContent value="news" className="space-y-4">
            <div className="space-y-4" data-testid="news-list">
              {currentContent.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No news articles found</p>
              ) : (
                currentContent.map((item, index) => renderContentItem(item, index))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-4" data-testid="projects-list">
              {currentContent.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No projects found</p>
              ) : (
                currentContent.map((item, index) => renderContentItem(item, index))
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div className="space-y-4" data-testid="gallery-list">
              {currentContent.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No gallery images found</p>
              ) : (
                currentContent.map((item, index) => renderContentItem(item, index))
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-4" data-testid="events-list">
              {currentContent.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No events found</p>
              ) : (
                currentContent.map((item, index) => renderContentItem(item, index))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}