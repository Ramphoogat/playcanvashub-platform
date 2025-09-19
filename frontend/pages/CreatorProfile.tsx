import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectCard } from '../components/ProjectCard';
import { Calendar, Eye, Gamepad2, ExternalLink } from 'lucide-react';
import backend from '~backend/client';
import type { CreatorProfile } from '~backend/profiles/get_creator';
import type { CreatorProject } from '~backend/profiles/list_creator_projects';

export function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [projects, setProjects] = useState<CreatorProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      loadProfile();
      loadProjects();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      const profileData = await backend.profiles.getCreator({ username: username! });
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await backend.profiles.listCreatorProjects({ 
        username: username!,
        limit: 12,
      });
      setProjects(projectsData.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Creator not found</h1>
        <p className="text-muted-foreground">The creator profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
              <AvatarFallback className="text-2xl">
                {profile.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              <p className="text-muted-foreground text-lg">@{profile.username}</p>
              
              {profile.bio && (
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gamepad2 className="h-4 w-4" />
                  <span>{profile.projectCount} projects</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{profile.totalPlays.toLocaleString()} total plays</span>
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(profile.links).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {Object.entries(profile.links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{platform}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Badge variant="secondary">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={{
                  ...project,
                  creator: {
                    username: profile.username,
                    displayName: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                  },
                }} 
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground">
                {profile.displayName} hasn't published any projects yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
