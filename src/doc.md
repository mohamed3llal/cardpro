# 📚 Comprehensive API Documentation & System Architecture

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Entities](#core-entities)
3. [API Routes](#api-routes)
4. [Business Logic Flows](#business-logic-flows)
5. [User Journeys](#user-journeys)
6. [Authentication & Authorization](#authentication--authorization)

---

## 🏗️ System Architecture

### Architecture Pattern

**Clean Architecture (Onion Architecture)** with Domain-Driven Design principles

```
├── Domain Layer (Core Business Logic)
│   ├── Entities (Card, User, Domain, Review, etc.)
│   ├── Value Objects (Contact, Location, SocialLinks)
│   └── Interfaces (Repository, Service contracts)
│
├── Application Layer (Use Cases)
│   ├── Use Cases (Business operations)
│   └── DTOs (Data Transfer Objects)
│
├── Infrastructure Layer (External Concerns)
│   ├── Database (MongoDB repositories)
│   ├── Services (Auth, Admin)
│   └── Middleware (Auth, Validation)
│
└── Presentation Layer (API)
    ├── Controllers
    ├── Routes
    └── Validators
```

### Technology Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Google OAuth
- **Real-time**: Socket.io
- **Validation**: Joi

---

## 🎯 Core Entities

### 1. **User**

```typescript
Properties:
- id, email, firstName, lastName
- phone, avatar, bio, city
- role: user | admin | moderator | super_admin
- isActive, isAdmin
- domainKey, subcategoryKey (for business verification)
- verificationStatus: none | pending | approved | rejected
- domainVerified: boolean
```

### 2. **Card (Business Card)**

```typescript
Properties:
- user_id, title, company, logo
- domain_key, subdomain_key
- description, mobile_phones, email, website
- address, work_hours, languages, tags
- location: { lat, lng, distance }
- rating: { average, count }
- social_links: { whatsapp, linkedin, etc. }
- is_public, scans, views
```

### 3. **Domain (Category)**

```typescript
Properties:
- key (unique identifier)
- ar, fr, en (multilingual names)
- keywords: { ar[], fr[], en[] }
- subcategories[]
```

### 4. **Review**

```typescript
Properties: -business_id,
  user_id - rating(1 - 5),
  title,
  comment - helpful_count,
  verified_purchase - user_name,
  user_avatar;
```

### 5. **Package (Subscription)**

```typescript
Properties:
- name, tier: free | basic | premium | business
- price, currency, interval (month/year)
- features: {
    maxCards, maxBoosts, canExploreCards,
    prioritySupport, verificationBadge,
    advancedAnalytics, customBranding, apiAccess
  }
```

---

## 🔌 API Routes

### **Authentication Routes** (`/api/v1/auth`)

| Method | Endpoint   | Auth | Description          |
| ------ | ---------- | ---- | -------------------- |
| POST   | `/google`  | ❌   | Google OAuth login   |
| POST   | `/refresh` | ❌   | Refresh access token |
| POST   | `/logout`  | ✅   | Logout user          |

### **User Routes** (`/api/v1/user`)

| Method | Endpoint               | Auth | Description                |
| ------ | ---------------------- | ---- | -------------------------- |
| GET    | `/me`                  | ✅   | Get current user profile   |
| PUT    | `/profile`             | ✅   | Update user profile        |
| POST   | `/domain-verification` | ✅   | Submit domain verification |

### **Business Routes** (`/api/v1/businesses`)

| Method | Endpoint             | Auth | Description                    |
| ------ | -------------------- | ---- | ------------------------------ |
| GET    | `/search`            | ❌   | Search businesses with filters |
| GET    | `/featured`          | ❌   | Get featured businesses        |
| GET    | `/:id`               | ❌   | Get business details           |
| POST   | `/:id/view`          | ❌   | Record view event              |
| POST   | `/:id/scan`          | ❌   | Record QR scan event           |
| POST   | `/:id/contact-click` | ❌   | Record contact click           |

**Search Parameters:**

```
?q=search_term
&domain=category_key
&subdomain=subcategory_keys (comma-separated)
&city=city_name
&latitude=36.7538
&longitude=3.0588
&radius=10 (km)
&rating=4.0
&languages=english,french
&verified=true
&sort_by=relevance|popular|rating|nearest|newest
&page=1
&limit=20
```

### **Cards/Dashboard Routes** (`/api/v1/dashboard`)

| Method | Endpoint                    | Auth | Description                  |
| ------ | --------------------------- | ---- | ---------------------------- |
| POST   | `/cards`                    | ✅   | Create new business card     |
| GET    | `/cards`                    | ✅   | Get user's cards (paginated) |
| GET    | `/cards/:cardId`            | ✅   | Get card by ID               |
| PUT    | `/cards/:cardId`            | ✅   | Update card                  |
| DELETE | `/cards/:cardId`            | ✅   | Delete card                  |
| PATCH  | `/cards/:cardId/visibility` | ✅   | Toggle public/private        |
| GET    | `/cards/stats`              | ✅   | Get dashboard statistics     |

### **Reviews Routes** (`/api/v1/reviews`)

| Method | Endpoint                  | Auth | Description          |
| ------ | ------------------------- | ---- | -------------------- |
| GET    | `/businesses/:id/reviews` | ❌   | Get business reviews |
| POST   | `/reviews`                | ✅   | Create review        |
| PUT    | `/reviews/:id`            | ✅   | Update own review    |
| DELETE | `/reviews/:id`            | ✅   | Delete own review    |
| POST   | `/reviews/:id/helpful`    | ✅   | Mark review helpful  |

### **Favorites Routes** (`/api/v1/favorites`)

| Method | Endpoint              | Auth | Description               |
| ------ | --------------------- | ---- | ------------------------- |
| GET    | `/`                   | ✅   | Get favorite business IDs |
| POST   | `/`                   | ✅   | Add to favorites          |
| DELETE | `/:business_id`       | ✅   | Remove from favorites     |
| GET    | `/businesses`         | ✅   | Get full favorite details |
| GET    | `/check/:business_id` | ✅   | Check if favorited        |

### **Messaging Routes** (`/api/v1/`)

| Method | Endpoint                      | Auth | Description              |
| ------ | ----------------------------- | ---- | ------------------------ |
| GET    | `/conversations`              | ✅   | Get all conversations    |
| POST   | `/conversations`              | ✅   | Create conversation      |
| GET    | `/conversations/:id`          | ✅   | Get conversation details |
| DELETE | `/conversations/:id`          | ✅   | Delete conversation      |
| GET    | `/conversations/:id/messages` | ✅   | Get messages             |
| POST   | `/messages`                   | ✅   | Send message             |
| PUT    | `/conversations/:id/read`     | ✅   | Mark as read             |

### **Packages Routes** (`/api/v1/`)

| Method | Endpoint                 | Auth | Description              |
| ------ | ------------------------ | ---- | ------------------------ |
| GET    | `/packages`              | ❌   | Get available packages   |
| GET    | `/subscriptions/current` | ✅   | Get current subscription |
| GET    | `/subscriptions/usage`   | ✅   | Get usage stats          |
| POST   | `/subscriptions`         | ✅   | Subscribe to package     |
| POST   | `/subscriptions/cancel`  | ✅   | Cancel subscription      |
| POST   | `/cards/:id/boost`       | ✅   | Boost card visibility    |
| GET    | `/boosts/active`         | ✅   | Get active boosts        |

### **Admin Routes** (`/api/v1/admin`) 🔐

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/check-role`               | Check admin privileges    |
| GET    | `/stats`                    | Dashboard statistics      |
| GET    | `/users`                    | Get all users             |
| PUT    | `/users/:id/role`           | Change user role          |
| GET    | `/cards`                    | Get all cards             |
| DELETE | `/cards/:id`                | Delete any card           |
| GET    | `/reviews`                  | Get all reviews           |
| DELETE | `/reviews/:id`              | Delete any review         |
| GET    | `/reports`                  | Get all reports           |
| PATCH  | `/reports/:id/status`       | Update report status      |
| GET    | `/feedback`                 | Get all feedback          |
| PATCH  | `/feedback/:id/status`      | Update feedback status    |
| GET    | `/verifications`            | Get verification requests |
| POST   | `/users/:id/verify/approve` | Approve verification      |
| POST   | `/users/:id/verify/reject`  | Reject verification       |
| GET    | `/packages`                 | Manage packages           |
| POST   | `/packages`                 | Create package            |

### **Domain Routes** (`/api/v1/domains`)

| Method | Endpoint | Auth | Description         |
| ------ | -------- | ---- | ------------------- |
| GET    | `/`      | ❌   | Get all categories  |
| GET    | `/:key`  | ❌   | Get category by key |

---

## 🔄 Business Logic Flows

### 1. **User Registration Flow (Google OAuth)**

```
1. Frontend receives Google ID token
   ↓
2. POST /api/v1/auth/google { token }
   ↓
3. GoogleAuthUseCase.execute()
   ├─→ Verify Google token
   ├─→ Check if user exists by email
   ├─→ If new: Create user with Google data
   ├─→ If existing: Update avatar & lastLoginAt
   ├─→ Generate JWT access & refresh tokens
   └─→ Return { accessToken, refreshToken, user, isNewUser }
```

### 2. **Business Card Creation Flow**

```
1. User authenticated via JWT
   ↓
2. POST /api/v1/dashboard/cards { cardData }
   ↓
3. CreateCardUseCase.execute()
   ├─→ Validate card data (Card entity)
   ├─→ Check user subscription limits
   ├─→ Save to MongoDB via CardRepository
   └─→ Return created card
```

### 3. **Business Search Flow**

```
1. GET /api/v1/businesses/search?q=...&domain=...
   ↓
2. SearchBusinessesUseCase.execute()
   ├─→ Build MongoDB query with filters
   ├─→ Apply text search if query exists
   ├─→ Apply geolocation filter if lat/lng provided
   ├─→ Join with users collection
   ├─→ Filter by verified users only
   ├─→ Calculate distance for each result
   ├─→ Apply sorting & pagination
   └─→ Return { businesses[], pagination, filters_applied }
```

### 4. **Review Submission Flow**

```
1. POST /api/v1/reviews { business_id, rating, title, comment }
   ↓
2. CreateReviewUseCase.execute()
   ├─→ Validate business exists
   ├─→ Check if user already reviewed
   ├─→ Create Review entity
   ├─→ Save review
   ├─→ Update business card rating (aggregate)
   └─→ Return created review
```

### 5. **Domain Verification Flow**

```
1. User updates profile with domain_key & subcategory_key
   ↓
2. POST /api/v1/user/domain-verification
   { domain_key, subcategory_key, document_url }
   ↓
3. SubmitDomainVerification.execute()
   ├─→ Validate domain matches profile
   ├─→ Check no pending verification
   ├─→ Set verificationStatus = "pending"
   └─→ Admin reviews in admin panel
       ↓
4. Admin: POST /api/v1/admin/users/:id/verify/approve
   ├─→ Set verificationStatus = "approved"
   ├─→ Set domainVerified = true
   └─→ User's cards now show verified badge
```

### 6. **Package Subscription Flow**

```
1. POST /api/v1/subscriptions { packageId, paymentMethodId }
   ↓
2. SubscribeToPackage.execute()
   ├─→ Validate package exists & active
   ├─→ Check no active subscription
   ├─→ Process payment (placeholder)
   ├─→ Create subscription record
   ├─→ Initialize usage tracking
   └─→ Return subscription details
```

---

## 👥 User Journeys

### **Journey 1: New User Registration**

```
Step 1: Google Sign-In
├─ Click "Sign in with Google"
├─ Authorize app permissions
└─ Redirected to dashboard

Step 2: Complete Profile
├─ Navigate to /profile
├─ Add: phone, bio, city
├─ Select domain & subcategory
└─ Upload verification document

Step 3: Create First Business Card
├─ Navigate to /dashboard/cards/new
├─ Fill business details
├─ Add location via map
├─ Upload images
└─ Publish (public/private)
```

### **Journey 2: User Searching for Services**

```
Step 1: Search & Filter
├─ Enter search query
├─ Select category/subcategory
├─ Set location & radius
├─ Filter by rating/verified
└─ View results list

Step 2: View Business Details
├─ Click business card
├─ View full details (contact, location, hours)
├─ Read reviews & ratings
├─ Check distance from user
└─ See verified badge (if applicable)

Step 3: Interact with Business
├─ Click phone → record contact_click
├─ Click WhatsApp → open chat
├─ View location → open maps
├─ Add to favorites
└─ Leave review
```

### **Journey 3: Business Owner Managing Cards**

```
Step 1: Dashboard Overview
├─ View card statistics
├─ See views, scans, contact clicks
├─ Check subscription usage
└─ Monitor active boosts

Step 2: Boost Card Visibility
├─ Select card to boost
├─ Choose duration (1-30 days)
├─ Confirm boost purchase
└─ Card appears in featured section

Step 3: Respond to Messages
├─ Check conversation list
├─ Open conversation
├─ Send message
└─ Mark as read
```

### **Journey 4: Admin Content Moderation**

```
Step 1: Review Dashboard
├─ Check pending verifications
├─ Review reported content
├─ Monitor user feedback
└─ View system statistics

Step 2: Handle Verification
├─ View verification request
├─ Check uploaded documents
├─ Approve/Reject with notes
└─ User notified of status

Step 3: Moderate Reviews
├─ View flagged reviews
├─ Investigate report details
├─ Take action (delete/dismiss)
└─ Update report status
```

---

## 🔐 Authentication & Authorization

### **JWT Token Structure**

```typescript
AccessToken Payload:
{
  userId: string,
  userRole: "user" | "admin" | "moderator" | "super_admin",
  userEmail: string,
  exp: number (15 minutes)
}

RefreshToken Payload:
{
  userId: string,
  userRole: string,
  userEmail: string,
  exp: number (7 days)
}
```

### **Authorization Levels**

| Level           | Access                                     |
| --------------- | ------------------------------------------ |
| **Public**      | Search, view businesses, view reviews      |
| **User**        | Create cards, reviews, favorites, messages |
| **Admin**       | Moderate content, manage users             |
| **Super Admin** | Manage domains, packages, system config    |

### **Middleware Chain**

```
Request → CORS → Rate Limit → Auth → Role Check → Controller
```

---

## 📊 Rate Limiting

| Endpoint Type   | Limit                   |
| --------------- | ----------------------- |
| General API     | 1000 requests / 15 min  |
| Auth (login)    | 5 requests / 15 min     |
| Search          | 100 requests / 1 min    |
| Analytics       | 1000 requests / 1 min   |
| Messaging       | 60 messages / 1 min     |
| Review creation | 5 reviews / 1 hour      |
| Favorites       | 100 operations / 1 hour |

---

## 🚀 Deployment Notes

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=900 (seconds)
GOOGLE_CLIENT_ID=your_google_client_id

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Health Check

```
GET /health
Response:
{
  status: "OK" | "DEGRADED",
  dbStatus: {
    state: 1,
    status: "connected",
    host: "...",
    isConnected: true
  },
  timestamp: "2025-10-21T..."
}
```

---

## 📝 Error Responses

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

Common error codes:

- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

---

## 🎓 Best Practices Implemented

1. **Clean Architecture**: Clear separation of concerns
2. **DDD**: Business logic in domain entities
3. **SOLID Principles**: Dependency injection, single responsibility
4. **Security**: JWT auth, rate limiting, input validation
5. **Scalability**: MongoDB indexing, pagination, caching-ready
6. **Monitoring**: Comprehensive logging with Winston
7. **Type Safety**: Full TypeScript coverage
8. **API Versioning**: `/api/v1/` prefix

---

## 📞 Support

For technical questions or contributions, refer to the repository documentation.
