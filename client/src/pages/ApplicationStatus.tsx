import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Clock, XCircle, User, Mail, Phone, MapPin, FileText } from "lucide-react";

export default function ApplicationStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'applicant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              This page is only accessible to applicants. Please log in with your applicant account.
            </p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (user.applicationStatus) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (user.applicationStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (user.applicationStatus) {
      case 'approved':
        return {
          title: "Congratulations! Your application has been approved.",
          description: "Welcome to 3ZERO Club Kurigram! You are now a member and can access all member features and activities.",
          action: "Your account will be upgraded to member status shortly."
        };
      case 'rejected':
        return {
          title: "We appreciate your interest in joining us.",
          description: "Unfortunately, your application was not approved at this time. You may reapply in the future.",
          action: "If you have questions about this decision, please contact us."
        };
      default:
        return {
          title: "Your application is being reviewed.",
          description: "Thank you for applying to join 3ZERO Club Kurigram! Our team is currently reviewing your application.",
          action: "We'll notify you via email once a decision has been made."
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="application-status-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Application Status
          </h1>
          <p className="text-gray-600" data-testid="page-description">
            Track the progress of your 3ZERO Club Kurigram membership application
          </p>
        </div>

        {/* Status Overview */}
        <Card className="mb-8" data-testid="status-overview">
          <CardHeader>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-xl" data-testid="status-title">
                  Application Status: 
                  <Badge className={`ml-2 ${getStatusColor()}`} data-testid="status-badge">
                    {user.applicationStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
                </CardTitle>
                <CardDescription data-testid="status-message-title">
                  {statusMessage.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600" data-testid="status-description">
                {statusMessage.description}
              </p>
              <p className="text-sm text-gray-500" data-testid="status-action">
                {statusMessage.action}
              </p>
              {user.appliedAt && (
                <p className="text-sm text-gray-400" data-testid="applied-date">
                  Applied on: {new Date(user.appliedAt).toLocaleDateString()}
                </p>
              )}
              {user.approvedAt && (
                <p className="text-sm text-gray-400" data-testid="approved-date">
                  Approved on: {new Date(user.approvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card data-testid="application-details">
          <CardHeader>
            <CardTitle>Your Application Details</CardTitle>
            <CardDescription>
              The information you provided when applying to join 3ZERO Club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3" data-testid="detail-name">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-gray-600">
                      {user.firstName || user.lastName ? 
                        `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                        'Not provided'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3" data-testid="detail-email">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3" data-testid="detail-phone">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.age && (
                  <div className="flex items-center space-x-3" data-testid="detail-age">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Age</p>
                      <p className="text-gray-600">{user.age}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {user.address && (
                  <div className="flex items-start space-x-3" data-testid="detail-address">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{user.address}</p>
                    </div>
                  </div>
                )}
                {user.motivation && (
                  <div className="flex items-start space-x-3" data-testid="detail-motivation">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium">Motivation</p>
                      <p className="text-gray-600">{user.motivation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        {user.applicationStatus === 'approved' && (
          <Card className="mt-8 bg-green-50 border-green-200" data-testid="approved-cta">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Welcome to 3ZERO Club!
                </h3>
                <p className="text-green-700 mb-4">
                  Your membership is being activated. Once complete, you'll have access to the Member Dashboard 
                  where you can participate in projects, events, and community activities.
                </p>
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="bg-green-600 text-white hover:bg-green-700"
                  data-testid="button-explore"
                >
                  Explore Our Community
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user.applicationStatus === 'pending' && (
          <Card className="mt-8 bg-blue-50 border-blue-200" data-testid="pending-cta">
            <CardContent className="p-6">
              <div className="text-center">
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Application Under Review
                </h3>
                <p className="text-blue-700 mb-4">
                  While you wait, feel free to explore our website to learn more about our projects, 
                  events, and the impact we're making in Kurigram.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => window.location.href = "/projects"}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    data-testid="button-view-projects"
                  >
                    View Our Projects
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/news"}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    data-testid="button-view-news"
                  >
                    Read Latest News
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}