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

  // Real-time notifications disabled - using static state only
  useEffect(() => {
    // Set connected to false since we're not using real-time
    setIsConnected(false);
    console.log('Real-time notifications disabled');
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