import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, User, Mail, Phone, School, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  institution: z.string().min(2, 'Institution name required'),
  reason: z.string().min(20, 'Please provide at least 20 characters explaining your motivation'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface QualityMetrics {
  score: number;
  factors: {
    nameQuality: number;
    emailDomain: number;
    phoneValid: number;
    institutionRecognized: number;
    motivationDepth: number;
  };
  feedback: string[];
  autoApproval: boolean;
}

export default function SmartRegistrationFlow() {
  const { toast } = useToast();
  const [qualityScore, setQualityScore] = useState<QualityMetrics | null>(null);
  const [step, setStep] = useState<'form' | 'analysis' | 'success'>('form');

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      institution: '',
      reason: '',
    },
  });

  const calculateQuality = (data: RegistrationForm): QualityMetrics => {
    const factors = {
      nameQuality: data.name.split(' ').length >= 2 ? 20 : 10,
      emailDomain: data.email.includes('@gmail.com') || data.email.includes('@edu') ? 20 : 15,
      phoneValid: /^\+?[\d\s-]{10,}$/.test(data.phone) ? 20 : 10,
      institutionRecognized: data.institution.toLowerCase().includes('university') || 
                           data.institution.toLowerCase().includes('college') ? 20 : 15,
      motivationDepth: data.reason.length > 100 ? 20 : data.reason.length > 50 ? 15 : 10,
    };

    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    const feedback = [];

    if (factors.nameQuality < 20) feedback.push('Consider providing your full name');
    if (factors.emailDomain < 20) feedback.push('Educational email addresses are preferred');
    if (factors.phoneValid < 20) feedback.push('Please check your phone number format');
    if (factors.institutionRecognized < 20) feedback.push('Provide your full institution name');
    if (factors.motivationDepth < 20) feedback.push('Share more about your motivation to join');

    return {
      score,
      factors,
      feedback,
      autoApproval: score >= 80,
    };
  };

  const submitRegistration = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const quality = calculateQuality(data);
      setQualityScore(quality);
      setStep('analysis');

      // Submit with quality metrics
      return await apiRequest('POST', '/api/registrations', {
        ...data,
        qualityScore: quality.score,
        autoApproval: quality.autoApproval,
      });
    },
    onSuccess: () => {
      setTimeout(() => {
        setStep('success');
        toast({
          title: qualityScore?.autoApproval ? 'Auto-Approved!' : 'Application Submitted',
          description: qualityScore?.autoApproval 
            ? 'Your application has been automatically approved. Welcome!'
            : 'Your application is under review. You\'ll hear from us soon.',
        });
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit registration',
        variant: 'destructive',
      });
      setStep('form');
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    submitRegistration.mutate(data);
  };

  if (step === 'analysis') {
    return (
      <Card className="w-full max-w-2xl mx-auto" data-testid="analysis-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing Your Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-eco-green mb-2">
                {qualityScore?.score || 0}%
              </div>
              <p className="text-gray-600">Quality Score</p>
            </div>
            
            <Progress value={qualityScore?.score || 0} className="w-full" />
            
            {qualityScore && (
              <div className="space-y-2">
                {qualityScore.autoApproval ? (
                  <Badge variant="default" className="w-full justify-center py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Auto-Approval Eligible
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Manual Review Required
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-2xl mx-auto" data-testid="success-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-eco-green mx-auto" />
            <h2 className="text-2xl font-bold">
              {qualityScore?.autoApproval ? 'Welcome to 3ZERO Club!' : 'Application Submitted'}
            </h2>
            <p className="text-gray-600">
              {qualityScore?.autoApproval 
                ? 'Your application scored high and has been automatically approved. You can now access member features.'
                : 'Thank you for your interest. Our team will review your application and get back to you within 24 hours.'
              }
            </p>
            <div className="pt-4">
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="registration-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Join 3ZERO Club Kurigram
        </CardTitle>
        <p className="text-gray-600">Smart application process with instant feedback</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <Input
                {...form.register('name')}
                placeholder="Your full name"
                data-testid="input-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                {...form.register('email')}
                type="email"
                placeholder="your.email@example.com"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <Input
                {...form.register('phone')}
                placeholder="+8801234567890"
                data-testid="input-phone"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <School className="h-4 w-4" />
                Institution
              </label>
              <Input
                {...form.register('institution')}
                placeholder="Your school, college, or university"
                data-testid="input-institution"
              />
              {form.formState.errors.institution && (
                <p className="text-sm text-red-600">{form.formState.errors.institution.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Why do you want to join 3ZERO Club?
            </label>
            <Textarea
              {...form.register('reason')}
              placeholder="Share your motivation and how you'd like to contribute to our mission of zero poverty, unemployment, and net carbon emissions..."
              rows={4}
              data-testid="textarea-reason"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-600">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitRegistration.isPending}
            data-testid="button-submit"
          >
            {submitRegistration.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Application...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}