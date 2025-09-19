import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileArchive, AlertCircle } from 'lucide-react';
import backend from '~backend/client';

const genres = ['Action', 'Puzzle', 'Adventure', 'Simulation', 'Strategy', 'Arcade', 'RPG', 'Other'];

export function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    tags: [] as string[],
  });

  useEffect(() => {
    // TODO: Load project data
    // For now, just simulate loading
    setTimeout(() => {
      setProject({
        id: id,
        title: 'My Awesome Game',
        description: 'A description of my game',
        status: 'draft',
        genre: 'Action',
        tags: ['html5', 'canvas'],
      });
      setFormData({
        title: 'My Awesome Game',
        description: 'A description of my game',
        genre: 'Action',
        tags: ['html5', 'canvas'],
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a ZIP file containing your game.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Start upload
      const startResponse = await backend.projects.startUpload({
        projectId: id!,
        filename: file.name,
        size: file.size,
      });

      // Upload file to presigned URL
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(startResponse.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/zip',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Complete upload
      await backend.projects.completeUpload({
        uploadId: startResponse.uploadId,
        projectId: id!,
      });

      toast({
        title: "Upload successful",
        description: "Your game files have been uploaded and are being processed.",
      });

      // Refresh project data
      // TODO: Implement project data refresh
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Game Files</span>
            </CardTitle>
            <CardDescription>
              Upload a ZIP file containing your HTML5 game. The ZIP should include an index.html file as the entry point.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Drag and drop your ZIP file here, or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 50MB
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-4"
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="space-y-1">
                      <li>• ZIP file containing your HTML5 game</li>
                      <li>• Must include an index.html file as the entry point</li>
                      <li>• All assets must be included in the ZIP</li>
                      <li>• No external dependencies or server-side code</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Configure your project details and metadata for the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={formData.genre || "Action"} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your game..."
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="html5, canvas, arcade"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              <div className="flex gap-4">
                <Button>Save Changes</Button>
                {project.status === 'draft' && (
                  <Button variant="outline">Publish Project</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
