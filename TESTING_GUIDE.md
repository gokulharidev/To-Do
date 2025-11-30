# Quick Test Guide - YouTrack Integration

## 🎯 Quick Start Testing (5 minutes)

### 1. Visual Check ✅
Open the app and verify:
- [x] Header says "Timesheet Logger"
- [x] Green "YouTrack Connected" badge with pulsing dot
- [x] "Type" field label (not "Category")
- [x] "Issue / Task Name" field
- [x] "Work Description" textarea (3 rows)

### 2. Basic Flow Test ✅
```
1. Type: ONEDATA-1056
2. Select from autocomplete
3. Wait 2-3 seconds
4. Check: Type dropdown should load with options
5. Select Type: "Bug"
6. Enter description: "Testing integration"
7. Check: "Timesheet Attributes" section visible (if configured)
8. Start timer → Wait 1 minute → Stop
9. Look for: "✓ Time logged to ONEDATA-1056 (11/30/2025) - Type updated"
```

**✅ Pass Criteria**:
- Type dropdown loads
- Success notification appears
- No red errors in console

### 3. Verify in YouTrack 🔍
Open: https://youtrack24.onedatasoftware.com/issue/ONEDATA-1056

Check:
1. **Type field** → Should show "Bug"
2. **Time Tracking tab** → New entry with:
   - Duration: 1m
   - Description: "Testing integration"
   - Date: November 30, 2025

---

## 🐛 Known Issues Fixed

### ✅ Issue #1: Description Not Saved
**Fixed**: Description now properly passed to YouTrack API
- Added `description` field to work item payload
- Verified in `addWorkItemFromSession()` method

### ✅ Issue #2: Work Item Attributes Not Visible
**Fixed**: Attributes now fetched and displayed
- Fetch from `/api/admin/projects/{projectId}/timeTrackingSettings/workItemAttributes`
- Displayed under "Timesheet Attributes" heading
- Only visible when project has configured attributes

### ✅ Issue #3: Category vs Type
**Fixed**: Replaced Category with Type from YouTrack
- Type values fetched from project configuration
- Type updated in YouTrack when session stops
- Current issue Type pre-selected

---

## 📊 Console Verification

### Expected Console Output
```javascript
// When selecting issue:
Fetching Type values and work item attributes...
Type values loaded: [{ id: "...", name: "Task" }, ...]
Work item attributes loaded: [{ id: "...", name: "Work Type", values: [...] }]

// When stopping timer:
Logging work item for date: 2025-11-30T14:30:00.000Z (11/30/2025)
Work Item Payload: {
  "duration": { "presentation": "1m" },
  "date": 1701356400000,
  "description": "Testing integration",
  "attributes": [
    { "id": "attr-123", "value": { "id": "dev" } }
  ]
}
Work item added successfully
Issue Type updated successfully
```

### ❌ What to Watch For
- Red errors during API calls
- `undefined` or `null` in payload
- Type not updating in YouTrack
- Description missing from timesheet

---

## 🔧 Manual Testing Checklist

### Critical Path (Must Pass)
- [ ] Issue selection loads Type values
- [ ] Type can be selected from dropdown
- [ ] Description is entered and saved
- [ ] Timer starts and stops normally
- [ ] Time logged to YouTrack
- [ ] Type updated in YouTrack
- [ ] Description appears in YouTrack timesheet
- [ ] Correct date in timesheet

### Work Item Attributes (If Configured)
- [ ] Attributes section visible
- [ ] Can select attribute values
- [ ] Attributes sent to YouTrack
- [ ] Attributes visible in timesheet

### Edge Cases
- [ ] Empty description handled gracefully
- [ ] Type not selected → time still logs
- [ ] Invalid issue ID → shows error
- [ ] Network error → clear error message

---

## 🎨 UI Changes Summary

### Before → After

| Before | After |
|--------|-------|
| "Focus Timer" | "Timesheet Logger" |
| "Category" dropdown | "Type" dropdown (from YouTrack) |
| No description field | "Work Description" textarea |
| "Custom Fields" section | Removed (wrong fields) |
| "Work Item Attributes" | "Timesheet Attributes" |
| No YouTrack status | Green "YouTrack Connected" badge |
| "Time Logs" button | "View Timesheet" button |

---

## 📝 API Endpoints Verified

### ✅ Working Endpoints
1. **Get Project Type Values**
   ```
   GET /api/admin/projects/{projectId}/customFields
   → Returns Type field with all possible values
   ```

2. **Get Work Item Attributes**
   ```
   GET /api/admin/projects/{projectId}/timeTrackingSettings/workItemAttributes
   → Returns timesheet-specific attributes
   ```

3. **Update Issue Type**
   ```
   POST /api/issues/{issueId}/customFields/{typeFieldId}
   Body: { "value": { "id": "typeValueId" } }
   → Updates Type field on issue
   ```

4. **Add Work Item**
   ```
   POST /api/issues/{issueId}/timeTracking/workItems
   Body: { duration, date, description, attributes }
   → Creates timesheet entry
   ```

---

## 🚀 Performance Benchmarks

### Target Response Times
- Type values loading: < 2 seconds
- Attributes loading: < 2 seconds
- Time logging: < 3 seconds
- Type update: < 2 seconds

### Test Results
Test and record your results:
```
Type load time: _______ ms
Attributes load time: _______ ms
Timesheet submit time: _______ ms
Type update time: _______ ms
```

---

## 🔍 Debugging Tips

### If Type Dropdown is Empty
1. Check console for errors
2. Verify project has Type field configured
3. Check API response: `GET /api/admin/projects/{projectId}/customFields`

### If Description Not Appearing
1. Open console
2. Look for "Work Item Payload"
3. Verify `description` field has value
4. Check YouTrack timesheet entry

### If Attributes Not Visible
1. Confirm project has time tracking enabled
2. Verify work item attributes configured in project settings
3. Check API: `/timeTrackingSettings/workItemAttributes`

### If Type Not Updating
1. Check console for "updateIssueType" call
2. Verify Type was selected before stopping
3. Check YouTrack API permissions

---

## ✅ Success Indicators

Your integration is working if:
1. ✅ Type dropdown loads with options
2. ✅ Selected Type updates in YouTrack
3. ✅ Description appears in timesheet
4. ✅ Work duration is accurate
5. ✅ Correct date in timesheet
6. ✅ Success notification shows
7. ✅ No console errors
8. ✅ Attributes sent (if configured)

---

## 📞 Support

### If Tests Fail
1. Check browser console (F12)
2. Verify YouTrack configuration
3. Test API endpoints directly
4. Review TEST_PLAN.md for detailed scenarios

### Common Solutions
- **Clear browser cache** if strange behavior
- **Check YouTrack permissions** for API token
- **Verify project settings** in YouTrack admin
- **Test with different issues** to isolate problems

---

## 🎉 Ready to Use!

If all tests pass, the integration is ready for production use!

**Next Steps**:
1. Train users on new Type field
2. Document project-specific attributes
3. Monitor console for any issues
4. Gather user feedback
