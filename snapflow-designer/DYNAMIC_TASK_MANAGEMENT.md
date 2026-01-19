# Dynamic Task Management & Runtime Routing - Design Specification

## 🎯 Overview

Enable **dynamic task creation and routing** at runtime based on data, rules, or database queries, while maintaining complete auditability and preventing orphan tasks.

---

## 📋 Key Concepts

### 1. **Static vs Dynamic Tasks**

**Static Tasks (Solid Lines):**
- Defined at design time
- Always execute in sequence
- Predictable flow
- Example: Start → Form → Gateway → End

**Dynamic Tasks (Dotted Lines):**
- Created/routed at runtime
- Based on data, rules, or DB queries
- Conditional execution
- Example: Approval chain based on amount

### 2. **Dynamic Routing Patterns**

#### Pattern 1: **Dynamic Parallel Tasks**
```
Loan Application
  ↓
Rules Engine (checks amount)
  ├─→ < $10K: Single Approver
  ├─→ $10K-$50K: Two Approvers (parallel)
  └─→ > $50K: Three Approvers + Manager (parallel)
```

#### Pattern 2: **Database-Driven Routing**
```
Purchase Request
  ↓
DB Query: Get Approvers by Department
  ├─→ Approver 1 (from DB)
  ├─→ Approver 2 (from DB)
  └─→ Approver N (from DB)
```

#### Pattern 3: **Conditional Task Creation**
```
Document Review
  ↓
Rules: Check document type
  ├─→ Legal Doc: Add Legal Review Task
  ├─→ Financial: Add Finance Review Task
  └─→ Technical: Add Tech Review Task
```

---

## 🎨 Visual Representation

### Designer UI

```
┌─────────────────────────────────────────────────────────────┐
│ Workflow: Loan Approval Process                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Start] ──────> [Loan Form] ──────> [Rules Engine]         │
│                                            │                 │
│                                            │ (Dynamic)       │
│                                            ├··········> [Approver 1]
│                                            │                 │
│                                            ├··········> [Approver 2]
│                                            │                 │
│                                            └··········> [Manager]
│                                                        │     │
│                                                        └─────┴──> [End]
│                                                                   │
│  Legend:                                                          │
│  ────── Solid: Static flow (always executes)                    │
│  ······ Dotted: Dynamic flow (conditional/runtime)              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Node Indicators

**Dynamic Router Node:**
```
┌─────────────────────────┐
│ ⚡ Dynamic Router       │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  ← Dotted border
│ Route based on:         │
│ • Amount                │
│ • Department            │
│ • Risk Level            │
└─────────────────────────┘
```

**Dynamic Task Placeholder:**
```
┌─────────────────────────┐
│ 👤 Approver (Dynamic)   │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  ← Dotted border
│ Assigned at runtime     │
│ Based on: Rules/DB      │
└─────────────────────────┘
```

---

## 🔧 Implementation Architecture

### 1. **Dynamic Router Node**

**Purpose:** Route to different tasks based on runtime data

**Configuration:**
```typescript
{
  type: 'dynamicRouter',
  config: {
    routingStrategy: 'rules' | 'database' | 'script',
    
    // Rules-based routing
    ruleSetId: 'approval-routing-rules',
    
    // Database-based routing
    dbQuery: 'SELECT approver_id FROM approvers WHERE dept = ${department}',
    
    // Script-based routing
    script: `
      if (amount > 50000) {
        return ['senior-approver', 'manager', 'cfo'];
      } else if (amount > 10000) {
        return ['approver-1', 'approver-2'];
      } else {
        return ['approver-1'];
      }
    `,
    
    // Task template for dynamic tasks
    taskTemplate: {
      type: 'userTask',
      name: 'Approval Task',
      formId: 'approval-form',
      assigneeField: '${approver}' // Populated at runtime
    }
  }
}
```

### 2. **Database Schema for Dynamic Tasks**

```sql
-- Dynamic Task Definitions
CREATE TABLE dynamic_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id),
    name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50), -- userTask, serviceTask, etc.
    config JSONB NOT NULL, -- Task configuration
    routing_rules JSONB, -- When to create this task
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Runtime Task Instances
CREATE TABLE dynamic_task_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES dynamic_task_templates(id),
    task_id VARCHAR(255), -- Flowable task ID
    assignee VARCHAR(255),
    status VARCHAR(50), -- pending, completed, skipped
    input_data JSONB,
    output_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Dynamic Routing Decisions (Audit)
CREATE TABLE dynamic_routing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id VARCHAR(255) NOT NULL,
    router_node_id VARCHAR(255),
    routing_strategy VARCHAR(50),
    input_data JSONB,
    routing_decision JSONB, -- Which tasks were created
    created_tasks TEXT[], -- Array of task IDs
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **Flowable Integration**

**Java Delegate for Dynamic Routing:**

