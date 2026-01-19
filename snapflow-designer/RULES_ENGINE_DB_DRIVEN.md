# SnapFlow - Database-Driven Business Rules Engine

## 🎯 Architecture Overview

**Approach:** Store rules in PostgreSQL, evaluate in Java, manage via UI

**Benefits:**
- ✅ No Drools dependency
- ✅ Simple to understand and maintain
- ✅ Visual rule builder
- ✅ Excel import/export
- ✅ Version control built-in
- ✅ Fast PostgreSQL JSON queries

---

## 🗄️ Database Schema

### PostgreSQL Tables

```sql
-- Rule Sets (collections of rules)
CREATE TABLE rule_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft',  -- draft, active, archived
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual Rules
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID REFERENCES rule_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0,  -- Higher priority = evaluated first
    conditions JSONB NOT NULL,  -- Array of conditions
    actions JSONB NOT NULL,     -- Array of actions
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rule Execution History (Audit)
CREATE TABLE rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID REFERENCES rule_sets(id),
    rule_id UUID REFERENCES rules(id),
    workflow_instance_id VARCHAR(255),
    input_data JSONB,
    output_data JSONB,
    matched BOOLEAN,  -- Did this rule match?
    executed_at TIMESTAMP DEFAULT NOW(),
    execution_time_ms INT
);

-- Indexes for performance
CREATE INDEX idx_rules_rule_set ON rules(rule_set_id);
CREATE INDEX idx_rules_priority ON rules(priority DESC);
CREATE INDEX idx_rule_executions_workflow ON rule_executions(workflow_instance_id);
CREATE INDEX idx_rule_executions_executed_at ON rule_executions(executed_at);
```

---

## 📋 Rule Data Model

### Condition Structure

```json
{
  "conditions": [
    {
      "field": "creditScore",
      "operator": "greaterThan",
      "value": 700,
      "type": "number"
    },
    {
      "field": "income",
      "operator": "greaterThan",
      "value": 50000,
      "type": "number"
    }
  ],
  "conditionLogic": "AND"  // AND or OR
}
```

### Action Structure

```json
{
  "actions": [
    {
      "type": "setVariable",
      "variable": "decision",
      "value": "APPROVED"
    },
    {
      "type": "setVariable",
      "variable": "reason",
      "value": "Auto-approved: High credit score"
    },
    {
      "type": "routeTo",
      "targetNode": "approval-notification"
    }
  ]
}
```

### Supported Operators

```typescript
enum RuleOperator {
  // Comparison
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN = 'lessThan',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  
  // String
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  MATCHES_REGEX = 'matchesRegex',
  
  // Collection
  IN = 'in',
  NOT_IN = 'notIn',
  
  // Boolean
  IS_TRUE = 'isTrue',
  IS_FALSE = 'isFalse',
  
  // Null checks
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

enum ActionType {
  SET_VARIABLE = 'setVariable',
  ROUTE_TO = 'routeTo',
  SEND_EMAIL = 'sendEmail',
  CALL_API = 'callApi',
  LOG_MESSAGE = 'logMessage',
}
```

---

## 🎨 Visual Rule Builder UI

### Main Rules Management Page

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Business Rules                                           │
├─────────────────────────────────────────────────────────────┤
│ [+ New Rule Set]  [📥 Import Excel]  [📤 Export]  [🔍]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📁 Loan Approval Rules                        v1.2     │  │
│ │ Status: Active • 5 rules • Last updated 2 hours ago    │  │
│ │ [Edit] [Version History] [Duplicate] [Archive]         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📁 Discount Calculation                       v2.0     │  │
│ │ Status: Active • 8 rules • Last updated yesterday      │  │
│ │ [Edit] [Version History] [Duplicate] [Archive]         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📁 Regional Routing                           v1.0     │  │
│ │ Status: Draft • 3 rules • Created today                │  │
│ │ [Edit] [Version History] [Duplicate] [Delete]          │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Rule Set Editor

```
┌─────────────────────────────────────────────────────────────┐
│ ✏️  Edit Rule Set: Loan Approval Rules                      │
├─────────────────────────────────────────────────────────────┤
│ Name: [Loan Approval Rules                              ]  │
│ Description: [Rules for automated loan approval decisions]  │
│ Status: [Active ▼]                                          │
├─────────────────────────────────────────────────────────────┤
│ Rules (Evaluated in priority order)                         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🔼 Priority 100                                        │  │
│ │ ✅ Auto Approve - High Credit                          │  │
│ │ IF creditScore > 700 AND income > 50000                │  │
│ │ THEN Set decision = "APPROVED"                         │  │
│ │ [Edit] [Disable] [Delete] [↑] [↓]                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🔽 Priority 50                                         │  │
│ │ ⚠️  Manual Review - Medium Credit                      │  │
│ │ IF creditScore > 650 AND debtRatio < 0.4               │  │
│ │ THEN Set decision = "REVIEW", Route to Manual Review   │  │
│ │ [Edit] [Disable] [Delete] [↑] [↓]                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🔽 Priority 0 (Default)                                │  │
│ │ ❌ Reject - Low Credit                                 │  │
│ │ IF (always)                                            │  │
│ │ THEN Set decision = "REJECTED"                         │  │
│ │ [Edit] [Disable] [Delete] [↑] [↓]                      │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [+ Add Rule]                                                │
│                                                              │
│ [Test Rules] [Save] [Cancel]                                │
└─────────────────────────────────────────────────────────────┘
```

