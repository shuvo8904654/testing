import { events, eventRegistrations, notices } from '../shared/schema.js';
import { storage } from './storage.js';

export const sampleEvents = [
  {
    id: "event-env-olympiad-2025",
    title: "Environmental Science Olympiad 2025",
    description: "Test your knowledge of environmental science, climate change, and sustainability in this exciting competition. Individual and team categories available with exciting prizes!",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    time: "9:00 AM - 4:00 PM",
    location: "Kurigram Science Center",
    category: "olympiad",
    status: "upcoming" as const,
    maxParticipants: 100,
    requiresRegistration: true,
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // 20 days from now
    eligibility: "Students aged 13-25 from any educational institution",
    prizes: "1st Prize: ৳50,000 | 2nd Prize: ৳30,000 | 3rd Prize: ৳20,000 | Participation certificates for all",
    teamEvent: false,
    contactInfo: "olympiad@3zeroclub.org | +880-1234567890",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event-youth-hackathon-2025",
    title: "3ZERO Youth Tech Hackathon",
    description: "48-hour hackathon focused on developing tech solutions for zero poverty, zero unemployment, and zero carbon emissions. Teams of 2-5 members.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
    time: "6:00 PM Friday - 6:00 PM Sunday",
    location: "Kurigram Innovation Hub",
    category: "hackathon",
    status: "upcoming" as const,
    maxParticipants: 80,
    requiresRegistration: true,
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35), // 35 days from now
    eligibility: "Students and young professionals aged 16-30",
    prizes: "Winning Team: ৳1,00,000 | Runner-up: ৳60,000 | 3rd Place: ৳40,000 | Special Category Awards",
    teamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 5,
    contactInfo: "hackathon@3zeroclub.org | +880-1234567891",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event-sustainability-competition",
    title: "Sustainable Innovation Competition",
    description: "Present your innovative ideas for sustainable development in your community. Individual presentations with focus on practical implementation.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25), // 25 days from now
    time: "10:00 AM - 3:00 PM",
    location: "Community Center Hall",
    category: "competition",
    status: "upcoming" as const,
    maxParticipants: 50,
    requiresRegistration: true,
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
    eligibility: "All community members aged 16+",
    prizes: "Best Innovation: ৳25,000 | Most Practical: ৳15,000 | People's Choice: ৳10,000",
    teamEvent: false,
    contactInfo: "innovation@3zeroclub.org",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "event-climate-workshop",
    title: "Climate Action Workshop",
    description: "Interactive workshop on climate change awareness and local action strategies. No registration required - just show up!",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    time: "2:00 PM - 5:00 PM",
    location: "3ZERO Club Office",
    category: "workshop",
    status: "upcoming" as const,
    maxParticipants: 30,
    requiresRegistration: false, // This one doesn't require registration
    contactInfo: "workshop@3zeroclub.org",
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const sampleNotices = [
  {
    id: "notice-olympiad-open",
    title: "Environmental Science Olympiad 2025 - Registration Open!",
    message: "Registration is now open for our flagship Environmental Science Olympiad. Limited seats available - register now to secure your spot!",
    type: "event" as const,
    priority: "high" as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), // 20 days
    link: "/events",
    linkText: "Register Now",
    dismissible: true,
    targetAudience: "all" as const,
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "notice-hackathon-announcement",
    title: "3ZERO Youth Tech Hackathon - Coming Soon!",
    message: "Get ready for an exciting 48-hour hackathon focused on solving real-world problems. Form your teams and prepare for innovation!",
    type: "announcement" as const,
    priority: "medium" as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35), // 35 days
    link: "/events",
    linkText: "Learn More",
    dismissible: true,
    targetAudience: "all" as const,
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "notice-monthly-meeting",
    title: "Monthly Team Meeting - This Saturday",
    message: "Join us for our monthly planning and coordination meeting. All members are encouraged to attend.",
    type: "info" as const,
    priority: "medium" as const,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
    dismissible: true,
    targetAudience: "members" as const,
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function initializeSampleEventData() {
  try {
    // Initialize events if none exist
    const existingEvents = await storage.getAllEvents();
    if (existingEvents.length === 0) {
      console.log('🎯 Adding sample events...');
      for (const event of sampleEvents) {
        await storage.createEvent(event);
      }
      console.log(`✅ Added ${sampleEvents.length} sample events`);
    }

    // Initialize notices if none exist
    const existingNotices = await storage.getAllNotices?.();
    if (!existingNotices || existingNotices.length === 0) {
      console.log('📢 Adding sample notices...');
      for (const notice of sampleNotices) {
        await storage.createNotice?.(notice);
      }
      console.log(`✅ Added ${sampleNotices.length} sample notices`);
    }

    console.log('✅ Sample event data initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing sample event data:', error);
  }
}