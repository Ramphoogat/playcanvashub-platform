import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '../components/ProjectCard';
import { Search, Filter } from 'lucide-react';
import backend from '~backend/client';
import type { GalleryProject } from '~backend/projects/gallery';

export function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');

  const genres = ['Action', 'Puzzle', 'Adventure', 'Simulation', 'Strategy', 'Arcade', 'RPG'];

  useEffect(() => {
    loadProjects();
  }, [searchParams]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      const response = await backend.projects.gallery({
        search: params.get('search') || undefined,
        sort: params.get('sort') || 'latest',
        genre: params.get('genre') || undefined,
        limit: 24,
      });
      setProjects(response.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort !== 'latest') params.set('sort', sort);
    if (genre) params.set('genre', genre);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSort('latest');
    setGenre('');
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Game Gallery</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={genre || "all"} onValueChange={(value) => setGenre(value === "all" ? "" : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(search || sort !== 'latest' || genre) && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(search || sort !== 'latest' || genre) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <Badge variant="secondary">
                Search: {search}
              </Badge>
            )}
            {sort !== 'latest' && (
              <Badge variant="secondary">
                Sort: {sort}
              </Badge>
            )}
            {genre && (
              <Badge variant="secondary">
                Genre: {genre}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">No games found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
