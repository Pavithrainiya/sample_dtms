# 🎯 DTMS Core Workflow Guide

## Main Concept: Admin → Task → User → Complete

This is an **organization task management system** where:
1. **Admin assigns tasks** to team members
2. **Users receive and complete** assigned tasks
3. **Admin reviews submissions**

---

## 👨‍💼 Admin Workflow: How to Assign Tasks

### Step 1: Login as Admin
- Go to `http://localhost:5173/login`
- Use admin credentials (e.g., `admin@dtms.com` / `admin123`)

### Step 2: Navigate to Tasks Section
You have **2 ways** to create tasks:

#### **Option A: From Dashboard**
1. Click on **"Recent Tasks"** section
2. Click **"View All"** button
3. Click **"Create Task"** button (top right, blue button with + icon)

#### **Option B: From Sidebar**
1. Click **"Tasks"** in the sidebar navigation
2. Click **"Create Task"** button (top right)

### Step 3: Fill Out Task Assignment Form

A modal will appear with the following fields:

```
📝 Task Assignment Form
├── Task Title * (Required)
│   └── Example: "Design Homepage Mockup"
│
├── Description * (Required)
│   └── Example: "Create a modern homepage design with hero section, 
│                features, and call-to-action. Follow brand guidelines."
│
├── Deadline * (Required)
│   └── Select date and time
│   └── Example: "2024-12-31 17:00"
│
├── Assign To * (Required - Multi-select)
│   └── Select one or more users from dropdown
│   └── Hold Ctrl/Cmd to select multiple users
│   └── Only shows non-admin users
│
└── Attachment (Optional)
    └── Upload task files (PDFs, images, documents)
```

### Step 4: Assign Users
**Important:** 
- You **MUST** assign at least one user
- Hold **Ctrl** (Windows) or **Cmd** (Mac) to select multiple users
- Only team members appear (not other admins)

### Step 5: Submit Task
- Click **"Create Task"** button
- Task is created and assigned users get notified
- Task appears in user's dashboard immediately

---

## 👤 User Workflow: How to Complete Tasks

### Step 1: Login as User
- Go to `http://localhost:5173/login`
- Use user credentials (e.g., `user@example.com`)

### Step 2: View Assigned Tasks
You have **3 ways** to see your tasks:

#### **Option A: From Dashboard**
- See **"My Tasks"** section with recent assignments
- Click **"Submit"** button next to any pending task

#### **Option B: From Sidebar**
- Click **"My Tasks"** in sidebar
- See all assigned tasks with status
- Click **"Submit Work"** button

#### **Option C: From Submissions**
- Click **"Submissions"** in sidebar
- Select a task from the list

### Step 3: View Task Details
Each task shows:
- ✅ **Task Title** - What needs to be done
- 📄 **Description** - Detailed instructions
- 📅 **Deadline** - When it's due
- 📎 **Attachment** - Download any files (if provided by admin)
- 🏷️ **Status Badge** - Current status (Not Submitted, Under Review, Approved, Needs Revision)

### Step 4: Submit Your Work

#### Fill Submission Form:
```
📤 Submission Form
├── Submission Details * (Required)
│   └── Describe what you did
│   └── Example: "Completed homepage design with 3 variations. 
│                Used Figma for mockups. Added mobile responsive views."
│
└── Attachment (Optional)
    └── Upload your work files
    └── Example: Design files, documents, code, screenshots
```

### Step 5: Submit
- Click **"Submit Work"** button
- Submission goes to admin for review
- Status changes to **"Under Review"**

---

## 📍 Where Everything Is Located

### Admin Dashboard Layout:

```
┌──────────────────────────────────────────────────────────┐
│ SIDEBAR              │ TOP BAR (Search, Theme, Profile)  │
│                      │                                    │
│ ➤ Dashboard          ├────────────────────────────────────┤
│   Tasks ⭐           │                                    │
│   Team               │  MAIN CONTENT AREA                 │
│   Analytics          │                                    │
│   Reports            │  [Stats Cards]                     │
│   Settings           │  [Charts]                          │
│                      │  [Recent Tasks]                    │
│ [Logout]             │                                    │
└──────────────────────┴────────────────────────────────────┘
```

