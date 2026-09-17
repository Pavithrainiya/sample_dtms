# ⚡ DTMS Quick Start Guide

## 🎯 Main Purpose
**Organization Task Management:** Admins assign tasks → Users complete them

---

## 🚀 How to Assign a Task (Admin)

### Step 1: Login as Admin
```
URL: http://localhost:5173/login
Username: admin@dtms.com
Password: admin123
```

### Step 2: Go to Tasks
**Click "Tasks" in the sidebar** (second item from top)

### Step 3: Create Task
**Click the blue "+ Create Task" button** (top right corner)

### Step 4: Fill the Form
```
┌─────────────────────────────────────┐
│ Task Title:                         │
│ ┌─────────────────────────────────┐ │
│ │ Design Homepage                 │ │ ← What to do
│ └─────────────────────────────────┘ │
│                                     │
│ Description:                        │
│ ┌─────────────────────────────────┐ │
│ │ Create a modern homepage with   │ │ ← Details
│ │ hero section and features...    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Deadline:                           │
│ ┌─────────────────────────────────┐ │
│ │ 2024-12-31 17:00               │ │ ← When
│ └─────────────────────────────────┘ │
│                                     │
│ Assign To: (Hold Ctrl for multiple)│
│ ┌─────────────────────────────────┐ │
│ │☑ John Doe (john@company.com)   │ │ ← Who
│ │☐ Jane Smith (jane@company.com) │ │   (Select users)
│ │☐ Bob Wilson (bob@company.com)  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Attachment: [Choose File] optional  │
│                                     │
│ [  Create Task  ] [ Cancel ]        │
└─────────────────────────────────────┘
```

### Step 5: Click "Create Task"
✅ Done! The user will see it in their dashboard!

---

## 👤 How to Complete a Task (User)

### Step 1: Login as User
```
URL: http://localhost:5173/login
Username: (your email)
Password: (your password)
```

### Step 2: View Your Tasks
**Click "My Tasks" in the sidebar** (second item from top)

### Step 3: Click "Submit Work"
Find your assigned task and **click the blue "Submit Work" button**

### Step 4: Fill Submission
```
┌─────────────────────────────────────┐
│ Submit Your Work                    │
│ Task: Design Homepage               │
├─────────────────────────────────────┤
│                                     │
│ Submission Details:                 │
│ ┌─────────────────────────────────┐ │
│ │ I completed the homepage design │ │
│ │ with 3 variations. Used modern  │ │ ← Describe work
│ │ UI principles and responsive    │ │
│ │ design for mobile...            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Attachment: [Choose File]           │
│ homepage_design.zip                 │ ← Upload files
│                                     │
│ [  Submit Work  ] [ Cancel ]        │
└─────────────────────────────────────┘
```

### Step 5: Click "Submit Work"
✅ Done! Admin will review your submission!

---

## 🗺️ Navigation Map

### Admin Dashboard:
```
Sidebar Menu:
├── 📊 Dashboard    ← Overview & stats
├── ✅ Tasks        ← CREATE TASKS HERE ⭐
├── 👥 Team         ← View team members
├── 📈 Analytics    ← Performance data
├── 📄 Reports      ← Generate reports
└── ⚙️  Settings    ← System settings
```

### User Dashboard:
```
Sidebar Menu:
├── 📊 Dashboard      ← Overview & stats
├── ✅ My Tasks       ← SEE ASSIGNED TASKS HERE ⭐
├── 📤 Submissions    ← SUBMIT WORK HERE ⭐
├── 🏆 Achievements   ← View badges & points
├── 📊 Activity       ← Your activity log
└── 👤 Profile        ← Update profile
```

---

## 🎨 Visual Flow

