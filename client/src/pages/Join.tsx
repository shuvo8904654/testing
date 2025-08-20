import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Rocket, UserPlus } from "lucide-react";

export default function Join() {
  const handleRegistrationClick = () => {
    // This would typically open a Google Form or similar registration form
    window.open('https://forms.google.com/your-form-link', '_blank');
  };

  return (
    <div className="py-20 gradient-bg" data-testid="join-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6" data-testid="page-title">
          Ready to Make a Difference?
        </h1>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto" data-testid="page-description">
          Join hundreds of young changemakers in Kurigram who are working together to create 
          a world of zero poverty, zero unemployment, and zero net carbon emissions.
        </p>

        <Card className="bg-white rounded-3xl shadow-2xl" data-testid="registration-card">
          <CardContent className="p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="card-title">Become a Member Today</h2>
            <p className="text-gray-600 mb-8" data-testid="card-description">
              Fill out our registration form and start your journey as a 3ZERO champion.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center" data-testid="benefit-community">
                <div className="bg-eco-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Users className="text-eco-green text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Join the Community</h3>
                <p className="text-gray-600 text-sm">Connect with like-minded young people</p>
              </div>
              <div className="text-center" data-testid="benefit-learn">
                <div className="bg-youth-blue/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="text-youth-blue text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Learn & Grow</h3>
                <p className="text-gray-600 text-sm">Access training and development opportunities</p>
              </div>
              <div className="text-center" data-testid="benefit-impact">
                <div className="bg-yellow-400/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Rocket className="text-yellow-600 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Impact</h3>
                <p className="text-gray-600 text-sm">Lead projects that transform communities</p>
              </div>
            </div>

            <Button 
              onClick={handleRegistrationClick}
              className="bg-eco-green text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-eco-green-dark"
              data-testid="button-register"
            >
              <UserPlus className="mr-3" />
              Register Now
            </Button>
            
            <p className="text-gray-500 text-sm mt-4" data-testid="registration-note">
              Registration is free and open to youth aged 16-30 in Kurigram
            </p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 text-left">
          <Card className="bg-white/90" data-testid="requirements-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="requirements-title">Membership Requirements</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center" data-testid="requirement-age">
                  <span className="w-2 h-2 bg-eco-green rounded-full mr-3"></span>
                  Age between 16-30 years
                </li>
                <li className="flex items-center" data-testid="requirement-location">
                  <span className="w-2 h-2 bg-eco-green rounded-full mr-3"></span>
                  Resident of Kurigram district
                </li>
                <li className="flex items-center" data-testid="requirement-commitment">
                  <span className="w-2 h-2 bg-eco-green rounded-full mr-3"></span>
                  Commitment to community service
                </li>
                <li className="flex items-center" data-testid="requirement-values">
                  <span className="w-2 h-2 bg-eco-green rounded-full mr-3"></span>
                  Belief in 3ZERO values
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/90" data-testid="benefits-card">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="benefits-title">Member Benefits</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center" data-testid="benefit-training">
                  <span className="w-2 h-2 bg-youth-blue rounded-full mr-3"></span>
                  Free skills development training
                </li>
                <li className="flex items-center" data-testid="benefit-networking">
                  <span className="w-2 h-2 bg-youth-blue rounded-full mr-3"></span>
                  Networking opportunities
                </li>
                <li className="flex items-center" data-testid="benefit-leadership">
                  <span className="w-2 h-2 bg-youth-blue rounded-full mr-3"></span>
                  Leadership development programs
                </li>
                <li className="flex items-center" data-testid="benefit-projects">
                  <span className="w-2 h-2 bg-youth-blue rounded-full mr-3"></span>
                  Participation in impactful projects
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
