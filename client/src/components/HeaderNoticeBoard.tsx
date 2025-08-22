import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  AlertCircle, 
  Info, 
  Calendar, 
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface Notice {
  id: number;
  title: string;
  message: string;
  type: 'announcement' | 'event' | 'urgent' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  link?: string;
  linkText?: string;
  dismissible: boolean;
}

export default function HeaderNoticeBoard() {
  const [dismissedNotices, setDismissedNotices] = useState<number[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  // Load dismissed notices from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedNotices');
    if (dismissed) {
      setDismissedNotices(JSON.parse(dismissed));
    }
  }, []);

  // Fetch active notices from API
  const { data: noticesData = [] } = useQuery<Notice[]>({
    queryKey: ["/api/notices", "active"],
    queryFn: () => fetch('/api/notices?active=true').then(res => res.json()),
  });

  const notices: Notice[] = noticesData.length > 0 ? noticesData : [
    {
      id: 1,
      title: 'Youth Environmental Olympiad 2025',
      message: 'Registration is now open for the annual Environmental Olympiad. Show your knowledge and win exciting prizes!',
      type: 'event',
      priority: 'high',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      link: '/events/environmental-olympiad',
      linkText: 'Register Now',
      dismissible: true
    },
    {
      id: 2,
      title: 'New Partnership with Local Schools',
      message: 'We\'re excited to announce partnerships with 5 local schools to expand our environmental education programs.',
      type: 'announcement',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      dismissible: true
    },
    {
      id: 3,
      title: 'Monthly Team Meeting',
      message: 'Join us for our monthly planning meeting this Saturday at 3 PM at the community center.',
      type: 'event',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
      dismissible: true
    },
    {
      id: 4,
      title: 'Website Maintenance Notice',
      message: 'Brief maintenance scheduled for this weekend. Some features may be temporarily unavailable.',
      type: 'info',
      priority: 'low',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days
      dismissible: true
    }
  ];

  // Filter active and non-dismissed notices
  const activeNotices = notices.filter(notice => {
    const now = new Date();
    const isActive = now >= notice.startDate && now <= notice.endDate;
    const isNotDismissed = !dismissedNotices.includes(notice.id);
    return isActive && isNotDismissed;
  });

  const dismissNotice = (noticeId: number) => {
    const newDismissed = [...dismissedNotices, noticeId];
    setDismissedNotices(newDismissed);
    localStorage.setItem('dismissedNotices', JSON.stringify(newDismissed));
    
    // Adjust current index if needed
    if (currentNoticeIndex >= activeNotices.length - 1) {
      setCurrentNoticeIndex(Math.max(0, activeNotices.length - 2));
    }
  };

  const nextNotice = () => {
    setCurrentNoticeIndex((prev) => (prev + 1) % activeNotices.length);
  };

  const prevNotice = () => {
    setCurrentNoticeIndex((prev) => (prev - 1 + activeNotices.length) % activeNotices.length);
  };

  const getNoticeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
    }
  };

  const getNoticeColor = (priority: Notice['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-900';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'medium': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'low': return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getBadgeColor = (priority: Notice['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  // Don't render if no active notices
  if (activeNotices.length === 0) {
    return null;
  }

  const currentNotice = activeNotices[currentNoticeIndex];

  return (
    <div className="w-full border-b bg-gradient-to-r from-blue-50 to-green-50" data-testid="header-notice-board">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className={`border-0 shadow-none ${getNoticeColor(currentNotice.priority)}`}>
          <CardContent className="py-3 px-0">
            <div className="flex items-center justify-between gap-4">
              {/* Notice Content */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getNoticeIcon(currentNotice.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">
                      {currentNotice.title}
                    </h4>
                    <Badge className={`text-xs ${getBadgeColor(currentNotice.priority)}`}>
                      {currentNotice.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentNotice.type}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90 line-clamp-1">
                    {currentNotice.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {currentNotice.link && (
                  <Link href={currentNotice.link}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {currentNotice.linkText || 'Learn More'}
                    </Button>
                  </Link>
                )}

                {/* Navigation for multiple notices */}
                {activeNotices.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={prevNotice}
                      className="h-7 w-7 p-0"
                      data-testid="notice-prev"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    
                    <span className="text-xs text-gray-600">
                      {currentNoticeIndex + 1}/{activeNotices.length}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={nextNotice}
                      className="h-7 w-7 p-0"
                      data-testid="notice-next"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Dismiss Button */}
                {currentNotice.dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotice(currentNotice.id)}
                    className="h-7 w-7 p-0 hover:bg-red-100"
                    data-testid="notice-dismiss"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}