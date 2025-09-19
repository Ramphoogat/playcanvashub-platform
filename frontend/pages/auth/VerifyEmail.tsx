import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import backend from '~backend/client';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await backend.auth.verifyEmail({ token });
      setStatus('success');
      setMessage(response.message);
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified.",
      });
    } catch (error: any) {
      console.error('Email verification failed:', error);
      setStatus('error');
      setMessage(error.message || 'Email verification failed');
      toast({
        title: "Verification failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <CardTitle>Verifying Email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Email Verified</CardTitle>
              <CardDescription>Your email has been successfully verified!</CardDescription>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>We couldn't verify your email address.</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {message}
          </p>
          
          {status === 'success' && (
            <Button asChild className="w-full">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/signup">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