```java
@Component("dynamicRouterDelegate")
public class DynamicRouterDelegate implements JavaDelegate {
    
    @Autowired
    private RulesEngineService rulesEngine;
    
    @Autowired
    private DynamicTaskService dynamicTaskService;
    
    @Override
    public void execute(DelegateExecution execution) {
        String routingStrategy = (String) execution.getVariable("routingStrategy");
        
        List<String> targetTasks = new ArrayList<>();
        
        switch (routingStrategy) {
            case "rules":
                targetTasks = routeByRules(execution);
                break;
            case "database":
                targetTasks = routeByDatabase(execution);
                break;
            case "script":
                targetTasks = routeByScript(execution);
                break;
        }
        
        // Create dynamic tasks
        for (String taskDef : targetTasks) {
            dynamicTaskService.createTask(execution, taskDef);
        }
        
        // Audit the decision
        auditRoutingDecision(execution, targetTasks);
        
        // Set variable for next steps
        execution.setVariable("dynamicTasks", targetTasks);
    }
    
    private List<String> routeByRules(DelegateExecution execution) {
        String ruleSetId = (String) execution.getVariable("ruleSetId");
        Map<String, Object> input = execution.getVariables();
        
        Map<String, Object> result = rulesEngine.evaluateRuleSet(
            UUID.fromString(ruleSetId), input
        );
        
        // Rules output: { "approvers": ["user1", "user2", "user3"] }
        return (List<String>) result.get("approvers");
    }
    
    private List<String> routeByDatabase(DelegateExecution execution) {
        String query = (String) execution.getVariable("dbQuery");
        // Execute query and return results
        return dynamicTaskService.queryApprovers(query, execution.getVariables());
    }
    
    private List<String> routeByScript(DelegateExecution execution) {
        String script = (String) execution.getVariable("script");
        // Evaluate JavaScript/Groovy script
        return scriptEngine.evaluate(script, execution.getVariables());
    }
}
```

---

## 🚫 Orphan Task Prevention

### Design-Time Validation

**Validation Rules:**
1. Every task must have at least one incoming connection (except Start)
2. Every task must have at least one outgoing connection (except End)
3. Dynamic tasks must have a "merge" point
4. All paths must eventually reach an End node

**Visual Indicators:**
```
❌ Orphan Task (Red border):
┌─────────────────────────┐
│ ⚠️  Approval Task       │ ← Red border
│ No incoming connection! │
└─────────────────────────┘

✅ Valid Task (Normal):
┌─────────────────────────┐
│ ✓ Approval Task         │ ← Normal border
│ Connected properly      │
└─────────────────────────┘
```

**Validation Component:**

```typescript
function validateWorkflow(nodes: Node[], edges: Edge[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for orphan tasks
    nodes.forEach(node => {
        if (node.type === 'start') return; // Start has no incoming
        
        const hasIncoming = edges.some(e => e.target === node.id);
        if (!hasIncoming) {
            errors.push(`Task "${node.data.label}" has no incoming connection`);
        }
        
        if (node.type === 'end') return; // End has no outgoing
        
        const hasOutgoing = edges.some(e => e.source === node.id);
        if (!hasOutgoing) {
            errors.push(`Task "${node.data.label}" has no outgoing connection`);
        }
    });
    
    // Check for unreachable tasks
    const reachable = findReachableTasks(nodes, edges);
    nodes.forEach(node => {
        if (!reachable.has(node.id)) {
            errors.push(`Task "${node.data.label}" is unreachable from Start`);
        }
    });
    
    // Check dynamic tasks have merge points
    const dynamicRouters = nodes.filter(n => n.type === 'dynamicRouter');
    dynamicRouters.forEach(router => {
        const dynamicPaths = edges.filter(e => e.source === router.id && e.style?.strokeDasharray);
        if (dynamicPaths.length > 0) {
            const hasMerge = checkForMergePoint(router.id, edges);
            if (!hasMerge) {
                warnings.push(`Dynamic router "${router.data.label}" should have a merge point`);
            }
        }
    });
    
    return { errors, warnings, isValid: errors.length === 0 };
}
```

---

## 🎨 Edge Styling for Dynamic Connections

### ReactFlow Edge Configuration

```typescript
// Static edge (solid line)
const staticEdge = {
    id: 'e1',
    source: 'task1',
    target: 'task2',
    type: 'smoothstep',
    animated: false,
    style: {
        stroke: '#6b7280',
        strokeWidth: 2,
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6b7280',
    }
};

// Dynamic edge (dotted line)
const dynamicEdge = {
    id: 'e2',
    source: 'router1',
    target: 'dynamic-task1',
    type: 'smoothstep',
    animated: true,
    style: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '5,5', // Dotted line
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
    },
    label: '⚡ Dynamic',
    labelStyle: {
        fill: '#3b82f6',
        fontSize: 10,
    }
};
```

---

## 📊 Example: Loan Approval with Dynamic Routing

### Workflow Definition