---

### Individual Rule Editor

```
┌─────────────────────────────────────────────────────────────┐
│ ✏️  Edit Rule: Auto Approve - High Credit                   │
├─────────────────────────────────────────────────────────────┤
│ Rule Name                                                    │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Auto Approve - High Credit                           │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ Description (Optional)                                       │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Automatically approve loans for applicants with      │    │
│ │ high credit scores and sufficient income             │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ Priority (Higher = Evaluated First)                          │
│ ┌──────┐                                                     │
│ │ 100  │ [Slider: 0 ────●──────────── 100]                  │
│ └──────┘                                                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 📌 CONDITIONS                                                │
├─────────────────────────────────────────────────────────────┤
│ Match: ● All conditions (AND)  ○ Any condition (OR)         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Condition 1                                            │  │
│ │ [creditScore ▼] [> ▼] [700        ] [×]                │  │
│ │                                                        │  │
│ │ Condition 2                                            │  │
│ │ [income      ▼] [> ▼] [50000      ] [×]                │  │
│ └────────────────────────────────────────────────────────┘  │
│ [+ Add Condition]                                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ ⚡ ACTIONS (Execute when conditions match)                  │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Action 1: Set Variable                                 │  │
│ │ Variable: [decision ▼]                                 │  │
│ │ Value:    [APPROVED                                ]   │  │
│ │ [×]                                                     │  │
│ │                                                        │  │
│ │ Action 2: Set Variable                                 │  │
│ │ Variable: [reason ▼]                                   │  │
│ │ Value:    [Auto-approved: High credit score        ]   │  │
│ │ [×]                                                     │  │
│ │                                                        │  │
│ │ Action 3: Route To                                     │  │
│ │ Target Node: [Approval Notification ▼]                 │  │
│ │ [×]                                                     │  │
│ └────────────────────────────────────────────────────────┘  │
│ [+ Add Action ▼]                                             │
│   • Set Variable                                             │
│   • Route To Node                                            │
│   • Send Email                                               │
│   • Call API                                                 │
│   • Log Message                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 🧪 TEST RULE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Test Input (JSON):                                           │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ {                                                      │  │
│ │   "creditScore": 720,                                 │  │
│ │   "income": 60000,                                    │  │
│ │   "debtRatio": 0.3                                    │  │
│ │ }                                                      │  │
│ └────────────────────────────────────────────────────────┘  │
│ [Run Test]                                                   │
│                                                              │
│ Test Result:                                                 │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ✅ Rule Matched!                                        │  │
│ │ Output:                                                │  │
│ │ {                                                      │  │
│ │   "decision": "APPROVED",                             │  │
│ │   "reason": "Auto-approved: High credit score"        │  │
│ │ }                                                      │  │
│ │ Execution Time: 2ms                                    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Save Rule] [Cancel]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Excel Import/Export

### Excel Template Format

**Sheet 1: Rule Set Info**
```
| Name                  | Loan Approval Rules                    |
| Description           | Rules for automated loan approval      |
| Version               | 1.0                                    |
| Status                | Active                                 |
```

**Sheet 2: Rules**
```
| Priority | Rule Name           | Condition 1 Field | Condition 1 Operator | Condition 1 Value | Condition 2 Field | Condition 2 Operator | Condition 2 Value | Logic | Action 1 Type | Action 1 Variable | Action 1 Value |
|----------|---------------------|-------------------|----------------------|-------------------|-------------------|----------------------|-------------------|-------|---------------|-------------------|----------------|
| 100      | Auto Approve High   | creditScore       | >                    | 700               | income            | >                    | 50000             | AND   | setVariable   | decision          | APPROVED       |
| 50       | Manual Review       | creditScore       | >                    | 650               | debtRatio         | <                    | 0.4               | AND   | setVariable   | decision          | REVIEW         |
| 0        | Reject Low Credit   |                   |                      |                   |                   |                      |                   |       | setVariable   | decision          | REJECTED       |
```

### Import Process

```typescript
// Frontend: Upload Excel
async function importRulesFromExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/rules/import', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result; // { ruleSetId, rulesImported: 5, errors: [] }
}
```

```java
// Backend: Parse Excel
@PostMapping("/api/rules/import")
public ResponseEntity<?> importRules(@RequestParam("file") MultipartFile file) {
    try {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        
        // Parse Sheet 1: Rule Set Info
        Sheet infoSheet = workbook.getSheetAt(0);
        RuleSet ruleSet = parseRuleSetInfo(infoSheet);
        ruleSet = ruleSetRepository.save(ruleSet);
        
        // Parse Sheet 2: Rules
        Sheet rulesSheet = workbook.getSheetAt(1);
        List<Rule> rules = parseRules(rulesSheet, ruleSet.getId());
        ruleRepository.saveAll(rules);
        
        return ResponseEntity.ok(Map.of(
            "ruleSetId", ruleSet.getId(),
            "rulesImported", rules.size()
        ));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```

---

## ⚙️ Rule Evaluation Engine

### Java Implementation

```java
@Service
public class RulesEngineService {
    
    @Autowired
    private RuleRepository ruleRepository;
    
    @Autowired
    private RuleExecutionRepository executionRepository;
    
    /**
     * Evaluate all rules in a rule set against input data
     */
    public Map<String, Object> evaluateRuleSet(
        UUID ruleSetId,
        Map<String, Object> inputData,
        String workflowInstanceId
    ) {
        // Get all enabled rules, ordered by priority
        List<Rule> rules = ruleRepository.findByRuleSetIdAndEnabledOrderByPriorityDesc(
            ruleSetId, true
        );
        
        Map<String, Object> outputData = new HashMap<>(inputData);
        
        for (Rule rule : rules) {
            long startTime = System.currentTimeMillis();
            
            // Evaluate conditions
            boolean matched = evaluateConditions(rule.getConditions(), inputData);
            
            if (matched) {
                // Execute actions
                executeActions(rule.getActions(), outputData);
                
                // Log execution
                long executionTime = System.currentTimeMillis() - startTime;
                logExecution(ruleSetId, rule.getId(), workflowInstanceId, 
                    inputData, outputData, true, executionTime);
                
                // Stop after first match (unless you want to evaluate all)
                break;
            }
        }
        
        return outputData;
    }
    
    /**
     * Evaluate conditions for a single rule
     */
    private boolean evaluateConditions(
        JsonNode conditionsJson,
        Map<String, Object> data
    ) {
        List<Condition> conditions = parseConditions(conditionsJson);
        String logic = conditionsJson.get("conditionLogic").asText("AND");
        
        if ("AND".equals(logic)) {
            return conditions.stream().allMatch(c -> evaluateCondition(c, data));
        } else {
            return conditions.stream().anyMatch(c -> evaluateCondition(c, data));
        }
    }
    
    /**
     * Evaluate a single condition
     */
    private boolean evaluateCondition(Condition condition, Map<String, Object> data) {
        Object fieldValue = data.get(condition.getField());
        Object conditionValue = condition.getValue();
        
        switch (condition.getOperator()) {
            case EQUALS:
                return Objects.equals(fieldValue, conditionValue);
            
            case NOT_EQUALS:
                return !Objects.equals(fieldValue, conditionValue);
            
            case GREATER_THAN:
                return compareNumbers(fieldValue, conditionValue) > 0;
            
            case GREATER_THAN_OR_EQUAL:
                return compareNumbers(fieldValue, conditionValue) >= 0;
            
            case LESS_THAN:
                return compareNumbers(fieldValue, conditionValue) < 0;
            
            case LESS_THAN_OR_EQUAL:
                return compareNumbers(fieldValue, conditionValue) <= 0;
            
            case CONTAINS:
                return fieldValue != null && 
                    fieldValue.toString().contains(conditionValue.toString());
            
            case STARTS_WITH:
                return fieldValue != null && 
                    fieldValue.toString().startsWith(conditionValue.toString());
            
            case IN:
                return conditionValue instanceof List && 
                    ((List<?>) conditionValue).contains(fieldValue);
            
            case IS_NULL:
                return fieldValue == null;
            
            case IS_NOT_NULL:
                return fieldValue != null;
            
            default:
                throw new IllegalArgumentException("Unknown operator: " + condition.getOperator());
        }
    }
    
    /**
     * Execute actions when rule matches
     */
    private void executeActions(JsonNode actionsJson, Map<String, Object> outputData) {
        List<Action> actions = parseActions(actionsJson);
        
        for (Action action : actions) {
            switch (action.getType()) {
                case SET_VARIABLE:
                    outputData.put(action.getVariable(), action.getValue());
                    break;
                
                case ROUTE_TO:
                    outputData.put("_routeToNode", action.getTargetNode());
                    break;
                
                case LOG_MESSAGE:
                    logger.info("Rule action: {}", action.getMessage());
                    break;
                
                // Add more action types as needed
            }
        }
    }
    
    /**
     * Compare two numbers
     */
    private int compareNumbers(Object a, Object b) {
        double aNum = ((Number) a).doubleValue();
        double bNum = ((Number) b).doubleValue();
        return Double.compare(aNum, bNum);
    }
}
```

---

## 🔌 Flowable Integration

```java
@Component("rulesEngineDelegate")
public class RulesEngineDelegate implements JavaDelegate {
    
    @Autowired
    private RulesEngineService rulesEngine;
    
    @Override
    public void execute(DelegateExecution execution) {
        // Get rule set ID from node configuration
        String ruleSetId = (String) execution.getVariable("ruleSetId");
        
        // Collect input variables
        Map<String, Object> inputData = new HashMap<>();
        execution.getVariables().forEach((key, value) -> {
            if (!key.startsWith("_")) {  // Skip internal variables
                inputData.put(key, value);
            }
        });
        
        // Evaluate rules
        Map<String, Object> outputData = rulesEngine.evaluateRuleSet(
            UUID.fromString(ruleSetId),
            inputData,
            execution.getProcessInstanceId()
        );
        
        // Set output variables
        outputData.forEach(execution::setVariable);
        
        logger.info("Rules evaluated for process {}: {} -> {}",
            execution.getProcessInstanceId(), inputData, outputData);
    }
}
```

---

## 📱 React Components

### RulesEngineConfig Component

```typescript
// RulesEngineConfig.tsx
interface Rule {
  id: string;
  name: string;
  priority: number;
  conditions: Condition[];
  conditionLogic: 'AND' | 'OR';
  actions: Action[];
  enabled: boolean;
}

interface Condition {
  field: string;
  operator: RuleOperator;
  value: any;
  type: 'string' | 'number' | 'boolean';
}

interface Action {
  type: ActionType;
  variable?: string;
  value?: any;
  targetNode?: string;
}

export function RulesEngineConfig({ nodeId, config, onUpdate }: Props) {
  const [ruleSetId, setRuleSetId] = useState(config?.ruleSetId);
  const [rules, setRules] = useState<Rule[]>([]);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  // Load rules when rule set changes
  useEffect(() => {
    if (ruleSetId) {
      fetchRules(ruleSetId).then(setRules);
    }
  }, [ruleSetId]);
  
  return (
    <div className="space-y-4">
      {/* Rule Set Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rule Set
        </label>
        <select
          value={ruleSetId || ''}
          onChange={(e) => {
            setRuleSetId(e.target.value);
            onUpdate({ ruleSetId: e.target.value });
          }}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select a rule set...</option>
          {ruleSets.map(rs => (
            <option key={rs.id} value={rs.id}>{rs.name}</option>
          ))}
        </select>
      </div>
      
      {/* Rules List */}
      {rules.length > 0 && (
        <div className="border rounded p-4">
          <h4 className="font-medium mb-2">Rules (Priority Order)</h4>
          {rules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={() => setEditingRule(rule)}
            />
          ))}
        </div>
      )}
      
      {/* Rule Editor Modal */}
      {editingRule && (
        <RuleEditorModal
          rule={editingRule}
          onSave={(updated) => {
            // Save rule
            setEditingRule(null);
          }}
          onClose={() => setEditingRule(null)}
        />
      )}
    </div>
  );
}
```

---

## 📊 Performance Optimization

### Caching Strategy

```java
@Service
public class RulesEngineService {
    
