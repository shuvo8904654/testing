import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Rocket, 
  Play, 
  Users, 
  Briefcase, 
  Leaf, 
  Calendar, 
  Handshake,
  TrendingUp,
  Heart,
  Award,
  Target,
  Globe,
  Star,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Quote,
  Camera,
  MessageCircle,
  Clock,
  BookOpen,
  Shield,
  Zap
} from "lucide-react";
import type { Project, NewsArticle, Member, Event } from "../../../shared/schema";

export default function Home() {
  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
  });

  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const projects = projectsData?.projects || [];
  const news = newsData?.articles || [];
  const events = eventsData?.events || [];

  const featuredProjects = projects.slice(0, 3) || [];
  const latestNews = news.slice(0, 2) || [];
  const teamMembers = members?.slice(0, 4) || [];
  const upcomingEvents = events.filter(event => event.status === 'upcoming').slice(0, 4) || [];

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
                <Link href="/join" className="bg-white text-eco-green px-8 py-4 rounded-full font-semibold hover:bg-gray-100 text-lg flex items-center justify-center" data-testid="button-join-movement">
                  <Rocket className="mr-2" />
                  Join the Movement
                </Link>
                <Link href="/about" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-eco-green text-lg flex items-center justify-center" data-testid="button-learn-more">
                  <Play className="mr-2" />
                  Learn More
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
              <Card key={`project-${project.id}`} className={`hover-scale ${
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
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg" data-testid="no-events-message">
                  No upcoming events at the moment. Stay tuned for future activities!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {upcomingEvents.map((event, index) => {
                  const categoryColors = {
                    'workshop': 'bg-eco-green',
                    'meeting': 'bg-youth-blue',
                    'training': 'bg-yellow-600',
                    'volunteer': 'bg-green-600',
                    'other': 'bg-gray-600'
                  };
                  const bgColor = categoryColors[event.category as keyof typeof categoryColors] || 'bg-eco-green';

                  return (
                    <Card key={`event-${event.id}`} className="shadow-lg" data-testid={`event-card-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className={`${bgColor} text-white p-3 rounded-lg mr-4`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900" data-testid={`event-title-${index}`}>
                              {event.title}
                            </h4>
                            <p className="text-gray-600 text-sm" data-testid={`event-date-${index}`}>
                              {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                            </p>
                            {event.location && (
                              <p className="text-gray-500 text-xs" data-testid={`event-location-${index}`}>
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600" data-testid={`event-description-${index}`}>
                          {event.description}
                        </p>
                        {event.maxParticipants && (
                          <p className="text-sm text-gray-500 mt-2" data-testid={`event-capacity-${index}`}>
                            Max participants: {event.maxParticipants}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
                <Card key={`news-${article.id}`} className="shadow-lg hover-scale overflow-hidden" data-testid={`news-card-${index}`}>
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
              <Card key={`member-${member.id || member._id || index}`} className="hover-scale shadow-lg" data-testid={`team-member-${index}`}>
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

      {/* Impact Statistics */}
      <section className="py-20 bg-gradient-to-r from-eco-green to-youth-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" data-testid="impact-stats-title">Our Impact by Numbers</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Measurable change through collective action and youth empowerment
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center text-white" data-testid="stat-communities">
              <div className="bg-white/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Globe className="text-2xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">15+</div>
              <div className="text-white/90">Communities Reached</div>
            </div>
            <div className="text-center text-white" data-testid="stat-volunteers">
              <div className="bg-white/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="text-2xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">200+</div>
              <div className="text-white/90">Active Volunteers</div>
            </div>
            <div className="text-center text-white" data-testid="stat-training">
              <div className="bg-white/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="text-2xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50+</div>
              <div className="text-white/90">Training Sessions</div>
            </div>
            <div className="text-center text-white" data-testid="stat-impact">
              <div className="bg-white/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="text-2xl" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">95%</div>
              <div className="text-white/90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="gallery-preview-title">Moments that Matter</h2>
            <p className="text-xl text-gray-600">
              Capturing our journey towards a better tomorrow
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
              "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            ].map((src, index) => (
              <div key={`gallery-${index}`} className="relative group overflow-hidden rounded-lg" data-testid={`gallery-image-${index}`}>
                <img
                  src={src}
                  alt={`Community activity ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white text-2xl" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/gallery">
              <Button variant="outline" className="px-8 py-3" data-testid="button-view-gallery">
                <Camera className="mr-2" />
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="testimonials-title">Community Voices</h2>
            <p className="text-xl text-gray-600">
              Hear from those whose lives have been transformed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The skills training program helped me start my own business. Now I employ 5 other young people from our community.",
                author: "Rashida Begum",
                role: "Entrepreneur",
                location: "Kurigram"
              },
              {
                quote: "Through environmental projects, we've made our village cleaner and more sustainable. The youth are leading the change.",
                author: "Md. Karim",
                role: "Community Leader",
                location: "Char Area"
              },
              {
                quote: "3ZERO Club gave me hope and direction. I learned leadership skills that I use every day in my career.",
                author: "Fatima Khatun",
                role: "Teacher",
                location: "Kurigram"
              }
            ].map((testimonial, index) => (
              <Card key={`testimonial-${index}`} className="p-6" data-testid={`testimonial-${index}`}>
                <CardContent className="p-0">
                  <Quote className="text-eco-green mb-4" size={32} />
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="bg-eco-green/10 rounded-full p-3 mr-4">
                      <Users className="text-eco-green" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="awards-title">Recognition & Achievements</h2>
            <p className="text-xl text-gray-600">
              Our efforts recognized by local and international organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Best Youth Initiative",
                organization: "District Administration",
                year: "2024",
                icon: Award
              },
              {
                title: "Environmental Excellence",
                organization: "Green Bangladesh",
                year: "2023",
                icon: Leaf
              },
              {
                title: "Community Impact Award",
                organization: "Youth Development Fund",
                year: "2023",
                icon: Heart
              },
              {
                title: "Innovation in Education",
                organization: "Education Ministry",
                year: "2024",
                icon: BookOpen
              }
            ].map((award, index) => (
              <div key={`award-${index}`} className="text-center" data-testid={`award-${index}`}>
                <div className="bg-gradient-to-br from-eco-green/10 to-youth-blue/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <award.icon className="text-eco-green text-2xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{award.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{award.organization}</p>
                <Badge variant="outline" className="text-xs">{award.year}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-eco-green via-youth-blue to-eco-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" data-testid="cta-title">
            Ready to Create Change?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of young leaders working towards a world of zero poverty, 
            zero unemployment, and zero net carbon emissions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
              <Target className="text-white text-2xl mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Take Action</h3>
              <p className="text-white/80 text-sm">Join our projects and make real impact</p>
            </div>
            <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
              <Zap className="text-white text-2xl mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Build Skills</h3>
              <p className="text-white/80 text-sm">Develop leadership and entrepreneurship</p>
            </div>
            <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
              <Globe className="text-white text-2xl mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Global Network</h3>
              <p className="text-white/80 text-sm">Connect with changemakers worldwide</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join">
              <Button className="bg-white text-eco-green px-8 py-4 rounded-full font-semibold hover:bg-gray-100 text-lg" data-testid="button-join-now">
                <Rocket className="mr-2" />
                Join Our Movement
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-eco-green text-lg" data-testid="button-upcoming-events">
                <Calendar className="mr-2" />
                Upcoming Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" data-testid="newsletter-title">Stay Connected</h2>
          <p className="text-gray-300 mb-8">
            Get updates on our latest projects, events, and opportunities to make a difference
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1"
              data-testid="newsletter-email-input"
            />
            <Button className="bg-eco-green text-white hover:bg-eco-green-dark" data-testid="newsletter-subscribe">
              <Mail className="mr-2" />
              Subscribe
            </Button>
          </div>
          
          <div className="flex justify-center gap-6 mt-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-facebook">
              <Facebook size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-twitter">
              <Twitter size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-instagram">
              <Instagram size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="social-linkedin">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Info Footer */}
      <section className="py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4 flex items-center justify-center md:justify-start" data-testid="contact-location-title">
                <MapPin className="mr-2" />
                Location
              </h3>
              <p className="text-gray-300">
                Kurigram District<br />
                Rangpur Division<br />
                Bangladesh
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-4 flex items-center justify-center" data-testid="contact-info-title">
                <Phone className="mr-2" />
                Contact
              </h3>
              <p className="text-gray-300">
                Email: info@3zeroclub.org<br />
                Phone: +880-1XXX-XXXXXX
              </p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-bold mb-4 flex items-center justify-center md:justify-end" data-testid="quick-links-title">
                <ChevronRight className="mr-2" />
                Quick Links
              </h3>
              <div className="space-y-2 text-gray-300">
                <Link href="/about" className="block hover:text-white transition-colors">About Us</Link>
                <Link href="/projects" className="block hover:text-white transition-colors">Projects</Link>
                <Link href="/events" className="block hover:text-white transition-colors">Events</Link>
                <Link href="/join" className="block hover:text-white transition-colors">Join Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
