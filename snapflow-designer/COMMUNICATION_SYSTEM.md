# SnapFlow - Smart Workspace & Contextual Communication System

## 🎯 Overview

A comprehensive communication and context-awareness system that keeps teams aligned, reduces context switching, and ensures users can pick up exactly where they left off.

---

## 🏠 Smart Landing Page (Workspace Dashboard)

### Design Philosophy
Instead of a blank canvas, users land on an **intelligent workspace** that shows:
- What needs their attention (prioritized)
- Where they left off (context restoration)
- Team activity (awareness)
- Quick actions (productivity)

---

## 📋 Dashboard Sections

### 1. **Priority Inbox** (Top Section)
Professional name for "Action Needed"

**What it shows:**
- **Pending Reviews**: Workflows awaiting your approval/review
- **Mentions**: Comments where you're @mentioned
- **Assigned Tasks**: Workflow tasks assigned to you
- **Blocked Workflows**: Processes waiting on your input
- **Overdue Items**: Time-sensitive items past deadline

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 🔔 Priority Inbox                          (3)  │
├─────────────────────────────────────────────────┤
│ 🔴 URGENT │ @you in "Approval Workflow"         │
│   Sarah: "Can you review the gateway logic?"    │
│   2 hours ago • Workflow Design                 │
│                                                  │
│ ⚠️  REVIEW │ "Customer Onboarding" needs review │
│   Waiting for your approval • 1 day ago         │
│                                                  │
│ 📌 ASSIGNED │ Complete "Email Template" task    │
│   Due tomorrow • Workflow Implementation        │
└─────────────────────────────────────────────────┘
```

**Priority Algorithm:**
1. Urgent mentions (< 4 hours old)
2. Overdue items
3. Pending reviews
4. Recent mentions
5. Assigned tasks

---

### 2. **Continue Working** (Resume Context)
Professional name for "Pick up where you left off"

**What it shows:**
- **Recent Workflows**: Last 5 workflows you edited
- **Draft Workflows**: Auto-saved, unpublished work
- **Pinned Workflows**: Your starred/bookmarked items
- **Last Session**: Exact state when you left (zoom, position, selected node)

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ ⚡ Continue Working                              │
├─────────────────────────────────────────────────┤
│ 📝 DRAFT │ "New Approval Process"                │
│   Last edited 5 min ago • Auto-saved            │
│   [Resume] [Discard Draft]                      │
│                                                  │
│ 🔄 RECENT │ "Customer Onboarding"                │
│   Edited 2 hours ago • 3 comments                │
│   [Open] [View History]                         │
│                                                  │
│ ⭐ PINNED │ "Payment Processing"                 │
│   Your go-to template • 12 uses                  │
│   [Open] [Duplicate]                            │
└─────────────────────────────────────────────────┘
```

**Context Restoration:**
```typescript
interface WorkflowSession {
  workflowId: string;
  viewport: { x: number; y: number; zoom: number };
  selectedNodeId?: string;
  openPanels: string[];  // e.g., ['properties', 'comments']
  scrollPosition: number;
  lastEditedAt: Date;
}

// When user clicks "Resume"
function restoreSession(session: WorkflowSession) {
  // Load workflow
  // Restore viewport position and zoom
  // Select the last edited node
  // Open the same panels they had open
  // Scroll to their last position
}
```

---

### 3. **Team Activity** (Awareness Feed)
Professional name for "Announcements & Updates"

**What it shows:**
- **Recent Changes**: What your team has been working on
- **Deployments**: Workflows published to production
- **System Updates**: New features, maintenance windows
- **Team Milestones**: Completed workflows, achievements

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 👥 Team Activity                                │
├─────────────────────────────────────────────────┤
│ 🚀 DEPLOYED │ "Invoice Processing v2.1"         │
│   John deployed to Production • 1 hour ago      │
│                                                  │
│ ✏️  UPDATED │ "Approval Workflow"                │
│   Sarah added email notification • 3 hours ago  │
│                                                  │
│ 💬 COMMENTED │ "Customer Onboarding"             │
│   Mike: "Great work on the gateway logic!"      │
│   4 hours ago                                    │
│                                                  │
│ 📢 ANNOUNCEMENT │ New AI Agent node available   │
│   System update • Yesterday                     │
└─────────────────────────────────────────────────┘
```

**Activity Types:**
- Workflow created/updated/deleted
- Comments added
- Deployments
- Approvals/rejections
- System announcements
- Team member joins

---

### 4. **Quick Actions** (Productivity Bar)

**What it shows:**
- **Create New**: Start from scratch or template
- **Import**: Upload BPMN XML
- **Browse Templates**: Pre-built workflows
- **Team Workspace**: View all team workflows

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ ⚡ Quick Actions                                 │
├─────────────────────────────────────────────────┤
│ [+ New Workflow]  [📁 Templates]  [⬆️ Import]   │
│ [👥 Team Workspace]  [📊 Analytics]             │
└─────────────────────────────────────────────────┘
```

---

## 💬 In-Context Comments System

### Node-Level Comments

