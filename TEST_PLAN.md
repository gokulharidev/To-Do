# Test Plan - YouTrack Timesheet Integration

## Test Date: November 30, 2025
## Version: 1.0

---

## Overview
This test plan validates the complete YouTrack timesheet integration including Type field management, work item attributes, and description logging.

---

## Pre-requisites
- [ ] YouTrack connection is active (green "YouTrack Connected" indicator visible)
- [ ] Valid YouTrack project with issues
- [ ] Project has Type field configured with values
- [ ] Project has time tracking enabled
- [ ] Browser console open for debugging (F12)

---

## Test Suite 1: Type Field Integration

### Test Case 1.1: Type Field Display
**Objective**: Verify Type dropdown shows correct values from YouTrack

**Steps**:
1. Open the app
2. Type an issue ID in "Issue / Task Name" field (e.g., "ONEDATA-1056")
3. Select the issue from autocomplete

**Expected Results**:
- [ ] Type dropdown becomes enabled
- [ ] Type dropdown shows "Select Type" placeholder
- [ ] Type dropdown contains all Type values from the project
- [ ] Current issue Type is pre-selected (if exists)
- [ ] Assignee information displays below Type field

**Actual Results**:
```
[Record results here]
```

---

### Test Case 1.2: Type Field Selection
**Objective**: Verify Type can be selected and changed

**Steps**:
1. Complete Test Case 1.1
2. Click Type dropdown
3. Select a different Type value (e.g., "Bug", "Task", "Feature")

**Expected Results**:
- [ ] Dropdown opens with all options
- [ ] Selected Type is highlighted
- [ ] Dropdown closes after selection
- [ ] Selected Type remains visible

**Actual Results**:
```
[Record results here]
```

---

### Test Case 1.3: Type Update in YouTrack
**Objective**: Verify Type is updated in YouTrack when session stops

**Steps**:
1. Select an issue with Type = "Task"
2. Change Type to "Bug" in dropdown
3. Add work description: "Testing type update"
4. Start timer
5. Wait 1-2 minutes
6. Stop timer
7. Check YouTrack issue page

**Expected Results**:
- [ ] Success notification shows: "✓ Time logged to [ISSUE-ID] ([DATE]) - Type updated"
- [ ] In YouTrack, issue Type changed to "Bug"
- [ ] Timesheet entry appears with correct duration
- [ ] Work description appears in timesheet

**Actual Results**:
```
Issue ID:
Original Type:
Selected Type:
YouTrack Type after update:
Timesheet duration:
Timesheet description:
```

---

## Test Suite 2: Work Description

### Test Case 2.1: Description Input
**Objective**: Verify description can be entered

**Steps**:
1. Select an issue
2. Click in "Work Description" field
3. Type: "Implemented user authentication with OAuth2"

**Expected Results**:
- [ ] Text appears in textarea as typed
- [ ] Textarea accepts multiline input
- [ ] Placeholder disappears when typing

**Actual Results**:
```
[Record results here]
```

---

### Test Case 2.2: Description Saved to YouTrack
**Objective**: Verify description appears in YouTrack timesheet

**Steps**:
1. Select issue: "ONEDATA-1056"
2. Enter description: "Fixed login bug - added error handling"
3. Start timer
4. Wait 2 minutes
5. Stop timer
6. Go to YouTrack > Issue > Time Tracking tab

**Expected Results**:
- [ ] Timesheet entry shows duration (2m)
- [ ] Timesheet entry shows description: "Fixed login bug - added error handling"
- [ ] Timesheet entry shows correct date (Nov 30, 2025)
- [ ] Console log shows: "Work Item Payload" with description field

**Actual Results**:
```
Issue ID:
Duration logged:
Description in YouTrack:
Date in YouTrack:
Console payload:
```

---

### Test Case 2.3: Empty Description Handling
**Objective**: Verify system handles empty description gracefully

**Steps**:
1. Select an issue
2. Leave description field empty
3. Start and stop timer after 1 minute

**Expected Results**:
- [ ] Timer works normally
- [ ] Time logged successfully
- [ ] Description in YouTrack shows task name or default text
- [ ] No errors in console

**Actual Results**:
```
[Record results here]
```

---

## Test Suite 3: Work Item Attributes

### Test Case 3.1: Attributes Visibility
**Objective**: Verify work item attributes are fetched and displayed

**Steps**:
1. Select an issue from a project with work item attributes configured
2. Wait for attributes to load

**Expected Results**:
- [ ] "Timesheet Attributes" section appears
- [ ] All configured attributes are visible
- [ ] Dropdown attributes show all available values
- [ ] Text input attributes have input fields

**Actual Results**:
```
Project ID:
Number of attributes loaded:
Attribute names:
Console log shows: "getWorkItemAttributes" call
```

