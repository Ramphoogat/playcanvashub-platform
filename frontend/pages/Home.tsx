import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Upload, Users, Zap } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Gamepad2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build. Share. Play.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The platform for browser game creators. Upload your HTML5 games, share them with the world, 
              and monetize through integrated advertising.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/gallery">Explore Games</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/signup">Start Creating</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-muted-foreground">
              From upload to monetization, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Upload className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription>
                  Simply upload your HTML5 game as a ZIP file. We handle the rest with automatic processing and optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Build your audience with creator profiles, project galleries, and social features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Monetization</CardTitle>
                <CardDescription>
                  Earn revenue through integrated advertising with interstitial and rewarded ad placements.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators sharing their games on PlayCanvasHub
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
