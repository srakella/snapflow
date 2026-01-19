# SnapFlow - Rules Engine, Flexible Routing & SSO Demo Setup

## 🎯 Overview

This document covers three critical enterprise features:
1. **Business Rules Engine** - Flexible, auditable decision-making
2. **Dynamic Workflow Routing** - Go to any node based on conditions
3. **SSO Demo Environment** - 100 sample users across 15 groups

---

## 🔧 1. Business Rules Engine Integration

### Philosophy: "2026 Flexibility with Enterprise Audit"

**Key Principles:**
- ✅ Deviate from strict BPMN when it adds value
- ✅ Maintain complete audit trail
- ✅ Support complex business logic
- ✅ Enable non-technical users to manage rules

---

### Rules Engine Architecture

**Recommendation: Use Drools (Java) or Easy-Rules**

**Why Drools:**
- Industry standard for Java/Spring
- Declarative rule syntax (DRL)
- Complex event processing
- Excellent audit capabilities
- Integrates with Flowable

**Alternative: Easy-Rules (Simpler)**
- Lightweight, annotation-based
- Perfect for straightforward rules
- Less overhead than Drools

---

### Rules Engine Node

**What it does:**
- Evaluates business rules against workflow data
- Returns decisions/outcomes
- Routes to different paths based on results
- Logs all rule evaluations for audit

**Example Use Cases:**
```
Loan Approval:
- IF credit_score > 700 AND income > 50000 → Auto-approve
- IF credit_score > 650 AND debt_ratio < 0.4 → Manual review
- ELSE → Reject

Discount Calculation:
- IF customer_tier == "Gold" AND order_value > 1000 → 15% discount
- IF customer_tier == "Silver" → 10% discount
- ELSE → 5% discount

Routing Logic:
- IF region == "EMEA" → Route to EMEA team
- IF amount > 10000 → Route to senior approver
- ELSE → Route to standard queue
```

---

### Rules Engine Configuration UI

**Properties Panel:**
```
┌─────────────────────────────────────────────────┐
│ 🔧 Rules Engine Configuration                   │
├─────────────────────────────────────────────────┤
│ Rule Set Name                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Loan Approval Rules                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Rule Definition Method                           │
│ ○ Visual Rule Builder                           │
│ ● DRL Script                                     │
│ ○ Decision Table (Excel)                        │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ rule "Auto Approve High Credit"             │ │
│ │ when                                        │ │
│ │   $loan: LoanApplication(                   │ │
│ │     creditScore > 700,                      │ │
│ │     income > 50000                          │ │
│ │   )                                         │ │
│ │ then                                        │ │
│ │   $loan.setDecision("APPROVED");            │ │
│ │   $loan.setReason("Auto-approved");         │ │
│ │ end                                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Input Variables                                  │
│ • creditScore (number)                          │
│ • income (number)                               │
│ • debtRatio (number)                            │
│                                                  │
│ Output Variable                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ loanDecision                                │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ [Test Rules] [Validate] [Save]                  │
└─────────────────────────────────────────────────┘
```

---

### Visual Rule Builder (No-Code Option)

**For non-technical users:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Visual Rule Builder                          │
├─────────────────────────────────────────────────┤
│ Rule 1: Auto Approve                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ IF                                          │ │
│ │   [creditScore] [>] [700]                   │ │
│ │   AND                                       │ │
│ │   [income] [>] [50000]                      │ │
│ │ THEN                                        │ │
│ │   Set [decision] to [APPROVED]              │ │
│ │   Set [reason] to [Auto-approved]           │ │
│ └─────────────────────────────────────────────┘ │
│ [+ Add Condition] [+ Add Action]                │
│                                                  │
│ Rule 2: Manual Review                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ IF                                          │ │
│ │   [creditScore] [>] [650]                   │ │
│ │   AND                                       │ │
│ │   [debtRatio] [<] [0.4]                     │ │
│ │ THEN                                        │ │
│ │   Set [decision] to [REVIEW]                │ │
│ │   Assign to [senior_approver]               │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ [+ Add Rule]                                    │
└─────────────────────────────────────────────────┘
```

---

### Decision Table (Excel Import)

**For business analysts:**
```
| Credit Score | Income  | Debt Ratio | Decision | Reason           |
|--------------|---------|------------|----------|------------------|
| > 700        | > 50000 | *          | APPROVED | Auto-approved    |
| > 650        | *       | < 0.4      | REVIEW   | Manual review    |
| *            | *       | *          | REJECTED | Does not qualify |
```

Upload Excel → Converts to Drools rules automatically

---

### Backend Integration

**Drools Service:**
```java
@Service
public class RulesEngineService {
    