```json
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "position": { "x": 100, "y": 200 }
    },
    {
      "id": "loan-form",
      "type": "userTask",
      "position": { "x": 300, "y": 200 },
      "data": { "label": "Loan Application", "formId": "loan-form" }
    },
    {
      "id": "dynamic-router",
      "type": "dynamicRouter",
      "position": { "x": 500, "y": 200 },
      "data": {
        "label": "Route to Approvers",
        "config": {
          "routingStrategy": "rules",
          "ruleSetId": "approval-routing-rules"
        }
      }
    },
    {
      "id": "merge",
      "type": "gateway",
      "position": { "x": 900, "y": 200 },
      "data": { "label": "Merge Approvals" }
    },
    {
      "id": "end",
      "type": "end",
      "position": { "x": 1100, "y": 200 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start",
      "target": "loan-form",
      "style": { "stroke": "#6b7280" }
    },
    {
      "id": "e2",
      "source": "loan-form",
      "target": "dynamic-router",
      "style": { "stroke": "#6b7280" }
    },
    {
      "id": "e3-dynamic",
      "source": "dynamic-router",
      "target": "merge",
      "style": { "stroke": "#3b82f6", "strokeDasharray": "5,5" },
      "label": "⚡ Dynamic Approvers"
    },
    {
      "id": "e4",
      "source": "merge",
      "target": "end",
      "style": { "stroke": "#6b7280" }
    }
  ]
}
```

### Routing Rules

```json
{
  "ruleSetName": "Approval Routing Rules",
  "rules": [
    {
      "priority": 100,
      "name": "High Value - Multiple Approvers",
      "conditions": [
        { "field": "amount", "operator": "greaterThan", "value": 50000 }
      ],
      "actions": [
        {
          "type": "setVariable",
          "variable": "approvers",
          "value": ["senior-approver", "manager", "cfo"]
        }
      ]
    },
    {
      "priority": 50,
      "name": "Medium Value - Two Approvers",
      "conditions": [
        { "field": "amount", "operator": "greaterThan", "value": 10000 }
      ],
      "actions": [
        {
          "type": "setVariable",
          "variable": "approvers",
          "value": ["approver-1", "approver-2"]
        }
      ]
    },
    {
      "priority": 0,
      "name": "Low Value - Single Approver",
      "conditions": [],
      "actions": [
        {
          "type": "setVariable",
          "variable": "approvers",
          "value": ["approver-1"]
        }
      ]
    }
  ]
}
```

### Runtime Execution

**Input:**
```json
{
  "applicantName": "John Doe",
  "amount": 75000,
  "purpose": "Business Expansion"
}
```

**Routing Decision:**
```json
{
  "ruleMatched": "High Value - Multiple Approvers",
  "approvers": ["senior-approver", "manager", "cfo"],
  "tasksCreated": [
    {
      "taskId": "approval-task-1",
      "assignee": "senior-approver",
      "name": "Senior Approver Review"
    },
    {
      "taskId": "approval-task-2",
      "assignee": "manager",
      "name": "Manager Review"
    },
    {
      "taskId": "approval-task-3",
      "assignee": "cfo",
      "name": "CFO Review"
    }
  ]
}
```

**Audit Log:**
```json
{
  "workflowInstanceId": "proc-12345",
  "routerNodeId": "dynamic-router",
  "routingStrategy": "rules",
  "inputData": { "amount": 75000 },
  "routingDecision": {
    "ruleMatched": "High Value - Multiple Approvers",
    "approvers": ["senior-approver", "manager", "cfo"]
  },
  "createdTasks": ["approval-task-1", "approval-task-2", "approval-task-3"],
  "executedAt": "2026-01-18T21:36:00Z"
}
```

---

## 🔄 Fresh Designer on Load

### Current Issue
Designer loads with previous workflow data

### Solution

```typescript
// store/useStore.ts
export const useStore = create<StoreState>((set) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    
    // Reset to fresh state
    resetWorkflow: () => set({
        nodes: [],
        edges: [],
        selectedNode: null,
        selectedEdge: null,
    }),
    
    // Load existing workflow
    loadWorkflow: (workflow: Workflow) => set({
        nodes: workflow.nodes,
        edges: workflow.edges,
    }),
}));

// Editor.tsx
export function Editor() {
    const { resetWorkflow, loadWorkflow } = useStore();
    
    useEffect(() => {
        // Reset to fresh state on mount
        resetWorkflow();
        
        // Only load if explicitly requested
        const workflowId = new URLSearchParams(window.location.search).get('workflowId');
        if (workflowId) {
            fetch(`/api/workflows/${workflowId}`)
                .then(res => res.json())
                .then(workflow => loadWorkflow(workflow));
        }
    }, []);
    
    return (
        <div className="h-screen">
            <ReactFlow ... />
        </div>
    );
}
```

---

## 📋 Summary

### Dynamic Task Management
✅ Rules-based routing
✅ Database-driven routing
✅ Script-based routing
✅ Runtime task creation
✅ Complete audit trail

### Visual Representation
✅ Solid lines for static flow
✅ Dotted lines for dynamic flow
✅ Dynamic node indicators
✅ Clear legends

### Orphan Prevention
✅ Design-time validation
✅ Reachability checks
✅ Merge point validation
✅ Visual error indicators

### Fresh Designer
✅ Clear state on load
✅ Explicit workflow loading
✅ URL parameter support

Ready to implement? 🚀