### Admin - Tasks Page:

```
┌────────────────────────────────────────────────────────────┐
│  All Tasks                          [+ Create Task Button] │ ⭐
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Task Title                           [Edit] [Del] │    │
│  │ Description text here...                          │    │
│  │ 📅 Due: Dec 31  👥 3 assigned  🟢 pending        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Another Task                         [Edit] [Del] │    │
│  │ Description...                                    │    │
│  │ 📅 Due: Jan 15  👥 2 assigned  🟡 completed      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Create Task Modal (When you click "Create Task"):

```
┌────────────────────────────────────────────┐
│  Create New Task                      [X]  │
├────────────────────────────────────────────┤
│                                            │
│  Task Title *                              │
│  [___________________________________]     │
│                                            │
│  Description *                             │
│  [___________________________________]     │
│  [___________________________________]     │
│  [___________________________________]     │
│                                            │
│  Deadline *                                │
│  [___________________________________]     │
│                                            │
│  Assign To * (Hold Ctrl for multiple) ⭐   │
│  [☑ John Doe (john@company.com)      ]    │
│  [☐ Jane Smith (jane@company.com)    ]    │
│  [☐ Bob Wilson (bob@company.com)     ]    │
│  [☐ Alice Brown (alice@company.com)  ]    │
│                                            │
│  Attachment (Optional)                     │
│  [Choose File] No file chosen              │
│                                            │
│  [   Create Task   ]  [   Cancel   ]       │
└────────────────────────────────────────────┘
```

### User Dashboard Layout:

```
┌──────────────────────────────────────────────────────────┐
│ SIDEBAR              │ TOP BAR (Search, Theme, Profile)  │
│                      │                                    │
│ ➤ Dashboard          ├────────────────────────────────────┤
│   My Tasks ⭐        │                                    │
│   Submissions ⭐     │  MAIN CONTENT AREA                 │
│   Achievements       │                                    │
│   Activity           │  [Stats Cards]                     │
│   Profile            │  [Activity Chart]                  │
│                      │  [My Tasks List] ⭐                │
│ [Logout]             │                                    │
└──────────────────────┴────────────────────────────────────┘
```

### User - My Tasks Page:

```
┌────────────────────────────────────────────────────────────┐
│  My Tasks                                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Design Homepage Mockup     [Submit Work Button] │ ⭐  │
│  │ Create a modern homepage design with...          │    │
│  │ 📅 Due: Dec 31  🔴 Not Submitted                │    │
│  │ 📎 Download Task Attachment                      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Write Documentation                              │    │
│  │ Document the API endpoints...                    │    │
│  │ 📅 Due: Jan 5   🟡 Under Review                 │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### User - Submission Form (When you click "Submit Work"):

```
┌────────────────────────────────────────────┐
│  Submit Your Work                          │
│  Submit work for: Design Homepage Mockup   │
├────────────────────────────────────────────┤
│                                            │
│  Submission Details *                      │
│  [___________________________________]     │
│  [___________________________________]     │
│  [___________________________________]     │
│  [___________________________________]     │
│  [___________________________________]     │
│  Describe your work and any notes...       │
│                                            │
│  Attachment (Optional)                     │
│  [Choose File] No file chosen              │
│                                            │
│  [   Submit Work   ]  [   Cancel   ]       │
└────────────────────────────────────────────┘
```

---

## 🎬 Complete Workflow Example

### Scenario: Admin assigns "Create Logo" task to designer

#### Admin Side:
1. **Login** → Admin Dashboard
2. **Click** "Tasks" in sidebar
3. **Click** "Create Task" button
4. **Fill form:**
   ```
   Title: "Create Company Logo"
   Description: "Design a modern, professional logo for our company..."
   Deadline: "2024-12-31 17:00"
   Assign To: [✓] Sarah Designer
   Attachment: brand_guidelines.pdf
   ```
5. **Click** "Create Task"
6. ✅ Task created! Sarah receives assignment