    private KieContainer kieContainer;
    
    @PostConstruct
    public void init() {
        KieServices ks = KieServices.Factory.get();
        kieContainer = ks.getKieClasspathContainer();
    }
    
    public Map<String, Object> evaluateRules(
        String ruleSetName, 
        Map<String, Object> facts
    ) {
        KieSession kSession = kieContainer.newKieSession(ruleSetName);
        
        // Insert facts
        facts.forEach((key, value) -> kSession.insert(value));
        
        // Fire rules
        kSession.fireAllRules();
        
        // Collect results
        Map<String, Object> results = new HashMap<>();
        kSession.getObjects().forEach(obj -> {
            // Extract results from modified facts
        });
        
        // Audit log
        auditService.logRuleExecution(ruleSetName, facts, results);
        
        kSession.dispose();
        return results;
    }
}
```

**Flowable Delegate:**
```java
@Component("rulesEngineDelegate")
public class RulesEngineDelegate implements JavaDelegate {
    
    @Autowired
    private RulesEngineService rulesEngine;
    
    @Override
    public void execute(DelegateExecution execution) {
        String ruleSetName = (String) execution.getVariable("ruleSetName");
        
        // Get input variables
        Map<String, Object> facts = new HashMap<>();
        facts.put("creditScore", execution.getVariable("creditScore"));
        facts.put("income", execution.getVariable("income"));
        
        // Evaluate rules
        Map<String, Object> results = rulesEngine.evaluateRules(ruleSetName, facts);
        
        // Set output variables
        results.forEach(execution::setVariable);
    }
}
```

---

## 🔀 2. Dynamic Workflow Routing (Flexible Navigation)

### Beyond Traditional BPMN Gateways

**Problem with strict BPMN:**
- Gateways only support binary/simple decisions
- Hard to express complex routing logic
- Difficult to route to arbitrary nodes

**SnapFlow Solution: Dynamic Routing**

---

### Dynamic Router Node

**What it does:**
- Evaluates complex conditions
- Routes to ANY node in the workflow (not just next)
- Supports multiple output paths
- Maintains full audit trail

**Configuration:**
```
┌─────────────────────────────────────────────────┐
│ 🔀 Dynamic Router Configuration                 │
├─────────────────────────────────────────────────┤
│ Routing Strategy                                 │
│ ● Conditional (if-then-else)                    │
│ ○ Rules-based                                    │
│ ○ Script-based (Groovy/JavaScript)              │
│                                                  │
│ Routes                                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ Route 1: High Priority                      │ │
│ │ Condition: priority == "HIGH"               │ │
│ │ Target Node: [Senior Approver Task ▼]       │ │
│ │ [Edit] [Delete]                             │ │
│ │                                             │ │
│ │ Route 2: EMEA Region                        │ │
│ │ Condition: region == "EMEA"                 │ │
│ │ Target Node: [EMEA Processing ▼]            │ │
│ │ [Edit] [Delete]                             │ │
│ │                                             │ │
│ │ Route 3: Default                            │ │
│ │ Condition: (default)                        │ │
│ │ Target Node: [Standard Queue ▼]             │ │
│ │ [Edit] [Delete]                             │ │
│ └─────────────────────────────────────────────┘ │
│ [+ Add Route]                                   │
└─────────────────────────────────────────────────┘
```

---

### Implementation: Dynamic Edges

**Data Model:**
```typescript
interface DynamicRoute {
  id: string;
  condition: string;  // JavaScript expression
  targetNodeId: string;
  priority: number;  // Evaluation order
  description: string;
}

interface RouterNode extends Node {
  type: 'dynamicRouter';
  data: {
    label: string;
    routes: DynamicRoute[];
    defaultRoute?: string;  // Fallback node
  };
}
```

**Backend Execution:**
```java
@Component("dynamicRouterDelegate")
public class DynamicRouterDelegate implements JavaDelegate {
    
    @Override
    public void execute(DelegateExecution execution) {
        List<DynamicRoute> routes = getRoutes(execution);
        
        // Evaluate routes in priority order
        for (DynamicRoute route : routes) {
            if (evaluateCondition(route.getCondition(), execution)) {
                // Set the target node for routing
                execution.setVariable("nextNode", route.getTargetNodeId());
                
                // Audit log
                auditService.logRouting(execution.getId(), route);
                return;
            }
        }
        
        // Default route
        execution.setVariable("nextNode", getDefaultRoute(execution));
    }
    
