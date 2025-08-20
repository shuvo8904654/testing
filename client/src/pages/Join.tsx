import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertRegistrationSchema } from "@shared/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Users, GraduationCap, Rocket, UserPlus } from "lucide-react";

const registrationFormSchema = insertRegistrationSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  age: z.string().min(1, "Age is required"),
  address: z.string().min(1, "Address is required"),
  motivation: z.string().min(1, "Please tell us your motivation"),
});

export default function Join() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: "",
      address: "",
      motivation: "",
    },
  });

  const createRegistrationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registrationFormSchema>) => {
      return await apiRequest("POST", "/api/registrations", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted!",
        description: "Thank you for joining us. We'll review your application and get back to you soon.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof registrationFormSchema>) => {
    createRegistrationMutation.mutate(data);
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-eco-green text-white px-12 py-4 rounded-full font-semibold text-lg hover:bg-eco-green-dark"
                  data-testid="button-register"
                >
                  <UserPlus className="mr-3" />
                  Register Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Join 3ZERO Club Kurigram</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-age" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why do you want to join 3ZERO Club?</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Tell us about your motivation to create positive change..." data-testid="input-motivation" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createRegistrationMutation.isPending}
                      data-testid="button-submit-registration"
                    >
                      {createRegistrationMutation.isPending ? "Submitting..." : "Submit Registration"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
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
