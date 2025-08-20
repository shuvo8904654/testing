import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Rocket, Play, Users, Briefcase, Leaf, Calendar, Handshake } from "lucide-react";
import type { Project, NewsArticle, Member } from "../../../shared/schema";

export default function Home() {
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: news } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const featuredProjects = projects?.slice(0, 3) || [];
  const latestNews = news?.slice(0, 2) || [];
  const teamMembers = members?.slice(0, 4) || [];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="gradient-bg min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ID: 050-009-0023
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
                Creating a World of <span className="text-yellow-300">Three Zeros</span>
              </h1>
              <div className="text-xl mb-8 space-y-2">
                <p className="flex items-center" data-testid="zero-poverty">
                  <CheckCircle className="mr-3" />
                  Zero Poverty
                </p>
                <p className="flex items-center" data-testid="zero-unemployment">
                  <CheckCircle className="mr-3" />
                  Zero Unemployment
                </p>
                <p className="flex items-center" data-testid="zero-carbon">
                  <CheckCircle className="mr-3" />
                  Zero Net Carbon
                </p>
              </div>
              <p className="text-lg mb-8 opacity-90" data-testid="hero-description">
                Join the youth-led movement in Kurigram, inspired by Nobel Laureate Dr. Muhammad Yunus, 
                to build a sustainable and equitable future for all.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/join">
                  <Button className="bg-white text-eco-green px-8 py-4 rounded-full font-semibold hover:bg-gray-100 text-lg" data-testid="button-join-movement">
                    <Rocket className="mr-2" />
                    Join the Movement
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-eco-green text-lg" data-testid="button-learn-more">
                    <Play className="mr-2" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Youth community action" 
                className="rounded-3xl shadow-2xl w-full"
                data-testid="hero-image"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl" data-testid="stat-youth-empowered">
                <div className="text-center">
                  <p className="text-3xl font-bold text-eco-green">500+</p>
                  <p className="text-sm text-gray-600">Youth Empowered</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl" data-testid="stat-projects-completed">
                <div className="text-center">
                  <p className="text-3xl font-bold text-youth-blue">25+</p>
                  <p className="text-sm text-gray-600">Projects Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="about-title">About 3ZERO Movement</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Inspired by Nobel Laureate Dr. Muhammad Yunus, we are part of a global movement 
              working towards a world free from poverty, unemployment, and environmental destruction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-eco-green/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-eco-green text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="mission-poverty">Zero Poverty</h3>
              <p className="text-gray-600">Creating economic opportunities for all community members</p>
            </div>
            <div className="text-center">
              <div className="bg-youth-blue/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-youth-blue text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="mission-unemployment">Zero Unemployment</h3>
              <p className="text-gray-600">Developing skills and entrepreneurship among youth</p>
            </div>
            <div className="text-center">
              <div className="bg-eco-green/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-eco-green text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="mission-carbon">Zero Net Carbon</h3>
              <p className="text-gray-600">Promoting sustainable practices and environmental conservation</p>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-gradient-to-r from-eco-green/5 to-youth-blue/5 rounded-3xl p-8 lg:p-12" data-testid="quote-section">
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
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="featured-projects-title">Our Impact</h2>
            <p className="text-xl text-gray-600">
              Transforming communities through action-oriented projects and events
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <Card key={project.id} className={`hover-scale ${
                index === 0 ? 'bg-gradient-to-br from-eco-green/5 to-eco-green/10' :
                index === 1 ? 'bg-gradient-to-br from-youth-blue/5 to-youth-blue/10' :
                'bg-gradient-to-br from-yellow-400/5 to-yellow-400/10'
              }`} data-testid={`project-card-${index}`}>
                <CardContent className="p-8">
                  <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 ${
                    index === 0 ? 'bg-eco-green/20' :
                    index === 1 ? 'bg-youth-blue/20' :
                    'bg-yellow-400/20'
                  }`}>
                    <Leaf className={`text-2xl ${
                      index === 0 ? 'text-eco-green' :
                      index === 1 ? 'text-youth-blue' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`project-title-${index}`}>
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid={`project-description-${index}`}>
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      index === 0 ? 'text-eco-green' :
                      index === 1 ? 'text-youth-blue' :
                      'text-yellow-600'
                    }`} data-testid={`project-status-${index}`}>
                      {project.completedAt}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-3xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-testid="upcoming-events-title">Upcoming Events</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg" data-testid="event-card-olympiad">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-eco-green text-white p-3 rounded-lg mr-4">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900" data-testid="event-title-olympiad">3ZERO Youth Olympiad 2024</h4>
                      <p className="text-gray-600 text-sm" data-testid="event-date-olympiad">December 15-17, 2024</p>
                    </div>
                  </div>
                  <p className="text-gray-600" data-testid="event-description-olympiad">
                    Three-day event featuring competitions, workshops, and networking sessions for young changemakers.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg" data-testid="event-card-campaign">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-youth-blue text-white p-3 rounded-lg mr-4">
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900" data-testid="event-title-campaign">Community Impact Campaign</h4>
                      <p className="text-gray-600 text-sm" data-testid="event-date-campaign">January 2025</p>
                    </div>
                  </div>
                  <p className="text-gray-600" data-testid="event-description-campaign">
                    Month-long campaign focusing on poverty alleviation and sustainable livelihood creation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="latest-news-title">Latest News</h2>
              <p className="text-xl text-gray-600">
                Stay updated with our recent activities and achievements
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {latestNews.map((article, index) => (
                <Card key={article.id} className="shadow-lg hover-scale overflow-hidden" data-testid={`news-card-${index}`}>
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    data-testid={`news-image-${index}`}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        article.category === 'Success Story' ? 'bg-eco-green/10 text-eco-green' :
                        article.category === 'Update' ? 'bg-youth-blue/10 text-youth-blue' :
                        'bg-yellow-400/20 text-yellow-700'
                      }`} data-testid={`news-category-${index}`}>
                        {article.category}
                      </span>
                      <span className="text-gray-500 text-sm ml-auto" data-testid={`news-date-${index}`}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3" data-testid={`news-title-${index}`}>
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4" data-testid={`news-excerpt-${index}`}>
                      {article.excerpt}
                    </p>
                    <Link href={`/news#${article.id}`}>
                      <a className="text-eco-green font-medium hover:text-eco-green-dark transition-colors" data-testid={`news-read-more-${index}`}>
                        Read More →
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link href="/news">
                <Button variant="outline" className="px-8 py-3" data-testid="button-view-all-news">
                  View All News
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Team Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="team-preview-title">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              Passionate youth leaders driving change in Kurigram and beyond
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((member, index) => (
              <Card key={member.id} className="hover-scale shadow-lg" data-testid={`team-member-${index}`}>
                <CardContent className="p-6 text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    data-testid={`member-image-${index}`}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`member-name-${index}`}>
                    {member.name}
                  </h3>
                  <p className="text-eco-green font-medium mb-3" data-testid={`member-position-${index}`}>
                    {member.position}
                  </p>
                  <p className="text-gray-600 text-sm" data-testid={`member-bio-${index}`}>
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/members">
              <Button className="bg-eco-green text-white px-8 py-3 hover:bg-eco-green-dark" data-testid="button-meet-team">
                <Users className="mr-2" />
                Meet Our Full Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
