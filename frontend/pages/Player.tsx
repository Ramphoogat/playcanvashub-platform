import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Maximize, RotateCcw, Eye, Calendar } from 'lucide-react';
import backend from '~backend/client';
import type { ProjectDetail } from '~backend/projects/get_by_slug';

export function Player() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProject();
    }
  }, [slug]);

  useEffect(() => {
    return () => {
      // End session when component unmounts
      if (sessionId) {
        backend.player.endSession({ sessionId }).catch(console.error);
      }
    };
  }, [sessionId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await backend.projects.getBySlug({ slug: slug! });
      setProject(projectData);

      // Start player session
      const sessionData = await backend.player.startSession({ slug: slug! });
      setSessionId(sessionData.sessionId);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (!iframe) return;

    if (!isFullscreen) {
      iframe.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(console.error);
    }
  };

  const reloadGame = () => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="aspect-video bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <p className="text-muted-foreground">The game you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Game Player */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-xl font-bold">{project.title}</h1>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={reloadGame}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reload
              </Button>
              <Button variant="secondary" size="sm" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              id="game-iframe"
              src={`https://play.playcanvashub.com/game/${project.id}`}
              className="w-full h-full"
              sandbox="allow-scripts allow-pointer-lock allow-popups-to-escape-sandbox"
              allow="gamepad; fullscreen"
              title={project.title}
            />
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Game Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{project.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.plays.toLocaleString()} plays</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Published {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {project.genre && (
                    <Badge variant="secondary">{project.genre}</Badge>
                  )}
                </div>

                {project.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                )}

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Created by</h3>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={project.creator.avatarUrl} 
                      alt={project.creator.displayName} 
                    />
                    <AvatarFallback>
                      {project.creator.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.creator.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{project.creator.username}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <a href={`/u/${project.creator.username}`}>
                    View Profile
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Game Controls Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">How to Play</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Use mouse to interact with the game</p>
                  <p>• Some games may require keyboard input</p>
                  <p>• Click fullscreen for the best experience</p>
                  <p>• Reload if the game becomes unresponsive</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
