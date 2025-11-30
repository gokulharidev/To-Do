# YouTrack Timesheet Integration Guide

## Overview
The Time Tracker app is now fully integrated with YouTrack, automatically logging timesheet entries when you complete work sessions.

## Features Implemented

### ✅ 1. Automatic Timesheet Logging
- When you stop a timer, the work duration is automatically logged to YouTrack
- The entry is logged on the **correct date** based on when the session started
- Includes work description and work item attributes

### ✅ 2. Issue Autocomplete
- Type issue ID (e.g., `PROJ-123`) or search for issues
- Real-time search as you type
- Shows issue summary and assignee information
- Automatically fetches work item attributes for the project

### ✅ 3. Work Item Attributes
- Fetched dynamically from project configuration
- Supports dropdown selects (for predefined values)
- Supports text inputs (for custom values)
- Automatically included when logging time

### ✅ 4. UI Improvements
- **Timesheet Logger** header clarifies purpose
- **YouTrack Connected** status indicator with pulsing dot
- **Issue / Task Name** field with autocomplete
- **Category** selector for work classification
- **Work Description** field logged to YouTrack
- Visual feedback with success/error notifications

### ✅ 5. Session Logs Enhancement
- Shows which entries were synced to YouTrack (📤 icon)
- Displays category badges with color coding
- Shows work descriptions in logs
- Better visual organization

## How It Works

### Starting a Work Session
1. **Select Category**: Choose work type (Work, Meeting, Admin, etc.)
2. **Enter Issue**: Type issue ID or search for issues
   - Autocomplete will show matching issues
   - Select an issue to auto-fill details
3. **Add Description**: Describe what you're working on
4. **Select Attributes**: Fill in work item attributes (if configured)
5. **Start Timer**: Click "Start Work Session"

### Logging Time to YouTrack
When you stop the timer:
1. Session is saved locally
2. Work duration is calculated (in minutes)
3. API call is made to YouTrack with:
   - Issue ID
   - Duration
   - Description
   - Work item attributes
   - **Session start date** (ensures correct date in timesheet)
4. Success/error notification is displayed
5. Session logs are updated

### Work Item Attributes
The app fetches work item attributes from YouTrack project settings:
```
GET /api/admin/projects/{projectId}/timeTrackingSettings/workItemAttributes
```

Response example:
```json
[
  {
    "id": "attr-1",
    "name": "Work Type",
    "values": [
      { "id": "dev", "name": "Development" },
      { "id": "review", "name": "Code Review" }
    ]
  }
]
```

### Timesheet API Call
When logging time, the app calls:
```
POST /api/issues/{issueId}/timeTracking/workItems
```

Payload:
```json
{
  "duration": {
    "presentation": "45m"
  },
  "date": 1701331200000,
  "description": "Implemented user authentication",
  "attributes": [
    {
      "id": "attr-1",
      "value": { "id": "dev" }
    }
  ]
}
```

## YouTrack Configuration

### Current Setup
- **API URL**: `https://youtrack24.onedatasoftware.com`
- **Token**: Configured in `src/services/youtrack.js`
- **Connection**: Automatic, no additional setup needed

### Project Requirements
For work item attributes to appear:
1. Project must have time tracking enabled
2. Work item attributes must be configured in project settings
3. Attributes can be:
   - **Dropdown fields** (with predefined values)
   - **Text fields** (for custom input)

## UI Components

### Smart Timer Component
- Located: `src/components/smartTimer.js`
- Features:
  - Issue autocomplete
  - Work item attributes (dynamic)
  - Category selector
  - Description textarea
  - Timer modes (Traditional/Flow)

### Session Logs
- Located: `src/components/sessionLogs.js`
- Shows:
  - All completed sessions
  - YouTrack sync status (📤 icon)
  - Category badges
  - Work descriptions
  - Edit/delete options

### YouTrack Service
- Located: `src/services/youtrack.js`
- Methods:
  - `searchIssues()` - Search for issues
  - `getIssue()` - Get issue details
  - `getWorkItemAttributes()` - Fetch project attributes
  - `addWorkItemFromSession()` - Log timesheet entry

## Notification System
Visual feedback for all YouTrack operations:
- ✓ **Success**: Green notification with issue ID and date
- ✗ **Error**: Red notification with error message
- Automatically dismisses after 3 seconds
- Slide-in/slide-out animations

## Category Badges
Color-coded categories for easy identification:
- 🔵 **Work/Focus** - Blue
- 🟡 **Meeting** - Orange/Yellow
- 🟣 **Admin** - Purple
- 🟢 **Break** - Green
- 🟠 **Meeting Prep** - Light Orange
- ⚪ **Other** - Gray

## Date Handling
**Important**: The app uses the **session start time** to determine the date for timesheet entries.

Example:
- Start session: November 30, 2025 at 11:45 PM
- Stop session: December 1, 2025 at 12:15 AM
- **Logged date**: November 30, 2025 ✓

This ensures timesheet entries appear on the correct date in YouTrack.

## Error Handling
The app handles various error scenarios:
- No issue selected → Tries to extract issue ID from task name
- Invalid issue ID → Shows error notification
- Network errors → Shows error message with details
- Zero duration → Prevents API call

## Testing
To verify integration:
1. Start timer with a valid issue ID
2. Work for at least 1 minute
3. Stop timer
4. Check YouTrack timesheet for the issue
5. Verify: date, duration, description, attributes

## Files Modified
- `src/components/smartTimer.js` - Timer UI and logic
- `src/components/sessionLogs.js` - Session display with sync status
- `src/services/youtrack.js` - API integration (already complete)
- `src/style.css` - UI styling for badges and indicators
- `src/utils/timerLogic.js` - Session data structure

## Future Enhancements
Potential improvements:
- Bulk edit timesheet entries
- Retry failed syncs
- Offline mode with sync queue
- Custom field mapping
- Project-specific defaults
- Time entry templates

## Support
For issues or questions:
1. Check browser console for detailed error messages
2. Verify YouTrack connection status
3. Confirm project has time tracking enabled
4. Check work item attribute configuration in YouTrack
