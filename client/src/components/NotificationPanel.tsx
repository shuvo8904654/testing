import { Bell, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPanel: React.FC = () => {
  const { isConnected, notifications, clearNotifications } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rejection':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'approval':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejection':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'connected':
        return <Badge variant="outline">Connected</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Real-time Notifications
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400">Real-time updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      {getNotificationBadge(notification.type)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};