---

### Test Case 3.2: Attribute Selection
**Objective**: Verify attributes can be selected

**Steps**:
1. Complete Test Case 3.1
2. Select value for dropdown attribute (e.g., Type: "Development")
3. Enter text for text attribute (if any)

**Expected Results**:
- [ ] Selected values are retained
- [ ] Multiple attributes can be set
- [ ] Values persist while timer runs

**Actual Results**:
```
[Record results here]
```

---

### Test Case 3.3: Attributes Sent to YouTrack
**Objective**: Verify attributes are included in timesheet entry

**Steps**:
1. Select issue
2. Set attribute: "Work Type" = "Development"
3. Set attribute: "Region" = "US" (if exists)
4. Add description: "Code review"
5. Start timer
6. Stop after 1 minute
7. Check browser console for payload
8. Check YouTrack timesheet entry

**Expected Results**:
- [ ] Console shows payload with "attributes" array
- [ ] Each attribute has "id" and "value" with "id"
- [ ] YouTrack timesheet shows attributes correctly
- [ ] Success notification appears

**Actual Results**:
```
Console payload:
{
  "duration": { "presentation": "1m" },
  "date": ...,
  "description": "Code review",
  "attributes": [
    { "id": "...", "value": { "id": "..." } }
  ]
}

YouTrack attributes displayed:
```

---

## Test Suite 4: Integration Flow

### Test Case 4.1: Complete Workflow
**Objective**: Verify entire workflow from issue selection to YouTrack update

**Steps**:
1. Clear any existing timer state
2. Type issue ID: "ONEDATA-1056"
3. Select from autocomplete
4. Verify Type field loads
5. Change Type to "Bug"
6. Enter description: "Complete workflow test - fixed authentication"
7. Select work item attribute: "Work Type" = "Bug Fix"
8. Start timer
9. Wait 3 minutes
10. Stop timer
11. Check notifications
12. Verify in YouTrack

**Expected Results**:
- [ ] Each step completes without errors
- [ ] Type dropdown loads within 2 seconds
- [ ] Attributes load within 2 seconds
- [ ] Timer runs normally
- [ ] Success notification shows with issue ID and date
- [ ] YouTrack shows:
  - [ ] Type changed to "Bug"
  - [ ] Timesheet entry: 3 minutes
  - [ ] Description: "Complete workflow test - fixed authentication"
  - [ ] Work Type attribute: "Bug Fix"
  - [ ] Correct date: November 30, 2025

**Actual Results**:
```
[Record complete test flow results]
```

---

### Test Case 4.2: No Issue Selected (Fallback)
**Objective**: Verify system works when issue not selected from autocomplete