    private boolean evaluateCondition(String condition, DelegateExecution execution) {
        // Use JavaScript engine or expression evaluator
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("javascript");
        
        // Add variables to context
        execution.getVariables().forEach(engine::put);
        
        try {
            return (Boolean) engine.eval(condition);
        } catch (Exception e) {
            logger.error("Error evaluating condition: " + condition, e);
            return false;
        }
    }
}
```

---

### Visual Route Editor

**UI for defining routes:**
```
┌─────────────────────────────────────────────────┐
│ Edit Route: High Priority                       │
├─────────────────────────────────────────────────┤
│ Condition Builder                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ [priority] [equals] [HIGH]                  │ │
│ │ AND                                         │ │
│ │ [amount] [greater than] [10000]             │ │
│ └─────────────────────────────────────────────┘ │
│ [+ Add Condition]                               │
│                                                  │
│ Or use JavaScript:                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ priority === "HIGH" && amount > 10000       │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Target Node                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Senior Approver Task                    ▼  │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ [Test Condition] [Save] [Cancel]                │
└─────────────────────────────────────────────────┘
```

---

## 👥 3. SSO Demo Environment Setup

### Objective: Demonstrate Enterprise SSO Integration

**Requirements:**
- 100 sample users
- 15 groups/roles
- Simulate Azure AD / LDAP
- Show role-based access control
- Demonstrate group-based routing

---

### Recommended Approach: Keycloak

**Why Keycloak:**
- ✅ Open-source, enterprise-grade
- ✅ Supports SAML, OAuth 2.0, OpenID Connect
- ✅ LDAP/AD integration
- ✅ User federation
- ✅ Role-based access control (RBAC)
- ✅ Easy to demo

**Alternative: Auth0** (if you want cloud-hosted)

---

### Keycloak Setup

**1. Install Keycloak:**
```bash
# Using Docker
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

**2. Create Realm:**
- Name: `snapflow`
- Display name: "SnapFlow Enterprise"

**3. Configure Client:**
```json
{
  "clientId": "snapflow-designer",
  "rootUrl": "http://localhost:3000",
  "redirectUris": ["http://localhost:3000/*"],
  "webOrigins": ["+"],
  "protocol": "openid-connect",
  "publicClient": true
}
```

---

### Sample User & Group Structure

**15 Groups (Departments/Roles):**
```
1. Executives (5 users)
2. Finance Team (10 users)
3. HR Department (8 users)
4. IT Operations (12 users)
5. Sales Team (15 users)
6. Marketing (10 users)
7. Customer Support (15 users)
8. Legal Team (5 users)
9. Procurement (8 users)
10. Regional - North America (10 users)
11. Regional - EMEA (10 users)
12. Regional - APAC (8 users)
13. Approvers - Level 1 (15 users)
14. Approvers - Level 2 (10 users)
15. System Administrators (4 users)
```

**Total: 145 users (allowing for overlap)**

---

### User Generation Script

**Keycloak Admin API:**
```javascript
// generate-users.js
const KcAdminClient = require('@keycloak/keycloak-admin-client').default;

const kcAdminClient = new KcAdminClient({
  baseUrl: 'http://localhost:8080',
  realmName: 'snapflow',
});

await kcAdminClient.auth({
  username: 'admin',
  password: 'admin',
  grantType: 'password',
  clientId: 'admin-cli',
});

// Define groups
const groups = [
  { name: 'Executives', count: 5 },
  { name: 'Finance', count: 10 },
  { name: 'HR', count: 8 },
  // ... etc
];

// Create groups
for (const group of groups) {
  await kcAdminClient.groups.create({
    name: group.name,
  });
}

// Generate users
const departments = ['Finance', 'HR', 'IT', 'Sales', 'Marketing'];
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];

for (let i = 1; i <= 100; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const dept = departments[Math.floor(Math.random() * departments.length)];
  
  const user = {
    username: `user${i}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@snapflow.demo`,
    firstName: firstName,
    lastName: lastName,
    enabled: true,
    emailVerified: true,
    attributes: {
      department: [dept],
      employeeId: [`EMP${String(i).padStart(5, '0')}`],
    },
    credentials: [{
      type: 'password',
      value: 'Demo123!',
      temporary: false,
    }],
  };
  
  const createdUser = await kcAdminClient.users.create(user);
  
  // Assign to groups
  const groupId = await getGroupId(dept);
  await kcAdminClient.users.addToGroup({
    id: createdUser.id,
    groupId: groupId,
  });
}

console.log('Created 100 users across 15 groups!');
```

---

