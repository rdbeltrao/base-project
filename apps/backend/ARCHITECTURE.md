# Backend Architecture

## Overview

The backend has been reorganized into a more scalable and maintainable architecture following best practices for separation of concerns and clean architecture principles.

## Directory Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # HTTP request/response handling
│   │   ├── routes/          # Route definitions
│   │   └── middleware/      # API-specific middleware
│   ├── config/              # Configuration files
│   ├── models/              # Data model definitions (future use)
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic layer
│   ├── utils/               # Utility functions
│   ├── types/               # Type definitions
│   ├── middleware/          # Legacy middleware (to be moved)
│   ├── routes/              # Legacy routes (to be refactored)
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Server entry point
```

## Layer Architecture

### 1. Controllers (`api/controllers/`)
- Handle HTTP requests and responses
- Validate input data
- Call appropriate services
- Format responses
- Should be thin, containing minimal business logic

**Example**: `AuthController`, `UserController`

### 2. Services (`services/`)
- Contain business logic
- Orchestrate multiple repositories
- Handle complex operations
- Validate business rules
- Should be independent of HTTP layer

**Example**: `AuthService`, `UserService`

### 3. Repositories (`repositories/`)
- Handle data access operations
- Abstract database interactions
- Provide a clean interface for data operations
- Should be focused on single entity operations

**Example**: `UserRepository`, `RoleRepository`

### 4. Configuration (`config/`)
- Database configuration
- JWT configuration
- CORS configuration
- Passport configuration
- Environment-specific settings

### 5. Middleware (`api/middleware/`)
- Authentication middleware
- Authorization middleware
- Validation middleware
- Error handling middleware

## Data Flow

```
HTTP Request → Routes → Middleware → Controller → Service → Repository → Database
                                        ↓
HTTP Response ← Controller ← Service ← Repository ← Database
```

## Migration Status

### ✅ Completed
- [x] Basic directory structure created
- [x] Database configuration separated (`config/database.ts`)
- [x] JWT configuration separated (`config/jwt.ts`)
- [x] CORS configuration separated (`config/cors.ts`)
- [x] User repository created (`repositories/user.repository.ts`)
- [x] Role repository created (`repositories/role.repository.ts`)
- [x] Auth service created (`services/auth.service.ts`)
- [x] User service created (`services/user.service.ts`)
- [x] Auth controller created (`api/controllers/auth.controller.ts`)
- [x] User controller created (`api/controllers/user.controller.ts`)
- [x] Auth routes refactored (`api/routes/auth.routes.ts`)
- [x] User routes refactored (`api/routes/users.routes.ts`)
- [x] Main app.ts cleaned and reorganized

### 🔄 To Be Refactored
- [ ] Role routes and controller
- [ ] Event routes and controller
- [ ] Reservation routes and controller
- [ ] Stats routes and controller
- [ ] Move remaining middleware to `api/middleware/`
- [ ] Create additional services as needed
- [ ] Add comprehensive error handling
- [ ] Add input validation layers
- [ ] Create model interfaces/types

## Benefits of New Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Business logic is separated from HTTP concerns
3. **Maintainability**: Code is organized in logical modules
4. **Scalability**: Easy to add new features and modify existing ones
5. **Reusability**: Services can be reused across different controllers
6. **Type Safety**: Better TypeScript support with separated layers

## Development Guidelines

### Adding New Features

1. **Create Repository**: Add data access methods in appropriate repository
2. **Create/Update Service**: Add business logic in service layer
3. **Create/Update Controller**: Add HTTP handling in controller
4. **Create/Update Routes**: Wire up the routes with proper middleware
5. **Add Tests**: Write unit tests for each layer

### Error Handling

- Controllers should catch and format errors appropriately
- Services should throw descriptive errors
- Repositories should handle data-level errors
- Use custom error types for better error handling

### Authentication & Authorization

- Authentication handled at route level with passport middleware
- Authorization handled through permission middleware
- User context passed through request object

## Configuration

All configuration is centralized in the `config/` directory:

- `database.ts`: Database connection and initialization
- `jwt.ts`: JWT token configuration and utilities
- `cors.ts`: CORS configuration
- `passport.ts`: Authentication strategies
- `redis.ts`: Redis configuration

## Next Steps

1. Complete migration of remaining routes
2. Add comprehensive input validation
3. Implement proper error handling
4. Add unit tests for each layer
5. Add API documentation
6. Implement logging strategy
7. Add monitoring and health checks