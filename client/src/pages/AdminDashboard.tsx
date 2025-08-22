import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  FileText, 
  Image, 
  UserCheck, 
  Crown, 
  Shield, 
  User as UserIcon, 
  Plus, 
  Calendar, 
  Settings, 
  Search, 
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Edit,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import type { IRegistration, INewsArticle, IProject, IGalleryImage, IUser, IEvent } from "@shared/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, eventFormSchema } from "@shared/validation";
import { z } from "zod";
import AdminContentManager from "@/components/AdminContentManager";
import NoticeManagement from "@/components/NoticeManagement";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form for creating new user
  const createUserForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema.extend({
      password: z.string().min(8, "Password must be at least 8 characters"),
    })),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      profileImageUrl: "",
      password: "",
      authType: "email",
      role: "member",
      permissions: [],
      isActive: true,
    },
  });

  // Form for creating new event  
  const createEventForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "workshop",
      maxParticipants: undefined,
      registrationRequired: false,
      contactInfo: "",
      status: "upcoming",
    },
  });

  // Redirect if not authenticated or not admin
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
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  // Data fetching
  const { data: applicantsData } = useQuery<{applicants: IUser[], analytics: any}>({
    queryKey: ["/api/users/applicants"],
    enabled: isAdmin,
  });

  const { data: pendingContent } = useQuery<{
    news: INewsArticle[];
    projects: IProject[];
    gallery: IGalleryImage[];
  }>({
    queryKey: ["/api/pending-content"],
    enabled: isAdmin,
  });

  const { data: allUsers = [] } = useQuery<IUser[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const { data: allEventsData } = useQuery<{events: IEvent[], analytics: any}>({
    queryKey: ["/api/events"],
    enabled: isAdmin,
  });

  const allEvents = allEventsData?.events || [];
  const applicants = applicantsData?.applicants || [];

  // Stats calculations
  const stats = {
    totalUsers: allUsers.length,
    activeMembers: allUsers.filter(u => u.role === 'member' && u.isActive).length,
    pendingApplicants: applicants.length,
    totalEvents: allEvents.length,
    upcomingEvents: allEvents.filter(e => e.status === 'upcoming').length,
    pendingContent: (pendingContent?.news?.length || 0) + 
                   (pendingContent?.projects?.length || 0) + 
                   (pendingContent?.gallery?.length || 0),
  };

  // Mutations
  const updateApplicantStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/users/${id}/application-status`, { 
        applicationStatus: status,
      });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: `Application ${status}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isUnauthorizedError(error) ? "Unauthorized" : "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertUserSchema> & { password: string }) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      createUserForm.reset();
      setCreateUserDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      return await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      createEventForm.reset();
      setCreateEventDialogOpen(false);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const getUrgentNotifications = () => {
    const notifications = [];
    if (stats.pendingApplicants > 0) {
      notifications.push(`${stats.pendingApplicants} pending applications`);
    }
    if (stats.pendingContent > 0) {
      notifications.push(`${stats.pendingContent} content awaiting review`);
    }
    return notifications;
  };

  const urgentNotifications = getUrgentNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 p-6" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback>
              <Crown className="h-8 w-8 text-yellow-600" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || user?.email}</p>
            <Badge variant="outline" className="mt-1">
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {urgentNotifications.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {urgentNotifications.length} urgent
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Members</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending Items</p>
                <p className="text-2xl font-bold">{stats.pendingApplicants + stats.pendingContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Attention Required</h3>
            </div>
            <div className="space-y-1">
              {urgentNotifications.map((notification, index) => (
                <p key={index} className="text-sm text-orange-700">• {notification}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicants.slice(0, 5).map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={applicant.profileImageUrl} />
                        <AvatarFallback>
                          {applicant.firstName?.[0] || applicant.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {applicant.firstName && applicant.lastName 
                            ? `${applicant.firstName} ${applicant.lastName}` 
                            : applicant.email}
                        </p>
                        <p className="text-xs text-gray-500">{applicant.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => updateApplicantStatusMutation.mutate({
                          id: applicant.id!,
                          status: "approved"
                        })}
                        disabled={updateApplicantStatusMutation.isPending}
                        className="h-7 px-2"
                        data-testid={`approve-applicant-${applicant.id}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicantStatusMutation.mutate({
                          id: applicant.id!,
                          status: "rejected"
                        })}
                        disabled={updateApplicantStatusMutation.isPending}
                        className="h-7 px-2"
                        data-testid={`reject-applicant-${applicant.id}`}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No pending applications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allEvents.filter(e => e.status === 'upcoming').slice(0, 5).map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString()}
                      <Clock className="h-3 w-3 ml-2" />
                      {event.time}
                    </div>
                  </div>
                ))}
                {allEvents.filter(e => e.status === 'upcoming').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-2" />
                      <span className="text-sm">Add User</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <Form {...createUserForm}>
                      <form onSubmit={createUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={createUserForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="John" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createUserForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Doe" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={createUserForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="john@example.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createUserForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="••••••••" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createUserForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <Button type="button" variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createUserMutation.isPending}>
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span className="text-sm">Create Event</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <Form {...createEventForm}>
                      <form onSubmit={createEventForm.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={createEventForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Event name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createEventForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Event description" rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={createEventForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createEventForm.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input {...field} type="time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={createEventForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Event location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={createEventForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="volunteer">Volunteer</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createEventForm.control}
                            name="maxParticipants"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Participants (optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="50"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value ? parseInt(value) : undefined);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={createEventForm.control}
                          name="registrationRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Registration Required
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Enable this if users need to register to attend this event
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createEventForm.control}
                          name="contactInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Information (optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Contact details for questions about this event" rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <Button type="button" variant="outline" onClick={() => setCreateEventDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createEventMutation.isPending}>
                            {createEventMutation.isPending ? "Creating..." : "Create Event"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Reports</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <AdminContentManager />
        </TabsContent>
        
        <TabsContent value="notices" className="space-y-6">
          <NoticeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}