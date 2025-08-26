import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
  Award
} from "lucide-react";
import type { EventRegistration, Event } from "../../../shared/schema";

export default function ParticipantDashboard() {
  const { user } = useAuth();

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/event-registrations"],
  });

  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const events = eventsData?.events || [];
  
  // Filter registrations for current participant
  const myRegistrations = registrations.filter(reg => reg.userId === user?.id);
  
  // Get events the participant is registered for
  const registeredEvents = events.filter(event => 
    myRegistrations.some(reg => reg.eventId === event.id)
  );

  const upcomingEvents = registeredEvents.filter(event => 
    new Date(event.date) > new Date() && event.status === 'upcoming'
  );

  const pastEvents = registeredEvents.filter(event => 
    new Date(event.date) <= new Date() || event.status === 'completed'
  );

  if (registrationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="participant-dashboard-title">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your event registrations and participation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="stat-total-events">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-eco-green/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-eco-green" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{myRegistrations.length}</p>
                  <p className="text-gray-600">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-upcoming-events">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-youth-blue/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-youth-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{upcomingEvents.length}</p>
                  <p className="text-gray-600">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed-events">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{pastEvents.length}</p>
                  <p className="text-gray-600">Completed Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-youth-blue" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <Link href="/events">
                    <Button className="mt-4" data-testid="button-browse-events">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => {
                    const registration = myRegistrations.find(reg => reg.eventId === event.id);
                    return (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900" data-testid={`event-title-${event.id}`}>
                            {event.title}
                          </h3>
                          <Badge variant={registration?.status === 'confirmed' ? 'default' : 'secondary'}>
                            {registration?.status || 'pending'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-eco-green" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <Badge variant="outline" className="ml-2">Participant</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              My Event Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No registrations yet</p>
                <Link href="/events">
                  <Button className="mt-4" data-testid="button-register-events">
                    Register for Events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Event</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRegistrations.map((registration) => {
                      const event = events.find(e => e.id === registration.eventId);
                      return (
                        <tr key={registration.id} className="border-b hover:bg-gray-50" data-testid={`registration-row-${registration.id}`}>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{event?.title || 'Event Not Found'}</p>
                              <p className="text-sm text-gray-600">{event?.location}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {event ? new Date(event.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                registration.status === 'confirmed' ? 'default' :
                                registration.status === 'cancelled' ? 'destructive' : 'secondary'
                              }
                            >
                              {registration.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(registration.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}