### Sample User Credentials

**For Demo:**
```
Username: user1 - user100
Password: Demo123!

Special Accounts:
- admin@snapflow.demo / Admin123! (System Admin)
- ceo@snapflow.demo / Demo123! (Executive)
- cfo@snapflow.demo / Demo123! (Finance, Approver L2)
- hr.manager@snapflow.demo / Demo123! (HR, Approver L1)
```

---

### Integration with SnapFlow

**Spring Security + Keycloak:**
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.keycloak</groupId>
    <artifactId>keycloak-spring-boot-starter</artifactId>
    <version>23.0.0</version>
</dependency>
```

**application.yml:**
```yaml
keycloak:
  realm: snapflow
  auth-server-url: http://localhost:8080
  ssl-required: external
  resource: snapflow-designer
  public-client: true
  confidential-port: 0
  
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: snapflow-designer
            authorization-grant-type: authorization_code
            scope: openid, profile, email
        provider:
          keycloak:
            issuer-uri: http://localhost:8080/realms/snapflow
```

**Security Config:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/workflows/**").hasAnyRole("USER", "APPROVER")
                .anyRequest().authenticated()
            )
            .oauth2Login(Customizer.withDefaults())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        
        return http.build();
    }
}
```

---

### Group-Based Workflow Routing

**Example: Route based on user's group:**
```java
@Component("groupBasedRouter")
public class GroupBasedRouter implements JavaDelegate {
    
    @Override
    public void execute(DelegateExecution execution) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // Get user's groups from JWT
        List<String> groups = extractGroups(auth);
        
        // Route based on group
        if (groups.contains("Executives")) {
            execution.setVariable("assignee", "executive-approver");
        } else if (groups.contains("Finance")) {
            execution.setVariable("assignee", "finance-team");
        } else if (groups.contains("Regional-EMEA")) {
            execution.setVariable("assignee", "emea-processor");
        }
        
        // Audit
        auditService.logGroupBasedRouting(execution.getId(), groups);
    }
}
```

---

### Demo Scenarios

**1. Role-Based Access:**
- Login as `user1` (Finance) → See only Finance workflows
- Login as `cfo@snapflow.demo` → See all workflows + approval queue

**2. Group-Based Routing:**
- Submit workflow as Finance user → Routes to Finance approver
- Submit as EMEA user → Routes to EMEA regional team

**3. Hierarchical Approval:**
- Amount < $1000 → Level 1 Approver
- Amount > $1000 → Level 2 Approver
- Amount > $10000 → Executive approval

**4. Multi-Group Users:**
- User in both "Finance" and "Approver-L2" → Can approve finance workflows

---

## 📊 Audit Trail for All Features

**Every action is logged:**
```java
@Entity
public class AuditLog {
    private String workflowId;
    private String nodeId;
    private String nodeType;  // rulesEngine, dynamicRouter, etc.
    private String userId;
    private Map<String, Object> inputData;
    private Map<String, Object> outputData;
    private String decision;
    private String reason;
    private LocalDateTime timestamp;
}
```

**Audit UI:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Audit Trail - Loan Application #12345        │
├─────────────────────────────────────────────────┤
│ 2026-01-18 21:00:00                             │
│ Rules Engine: Loan Approval Rules               │
│ Input: creditScore=720, income=60000            │
│ Output: decision=APPROVED, reason=Auto-approved │
│ User: system                                     │
│                                                  │
│ 2026-01-18 21:00:05                             │
│ Dynamic Router: Priority Routing                │
│ Condition: priority === "HIGH"                   │
│ Routed to: Senior Approver Task                 │
│ User: john.smith@snapflow.demo                   │
│                                                  │
│ 2026-01-18 21:05:30                             │
│ User Task: Senior Approval                       │
│ Assigned to: Approvers-L2 group                 │
│ Completed by: cfo@snapflow.demo                  │
│ Decision: Approved                               │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Priority

**Week 1-2: Rules Engine**
1. Create RulesEngineNode component
2. Integrate Drools/Easy-Rules
3. Build visual rule builder
4. Add audit logging

**Week 3-4: Dynamic Routing**
1. Create DynamicRouterNode
2. Implement condition evaluator
3. Build route configuration UI
4. Test complex routing scenarios

**Week 5-6: SSO Demo**
1. Set up Keycloak
2. Generate 100 sample users
3. Configure 15 groups
4. Integrate with Spring Security
5. Build demo scenarios

---

This gives you **enterprise-grade flexibility** while maintaining **complete audit trails** - exactly what modern workflow systems need in 2026! 🎯
