import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, FileText, Image, UserCheck, Crown, Shield, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import type { Registration, NewsArticle, Project, GalleryImage, User } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

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

  const { data: registrations = [] } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
    enabled: isAdmin,
  });

  const { data: pendingContent } = useQuery<{
    news: NewsArticle[];
    projects: Project[];
    gallery: GalleryImage[];
  }>({
    queryKey: ["/api/pending-content"],
    enabled: isAdmin,
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/registrations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      toast({
        title: "Success",
        description: "Registration status updated",
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
        description: "Failed to update registration status",
        variant: "destructive",
      });
    },
  });

  const handleRegistrationAction = (id: string, status: string) => {
    updateRegistrationMutation.mutate({ id, status });
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
              <TabsTrigger value="registrations" data-testid="tab-registrations" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <UserCheck className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Registrations</span>
                <span className="sm:hidden">Reg.</span>
              </TabsTrigger>
              <TabsTrigger value="members" data-testid="tab-members" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <Users className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Members</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Content</span>
                <span className="sm:hidden">Content</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <Image className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Gallery</span>
                <span className="sm:hidden">Gallery</span>
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
                  {registrations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-registrations">
                      No pending registrations
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="border rounded-lg p-4 space-y-3"
                          data-testid={`card-registration-${registration.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium" data-testid={`text-name-${registration.id}`}>
                                {registration.firstName} {registration.lastName}
                              </h3>
                              <p className="text-sm text-gray-600" data-testid={`text-email-${registration.id}`}>
                                {registration.email}
                              </p>
                              <p className="text-sm text-gray-600" data-testid={`text-phone-${registration.id}`}>
                                {registration.phone}
                              </p>
                            </div>
                            <Badge
                              variant={
                                registration.status === "approved"
                                  ? "default"
                                  : registration.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              data-testid={`badge-status-${registration.id}`}
                            >
                              {registration.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Age:</span> {registration.age}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Occupation:</span> {registration.occupation}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Address:</span> {registration.address}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Motivation:</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {registration.motivation}
                            </p>
                          </div>
                          {registration.skills && (
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Skills:</span>
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {registration.skills}
                              </p>
                            </div>
                          )}
                          {registration.status === "pending" && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                              <Button
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleRegistrationAction(registration.id, "approved")}
                                disabled={updateRegistrationMutation.isPending}
                                data-testid={`button-approve-${registration.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => handleRegistrationAction(registration.id, "rejected")}
                                disabled={updateRegistrationMutation.isPending}
                                data-testid={`button-reject-${registration.id}`}
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
                  <CardTitle>User Role Management</CardTitle>
                  <CardDescription>
                    Manage user roles and permissions {!isSuperAdmin && "(View Only - Super Admin access required to modify roles)"}
                  </CardDescription>
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
                                {article.category}
                              </Badge>
                            </div>
                            <Badge
                              variant="secondary"
                              data-testid={`badge-news-status-${article.id}`}
                            >
                              {article.approvalStatus}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="line-clamp-3">{article.content}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created: {new Date(article.createdAt!).toLocaleDateString()}</span>
                            <span>By: {article.createdBy || 'Unknown'}</span>
                          </div>
                          {article.approvalStatus === "pending" && (
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
                                  {project.category}
                                </Badge>
                                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              data-testid={`badge-project-status-${project.id}`}
                            >
                              {project.approvalStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Created: {new Date(project.createdAt!).toLocaleDateString()}</span>
                            <span>By: {project.createdBy || 'Unknown'}</span>
                          </div>
                          {project.approvalStatus === "pending" && (
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
                              src={image.url}
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
                                {image.approvalStatus}
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
                            {image.approvalStatus === "pending" && (
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}