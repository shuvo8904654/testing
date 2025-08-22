import EventRSVPSystem from "@/components/EventRSVPSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Coffee, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  FileText, 
  Star, 
  BookOpen, 
  AlertCircle 
} from "lucide-react";
import type { Event } from "@shared/schema";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  institution: z.string().optional(),
  reason: z.string().min(10, "Please provide at least 10 characters explaining why you want to attend"),
  teamName: z.string().optional(),
  teamMembers: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

function RegistrationEvents() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const events = eventsData?.events || [];
  
  // Filter events that require registration
  const registrationEvents = events.filter(event => 
    event.registrationRequired &&
    (event.status === 'upcoming' || event.status === 'ongoing')
  );

  const registrationForm = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: "",
      institution: "",
      reason: "",
      teamName: "",
      teamMembers: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm & { eventId: number }) => {
      return apiRequest("POST", "/api/event-registrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setRegistrationDialogOpen(false);
      setSelectedEvent(null);
      registrationForm.reset();
      toast({ 
        title: "Registration successful!",
        description: "You have been registered for the event."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const getEventTypeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'workshop': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'meeting': return <Users className="h-5 w-5 text-green-500" />;
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

  const handleRegister = (event: Event) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return;
    }
    setSelectedEvent(event);
    setRegistrationDialogOpen(true);
  };

  const onSubmit = (data: RegistrationForm) => {
    if (!selectedEvent) return;
    registerMutation.mutate({
      ...data,
      eventId: selectedEvent.id,
    });
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

  return (
    <div className="space-y-6" data-testid="event-registration-system">
      {/* Events Grid */}
      {registrationEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration Events</h3>
            <p className="text-gray-600">Check back later for upcoming registration events.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrationEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getEventTypeIcon(event.category)}
                    <Badge className={`text-xs ${getEventTypeColor(event.category)}`}>
                      {event.category.toUpperCase()}
                    </Badge>
                  </div>
                  {event.urgency === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {event.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  {event.maxParticipants && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>Max {event.maxParticipants} participants</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {event.contactInfo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Contact Info</span>
                    </div>
                    <p className="text-xs text-gray-600">{event.contactInfo}</p>
                  </div>
                )}

                {/* Registration Button */}
                <Button 
                  onClick={() => handleRegister(event)}
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid={`register-event-${event.id}`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Registration Dialog */}
      <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <Form {...registrationForm}>
            <form onSubmit={registrationForm.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registrationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registrationForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+880 XXX XXX XXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={registrationForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="your@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registrationForm.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution/Organization (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your school, college, or workplace" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registrationForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to attend this event? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell us your motivation and what you hope to gain from this event"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEvent?.teamEvent && (
                <div className="space-y-4">
                  <FormField
                    control={registrationForm.control}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your team name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registrationForm.control}
                    name="teamMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Members (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="List your team members (name, email, phone for each)"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRegistrationDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={registerMutation.isPending}
                  className="flex-1"
                >
                  {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
            <RegistrationEvents />
          </TabsContent>
          
          <TabsContent value="rsvp">
            <EventRSVPSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}