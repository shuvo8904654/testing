import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  UserCheck,
  Info,
  Star,
  BookOpen,
  Coffee,
  Users2
} from "lucide-react";
import type { Event } from "@shared/schema";

export default function EventRSVPSystem() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const events = eventsData?.events || [];
  
  // Filter events that don't require registration (RSVP events)
  const rsvpEvents = events.filter(event => 
    !event.requiresRegistration && !event.registrationRequired &&
    (event.status === 'upcoming' || event.status === 'ongoing')
  );

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest("POST", "/api/event-rsvp", { eventId, userId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "RSVP confirmed!" });
    },
    onError: (error: any) => {
      toast({
        title: "RSVP failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getEventTypeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'workshop': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'meeting': return <Users2 className="h-5 w-5 text-green-500" />;
      case 'training': return <Star className="h-5 w-5 text-purple-500" />;
      case 'volunteer': return <Users className="h-5 w-5 text-orange-500" />;
      default: return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventTypeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'workshop': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 border-green-200';
      case 'training': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'volunteer': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading || eventsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-red-600 mb-4">Unable to load events</div>
        <div className="text-sm text-gray-600">Please try refreshing the page</div>
      </div>
    );
  }

  const handleRSVP = (eventId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to RSVP for events",
        variant: "destructive",
      });
      return;
    }
    rsvpMutation.mutate(eventId);
  };

  return (
    <div className="space-y-6" data-testid="event-rsvp-system">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">RSVP Events</h2>
        <p className="text-lg text-gray-600">
          Quick RSVP for workshops, meetings, and community events
        </p>
      </div>

      {/* Events Grid */}
      {rsvpEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No RSVP Events</h3>
            <p className="text-gray-600">Check back later for upcoming workshops and meetings.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rsvpEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getEventTypeColor(event.category)}`}>
                    {getEventTypeIcon(event.category)}
                    <span className="ml-1 capitalize">{event.category}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    RSVP
                  </Badge>
                </div>
                
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {event.maxParticipants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Max {event.maxParticipants} participants</span>
                    </div>
                  )}
                </div>

                {/* RSVP Button */}
                <div className="pt-2">
                  <Button 
                    className="w-full"
                    onClick={() => handleRSVP(event.id)}
                    disabled={rsvpMutation.isPending}
                    data-testid={`rsvp-button-${event.id}`}
                  >
                    {rsvpMutation.isPending ? (
                      "Confirming..."
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        RSVP
                      </>
                    )}
                  </Button>
                </div>

                {/* Additional Info */}
                {event.contactInfo && (
                  <div className="pt-2 border-t">
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{event.contactInfo}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}