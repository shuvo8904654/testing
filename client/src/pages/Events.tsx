import EventRegistrationSystem from "@/components/EventRegistrationSystem";
import EventRSVPSystem from "@/components/EventRSVPSystem";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Events() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-20 bg-white" data-testid="events-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
            Events & Programs
          </h1>
          <p className="text-xl text-gray-600">
            Join our workshops, competitions, and olympiads to make a difference
          </p>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="register">Registration Events</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
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