#### User (Sarah) Side:
1. **Login** → User Dashboard
2. **See** "Create Company Logo" in "My Tasks"
3. **Read** task description and deadline
4. **Download** brand_guidelines.pdf attachment
5. **Work** on the logo design
6. **Click** "Submit Work" button
7. **Fill submission:**
   ```
   Details: "Created 3 logo variations in vector format..."
   Attachment: logo_designs.zip
   ```
8. **Click** "Submit Work"
9. ✅ Submission sent to admin for review!

#### Admin Reviews:
1. **See** notification of new submission
2. **Review** Sarah's work
3. **Approve** or **Request Revisions**

---

## 🔑 Key Features in New UI

### Task Assignment Features:
✅ **Multi-user assignment** - Assign one task to multiple team members
✅ **File attachments** - Add reference files to tasks
✅ **Deadline setting** - Set specific date and time
✅ **Rich descriptions** - Detailed task instructions
✅ **Edit tasks** - Modify assignments after creation
✅ **Delete tasks** - Remove tasks if needed

### User Submission Features:
✅ **Clear task details** - See all task information
✅ **Status tracking** - Know submission status
✅ **File uploads** - Submit work files
✅ **Text descriptions** - Explain your work
✅ **Download attachments** - Get task files from admin

### Visual Indicators:
- 🔴 **Red badge** - Not Submitted
- 🟡 **Yellow badge** - Under Review
- 🟢 **Green badge** - Approved
- 🔵 **Blue badge** - Needs Revision

---

## 📱 Quick Access Guide

### Admin Quick Actions:
| Action | Location | Button |
|--------|----------|--------|
| Create Task | Tasks page | "+ Create Task" (top right) |
| Edit Task | Tasks page | Edit icon on task card |
| Delete Task | Tasks page | Trash icon on task card |
| View Team | Sidebar | "Team" menu item |
| See Stats | Dashboard | Stats cards at top |

### User Quick Actions:
| Action | Location | Button |
|--------|----------|--------|
| View Tasks | My Tasks page | Click "My Tasks" in sidebar |
| Submit Work | Task card | "Submit Work" button |
| Download File | Task details | "Download Task Attachment" link |
| Check Status | Dashboard | Look for colored status badges |

---

## 🎯 Core Files for Task Assignment

### Backend (API):
- `backend/tasks/models.py` - Task and Submission models
- `backend/tasks/views.py` - Task CRUD operations
- `backend/tasks/serializers.py` - Data serialization

### Frontend (UI):
- `frontend/src/pages/AdminDashboardNew.jsx` - **Admin task creation** ⭐
  - Line 397-407: "Create Task" button
  - Line 611-731: Task creation modal form ⭐
  - Line 90-128: `handleCreateTask()` function
  
- `frontend/src/pages/UserDashboardNew.jsx` - **User task submission** ⭐
  - Line 336-447: Task list with "Submit Work" buttons
  - Line 450-536: Submission form ⭐
  - Line 110-142: `handleSubmit()` function

### Key Code Locations:

**Admin - Task Form (Line 611 in AdminDashboardNew.jsx):**
```jsx
<form onSubmit={handleCreateTask}>
  {/* Task Title */}
  {/* Description */}
  {/* Deadline */}
  {/* Assign To - Multi-select dropdown ⭐ */}
  {/* File Attachment */}
</form>
```

**User - Submission Form (Line 489 in UserDashboardNew.jsx):**
```jsx
<form onSubmit={handleSubmit}>
  {/* Submission Details */}
  {/* File Attachment */}
</form>
```

---

## ✅ Summary

The **core workflow** is simple and clear in the new UI:

1. **Admin**: Sidebar → Tasks → Create Task → Fill Form → Assign Users → Submit
2. **User**: Sidebar → My Tasks → View Task → Submit Work → Fill Form → Submit

Everything is accessible with **1-2 clicks** from the main dashboard!

---

**Need Help?**
- Check `MIGRATION_INSTRUCTIONS.md` for setup
- Check `backend/POSTGRESQL_SETUP.md` for database
- All core features are working and ready to use!
