## 📋 **Complete Application Flow Breakdown**

### **1. Authentication & Initialization Flow**

**Entry Point: src/App.tsx**

- Sets up React Router with routes: /, /auth, /matches, /chat/:matchId
- Wraps app with ThemeProvider, QueryClient, and TooltipProvider
- All routes check authentication status

**Authentication Logic: src/pages/Auth.tsx**

```
Step 1: User Registration (Multi-Step Form)
├── Step 1: Basic Info
│   ├── Full Name
│   ├── Email
│   ├── Password
│   └── Role Selection (Job Seeker or Recruiter)
├── Step 2: Profile Details
│   ├── Job Seeker: Profile photo, position, location, experience, education, LinkedIn
│   └── Recruiter: Company logo, position hiring for, company name, location, salary range
└── Step 3: Additional Info
    ├── Bio/Description
    └── Skills (array)

Step 2: Profile Creation
├── Create Supabase auth user
├── Upload avatar/logo to storage bucket
├── Insert profile data into 'profiles' table
└── Insert role into 'user_roles' table

Step 3: Redirect to main app (/)

```

### **2. Main Application Flow - Index Page**

**File: src/pages/Index.tsx**

## 📋 **Complete Application Flow Breakdown**

### **1. Authentication & Initialization Flow**

**Entry Point: src/App.tsx**

- Sets up React Router with routes: /, /auth, /matches, /chat/:matchId
- Wraps app with ThemeProvider, QueryClient, and TooltipProvider
- All routes check authentication status

**Authentication Logic: src/pages/Auth.tsx**

```
Step 1: User Registration (Multi-Step Form)
├── Step 1: Basic Info
│   ├── Full Name
│   ├── Email
│   ├── Password
│   └── Role Selection (Job Seeker or Recruiter)
├── Step 2: Profile Details
│   ├── Job Seeker: Profile photo, position, location, experience, education, LinkedIn
│   └── Recruiter: Company logo, position hiring for, company name, location, salary range
└── Step 3: Additional Info
    ├── Bio/Description
    └── Skills (array)

Step 2: Profile Creation
├── Create Supabase auth user
├── Upload avatar/logo to storage bucket
├── Insert profile data into 'profiles' table
└── Insert role into 'user_roles' table

Step 3: Redirect to main app (/)

```

### **2. Main Application Flow - Index Page**

**File: src/pages/Index.tsx**

Sequence

**Key Functions:**

1. **loadCandidates(userId)** - For Recruiters
   - Fetches all users with role "job_seeker"
   - Gets existing matches for this recruiter
   - Filters out already matched candidates
   - Returns unmatched candidate profiles
2. **loadJobs(userId)** - For Job Seekers
   - Fetches all users with role "recruiter"
   - Gets existing matches for this job seeker
   - Filters out already matched recruiters
   - Returns unmatched job postings

### **3. Swipe Mechanism**

**Key Functions:**

1. **loadCandidates(userId)** - For Recruiters
   - Fetches all users with role "job_seeker"
   - Gets existing matches for this recruiter
   - Filters out already matched candidates
   - Returns unmatched candidate profiles
2. **loadJobs(userId)** - For Job Seekers
   - Fetches all users with role "recruiter"
   - Gets existing matches for this job seeker
   - Filters out already matched recruiters
   - Returns unmatched job postings

### **3. Swipe Mechanism**

Diagram

**Swipe Right Logic:**

```jsx
1. Insert swipe into 'swipes' table
   { swiper_id: currentUserId, swiped_id: targetUserId }

2. Query 'swipes' table for reverse swipe
   Check if target user has swiped right on current user

3. If mutual swipe found:
   - Insert into 'matches' table
   - Trigger real-time notification
   - Show match dialog with chat button

4. If no mutual swipe:
   - Show "Liked!" toast
   - Move to next profile

```

### **4. Real-Time Updates**

The app uses **Supabase Real-Time**extensively:

**Profile Updates (Index.tsx, lines 96-123):**

```tsx
supabase.channel('profiles-changes')
  .on('postgres_changes', { table: 'profiles' }, () => {
    // Reload candidates/jobs when any profile updates
  })

```

**Match Notifications (Index.tsx, lines 126-176):**

```tsx
supabase.channel('matches-changes')
  .on('postgres_changes',
    { event: 'INSERT', table: 'matches', filter: userRole-specific },
    (payload) => {
      // Fetch matched user's profile
      // Show match notification dialog
    }
  )

```

**Message Updates (Chat.tsx, lines 91-106):**

