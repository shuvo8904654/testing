import { CheckCircle, Heart, Briefcase, Leaf } from "lucide-react";

export default function About() {
  return (
    <div className="py-20 bg-white" data-testid="about-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">About 3ZERO Movement</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inspired by Nobel Laureate Dr. Muhammad Yunus, we are part of a global movement 
            working towards a world free from poverty, unemployment, and environmental destruction.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Leadership and inspiration" 
              className="rounded-2xl shadow-lg"
              data-testid="about-image"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6" data-testid="mission-title">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6" data-testid="mission-description">
              3ZERO Club Kurigram (ID: 050-009-0023) is a registered youth organization under the 
              global 3ZERO movement. We empower young people to become agents of change in their 
              communities through innovative social business solutions and sustainable practices.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-eco-green/10 p-3 rounded-full mr-4">
                  <Heart className="text-eco-green w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-testid="zero-poverty-title">Zero Poverty</h3>
                  <p className="text-gray-600" data-testid="zero-poverty-description">Creating economic opportunities for all community members</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-youth-blue/10 p-3 rounded-full mr-4">
                  <Briefcase className="text-youth-blue w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-testid="zero-unemployment-title">Zero Unemployment</h3>
                  <p className="text-gray-600" data-testid="zero-unemployment-description">Developing skills and entrepreneurship among youth</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-eco-green/10 p-3 rounded-full mr-4">
                  <Leaf className="text-eco-green w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-testid="zero-carbon-title">Zero Net Carbon</h3>
                  <p className="text-gray-600" data-testid="zero-carbon-description">Promoting sustainable practices and environmental conservation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="bg-gradient-to-r from-eco-green/5 to-youth-blue/5 rounded-3xl p-8 lg:p-12 mb-16" data-testid="quote-section">
          <div className="text-center">
            <div className="quote-mark text-eco-green">&ldquo;</div>
            <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
              We can create a world of three zeros: zero poverty, zero unemployment, and zero net carbon emissions.
            </blockquote>
            <cite className="text-lg text-gray-600">
              — Dr. Muhammad Yunus, Nobel Laureate
            </cite>
          </div>
        </div>

        {/* Our Approach */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-testid="approach-title">Our Approach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-eco-green/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-eco-green text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="community-title">Community-Driven</h3>
              <p className="text-gray-600" data-testid="community-description">
                We believe in empowering local communities to identify and solve their own challenges through collaborative action.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-youth-blue/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-youth-blue text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="youth-title">Youth-Led</h3>
              <p className="text-gray-600" data-testid="youth-description">
                Young people are at the center of our initiatives, driving innovation and creating sustainable solutions for their communities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-400/20 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="sustainable-title">Sustainable Impact</h3>
              <p className="text-gray-600" data-testid="sustainable-description">
                All our projects are designed with long-term sustainability in mind, creating lasting positive change.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-testid="values-title">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="innovation-title">Innovation</h3>
              <p className="text-gray-600 mb-6" data-testid="innovation-description">
                We encourage creative thinking and innovative solutions to address complex social and environmental challenges.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="collaboration-title">Collaboration</h3>
              <p className="text-gray-600" data-testid="collaboration-description">
                We believe in the power of working together, building partnerships across sectors and communities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="integrity-title">Integrity</h3>
              <p className="text-gray-600 mb-6" data-testid="integrity-description">
                We operate with transparency, honesty, and accountability in all our activities and relationships.
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="inclusion-title">Inclusion</h3>
              <p className="text-gray-600" data-testid="inclusion-description">
                We ensure that everyone, regardless of background, has an opportunity to participate and contribute to our mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