    @Cacheable(value = "ruleSets", key = "#ruleSetId")
    public List<Rule> getRules(UUID ruleSetId) {
        return ruleRepository.findByRuleSetIdAndEnabledOrderByPriorityDesc(
            ruleSetId, true
        );
    }
    
    @CacheEvict(value = "ruleSets", key = "#ruleSetId")
    public void invalidateCache(UUID ruleSetId) {
        // Called when rules are updated
    }
}
```

### Database Indexing

```sql
-- Optimize rule lookups
CREATE INDEX idx_rules_rule_set_priority 
ON rules(rule_set_id, priority DESC, enabled) 
WHERE enabled = true;

-- Optimize audit queries
CREATE INDEX idx_rule_executions_workflow_time 
ON rule_executions(workflow_instance_id, executed_at DESC);
```

---

## 🎯 Summary

**This approach gives you:**

✅ **Simple**: No Drools complexity
✅ **Visual**: Full UI for rule management
✅ **Flexible**: Excel import/export
✅ **Fast**: PostgreSQL JSON queries
✅ **Auditable**: Complete execution history
✅ **Maintainable**: Pure Java + SQL
✅ **Scalable**: Caching + indexing

**Next Steps:**
1. Implement database schema
2. Build Visual Rule Builder UI
3. Create Excel import/export
4. Integrate with Flowable
5. Add audit dashboard

Ready to implement? 🚀
