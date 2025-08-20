import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Image, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import type { Registration } from "@shared/schema";

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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.firstName || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="registrations" data-testid="tab-registrations">
                <UserCheck className="w-4 h-4 mr-2" />
                Registrations
              </TabsTrigger>
              <TabsTrigger value="members" data-testid="tab-members">
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery">
                <Image className="w-4 h-4 mr-2" />
                Gallery
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
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleRegistrationAction(registration.id, "approved")}
                                disabled={updateRegistrationMutation.isPending}
                                data-testid={`button-approve-${registration.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
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

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Members Management</CardTitle>
                  <CardDescription>
                    Manage club members and their profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Member management interface will be available soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>
                    Manage news articles, stories, and projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Content management interface will be available soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Management</CardTitle>
                  <CardDescription>
                    Manage gallery images and media content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Gallery management interface will be available soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}