# SnapFlow Designer Enhancements

## Overview
The SnapFlow Workflow Designer has been significantly enhanced with improved drag interactions, better connectors, expanded node types, and a completely redesigned UI.

---

## 🎨 Visual Enhancements

### 1. **Enhanced Connectors**
- **Smooth Bezier Curves**: Changed from step connectors to `smoothstep` for more natural flow lines
- **Better Styling**: Increased stroke width to 2.5px with vibrant blue color (#3b82f6)
- **Animated Flow**: Connectors now animate to show workflow direction
- **Larger Arrows**: Increased arrow marker size (20x20) for better visibility
- **Connection Preview**: Dashed blue line when dragging connections

### 2. **Improved Drag Feel**
- **Snap to Grid**: Added 15x15 grid snapping for precise node placement
- **Connection Radius**: 30px radius makes it easier to connect nodes
- **Visual Feedback**: Nodes scale and show opacity changes during drag
- **Smooth Animations**: 200ms transitions on all node interactions
- **Hover Effects**: Nodes lift and shadow increases on hover

### 3. **Enhanced Node Designs**

#### **Start Node** (Green)
- Gradient background (green-400 to emerald-500)
- Play icon in white
- 14x14 size with shadow
- Ring animation on selection

#### **End Node** (Red)
- Gradient background (red-500 to rose-600)
- Square icon in white
- 14x14 size with shadow
- Ring animation on selection

#### **Task Node** (Blue)
- Gradient background changes based on type:
  - User Task: blue-50 to cyan-50
  - Service Task: indigo-50 to blue-50
- Shows task type and assignee
- Rounded corners with shadow
- Scale effect on selection (105%)

#### **Gateway/Decision Node** (Orange)
- Diamond shape with gradient (orange-100 to amber-100)
- Larger size (16x16) for better visibility
- Inner gradient layer for depth
- Label with background badge
- Rotated 45° for BPMN standard diamond shape

#### **AI Agent Node** (Purple)
- Gradient background (purple-50 to fuchsia-50)
- Animated sparkles icon
- Professional card design
- Shows "AI Agent" label

#### **Email Node** (Pink) - NEW!
- Gradient background (pink-50 to rose-50)
- Mail icon in gradient circle
- Shows recipient email when configured
- Modern card design

#### **Timer Node** (Amber) - NEW!
- Gradient background (amber-50 to orange-50)
- Clock icon in gradient circle
- Shows duration when configured
- Professional card design

### 4. **Connection Handles**
- Increased hover scale to 150% (from 125%)
- Color-coded by node type
- Always visible with proper opacity
- Ring effect on selection
- Positioned on all 4 sides (top, bottom, left, right)

---

## 🎯 New Features

### 1. **Expanded Node Palette**
The palette now includes **7 node types** organized into **3 categories**:

#### **Events**
- Start Event
- End Event
- Timer Event (NEW)

#### **Tasks**
- User/Service Task
- Email Task (NEW)
- AI Agent Task

#### **Logic**
- Gateway (Decision Point)

### 2. **Redesigned Palette UI**
- **Categorized Layout**: Nodes grouped by function
- **Gradient Icons**: Each node has a unique gradient color
- **Better Tooltips**: Hover tooltips appear on the right with descriptions
- **Drag Feedback**: Visual feedback when dragging (opacity + scale)
- **Scrollable**: Supports many node types with smooth scrolling
- **Professional Header**: "Palette" label with gradient icon

### 3. **Enhanced Properties Sidebar**

#### **Email Node Configuration**
- Recipient Email field
- Subject line
- Email body (textarea)
- Pink-themed UI matching node color

#### **Timer Node Configuration**
- Duration input field
- ISO 8601 format helper
- Amber-themed UI matching node color
- Examples: PT5M (5 minutes), PT1H (1 hour), P1D (1 day)

### 4. **Better ReactFlow Settings**
- Snap to grid: 15x15
- Connection radius: 30px
- Min zoom: 0.2x
- Max zoom: 4x
- Custom connection line styling
- Attribution hidden for cleaner UI

---

## 🚀 User Experience Improvements

### 1. **Drag & Drop**
- ✅ Smooth grid snapping
- ✅ Visual feedback during drag
- ✅ Larger connection radius
- ✅ Better cursor states (grab/grabbing)

### 2. **Node Interactions**
- ✅ Scale on selection (105%)
- ✅ Ring effects for selected state
- ✅ Hover shadows and lift effects
- ✅ Color-coded connection handles
- ✅ Smooth 200ms transitions

### 3. **Connectors**
- ✅ Smooth bezier curves (not stepped)
- ✅ Animated flow direction
- ✅ Vibrant blue color
- ✅ Larger arrow markers
- ✅ Dashed preview when connecting

### 4. **Visual Hierarchy**
- ✅ Gradient backgrounds on all nodes
- ✅ Consistent rounded corners (xl)
- ✅ Professional shadows (lg)
- ✅ Color-coded by function
- ✅ Clear typography hierarchy

---

## 📋 Decision Support

### Gateway/Decision Node Enhancements
- **Larger Size**: 16x16 (from 12x12) for better visibility
- **Gradient Background**: Orange to amber gradient
- **Inner Shadow**: Depth effect with secondary gradient
- **Label Badge**: White background with shadow
- **Better Icon**: Thicker stroke width (2.5)
- **BPMN Standard**: Proper diamond shape (45° rotation)

### Edge Labels
- Can be configured via Properties Sidebar
- Used for decision conditions (e.g., "Yes", "No", "> $500")
- Displayed on connection lines

---

## 🎨 Color Palette

| Node Type | Primary Color | Gradient |
|-----------|--------------|----------|
| Start | Green | green-400 → emerald-500 |
| End | Red | red-500 → rose-600 |
| Task (User) | Blue | blue-50 → cyan-50 |
| Task (Service) | Indigo | indigo-50 → blue-50 |
| Gateway | Orange | orange-100 → amber-100 |
| AI Agent | Purple | purple-50 → fuchsia-50 |
| Email | Pink | pink-50 → rose-50 |
| Timer | Amber | amber-50 → orange-50 |

---

## 📦 Files Modified

### New Files
- `/src/components/nodes/EmailNode.tsx` - Email task node component
- `/src/components/nodes/TimerNode.tsx` - Timer event node component

### Enhanced Files
- `/src/components/Editor.tsx` - Added new node types, improved edge styling, better ReactFlow config
- `/src/components/SidePalette.tsx` - Complete redesign with categories and new nodes
- `/src/components/PropertiesSidebar.tsx` - Added Email and Timer configuration panels
- `/src/components/nodes/TaskNode.tsx` - Enhanced with gradients and better styling
- `/src/components/nodes/GatewayNode.tsx` - Larger, better gradients, improved visibility
- `/src/components/nodes/AIAgentNode.tsx` - Enhanced with gradients and removed inline styles
- `/src/components/nodes/StartNode.tsx` - Gradient background with Play icon
- `/src/components/nodes/EndNode.tsx` - Gradient background with Square icon

---

## ✨ Key Improvements Summary

1. **Drag Feel**: ✅ Snap to grid, smooth animations, visual feedback
2. **Connectors**: ✅ Smooth bezier curves, animated, vibrant colors, larger arrows
3. **Decisions**: ✅ Enhanced gateway node, edge labels, better visibility
4. **New Nodes**: ✅ Email and Timer nodes added to palette
5. **UI Polish**: ✅ Gradients, shadows, hover effects, professional design
6. **Palette**: ✅ Categorized, scrollable, better tooltips, drag feedback
7. **Properties**: ✅ Configuration panels for all node types

---

## 🎯 Next Steps (Optional Enhancements)

1. **More Node Types**: Database, Subprocess, Message, Signal events
2. **Custom Edge Types**: Conditional edges with different colors
3. **Minimap Styling**: Custom colors for different node types
4. **Keyboard Shortcuts**: Delete, Copy, Paste, Undo/Redo
5. **Node Templates**: Pre-configured common patterns
6. **Validation**: Real-time workflow validation
7. **Auto-layout**: Automatic node arrangement
8. **Export Options**: PNG, SVG, PDF export

---

## 📸 Screenshots

The enhanced designer features:
- Modern, gradient-based node designs
- Smooth, animated connectors
- Categorized palette with 7 node types
- Professional UI with excellent visual hierarchy
- Improved drag and drop experience
- Better decision/gateway visualization

All enhancements maintain BPMN standards while providing a modern, user-friendly interface.
