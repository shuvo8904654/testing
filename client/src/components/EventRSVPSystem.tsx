import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  UserCheck,
  QrCode,
  Share2
} from "lucide-react";
import type { Event } from "@shared/schema";

const rsvpSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  additionalGuests: z.number().min(0).max(5).default(0),
  dietaryRequirements: z.string().optional(),
  comments: z.string().optional(),
});

type RSVPData = z.infer<typeof rsvpSchema>;

interface EventRSVP {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  additionalGuests: number;
  dietaryRequirements?: string;
  comments?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkedIn: boolean;
  rsvpDate: Date;
}

export default function EventRSVPSystem() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRSVPDialog, setShowRSVPDialog] = useState(false);

  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const events = eventsData?.events?.filter(e => e.status === 'upcoming') || [];

  return (
    <div className="space-y-6" data-testid="event-rsvp-system">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Event RSVP System</h2>
        <Badge variant="outline" className="text-sm">
          {events.length} Upcoming Events
        </Badge>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event}
            onRSVP={() => {
              setSelectedEvent(event);
              setShowRSVPDialog(true);
            }}
          />
        ))}
        
        {events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600">Check back soon for exciting events and activities!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RSVP Dialog */}
      <Dialog open={showRSVPDialog} onOpenChange={setShowRSVPDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>RSVP to {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <RSVPForm 
              event={selectedEvent}
              onSuccess={() => setShowRSVPDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ event, onRSVP }: { event: Event; onRSVP: () => void }) {
  const { data: rsvps } = useQuery<EventRSVP[]>({
    queryKey: ["/api/events", event.id, "rsvps"],
  });

  const confirmedRSVPs = rsvps?.filter(r => r.status === 'confirmed') || [];
  const totalAttendees = confirmedRSVPs.reduce((sum, rsvp) => sum + 1 + rsvp.additionalGuests, 0);
  const spotsRemaining = event.maxParticipants ? event.maxParticipants - totalAttendees : null;

  const eventDate = new Date(event.date);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isPast = eventDate < new Date();

  return (
    <Card className={`${isToday ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <p className="text-gray-600 mt-2">{event.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={isToday ? 'default' : 'secondary'}>
              {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'}
            </Badge>
            <Badge variant="outline">{event.category}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {eventDate.toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
        </div>

        {event.registrationRequired && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {totalAttendees} registered
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </span>
              </div>
              
              {spotsRemaining !== null && (
                <Badge variant={spotsRemaining > 10 ? 'default' : spotsRemaining > 0 ? 'secondary' : 'destructive'}>
                  {spotsRemaining > 0 ? `${spotsRemaining} spots left` : 'Full'}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={onRSVP}
                disabled={isPast || (spotsRemaining !== null && spotsRemaining <= 0)}
                className="flex-1"
                data-testid={`button-rsvp-${event.id}`}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {isPast ? 'Event Ended' : spotsRemaining === 0 ? 'Event Full' : 'RSVP Now'}
              </Button>
              
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!event.registrationRequired && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">No registration required - just show up!</p>
            <Button variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RSVPForm({ event, onSuccess }: { event: Event; onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<RSVPData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      eventId: event.id,
      name: "",
      email: "",
      phone: "",
      additionalGuests: 0,
      dietaryRequirements: "",
      comments: "",
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (data: RSVPData) => {
      return apiRequest("POST", `/api/events/${event.id}/rsvp`, data);
    },
    onSuccess: () => {
      toast({ 
        title: "RSVP Confirmed!", 
        description: "You'll receive a confirmation email shortly." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "rsvps"] });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "RSVP Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => rsvpMutation.mutate(data))} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold">{event.title}</h4>
          <p className="text-sm text-gray-600">
            {new Date(event.date).toLocaleDateString()} at {event.time}
          </p>
          <p className="text-sm text-gray-600">📍 {event.location}</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Guests (0-5)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0" 
                  max="5"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dietaryRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Requirements</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vegetarian, allergies, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Questions or special requests..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={rsvpMutation.isPending} className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          {rsvpMutation.isPending ? "Confirming RSVP..." : "Confirm RSVP"}
        </Button>
      </form>
    </Form>
  );
}

// Export components for use in other parts of the app
export { EventCard, RSVPForm };