**Steps**:
1. Type issue ID: "ONEDATA-1056" (don't select from dropdown)
2. Enter description
3. Start and stop timer

**Expected Results**:
- [ ] Type field remains disabled
- [ ] System extracts issue ID from task name
- [ ] Time logged to correct issue
- [ ] Description saved
- [ ] Type not updated (since not selected)

**Actual Results**:
```
[Record results here]
```

---

## Test Suite 5: Error Handling

### Test Case 5.1: Invalid Issue ID
**Objective**: Verify error handling for non-existent issue

**Steps**:
1. Type "INVALID-9999"
2. Add description
3. Start and stop timer

**Expected Results**:
- [ ] Error notification appears
- [ ] Error message is clear and helpful
- [ ] Timer resets properly
- [ ] Console shows detailed error

**Actual Results**:
```
Error message:
Console error:
```

---

### Test Case 5.2: Network Error
**Objective**: Verify graceful handling of network issues

**Steps**:
1. Open browser DevTools > Network tab
2. Set network to "Offline"
3. Try to select an issue
4. Set network back to "Online"
5. Try again

**Expected Results**:
- [ ] Appropriate error message when offline
- [ ] System recovers when online
- [ ] No data loss

**Actual Results**:
```
[Record results here]
```

---

### Test Case 5.3: Missing Type Field
**Objective**: Verify handling when issue has no Type field

**Steps**:
1. Select an issue without Type field (if possible)
2. Complete timesheet entry

**Expected Results**:
- [ ] Type dropdown remains disabled
- [ ] Time logging works normally
- [ ] No errors occur

**Actual Results**:
```
[Record results here]
```

---

## Test Suite 6: UI/UX Validation

### Test Case 6.1: Visual Indicators
**Objective**: Verify all visual elements are correct

**Checklist**:
- [ ] "Timesheet Logger" header visible
- [ ] "YouTrack Connected" badge with green pulsing dot
- [ ] Type field clearly labeled
- [ ] Type dropdown has proper styling
- [ ] Disabled state is visually distinct
- [ ] Work Description textarea has 3 rows
- [ ] Placeholder text is helpful
- [ ] Timesheet Attributes section has clear heading
- [ ] Assignee info displays correctly

---

### Test Case 6.2: Responsive Behavior
**Objective**: Verify UI works on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on laptop (1366x768)
3. Test on tablet (768x1024)

**Expected Results**:
- [ ] All fields remain accessible
- [ ] No horizontal scrolling required
- [ ] Text remains readable

---

## Test Suite 7: Browser Console Validation

### Test Case 7.1: Console Logging
**Objective**: Verify appropriate console messages

**Expected Console Output**:
```javascript
// When selecting issue:
"Fetching work item attributes..."

// When stopping timer:
"Logging work item for date: 2025-11-30T..."
"Work Item Payload: { duration: {...}, date: ..., description: '...', attributes: [...] }"
"Work item added successfully: {...}"
"Issue Type updated successfully"

// Success case:
"✓ Time logged to ONEDATA-1056 (11/30/2025) - Type updated"
```

**Check For**:
- [ ] No red errors (except expected validation)
- [ ] Clear, informative messages
- [ ] Proper payload structure
- [ ] Timestamps are correct

---

## Test Suite 8: Session Logs

### Test Case 8.1: Logs Display
**Objective**: Verify session logs show correct information

**Steps**:
1. Complete several timesheet entries
2. Click "View Timesheet 📝"

**Expected Results**:
- [ ] All sessions appear in logs
- [ ] Synced entries show 📤 icon
- [ ] Descriptions appear below task names
- [ ] Mode badges display correctly (traditional/flow)
- [ ] Time durations are accurate
- [ ] Dates are correct

**Actual Results**:
```
[Record results here]
```

---

## Test Suite 9: Performance

### Test Case 9.1: Load Times
**Objective**: Measure response times

**Measurements**:
- [ ] Type values load time: _______ ms (should be < 2s)
- [ ] Work item attributes load time: _______ ms (should be < 2s)
- [ ] Timesheet submit time: _______ ms (should be < 3s)
- [ ] Type update time: _______ ms (should be < 2s)

---

## Test Suite 10: Data Integrity

### Test Case 10.1: Date Accuracy
**Objective**: Verify dates are logged correctly

**Test Scenarios**:
1. **Same Day**: Start 2:00 PM, Stop 2:30 PM → Should log to today
2. **Midnight Cross**: Start 11:55 PM, Stop 12:05 AM → Should log to start date
3. **Multi-day**: Start Monday 11 PM, Stop Tuesday 1 AM → Should log to Monday

**Expected**: All scenarios log to session start date

**Actual Results**:
```
Scenario 1:
Scenario 2:
Scenario 3:
```

---

## Regression Tests

### Existing Functionality
Verify these features still work:
- [ ] Timer Traditional mode (25min work / 5min break)
- [ ] Timer Flow mode (custom duration)
- [ ] Break enforcement
- [ ] Issue autocomplete
- [ ] Microsoft Calendar integration
- [ ] Session edit/delete
- [ ] Navigation between Time/Calendar pages

---

## Bug Tracking

### Bugs Found During Testing

| ID | Description | Severity | Steps to Reproduce | Status |
|----|-------------|----------|-------------------|--------|
| 1  |             |          |                   |        |
| 2  |             |          |                   |        |
| 3  |             |          |                   |        |

---

## Test Summary

**Test Date**: _________________

**Tester**: _________________

**Results**:
- Total Test Cases: 30+
- Passed: _______
- Failed: _______
- Blocked: _______
- Skipped: _______

**Overall Status**: ⬜ Pass / ⬜ Fail / ⬜ Conditional Pass

**Notes**:
```
[Add any additional observations or recommendations]
```

---

## Sign-off

**Tested By**: _____________________ **Date**: _________

**Approved By**: _____________________ **Date**: _________

---

## Appendix A: Test Data

### Sample Issue IDs
- ONEDATA-1056 (Card Creation & Review)
- [Add more as needed]

### Sample Descriptions
- "Implemented user authentication"
- "Fixed login bug - added error handling"
- "Code review and refactoring"
- "Added unit tests for payment module"

### Sample Work Item Attributes
- Work Type: Development, Bug Fix, Code Review
- Region: US, EU, APAC
- Billability: Billable, Non-billable

---

## Appendix B: Troubleshooting

### Common Issues

**Issue**: Type dropdown doesn't load
- **Solution**: Check project has Type field configured in YouTrack

**Issue**: Description not appearing in YouTrack
- **Solution**: Verify `description` field in console payload

**Issue**: Attributes not visible
- **Solution**: Confirm project has time tracking work item attributes configured

**Issue**: Type not updating
- **Solution**: Check browser console for "updateIssueType" errors
