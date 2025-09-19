import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    tags: string[];
    thumbUrl?: string;
    creator: {
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
    plays: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {project.thumbUrl ? (
          <img
            src={project.thumbUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        <Link
          to={`/play/${project.slug}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </Link>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Link to={`/p/${project.slug}`}>
              <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                {project.title}
              </h3>
            </Link>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={project.creator.avatarUrl} alt={project.creator.displayName} />
              <AvatarFallback className="text-xs">
                {project.creator.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Link
              to={`/u/${project.creator.username}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
            >
              {project.creator.displayName}
            </Link>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{project.plays.toLocaleString()} plays</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