```tsx
supabase.channel(`chat-${matchId}`)
  .on('postgres_changes',
    { event: 'INSERT', table: 'messages' },
    (payload) => {
      // Add new message to chat
    }
  )

```

### **5. Matches Page Flow**

**File: src/pages/Matches.tsx**

```
1. Fetch all matches for current user
   - Query 'matches' table where user is recruiter_id OR job_seeker_id

2. For each match:
   - Get other user's email from 'profiles'
   - Count unread messages (where read=false and sender≠currentUser)

3. Display matches with:
   - Other user's email
   - Unread message count (if any)
   - Click to open chat

4. Real-time subscription:
   - Listen to 'messages' table changes
   - Reload matches when messages update

```

### **6. Chat System Flow**

**File: src/pages/Chat.tsx**

**Swipe Right Logic:**

```jsx
1. Insert swipe into 'swipes' table
   { swiper_id: currentUserId, swiped_id: targetUserId }

2. Query 'swipes' table for reverse swipe
   Check if target user has swiped right on current user

3. If mutual swipe found:
   - Insert into 'matches' table
   - Trigger real-time notification
   - Show match dialog with chat button

4. If no mutual swipe:
   - Show "Liked!" toast
   - Move to next profile

```

### **4. Real-Time Updates**

The app uses **Supabase Real-Time**extensively:

**Profile Updates (Index.tsx, lines 96-123):**

```tsx
supabase.channel('profiles-changes')
  .on('postgres_changes', { table: 'profiles' }, () => {
    // Reload candidates/jobs when any profile updates
  })

```

**Match Notifications (Index.tsx, lines 126-176):**

```tsx
supabase.channel('matches-changes')
  .on('postgres_changes',
    { event: 'INSERT', table: 'matches', filter: userRole-specific },
    (payload) => {
      // Fetch matched user's profile
      // Show match notification dialog
    }
  )

```

**Message Updates (Chat.tsx, lines 91-106):**

```tsx
supabase.channel(`chat-${matchId}`)
  .on('postgres_changes',
    { event: 'INSERT', table: 'messages' },
    (payload) => {
      // Add new message to chat
    }
  )

```

### **5. Matches Page Flow**

**File: src/pages/Matches.tsx**

```
1. Fetch all matches for current user
   - Query 'matches' table where user is recruiter_id OR job_seeker_id

2. For each match:
   - Get other user's email from 'profiles'
   - Count unread messages (where read=false and sender≠currentUser)

3. Display matches with:
   - Other user's email
   - Unread message count (if any)
   - Click to open chat

4. Real-time subscription:
   - Listen to 'messages' table changes
   - Reload matches when messages update

```

### **6. Chat System Flow**

**File: src/pages/Chat.tsx**

Sequence

### **8. Unread Message System**

**Hook: src/hooks/useUnreadMessages.tsx**

```
1. Fetch all user's matches
2. Count messages where:
   - match_id in user's matches
   - read = false
   - sender_id ≠ current user
3. Real-time subscription updates count
4. Returns total unread count

```

**Badge Display:**

- Index page: Shows total unread count on "Matches" button
- Matches page: Shows per-chat unread count on each match card

### **9. Key Security Features (RLS Policies)**

```sql
Profiles:
- Anyone can view all profiles
- Users can only update their own profile

User Roles:
- Anyone can view roles (needed for matching)
- Users can only insert their own role

Swipes:
- Users can only insert their own swipes
- Users can view swipes they're involved in

Matches:
- Users can view matches they're part of
- Users can create matches if they're involved

Messages:
- Users can view messages in their matches
- Users can send messages in their matches
- Users can mark messages as read (only ones sent to them)

```

### **10. Component Architecture**

```
Main Components:
├── SwipeCard: Animated card with swipe gestures (GSAP)
├── JobCard: Displays recruiter job posting
├── CandidateCard: Displays job seeker profile
├── AccountMenu: Shows user profile, logout
├── MatchNotification: Dialog shown on mutual match
├── ProfileDialog: Edit user profile
├── Footer: App footer
└── ThemeToggle: Dark/light mode switch

Helper Hooks:
├── useUnreadMessages: Counts unread messages
├── useToast: Toast notifications
└── use-mobile: Detects mobile viewport

```

This architecture creates a **real-time, responsive job matching platform** where:

- ✅ Users can swipe through profiles
- ✅ Mutual swipes create instant matches
- ✅ Matched users can chat in real-time
- ✅ All updates happen live across devices
- ✅ Unread message counts update automatically
- ✅ Matched profiles are filtered out from swipe queue
