import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Linkedin, Facebook, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Member } from "@shared/schema";

export default function Members() {
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50" data-testid="members-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">Meet Our Team</h1>
          <p className="text-xl text-gray-600">
            Passionate youth leaders driving change in Kurigram and beyond
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {members?.map((member, index) => (
            <Card key={member.id || index} className="bg-white hover-scale shadow-lg" data-testid={`member-card-${index}`}>
              <CardContent className="p-6">
                <img 
                  src={member.profileImageUrl || '/placeholder-avatar.png'} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  data-testid={`member-image-${index}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder-avatar.png') {
                      target.src = '/placeholder-avatar.png';
                    }
                  }}
                />
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2" data-testid={`member-name-${index}`}>
                  {member.name}
                </h3>
                <p className="text-eco-green text-center font-medium mb-3" data-testid={`member-position-${index}`}>
                  {member.role}
                </p>
                <p className="text-gray-600 text-center text-sm mb-4" data-testid={`member-bio-${index}`}>
                  {member.bio}
                </p>
                <div className="space-y-4">
                  <div className="flex justify-center space-x-3">
                    {member.social?.linkedin && (
                      <a 
                        href={member.social.linkedin} 
                        className="text-youth-blue hover:text-youth-blue-dark transition-colors"
                        data-testid={`member-linkedin-${index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.social?.facebook && (
                      <a 
                        href={member.social.facebook} 
                        className="text-eco-green hover:text-eco-green-dark transition-colors"
                        data-testid={`member-facebook-${index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <Link href={`/member/${member.name.toLowerCase().replace(/\s+/g, '')}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200"
                        data-testid={`member-profile-link-${index}`}
                      >
                        View Profile
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/join">
            <Button className="bg-eco-green text-white px-8 py-3 hover:bg-eco-green-dark" data-testid="button-join-team">
              <Users className="mr-2" />
              Join Our Team
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
