import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Trophy,
  Target,
  CheckCircle,
  UserPlus,
  Info,
  AlertTriangle,
  Star,
  Award,
  Zap,
  BookOpen
} from "lucide-react";
import type { Event } from "@shared/schema";

const registrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  participantName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  institution: z.string().optional(),
  grade: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
  teamName: z.string().optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string()
  })).optional(),
  additionalInfo: z.string().optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface EventRegistration {
  id: string;
  eventId: string;
  participantId: string;
  participantName: string;
  email: string;
  phone: string;
  institution?: string;
  grade?: string;
  registeredAt: Date;
  status: 'registered' | 'confirmed' | 'waitlist' | 'cancelled';
  checkInTime?: Date;
  teamName?: string;
  teamMembers?: Array<{ name: string; email: string; phone: string; }>;
  additionalInfo?: string;
}

export default function EventRegistrationSystem() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/event-registrations"],
  });

  const events = eventsData?.events || [];
  
  // Filter events that require registration
  const registrationEvents = events.filter(event => 
    event.requiresRegistration && 
    (event.status === 'upcoming' || event.status === 'ongoing')
  );

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return apiRequest("POST", "/api/event-registrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/event-registrations"] });
      toast({ title: "Registration successful!" });
      setShowRegistrationDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      participantName: user?.firstName || "",
      email: user?.email || "",
      phone: "",
      institution: "",
      grade: "",
      experience: "",
      motivation: "",
      teamName: "",
      teamMembers: [],
      additionalInfo: "",
    },
  });

  const onSubmit = (data: RegistrationData) => {
    if (!selectedEvent) return;
    registerMutation.mutate({
      ...data,
      eventId: selectedEvent.id,
    });
  };

  const getEventTypeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'olympiad': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'competition': return <Award className="h-5 w-5 text-purple-500" />;
      case 'workshop': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'training': return <Target className="h-5 w-5 text-green-500" />;
      case 'hackathon': return <Zap className="h-5 w-5 text-orange-500" />;
      default: return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventTypeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'olympiad': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'competition': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workshop': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'hackathon': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRegistrationStatus = (eventId: string) => {
    const userRegistration = registrations?.find(reg => 
      reg.eventId === eventId && reg.email === user?.email
    );
    return userRegistration?.status;
  };

  const isRegistered = (eventId: string) => {
    return !!getRegistrationStatus(eventId);
  };

  const getRegistrationCount = (eventId: string) => {
    return registrations?.filter(reg => reg.eventId === eventId && reg.status !== 'cancelled').length || 0;
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
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Registration</h2>
        <p className="text-lg text-gray-600">
          Register for upcoming programs, olympiads, and competitions
        </p>
      </div>

      {/* Events Grid */}
      {registrationEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration Events</h3>
            <p className="text-gray-600">Check back later for upcoming events that require registration.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrationEvents.map((event) => {
            const registrationCount = getRegistrationCount(event.id);
            const isUserRegistered = isRegistered(event.id);
            const registrationStatus = getRegistrationStatus(event.id);
            const isFull = event.maxParticipants && registrationCount >= event.maxParticipants;
            const spotsLeft = event.maxParticipants ? event.maxParticipants - registrationCount : null;

            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getEventTypeColor(event.category)}`}>
                      {getEventTypeIcon(event.category)}
                      <span className="ml-1 capitalize">{event.category}</span>
                    </Badge>
                    {isUserRegistered && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {registrationStatus}
                      </Badge>
                    )}
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
                        <span>
                          {registrationCount}/{event.maxParticipants} registered
                          {spotsLeft !== null && spotsLeft > 0 && (
                            <span className="text-orange-600 font-medium">
                              ({spotsLeft} spots left)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Registration Button */}
                  <div className="pt-2">
                    {isUserRegistered ? (
                      <Button disabled className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registered
                      </Button>
                    ) : isFull ? (
                      <Button disabled className="w-full" variant="secondary">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Event Full
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRegistrationDialog(true);
                        }}
                        data-testid={`register-button-${event.id}`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register Now
                      </Button>
                    )}
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
            );
          })}
        </div>
      )}

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventTypeIcon(selectedEvent.category)}
              Register for {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="participantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-participant-name" />
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
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution/School</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-institution" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event-specific fields */}
                {selectedEvent.category.toLowerCase() === 'olympiad' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade/Level</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grade-6">Grade 6</SelectItem>
                                <SelectItem value="grade-7">Grade 7</SelectItem>
                                <SelectItem value="grade-8">Grade 8</SelectItem>
                                <SelectItem value="grade-9">Grade 9</SelectItem>
                                <SelectItem value="grade-10">Grade 10</SelectItem>
                                <SelectItem value="grade-11">Grade 11</SelectItem>
                                <SelectItem value="grade-12">Grade 12</SelectItem>
                                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Experience</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Team registration for team events */}
                {selectedEvent.title.toLowerCase().includes('team') && (
                  <FormField
                    control={form.control}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-team-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to participate?</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Tell us about your motivation and what you hope to gain..."
                          data-testid="input-motivation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional information or special requirements..."
                          data-testid="input-additional-info"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRegistrationDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                    data-testid="submit-registration"
                  >
                    {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}