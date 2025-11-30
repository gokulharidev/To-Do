# Quick Start - YouTrack Timesheet Logging

## ✅ What's Working

Your app now **automatically logs timesheet entries to YouTrack** when you track time. Here's what's ready to use:

### 1. Visual Updates
- ✅ **"Timesheet Logger"** header (changed from "Focus Timer")
- ✅ **"YouTrack Connected"** status with pulsing green dot
- ✅ **"Issue / Task Name"** field with autocomplete
- ✅ **"Work Description"** field (logged to YouTrack)
- ✅ **Work Item Attributes** (fetched from project settings)
- ✅ **Category badges** in session logs
- ✅ **Sync indicators** (📤) for YouTrack entries

### 2. Automatic Integration
- ✅ Issue autocomplete as you type
- ✅ Work item attributes loaded automatically
- ✅ Timesheet logged when you stop timer
- ✅ Correct date based on session start time
- ✅ Success/error notifications

## 🚀 How to Use

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Track Time
1. **Select Category**: Work, Meeting, Admin, etc.
2. **Enter Issue**: Type issue ID (e.g., `PROJ-123`) or search
   - Autocomplete will show matching issues
   - Click to select
3. **Add Description**: Describe your work
4. **Fill Attributes**: Select work item attributes (if available)
5. **Start Timer**: Click "Start Work Session"
6. **Do Your Work**: Timer runs
7. **Stop Timer**: Click "Stop Session"

### Step 3: Verify
1. ✅ See success notification: "✓ Time logged to PROJ-123 (11/30/2025)"
2. ✅ Open "View Timesheet 📝" to see logs
3. ✅ Check for 📤 icon next to synced entries
4. ✅ Verify in YouTrack timesheet

## 📋 Example Workflow

```
You: Type "PROJ-123"
App: Shows autocomplete suggestions
     → "PROJ-123: Fix login bug"

You: Select issue
App: Loads work item attributes
     → "Work Type: [Development, Testing, Review]"

You: Fill description: "Fixed OAuth authentication"
You: Select "Development"
You: Click "Start Work Session"

... 45 minutes of work ...

You: Click "Stop Session"
App: ✓ Time logged to PROJ-123 (11/30/2025)
     Session saved locally
     Sent to YouTrack API

YouTrack:
  Issue: PROJ-123
  Date: November 30, 2025
  Duration: 45 minutes
  Description: "Fixed OAuth authentication"
  Work Type: Development
```

## 🎯 Key Features

### Smart Date Handling
The app uses the **session start time** to determine the timesheet date.

**Example**:
- Start: 11:45 PM on Nov 30
- Stop: 12:15 AM on Dec 1
- **Logged**: Nov 30 ✓

### Issue Detection
Even without autocomplete, the app extracts issue IDs:
- Task name: `PROJ-123 Fix bug` → Logs to PROJ-123 ✓
- Task name: `Working on PROJ-456` → Logs to PROJ-456 ✓

### Visual Feedback
- 🟢 YouTrack Connected indicator
- ✓ Success: Green notification
- ✗ Error: Red notification with details
- 📤 Sync status in session logs

## 🔍 Troubleshooting

### Issue: Autocomplete not working
- **Check**: YouTrack connection status (green indicator)
- **Check**: Browser console for errors
- **Solution**: Verify API URL and token in `src/services/youtrack.js`

### Issue: No work item attributes
- **Check**: Project has time tracking enabled in YouTrack
- **Check**: Work item attributes configured in project settings
- **Solution**: Configure attributes in YouTrack admin panel

### Issue: Timesheet not logged
- **Check**: Valid issue ID entered
- **Check**: Session duration > 0 minutes
- **Check**: Browser console for error messages
- **Solution**: Check notification message for details

### Issue: Wrong date in YouTrack
- **Verify**: Session start time in logs
- **Note**: App uses start time, not stop time
- **Example**: Start 11:30 PM Nov 30 → Logged Nov 30 ✓

## 📊 Session Logs

View all your tracked time:
1. Click "View Timesheet 📝"
2. Navigate dates with ‹ › buttons
3. See all sessions with:
   - 📤 icon = Synced to YouTrack
   - Category badges (color-coded)
   - Work descriptions
   - Time ranges and durations

## 🔧 Configuration

### YouTrack Settings
Located in: `src/services/youtrack.js`

```javascript
constructor() {
  this.apiUrl = 'https://youtrack24.onedatasoftware.com';
  this.token = 'perm-...';
  this.isConfigured = true;
}
```

### Work Item Attributes
Configured in YouTrack per project:
1. Admin → Projects → Select Project
2. Time Tracking → Work Item Attributes
3. Add custom attributes (dropdown or text)

## 📚 Documentation

For detailed information:
- **`YOUTRACK_INTEGRATION.md`** - Complete integration guide
- **`CHANGES_SUMMARY.md`** - All changes made

## 🎉 You're Ready!

The integration is **complete** and **working**. Just:
1. Start the app (`npm run dev`)
2. Track your time
3. Watch it sync to YouTrack automatically

**No additional configuration needed!** 🚀
