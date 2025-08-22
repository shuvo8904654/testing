import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  Calendar, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  X,
  Settings,
  Filter
} from "lucide-react";

interface Notification {
  id: string;
  type: 'event' | 'news' | 'system' | 'member' | 'content';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionRequired: boolean;
  relatedId?: string;
  relatedType?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export default function NotificationSystem() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  // In a real app, this would come from an API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'New Event: 3ZERO Youth Workshop',
      message: 'A new workshop has been scheduled for tomorrow. Registration is now open.',
      priority: 'high',
      read: false,
      actionRequired: true,
      relatedId: 'event-1',
      relatedType: 'event',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      type: 'content',
      title: 'Content Pending Approval',
      message: 'New project submission requires admin approval.',
      priority: 'medium',
      read: false,
      actionRequired: true,
      relatedId: 'project-1',
      relatedType: 'project',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'member',
      title: 'New Member Application',
      message: 'Sarah Ahmed has applied to join the organization.',
      priority: 'medium',
      read: true,
      actionRequired: true,
      relatedId: 'user-123',
      relatedType: 'application',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: '4',
      type: 'news',
      title: 'Article Published',
      message: 'Your article "Community Impact Report" has been published.',
      priority: 'low',
      read: true,
      actionRequired: false,
      relatedId: 'article-1',
      relatedType: 'news',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur this weekend.',
      priority: 'medium',
      read: false,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // Expires in 4 days
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // In real app: await apiRequest("PATCH", `/api/notifications/${notificationId}`, { read: true });
      return Promise.resolve();
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // In real app: await apiRequest("PATCH", "/api/notifications/mark-all-read");
      return Promise.resolve();
    },
    onSuccess: () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({ title: "All notifications marked as read" });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // In real app: await apiRequest("DELETE", `/api/notifications/${notificationId}`);
      return Promise.resolve();
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({ title: "Notification deleted" });
    },
  });

  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.read) return false;
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    return true;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 'text-gray-500';
    
    switch (type) {
      case 'event': return <Calendar className={`h-4 w-4 ${iconClass}`} />;
      case 'news': return <FileText className={`h-4 w-4 ${iconClass}`} />;
      case 'member': return <Users className={`h-4 w-4 ${iconClass}`} />;
      case 'content': return <FileText className={`h-4 w-4 ${iconClass}`} />;
      case 'system': return <AlertCircle className={`h-4 w-4 ${iconClass}`} />;
      default: return <Bell className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4" data-testid="notification-system">
      {/* Notification Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Urgent</p>
                <p className="text-2xl font-bold">{urgentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Action Required</p>
                <p className="text-2xl font-bold">{actionRequiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                data-testid="filter-unread"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </Button>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="event">Events</option>
                <option value="news">News</option>
                <option value="member">Members</option>
                <option value="content">Content</option>
                <option value="system">System</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                data-testid="mark-all-read"
              >
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
                    onDelete={() => deleteNotificationMutation.mutate(notification.id)}
                    getNotificationIcon={getNotificationIcon}
                    getPriorityColor={getPriorityColor}
                    getTimeAgo={getTimeAgo}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  getNotificationIcon, 
  getPriorityColor, 
  getTimeAgo 
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  getNotificationIcon: (type: string, priority: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getTimeAgo: (date: Date) => string;
}) {
  return (
    <div 
      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
        notification.read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 shadow-sm'
      }`}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type, notification.priority)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              
              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
              
              {notification.actionRequired && (
                <Badge variant="outline" className="text-xs">
                  Action Required
                </Badge>
              )}
            </div>
            
            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-gray-400">
                {getTimeAgo(notification.createdAt)}
              </span>
              
              {notification.expiresAt && (
                <span className="text-xs text-orange-500">
                  Expires {getTimeAgo(notification.expiresAt)}
                </span>
              )}
              
              <Badge variant="outline" className="text-xs">
                {notification.type}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAsRead}
              className="h-8 w-8 p-0"
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
            title="Delete notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Notification Bell Component for Navigation
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock unread count - in real app, this would come from an API
  const unreadCount = 3;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" data-testid="notification-bell">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <NotificationSystem />
      </DialogContent>
    </Dialog>
  );
}