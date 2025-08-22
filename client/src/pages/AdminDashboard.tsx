import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, FileText, Image, UserCheck, Crown, Shield, User as UserIcon, Plus, Calendar, Settings, Search, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import type { IRegistration, INewsArticle, IProject, IGalleryImage, IUser, IEvent } from "@shared/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, insertEventSchema } from "@shared/validation";
import { z } from "zod";
import AdminContentManager from "@/components/AdminContentManager";
import NoticeManagement from "@/components/NoticeManagement";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);

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
  const createEventForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "workshop" as const,
      maxParticipants: undefined as number | undefined,
      registrationRequired: false,
      contactInfo: "",
      status: "upcoming" as const,
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

  const { data: applicantsData } = useQuery<{applicants: IUser[], analytics: any}>({
    queryKey: ["/api/users/applicants"],
    enabled: isAdmin,
  });

  const applicants = applicantsData?.applicants || [];

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

  const updateApplicantStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/users/${id}/application-status`, { 
        applicationStatus: status,
        ...(status === 'approved' && { role: 'member', approvedAt: new Date() })
      });
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/users/applicants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const handleApplicantAction = (id: string, status: string) => {
    updateApplicantStatusMutation.mutate({ id, status });
  };

  const approveContentMutation = useMutation({
    mutationFn: async ({ contentType, id }: { contentType: string; id: string }) => {
      return await apiRequest("POST", `/api/approve-content/${contentType}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
      toast({
        title: "Success",
        description: "Content approved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to approve content",
        variant: "destructive",
      });
    },
  });

  const rejectContentMutation = useMutation({
    mutationFn: async ({ contentType, id }: { contentType: string; id: string }) => {
      return await apiRequest("POST", `/api/reject-content/${contentType}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
      toast({
        title: "Success",
        description: "Content rejected successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to reject content",
        variant: "destructive",
      });
    },
  });

  const handleContentAction = (contentType: string, id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      approveContentMutation.mutate({ contentType, id });
    } else {
      rejectContentMutation.mutate({ contentType, id });
    }
  };

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissions }: { userId: string; role: string; permissions: string[] }) => {
      return await apiRequest("PUT", `/api/users/${userId}`, { role, permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof insertUserSchema>) => {
      return await apiRequest("POST", "/api/users", userData);
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
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: z.infer<typeof insertEventSchema>) => {
      return await apiRequest("POST", "/api/events", { ...eventData, createdBy: user?._id });
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
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, role: newRole, permissions: [] });
  };

  const handleStatusToggle = (userId: string, isActive: boolean) => {
    updateUserStatusMutation.mutate({ userId, isActive });
  };

  const isSuperAdmin = user?.role === "super_admin";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.firstName || user?.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                data-testid="button-home"
              >
                Back to Website
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="registrations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 h-auto">
              <TabsTrigger value="registrations" data-testid="tab-registrations" className="flex flex-col lg:flex-row items-center text-xs sm:text-sm p-2 sm:p-3 min-h-[3rem]">
                <UserCheck className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
                <span className="hidden lg:inline">Registrations</span>
                <span className="lg:hidden text-center">Reg.</span>
              </TabsTrigger>
              <TabsTrigger value="members" data-testid="tab-members" className="flex flex-col lg:flex-row items-center text-xs sm:text-sm p-2 sm:p-3 min-h-[3rem]">
                <Users className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
                <span className="hidden lg:inline">Members</span>
                <span className="lg:hidden text-center">Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content" className="flex flex-col lg:flex-row items-center text-xs sm:text-sm p-2 sm:p-3 min-h-[3rem]">
                <FileText className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
                <span className="hidden lg:inline">Content</span>
                <span className="lg:hidden text-center">Content</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery" className="flex flex-col lg:flex-row items-center text-xs sm:text-sm p-2 sm:p-3 min-h-[3rem]">
                <Image className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
                <span className="hidden lg:inline">Gallery</span>
                <span className="lg:hidden text-center">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events" className="flex flex-col lg:flex-row items-center text-xs sm:text-sm p-2 sm:p-3 min-h-[3rem]">
                <Calendar className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
                <span className="hidden lg:inline">Events</span>
                <span className="lg:hidden text-center">Events</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Membership Registrations</CardTitle>
                  <CardDescription>
                    Review and approve membership applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applicants.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-applicants">
                      No pending applications
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {applicants.map((applicant) => (
                        <div
                          key={applicant._id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-applicant-${applicant._id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium" data-testid={`text-name-${applicant._id}`}>
                                {applicant.firstName} {applicant.lastName}
                              </h3>
                              <p className="text-sm text-gray-600" data-testid={`text-email-${applicant._id}`}>
                                {applicant.email}
                              </p>
                              <p className="text-sm text-gray-600" data-testid={`text-phone-${applicant._id}`}>
                                {applicant.phone}
                              </p>
                            </div>
                            <Badge
                              variant={
                                applicant.applicationStatus === "approved"
                                  ? "default"
                                  : applicant.applicationStatus === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              data-testid={`badge-status-${applicant._id}`}
                            >
                              {applicant.applicationStatus}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Age:</span> {applicant.age}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Role:</span> {applicant.role}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Address:</span> {applicant.address}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Motivation:</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {applicant.motivation}
                            </p>
                          </div>
                          {applicant.appliedAt && (
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Applied:</span> {new Date(applicant.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {applicant.applicationStatus === "pending" && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                              <Button
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleApplicantAction(applicant._id, "approved")}
                                disabled={updateApplicantStatusMutation.isPending}
                                data-testid={`button-approve-${applicant._id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => handleApplicantAction(applicant._id, "rejected")}
                                disabled={updateApplicantStatusMutation.isPending}
                                data-testid={`button-reject-${applicant._id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle>User Role Management</CardTitle>
                      <CardDescription>
                        Manage user roles and permissions {!isSuperAdmin && "(View Only - Super Admin access required to modify roles)"}
                      </CardDescription>
                    </div>
                    {isSuperAdmin && (
                      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-create-user" className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Create User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto max-h-[90vh] overflow-y-auto p-3 sm:p-6">
                          <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                          </DialogHeader>
                          <Form {...createUserForm}>
                            <form onSubmit={createUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={createUserForm.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>First Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} value={field.value || ""} data-testid="input-user-firstname" />
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
                                        <Input {...field} value={field.value || ""} data-testid="input-user-lastname" />
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
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} type="email" data-testid="input-user-email" required />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={createUserForm.control}
                                name="profileImageUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Profile Image</FormLabel>
                                    <FormControl>
                                      <FileUpload
                                        onFileUpload={field.onChange}
                                        currentValue={field.value || ""}
                                        placeholder="Upload profile image"
                                      />
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
                                    <FormLabel>Password *</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} type="password" data-testid="input-user-password" required />
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
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-user-role">
                                          <SelectValue />
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
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                                <Button
                                  type="submit"
                                  disabled={createUserMutation.isPending}
                                  className="w-full sm:w-auto"
                                  data-testid="button-submit-user"
                                >
                                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setCreateUserDialogOpen(false)}
                                  className="w-full sm:w-auto"
                                  data-testid="button-cancel-user"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {allUsers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-users">
                      No users found
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {allUsers.map((targetUser) => (
                        <div
                          key={targetUser.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-user-${targetUser.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {targetUser.role === "super_admin" && <Crown className="w-4 h-4 text-yellow-500" />}
                                {targetUser.role === "admin" && <Shield className="w-4 h-4 text-blue-500" />}
                                {targetUser.role === "member" && <UserIcon className="w-4 h-4 text-gray-500" />}
                                <h3 className="font-medium" data-testid={`text-user-name-${targetUser.id}`}>
                                  {targetUser.firstName && targetUser.lastName 
                                    ? `${targetUser.firstName} ${targetUser.lastName}` 
                                    : targetUser.email}
                                  {targetUser.id === user?.id && " (You)"}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600" data-testid={`text-user-email-${targetUser.id}`}>
                                {targetUser.email}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">Role:</span>
                                  {isSuperAdmin && targetUser.id !== user?.id ? (
                                    <Select
                                      value={targetUser.role}
                                      onValueChange={(newRole) => handleRoleChange(targetUser.id, newRole)}
                                      disabled={updateUserRoleMutation.isPending}
                                    >
                                      <SelectTrigger className="w-32" data-testid={`select-role-${targetUser.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Badge
                                      variant={
                                        targetUser.role === "super_admin"
                                          ? "default"
                                          : targetUser.role === "admin"
                                          ? "secondary"
                                          : "outline"
                                      }
                                      data-testid={`badge-role-${targetUser.id}`}
                                    >
                                      {targetUser.role === "super_admin" ? "Super Admin" : 
                                       targetUser.role === "admin" ? "Admin" : "Member"}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">Status:</span>
                                  {isSuperAdmin && targetUser.id !== user?.id ? (
                                    <Switch
                                      checked={targetUser.isActive ?? false}
                                      onCheckedChange={(checked) => handleStatusToggle(targetUser.id, checked)}
                                      disabled={updateUserStatusMutation.isPending}
                                      data-testid={`switch-status-${targetUser.id}`}
                                    />
                                  ) : (
                                    <Badge variant={targetUser.isActive ? "default" : "destructive"}>
                                      {targetUser.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Joined: {new Date(targetUser.createdAt!).toLocaleDateString()}</span>
                            <span>Last Updated: {new Date(targetUser.updatedAt!).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {/* News Articles */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending News Articles</CardTitle>
                  <CardDescription>
                    Review and approve news articles submitted by members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!pendingContent?.news || pendingContent.news.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-pending-news">
                      No pending news articles
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingContent.news.map((article) => (
                        <div
                          key={article.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-news-${article.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg" data-testid={`text-news-title-${article.id}`}>
                                {article.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1" data-testid={`text-news-excerpt-${article.id}`}>
                                {article.excerpt}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                News
                              </Badge>
                            </div>
                            <Badge
                              variant="secondary"
                              data-testid={`badge-news-status-${article.id}`}
                            >
                              {article.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="line-clamp-3">{article.content}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created: {new Date(article.createdAt!).toLocaleDateString()}</span>
                            <span>By: {article.createdBy || 'Unknown'}</span>
                          </div>
                          {article.status === "pending" && (
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleContentAction('news', article.id, 'approve')}
                                disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                data-testid={`button-approve-news-${article.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleContentAction('news', article.id, 'reject')}
                                disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                data-testid={`button-reject-news-${article.id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Projects</CardTitle>
                  <CardDescription>
                    Review and approve project proposals submitted by members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!pendingContent?.projects || pendingContent.projects.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-pending-projects">
                      No pending projects
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingContent.projects.map((project) => (
                        <div
                          key={project.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-project-${project.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg" data-testid={`text-project-title-${project.id}`}>
                                {project.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1" data-testid={`text-project-description-${project.id}`}>
                                {project.description}
                              </p>
                              <div className="flex space-x-2 mt-2">
                                <Badge variant="outline">
                                  Project
                                </Badge>
                                <Badge variant={project.status === 'approved' ? 'default' : 'secondary'}>
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              data-testid={`badge-project-status-${project.id}`}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created: {new Date(project.createdAt!).toLocaleDateString()}</span>
                            <span>By: {project.createdBy || 'Unknown'}</span>
                          </div>
                          {project.status === "pending" && (
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleContentAction('project', project.id, 'approve')}
                                disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                data-testid={`button-approve-project-${project.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleContentAction('project', project.id, 'reject')}
                                disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                data-testid={`button-reject-project-${project.id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Gallery Images</CardTitle>
                  <CardDescription>
                    Review and approve gallery images submitted by members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!pendingContent?.gallery || pendingContent.gallery.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-pending-gallery">
                      No pending gallery images
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingContent.gallery.map((image) => (
                        <div
                          key={image.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-gallery-${image.id}`}
                        >
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.imageUrl}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              data-testid={`img-gallery-${image.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium" data-testid={`text-gallery-title-${image.id}`}>
                                {image.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                data-testid={`badge-gallery-status-${image.id}`}
                              >
                                {image.status}
                              </Badge>
                            </div>
                            {image.description && (
                              <p className="text-sm text-gray-600" data-testid={`text-gallery-description-${image.id}`}>
                                {image.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Created: {new Date(image.createdAt!).toLocaleDateString()}</span>
                              <span>By: {image.createdBy || 'Unknown'}</span>
                            </div>
                            {image.status === "pending" && (
                              <div className="flex space-x-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleContentAction('gallery', image.id, 'approve')}
                                  disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                  data-testid={`button-approve-gallery-${image.id}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleContentAction('gallery', image.id, 'reject')}
                                  disabled={approveContentMutation.isPending || rejectContentMutation.isPending}
                                  data-testid={`button-reject-gallery-${image.id}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle>Events Management</CardTitle>
                      <CardDescription>
                        Create and manage upcoming events for the organization
                      </CardDescription>
                    </div>
                    <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-create-event" className="w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto max-h-[90vh] overflow-y-auto p-3 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Create New Event</DialogTitle>
                        </DialogHeader>
                        <Form {...createEventForm}>
                          <form onSubmit={createEventForm.handleSubmit((data) => createEventMutation.mutate({...data, date: new Date(data.date), createdBy: user?._id || 'unknown'}))} className="space-y-4">
                            <FormField
                              control={createEventForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Event Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-event-title" />
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
                                    <Textarea {...field} data-testid="input-event-description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={createEventForm.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" data-testid="input-event-date" />
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
                                      <Input {...field} type="time" data-testid="input-event-time" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={createEventForm.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-event-location" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={createEventForm.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-event-category">
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
                            </div>
                            <FormField
                              control={createEventForm.control}
                              name="maxParticipants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Participants (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" data-testid="input-event-max-participants" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={createEventForm.control}
                              name="contactInfo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Information (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-event-contact" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={createEventMutation.isPending}
                              data-testid="button-submit-event"
                            >
                              {createEventMutation.isPending ? "Creating..." : "Create Event"}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {allEvents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-events">
                      No events created yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {allEvents.map((event) => (
                        <div
                          key={event.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-event-${event.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg" data-testid={`text-event-title-${event.id}`}>
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1" data-testid={`text-event-description-${event.id}`}>
                                {event.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline">
                                  {event.category}
                                </Badge>
                                <Badge 
                                  variant={event.status === 'upcoming' ? 'default' : 
                                          event.status === 'ongoing' ? 'secondary' : 
                                          event.status === 'completed' ? 'outline' : 'destructive'}
                                >
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{event.time}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Location:</span> {event.location}
                            </div>
                            {event.maxParticipants && (
                              <div>
                                <span className="font-medium">Max Participants:</span> {event.maxParticipants}
                              </div>
                            )}
                            {event.contactInfo && (
                              <div className="sm:col-span-2">
                                <span className="font-medium">Contact:</span> {event.contactInfo}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteEventMutation.mutate(event.id)}
                                disabled={deleteEventMutation.isPending}
                                data-testid={`button-delete-event-${event.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}