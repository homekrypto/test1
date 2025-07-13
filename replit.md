# PropertyGlobal Real Estate Platform

## Overview

PropertyGlobal is a sophisticated global real estate platform that connects agents and developers with international buyers. The application consists of two main parts: a public-facing website for property browsing and a private agent dashboard for property management and subscription handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration with session management
- **Payment Processing**: Stripe integration for subscription handling

### Database Architecture
- **ORM**: Drizzle with Neon PostgreSQL serverless
- **Schema Management**: Type-safe schema definitions in shared directory
- **Session Storage**: PostgreSQL-backed session storage for authentication

## Key Components

### Public Website Components
1. **Landing Page**: Hero section with search functionality and featured properties
2. **Property Search**: Advanced filtering with grid/map view toggle
3. **Property Details**: Comprehensive property information with inquiry forms
4. **Navigation**: Responsive navigation with authentication state awareness

### Agent Dashboard Components
1. **Subscription Management**: Three-tier pricing (Bronze/Silver/Gold) with Stripe integration
2. **Property Management**: CRUD operations for property listings
3. **Listing Wizard**: Multi-step form for creating comprehensive property listings
4. **Dashboard Analytics**: Overview of listings, leads, and performance metrics

### Shared Components
- **UI Components**: Comprehensive component library (buttons, forms, dialogs, etc.)
- **Property Cards**: Reusable property display components
- **Search Filters**: Advanced filtering system for property search

## Data Flow

### Authentication Flow
1. Users authenticate via Replit Auth (supporting social logins)
2. Session management handled by connect-pg-simple with PostgreSQL storage
3. Protected routes redirect to dashboard after successful authentication

### Property Management Flow
1. Agents create listings through multi-step wizard
2. Property data validated with Zod schemas
3. Images and media stored with property metadata
4. Properties published to public search with status management

### Subscription Flow
1. Agents select subscription plans (Bronze/Silver/Gold)
2. Stripe handles payment processing and subscription management
3. Plan limits enforced on property listing creation
4. Subscription status tracked in user database

### Search Flow
1. Public users search properties with location-based filtering
2. Advanced filters include price, type, features, and amenities
3. Results displayed in grid or map view
4. Property inquiries sent to listing agents

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Stripe**: Payment processing and subscription management
- **Replit Auth**: Authentication and user management

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation

### Backend Libraries
- **Express.js**: Web application framework
- **Drizzle ORM**: Type-safe database ORM
- **Passport**: Authentication middleware
- **Connect-PG-Simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with environment-based configuration
- **Build Process**: TypeScript compilation with Vite bundling

### Production Build
- **Frontend**: Static assets built with Vite and served from Express
- **Backend**: Node.js application with bundled dependencies
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: Database URL, Stripe keys, session secrets

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key for payment processing
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier

### Subscription Plans
- **Bronze**: $40/month, 5 listings
- **Silver**: $60/month, 10 listings  
- **Gold**: $80/month, 20 listings
- Annual billing options available

The architecture prioritizes type safety, scalability, and user experience while maintaining clear separation between public and private functionality.