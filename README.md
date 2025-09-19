# PlayCanvasHub Platform

A production-ready web platform for creators to upload, share, and monetize browser-based HTML5 games.

## Features

### Core Platform
- **Authentication**: Email/password signup with verification, OAuth ready
- **Creator Workspace**: Project management, file upload, version control
- **Public Gallery**: Browse, search, filter games by genre/tags
- **Secure Player**: Sandboxed gameplay with ad monetization
- **Creator Profiles**: Public profiles with project galleries
- **Content Moderation**: Reporting system and admin tools

### Security & Isolation
- JWT authentication with HttpOnly cookies
- Iframe sandboxing with strict CSP policies
- File validation and antivirus scanning
- Rate limiting and CSRF protection
- Isolated player domain for security

### Infrastructure
- **Backend**: Encore.ts microservices with PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Storage**: S3-compatible object storage for assets
- **Database**: PostgreSQL with automated migrations
- **Deployment**: Cloud-ready with environment management

## Quick Start

### Prerequisites
- Node.js 18+
- Encore CLI (`npm install -g encore-cli`)
- PostgreSQL (or use Encore's built-in database)

### Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd playcanvas-hub
   npm install
   ```

2. **Configure secrets**
   Navigate to the Infrastructure tab in the Leap UI to set up required secrets:
   - `JWTSecret`: Secret key for JWT token signing
   - `EmailAPIKey`: API key for email service (SendGrid, Mailgun, etc.)
   - `FromEmail`: Email address for system emails

3. **Run the development environment**
   ```bash
   encore run
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Database dashboard: Available in Encore dev dashboard

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_PLAYER_ORIGIN=http://play.localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

## Architecture

### Backend Services

- **auth**: User authentication, JWT tokens, email verification
- **projects**: Project CRUD, file uploads, publishing
- **player**: Game sessions, ad requests, analytics
- **profiles**: Creator profiles, public galleries
- **moderation**: Content reporting, admin actions

### Database Schema

Key tables:
- `users`: User accounts and authentication
- `projects`: Game projects and metadata
- `versions`: Project versions and file storage
- `player_sessions`: Gameplay sessions and analytics
- `ad_events`: Ad impressions and revenue tracking
- `reports`: Content moderation reports

### File Upload Flow

1. **Start Upload**: Generate presigned URL for S3 upload
2. **Upload File**: Client uploads ZIP directly to S3
3. **Process**: Backend validates, extracts, and processes files
4. **Generate Manifest**: Create game manifest and asset listings
5. **Preview**: Secure preview URL for testing
6. **Publish**: Make game publicly available

### Security Model

- **Player Isolation**: Games run on separate subdomain with strict CSP
- **Sandboxing**: Iframe sandbox prevents navigation escapes
- **File Validation**: ZIP scanning, MIME validation, size limits
- **Content Security**: Strip service workers, block external requests

## Ad Monetization

### Integration

The platform includes a flexible ad system with:
- **Interstitial Ads**: Between levels, game over screens
- **Rewarded Ads**: Unlock content, extra lives, bonuses
- **Frequency Capping**: Prevent ad fatigue
- **Revenue Tracking**: Per-impression analytics

### Game Integration

Games communicate with the host via postMessage:

```javascript
// Request interstitial ad
window.postMessage({
  type: 'BREAK_REQUEST',
  breakpoint: 'level_end'
}, '*');

// Request rewarded ad
window.postMessage({
  type: 'REWARDED_REQUEST', 
  placement: 'continue'
}, '*');

// Listen for ad results
window.addEventListener('message', (event) => {
  if (event.data.type === 'AD_RESULT') {
    const { status, rewarded } = event.data;
    if (status === 'completed' && rewarded) {
      // Grant reward to player
      grantExtraLife();
    }
  }
});
```

### Ad Configuration

Admins can configure:
- Frequency caps (max ads per session/time period)
- Cooldown periods between ads
- Revenue sharing splits
- Provider integration settings

## Content Moderation

### Reporting System
- **User Reports**: IP violation, malware, inappropriate content
- **Admin Dashboard**: Review queue, actions, notes
- **Automated Scanning**: File validation, content analysis
- **Appeals Process**: User appeals and admin review

### Moderation Actions
- Suspend projects
- Warn creators
- Ban users
- Remove content
- Feature/unfeature projects

## API Documentation

### Authentication Endpoints

```
POST /auth/signup - Create new account
POST /auth/login - Authenticate user  
POST /auth/verify-email - Verify email address
GET /auth/me - Get current user info
```

### Project Endpoints

```
POST /projects - Create new project
GET /projects - List user projects
POST /projects/:id/upload/start - Start file upload
POST /projects/:id/upload/complete - Complete upload
POST /projects/:id/publish - Publish project
GET /gallery - Public project gallery
GET /projects/:slug - Get project details
```

### Player Endpoints

```
POST /player/start/:slug - Start game session
POST /player/end - End game session
POST /player/ads/request - Request ad display
```

## Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Set production secrets
   encore secret set --env=prod JWTSecret=<strong-secret>
   encore secret set --env=prod EmailAPIKey=<email-service-key>
   encore secret set --env=prod FromEmail=noreply@yourdomain.com
   ```

2. **Database Migration**
   ```bash
   encore db migrate --env=prod
   ```

3. **Deploy Backend**
   ```bash
   encore deploy --env=prod
   ```

4. **Frontend Deployment**
   Deploy the `frontend/dist` folder to your CDN/static hosting.

### Domain Configuration

- **Main App**: `app.yourdomain.com`
- **Player**: `play.yourdomain.com` (isolated subdomain)
- **CDN**: `cdn.yourdomain.com` (asset delivery)
- **API**: `api.yourdomain.com` (backend services)

### CSP Headers

Player domain (`play.yourdomain.com`):
```
Content-Security-Policy: 
  default-src 'none';
  script-src 'self' cdn.yourdomain.com;
  img-src 'self' data: cdn.yourdomain.com;
  connect-src analytics.yourdomain.com;
  frame-ancestors 'none';
  frame-src 'self';
  upgrade-insecure-requests;
```

## Development

### Adding New Services

1. Create service directory: `backend/servicename/`
2. Add `encore.service.ts` file
3. Implement API endpoints
4. Add database migrations if needed
5. Update frontend client usage

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Code Quality

- **ESLint**: Enforced code style
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting
- **Accessibility**: WCAG compliance
- **Security**: OWASP best practices

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Community**: Discord/Forums
- **Email**: support@playcanvashub.com