### Complete Workflow:
```
ADMIN SIDE:                    USER SIDE:
┌──────────────┐              ┌──────────────┐
│   Login as   │              │  Login as    │
│    Admin     │              │    User      │
└──────┬───────┘              └──────┬───────┘
       │                              │
       ▼                              │
┌──────────────┐                     │
│ Click "Tasks"│                     │
│  in Sidebar  │                     │
└──────┬───────┘                     │
       │                              │
       ▼                              │
┌──────────────┐                     │
│ Click "+"    │                     │
│ Create Task  │                     │
└──────┬───────┘                     │
       │                              │
       ▼                              │
┌──────────────┐                     │
│   Fill Form  │                     │
│  - Title     │                     │
│  - Details   │                     │
│  - Deadline  │                     │
│  - Assign To │ ←─────────────────┐ │
└──────┬───────┘                   │ │
       │                            │ │
       ▼                            │ │
┌──────────────┐                   │ │
│    Submit    │                   │ │
│     Task     │                   │ │
└──────┬───────┘                   │ │
       │                            │ │
       │ Task assigned! ──────────→│ │
       │                            │ │
                                    ▼ │
                              ┌──────────────┐
                              │ See Task in  │
                              │  "My Tasks"  │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Click Submit │
                              │  Work Button │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Fill Form   │
                              │  - Details   │
                              │  - Files     │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Submit     │
                              │    Work      │
                              └──────┬───────┘
       ┌─────────────────────────────┘
       │ Submission received!
       ▼
┌──────────────┐
│ Admin Review │
│  Submission  │
└──────────────┘
```

---

## 🎯 Key Locations Summary

| Action | Role | Where to Click |
|--------|------|----------------|
| **Create Task** | Admin | Sidebar → Tasks → "+ Create Task" button |
| **Assign Users** | Admin | In task form → "Assign To" dropdown (hold Ctrl) |
| **Set Deadline** | Admin | In task form → "Deadline" field |
| **View Tasks** | User | Sidebar → "My Tasks" |
| **Submit Work** | User | My Tasks → "Submit Work" button on task |
| **Upload Files** | User | Submission form → "Attachment" field |

---

## ⚠️ Important Notes

1. **Admin must assign at least ONE user** when creating a task
2. **Hold Ctrl/Cmd** to select multiple users in the assignment dropdown
3. **Users only see their assigned tasks** (not all organization tasks)
4. **File attachments are optional** but recommended for better context
5. **Deadline is required** - system won't let you create task without it

---

## 🎨 UI Features

### Theme Toggle
- **Location:** Top right corner (Sun/Moon icon)
- **Function:** Switch between Light and Dark mode
- **Persistence:** Theme choice is saved and restored on next visit

### Status Badges
- 🔴 **Red** - Not Submitted
- 🟡 **Yellow** - Under Review  
- 🟢 **Green** - Approved
- 🔵 **Blue** - Needs Revision

### Search Bar
- **Location:** Top bar (admin only)
- **Function:** Search tasks, users, or projects

---

## 🚦 Getting Started Checklist

### For Admins:
- [ ] Login with admin credentials
- [ ] Navigate to "Tasks" page
- [ ] Click "Create Task" button
- [ ] Fill in task title and description
- [ ] Set a deadline
- [ ] **Select at least one user to assign**
- [ ] (Optional) Upload task files
- [ ] Click "Create Task"
- [ ] ✅ Task is now assigned!

### For Users:
- [ ] Login with user credentials
- [ ] Navigate to "My Tasks" page
- [ ] Find your assigned task
- [ ] Read task description and deadline
- [ ] Download attachments if any
- [ ] Click "Submit Work" button
- [ ] Describe your completed work
- [ ] (Optional) Upload your work files
- [ ] Click "Submit Work"
- [ ] ✅ Submission sent to admin!

---

## 🎉 That's It!

The core functionality is simple:
1. Admin creates and assigns tasks
2. Users receive and complete tasks
3. Admin reviews submissions

Everything happens inside the organization, managed through the DTMS platform!

**For detailed instructions, see:** `CORE_WORKFLOW_GUIDE.md`
**For PostgreSQL setup, see:** `MIGRATION_INSTRUCTIONS.md`
