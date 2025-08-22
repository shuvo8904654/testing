import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import MemberDashboardEnhanced from "@/components/MemberDashboardEnhanced";
import EventRegistrationSystem from "@/components/EventRegistrationSystem";
import EventRSVPSystem from "@/components/EventRSVPSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MemberDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="events">Event Registration</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <MemberDashboardEnhanced />
          </TabsContent>
          
          <TabsContent value="events">
            <EventRegistrationSystem />
          </TabsContent>
          
          <TabsContent value="rsvp">
            <EventRSVPSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}