**Where:** Click any node to add/view comments

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 💬 Comments (3)                            [×]  │
├─────────────────────────────────────────────────┤
│ Sarah Chen • 2 hours ago                        │
│ @john Can you review the validation logic here? │
│ This gateway seems too complex.                 │
│   [Reply] [Resolve] [⋮]                         │
│                                                  │
│   └─ John Smith • 1 hour ago                    │
│      Good catch! I'll simplify this to use a    │
│      single condition instead.                  │
│      [Reply] [⋮]                                 │
│                                                  │
│ Mike Johnson • Yesterday                        │
│ ✅ RESOLVED: Updated the email template         │
│   [Unresolve] [⋮]                               │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Add a comment...                            │ │
│ │ @ to mention someone                        │ │
│ └─────────────────────────────────────────────┘ │
│ [Attach] [Emoji] [Send]                         │
└─────────────────────────────────────────────────┘
```

**Features:**
- **@Mentions**: Type @ to mention team members
- **Threaded Replies**: Nested conversations
- **Resolve/Unresolve**: Mark comments as done
- **Attachments**: Images, files, links
- **Reactions**: 👍 ❤️ 🎉 (quick feedback)
- **Edit/Delete**: Own comments only
- **Notifications**: Email + in-app for mentions

**Data Model:**
```typescript
interface Comment {
  id: string;
  workflowId: string;
  nodeId: string;  // Which node this comment is on
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  mentions: string[];  // User IDs mentioned
  attachments?: Attachment[];
  reactions: {
    emoji: string;
    users: string[];
  }[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  parentId?: string;  // For threaded replies
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Workflow-Level Comments

**Where:** Global comment panel for overall workflow discussion

**Use Cases:**
- General feedback on the workflow
- Deployment notes
- Change requests
- Documentation

---

### Comment Indicators

**Visual Cues:**
```
┌─────────────────┐
│  User Task   💬3│  ← Badge showing 3 comments
│  New task       │
│  ● ● ● ●        │
└─────────────────┘

┌─────────────────┐
│  Gateway     💬1│  ← Badge showing 1 unresolved
│  Decision    🔴 │  ← Red dot for urgent mention
│  ◆ ◆ ◆ ◆        │
└─────────────────┘
```

**Badge Types:**
- 💬 Gray: Regular comments
- 🔴 Red: Unresolved mentions
- ✅ Green: All resolved
- 🔔 Yellow: New activity

---

## 📜 Version History & Diff Viewer

### Version History Panel

**UI Design:**
```
┌─────────────────────────────────────────────────┐
│ 📜 Version History                         [×]  │
├─────────────────────────────────────────────────┤
│ Search versions...                          🔍  │
├─────────────────────────────────────────────────┤
│ ● v3.2 (Current) • 2 hours ago                  │
│   Sarah Chen: "Added email notification"       │
│   [View] [Restore] [Compare]                    │
│                                                  │
│ ○ v3.1 • Yesterday                              │
│   John Smith: "Simplified gateway logic"       │
│   [View] [Restore] [Compare]                    │
│                                                  │
│ ○ v3.0 • 2 days ago                             │
│   Mike Johnson: "Major refactor"               │
│   [View] [Restore] [Compare]                    │
│                                                  │
│ ○ v2.5 • Last week                              │
│   Sarah Chen: "Added approval step"            │
│   [View] [Restore] [Compare]                    │
└─────────────────────────────────────────────────┘
```

**Features:**
- **Auto-save**: Every change creates a version
- **Named Versions**: Major milestones (v1.0, v2.0)
- **Commit Messages**: Describe what changed
- **Author Tracking**: Who made each change
- **Restore**: Roll back to any version
- **Compare**: Visual diff between versions

---

### Visual Diff Viewer

**Side-by-Side Comparison:**
```
┌──────────────────────┬──────────────────────┐
│ v3.1 (Yesterday)     │ v3.2 (Current)       │
├──────────────────────┼──────────────────────┤
│ Start Event          │ Start Event          │
│   ↓                  │   ↓                  │
│ User Task            │ User Task            │
│   ↓                  │   ↓                  │
│ Gateway              │ Gateway              │
│   ↓                  │   ↓                  │
│                      │ 🆕 Email Task        │ ← Added
│                      │   ↓                  │
│ End Event            │ End Event            │
└──────────────────────┴──────────────────────┘

Changes:
+ Added: Email Task (email-1234)
  - Recipient: admin@example.com
  - Subject: "Approval Needed"
```

**Diff Highlighting:**
- 🟢 Green: Added nodes/edges
- 🔴 Red: Removed nodes/edges
- 🟡 Yellow: Modified properties
- ⚪ Gray: Unchanged

---

## 🔔 Notification System

### Notification Types

**In-App Notifications:**
```
┌─────────────────────────────────────────────────┐
│ 🔔 Notifications                           (5)  │
├─────────────────────────────────────────────────┤
│ 🔴 @you in "Approval Workflow"                  │
│   Sarah: "Can you review this?"                 │
│   2 hours ago • [View] [Mark Read]              │
│                                                  │
│ 📝 "Customer Onboarding" updated                │
│   John made 3 changes                           │
│   4 hours ago • [View] [Mark Read]              │
│                                                  │
│ ✅ Your comment was resolved                    │
│   Mike resolved your comment                    │
│   Yesterday • [View] [Mark Read]                │
└─────────────────────────────────────────────────┘
```

**Email Notifications:**
- **Immediate**: @mentions, urgent items
- **Daily Digest**: Summary of activity
- **Weekly Summary**: Team progress report

**Notification Preferences:**
```typescript
interface NotificationSettings {
  mentions: 'immediate' | 'daily' | 'off';
  comments: 'immediate' | 'daily' | 'off';
  workflowUpdates: 'immediate' | 'daily' | 'off';
  deployments: 'immediate' | 'daily' | 'off';
  systemAnnouncements: 'immediate' | 'weekly' | 'off';
}
```

---

## 🗄️ Database Schema (Hybrid Approach)

### PostgreSQL Schema

```sql
-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Versions
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,  -- Full workflow JSON
  diff JSONB,           -- Changes from previous version
  commit_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workflow_id, version)
);

-- Create indexes
CREATE INDEX idx_workflow_versions_workflow ON workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_data ON workflow_versions USING GIN (data);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB Schema

```javascript
// Comments Collection
{
  _id: ObjectId("..."),
  workflowId: "uuid-here",
  nodeId: "task-123",  // null for workflow-level comments
  author: {
    id: "user-uuid",
    name: "John Doe",
    avatar: "https://..."
  },
  text: "Can you review this? @jane",
  mentions: ["user-jane-uuid"],
  attachments: [
    {
      type: "image",
      url: "https://...",
      name: "screenshot.png"
    }
  ],
  reactions: [
    { emoji: "👍", users: ["user-1", "user-2"] },
    { emoji: "❤️", users: ["user-3"] }
  ],
  resolved: false,
  resolvedBy: null,
  resolvedAt: null,
  parentId: null,  // For threaded replies
  createdAt: ISODate("2026-01-18T20:00:00Z"),
  updatedAt: ISODate("2026-01-18T20:00:00Z")
}

// Activity Feed Collection
{
  _id: ObjectId("..."),
  type: "workflow_updated",  // workflow_created, comment_added, deployed, etc.
  workflowId: "uuid-here",
  userId: "user-uuid",
  metadata: {
    version: "v3.2",
    changes: ["Added email task"],
    nodeId: "email-123"
  },
  timestamp: ISODate("2026-01-18T20:00:00Z")
}

// Notifications Collection
{
  _id: ObjectId("..."),
  userId: "user-uuid",
  type: "mention",  // mention, comment, update, deployment
  workflowId: "uuid-here",
  nodeId: "task-123",
  message: "@you in 'Approval Workflow'",
  read: false,
  actionUrl: "/designer?workflow=uuid&node=task-123",
  createdAt: ISODate("2026-01-18T20:00:00Z")
}

// User Sessions Collection (for context restoration)
{
  _id: ObjectId("..."),
  userId: "user-uuid",
  workflowId: "uuid-here",
  viewport: { x: 100, y: 200, zoom: 1.5 },
  selectedNodeId: "task-123",
  openPanels: ["properties", "comments"],
  scrollPosition: 500,
  lastActiveAt: ISODate("2026-01-18T20:00:00Z")
}
```

---

## 🎨 UI Components to Build

### 1. Dashboard Page (`/`)
- Priority Inbox
- Continue Working
- Team Activity
- Quick Actions

### 2. Comments Panel (Sidebar)
- Node comments
- Workflow comments
- Mention autocomplete
- Reaction picker

### 3. Version History Panel (Sidebar)
- Version list
- Diff viewer
- Restore functionality

### 4. Notification Center (Dropdown)
- Notification list
- Mark as read
- Quick actions

### 5. Context Restoration
- Auto-save drafts
- Session restoration
- Viewport persistence

---

## 🚀 Implementation Priority

### Phase 1: Core Communication (Week 1-2)
1. ✅ Comments on nodes
2. ✅ @Mentions with autocomplete
3. ✅ Basic notifications
4. ✅ Comment threads

### Phase 2: Context & History (Week 3-4)
1. ✅ Version history
2. ✅ Auto-save drafts
3. ✅ Session restoration
4. ✅ Visual diff viewer

### Phase 3: Smart Dashboard (Week 5-6)
1. ✅ Priority Inbox
2. ✅ Continue Working section
3. ✅ Team Activity feed
4. ✅ Quick Actions

### Phase 4: Polish & Scale (Week 7-8)
1. ✅ Email notifications
2. ✅ Notification preferences
3. ✅ Performance optimization
4. ✅ Mobile responsive

---

## 📊 Success Metrics

**Engagement:**
- Comments per workflow
- @Mentions usage
- Session restoration rate
- Time to resume work

**Collaboration:**
- Multi-user workflows
- Comment resolution time
- Version rollback frequency

**Productivity:**
- Time saved (context switching)
- Workflows completed faster
- Reduced email communication

---

This system creates a **contextual, intelligent workspace** that keeps teams aligned without overwhelming them with features they don't need. The focus is on **reducing friction** and **maintaining context** - exactly what enterprise teams need.

Ready to start implementing? 🚀
