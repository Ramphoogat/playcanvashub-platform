import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye, Calendar, ExternalLink } from 'lucide-react';
import backend from '~backend/client';
import type { ProjectDetail } from '~backend/projects/get_by_slug';

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadProject();
    }
  }, [slug]);

  const loadProject = async () => {
    try {
      const projectData = await backend.projects.getBySlug({ slug: slug! });
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Game Preview */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {project.thumbUrl ? (
                  <img
                    src={project.thumbUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <Play className="h-16 w-16 text-primary/50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <Button size="lg" asChild>
                    <Link to={`/play/${project.slug}`}>
                      <Play className="h-6 w-6 mr-2 fill-current" />
                      Play Game
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{project.title}</h1>
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
                <div className="space-y-3">
                  <h3 className="font-semibold">About this game</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {project.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Play Button */}
          <Card>
            <CardContent className="p-6">
              <Button size="lg" className="w-full" asChild>
                <Link to={`/play/${project.slug}`}>
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Play Game
                </Link>
              </Button>
            </CardContent>
          </Card>

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
                <Link to={`/u/${project.creator.username}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Plays</span>
                  <span className="font-medium">{project.plays.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {project.genre && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Genre</span>
                    <span className="font-medium">{project.genre}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
