# SnapFlow Refactoring - Testing Checklist

**Date:** 2026-01-19  
**Status:** Ready for Testing

---

## ✅ Pre-Testing Setup

### 1. Start Services

```bash
# Terminal 1: Start Backend
cd /Users/srakella/SnapFlow/workspace/snapflow-engine
gradle bootRun

# Terminal 2: Start Frontend
cd /Users/srakella/SnapFlow/workspace/snapflow-designer
npm run dev

# Terminal 3: Start Database (if not running)
cd /Users/srakella/SnapFlow/workspace
docker-compose up -d
```

---

## 🧪 Testing Checklist

### Phase 1: Basic Functionality ✅

- [ ] **Open Designer** - Navigate to http://localhost:3000/designer
- [ ] **New Process Button** - Click "New" button, confirm dialog works
- [ ] **Drag Elements** - Drag nodes from palette onto canvas
- [ ] **Zoom Controls** - Elements should appear at normal size (not huge)
- [ ] **Pan Canvas** - Should be able to pan around

### Phase 2: Properties Sidebar ✅

- [ ] **Click Node** - Properties sidebar should slide in from right
- [ ] **General Tab** - Should show label and description fields
- [ ] **Edit Label** - Change label, should update node
- [ ] **Edit Description** - Add description, should save

### Phase 3: Configuration Tab ✅

#### User Task
- [ ] **Select User Task** - Click on a user task node
- [ ] **Config Tab** - Switch to Configuration tab
- [ ] **Conditional Execution** - Toggle on/off, edit condition
- [ ] **Info Box** - Should see blue info box

#### Service Task
- [ ] **Select Service Task** - Click on a service task node
- [ ] **HTTP Method** - Should see GET/POST/PUT/DELETE dropdown
- [ ] **Endpoint URL** - Should be able to enter URL
- [ ] **Request Body** - Should see JSON editor with dark theme

#### AI Agent
- [ ] **Select AI Agent** - Click on AI agent node
- [ ] **System Prompt** - Should see purple-themed textarea
- [ ] **Input/Output Vars** - Should see two input fields

#### Email Node
- [ ] **Select Email** - Click on email node
- [ ] **Recipient** - Should see email input
- [ ] **Subject** - Should see subject input
- [ ] **Body** - Should see body textarea

#### Timer Node
- [ ] **Select Timer** - Click on timer node
- [ ] **Duration** - Should see duration input
- [ ] **Info Box** - Should see amber warning box with ISO 8601 format

### Phase 4: Data & Form Tab ✅

#### User Task Data
- [ ] **Select User Task** - Click on user task
- [ ] **Data Tab** - Switch to Data & Form tab
- [ ] **Assignee Field** - Click, should see user dropdown
- [ ] **User Lookup** - Type to filter users
- [ ] **Select User** - Click user, should populate field
- [ ] **Candidate Groups** - Should see dropdown with groups
- [ ] **Form Selector** - Should see form dropdown
- [ ] **Create New Link** - Should see "+ Create New" link

#### Service Task Data
- [ ] **Select Service Task** - Click on service task
- [ ] **Data Tab** - Switch to Data & Form tab
- [ ] **Result Variable** - Should see input field
- [ ] **Info Box** - Should see yellow warning box

### Phase 5: Edge Configuration ✅

- [ ] **Connect Nodes** - Draw connection between two nodes
- [ ] **Click Edge** - Click on the connection line
- [ ] **Properties Sidebar** - Should show edge properties
- [ ] **Rule Label** - Should see input for label
- [ ] **Edit Label** - Type label, should update edge
- [ ] **Info Box** - Should see orange conditional flow box

### Phase 6: Save & Load ✅

- [ ] **Create Workflow** - Add several nodes and connections
- [ ] **Save Button** - Click "Save & Launch"
- [ ] **Enter Name** - Type workflow name
- [ ] **Save** - Confirm save works (check console for success)
- [ ] **New Process** - Click "New" button
- [ ] **Load Button** - Click "Load" button
- [ ] **Select Workflow** - Choose saved workflow
- [ ] **Verify Load** - All nodes and connections should appear

### Phase 7: Delete Operations ✅

- [ ] **Select Node** - Click on any node
- [ ] **Delete Button** - Click "Delete Node" in footer
- [ ] **Confirm Dialog** - Should see confirmation
- [ ] **Confirm Delete** - Node should be removed
- [ ] **Select Edge** - Click on a connection
- [ ] **Delete Connection** - Click "Delete Connection"
- [ ] **Confirm Delete** - Connection should be removed

### Phase 8: Service Layer Testing ✅

Open browser console (F12) and check:

- [ ] **Save Workflow** - Should see clean service call (no raw fetch)
- [ ] **Load Forms** - Should see forms loaded via service
- [ ] **Error Handling** - Try saving with invalid data, should see proper error

### Phase 9: Responsive Behavior ✅

- [ ] **Resize Window** - Sidebar should remain visible
- [ ] **Scroll Content** - Long forms should scroll properly
- [ ] **Tab Switching** - Tabs should switch smoothly
- [ ] **Animations** - Slide-in animations should be smooth

### Phase 10: Edge Cases ✅

- [ ] **Empty Canvas** - Click on empty space, sidebar should close
- [ ] **Multiple Nodes** - Select different nodes, sidebar should update
- [ ] **Rapid Switching** - Quickly switch between nodes, no errors
- [ ] **Form Without Selection** - Open Data tab before forms load
- [ ] **Invalid Input** - Try entering invalid data, should handle gracefully

---

## 🐛 Known Issues (Expected)

### Non-Critical
1. **Jakarta validation IDE warnings** - Will resolve after IDE refresh
2. **Null safety warnings** - Java strict null checking (cosmetic)
3. **Unused deployment variable** - Intentional for now

### If You Find Issues

**Report Format:**
```
Issue: [Brief description]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What actually happened]
Console Errors: [Any errors in browser console]
```

---

## ✅ Success Criteria

### Must Pass
- ✅ All basic functionality works
- ✅ Properties sidebar opens and closes
- ✅ All tabs display correctly
- ✅ Can save and load workflows
- ✅ Can delete nodes and edges
- ✅ No console errors during normal operation

### Nice to Have
- ✅ Smooth animations
- ✅ Fast response times
- ✅ Clean console logs
- ✅ Proper error messages

---

## 📊 Test Results Template

```
Date: _____________
Tester: _____________

Phase 1: Basic Functionality        [ ] Pass  [ ] Fail
Phase 2: Properties Sidebar          [ ] Pass  [ ] Fail
Phase 3: Configuration Tab           [ ] Pass  [ ] Fail
Phase 4: Data & Form Tab             [ ] Pass  [ ] Fail
Phase 5: Edge Configuration          [ ] Pass  [ ] Fail
Phase 6: Save & Load                 [ ] Pass  [ ] Fail
Phase 7: Delete Operations           [ ] Pass  [ ] Fail
Phase 8: Service Layer               [ ] Pass  [ ] Fail
Phase 9: Responsive Behavior         [ ] Pass  [ ] Fail
Phase 10: Edge Cases                 [ ] Pass  [ ] Fail

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🚀 Quick Smoke Test (5 minutes)

If you're short on time, run this quick test:

1. ✅ Open designer
2. ✅ Drag a user task onto canvas
3. ✅ Click it, properties sidebar opens
4. ✅ Switch between all 3 tabs
5. ✅ Edit the label
6. ✅ Save the workflow
7. ✅ Click "New" to clear
8. ✅ Load the workflow back
9. ✅ Delete the node

**If all 9 steps work, the refactoring is successful!**

---

**Ready to test!** 🎉
