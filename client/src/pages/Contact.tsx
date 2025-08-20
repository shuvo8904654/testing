import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Mail, Phone, Facebook, MessageCircle, Send, Linkedin, NotebookPen } from "lucide-react";
import { insertContactMessageSchema, type InsertContactMessage } from "@shared/schema";

export default function Contact() {
  const { toast } = useToast();
  
  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContactMessage) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="py-20 bg-gray-50" data-testid="contact-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">Get in Touch</h1>
          <p className="text-xl text-gray-600">
            Connect with us and stay updated on our latest initiatives
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" data-testid="contact-info-title">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start" data-testid="address-info">
                <div className="bg-eco-green/10 p-3 rounded-full mr-4">
                  <MapPin className="text-eco-green w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Office Address</h3>
                  <p className="text-gray-600">
                    3ZERO Club Kurigram<br />
                    ID: 050-009-0023<br />
                    Kurigram, Bangladesh
                  </p>
                </div>
              </div>
              
              <div className="flex items-start" data-testid="email-info">
                <div className="bg-youth-blue/10 p-3 rounded-full mr-4">
                  <Mail className="text-youth-blue w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@3zerokurigram.org</p>
                </div>
              </div>
              
              <div className="flex items-start" data-testid="phone-info">
                <div className="bg-eco-green/10 p-3 rounded-full mr-4">
                  <Phone className="text-eco-green w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-600">+880 1XX XXX XXXX</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6" data-testid="social-media-title">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                  data-testid="social-facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                  data-testid="social-whatsapp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                  data-testid="social-telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-900 transition-colors"
                  data-testid="social-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <Card className="bg-white shadow-lg" data-testid="contact-form-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="contact-form-title">Send us a Message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:border-transparent"
                              data-testid="input-first-name"
                            />
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
                            <Input 
                              {...field}
                              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:border-transparent"
                              data-testid="input-last-name"
                            />
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
                          <Input 
                            {...field}
                            type="email"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:border-transparent"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:border-transparent"
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            rows={4}
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eco-green focus:border-transparent"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-eco-green-dark"
                    disabled={contactMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <NotebookPen className="mr-2 w-5 h-5" />
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
