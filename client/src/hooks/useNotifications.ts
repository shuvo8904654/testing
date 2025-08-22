import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AppNotification {
  type: string;
  title: string;
  message: string;
  data?: any;
}

export const useNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('Connected to WebSocket notifications');
          setIsConnected(true);
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const notification: AppNotification = JSON.parse(event.data);
            
            // Add to notifications list
            setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
            
            // Show toast notification for important events
            if (notification.type === 'approval' || notification.type === 'rejection') {
              toast({
                title: notification.title,
                description: notification.message,
                duration: 4000,
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        wsRef.current.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 3000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [toast]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    isConnected,
    notifications,
    clearNotifications
  };
};