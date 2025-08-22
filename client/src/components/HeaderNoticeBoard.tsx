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
  type: 'announcement' | 'event' | 'urgent' | 'info' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string | Date;
  endDate: string | Date;
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

  const notices: Notice[] = Array.isArray(noticesData) ? noticesData : [];

  // Filter active and non-dismissed notices
  const activeNotices = notices.filter(notice => {
    const now = new Date();
    const startDate = new Date(notice.startDate);
    const endDate = new Date(notice.endDate);
    const isActive = now >= startDate && now <= endDate;
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <Card className={`border-0 shadow-none ${getNoticeColor(currentNotice.priority)}`}>
          <CardContent className="py-2 sm:py-3 px-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {/* Notice Content */}
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {getNoticeIcon(currentNotice.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h4 className="font-semibold text-sm sm:text-base leading-tight">
                      {currentNotice.title}
                    </h4>
                    <div className="flex gap-1 sm:gap-2">
                      <Badge className={`text-xs ${getBadgeColor(currentNotice.priority)}`}>
                        {currentNotice.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs sm:inline hidden">
                        {currentNotice.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 line-clamp-2 sm:line-clamp-1">
                    {currentNotice.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                {currentNotice.link && (
                  <Link href={currentNotice.link}>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                      <ExternalLink className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">{currentNotice.linkText || 'Learn More'}</span>
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
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                      data-testid="notice-prev"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    
                    <span className="text-xs text-gray-600 px-1">
                      {currentNoticeIndex + 1}/{activeNotices.length}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={nextNotice}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0"
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
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-red-100"
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