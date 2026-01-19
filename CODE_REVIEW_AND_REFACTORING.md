# SnapFlow Code Review & Refactoring Plan

**Date:** 2026-01-19  
**Reviewer:** AI Code Assistant  
**Status:** 🔴 **URGENT - Refactoring Needed**

---

## Executive Summary

The SnapFlow application has grown organically and now contains several **critical technical debt issues** that will become increasingly difficult to manage. The most pressing issue is the **PropertiesSidebar.tsx** file (562 lines, 46KB), which violates the Single Responsibility Principle and will become unmaintainable as features grow.

### Overall Code Health: 6/10

**Strengths:**
- ✅ Good separation between frontend and backend
- ✅ Proper use of TypeScript and type safety
- ✅ Clean controller structure in backend
- ✅ Good use of React hooks and state management (Zustand)

**Critical Issues:**
- 🔴 **PropertiesSidebar.tsx is a monolithic component (562 lines)**
- 🟡 Repeated configuration logic across node types
- 🟡 Hardcoded constants scattered across files
- 🟡 Missing service layer abstraction for API calls
- 🟡 No proper error handling patterns

---

## 🔴 CRITICAL: PropertiesSidebar.tsx Refactoring

### Current State
- **562 lines** of tightly coupled JSX
- Handles 8+ different node types with conditional rendering
- Mixes UI, business logic, and data fetching
- Difficult to test, extend, or debug

### Problems
1. **Violation of Single Responsibility**: Handles general settings, configuration, data management, user lookup, form selection, service task config, AI agent config, email config, timer config, rules engine config, and edge configuration
2. **Cognitive Overload**: Developers must understand the entire file to make changes
3. **Testing Nightmare**: Cannot unit test individual sections
4. **Merge Conflicts**: Multiple developers will constantly conflict
5. **Performance**: Re-renders entire component even for small changes

### Proposed Refactoring

#### New Structure
```
src/components/properties/
├── PropertiesSidebar.tsx          # Main container (50 lines)
├── PropertiesHeader.tsx           # Header with close button (30 lines)
├── PropertiesTabs.tsx             # Tab navigation (40 lines)
├── PropertiesFooter.tsx           # Delete actions (30 lines)
│
├── tabs/
│   ├── GeneralTab.tsx             # General settings (80 lines)
│   ├── ConfigTab.tsx              # Configuration router (60 lines)
│   └── DataTab.tsx                # Data & forms router (60 lines)
│
├── config/
│   ├── AIAgentConfig.tsx          # AI agent settings (100 lines)
│   ├── EmailConfig.tsx            # Email settings (80 lines)
│   ├── TimerConfig.tsx            # Timer settings (60 lines)
│   ├── UserTaskConfig.tsx         # User task settings (100 lines)
│   ├── ServiceTaskConfig.tsx      # Service task settings (120 lines)
│   ├── RulesEngineConfig.tsx      # Already exists, good!
│   └── DefaultConfig.tsx          # Fallback (30 lines)
│
├── data/
│   ├── UserTaskData.tsx           # User assignment & forms (150 lines)
│   ├── ServiceTaskData.tsx        # Service task data (80 lines)
│   └── EdgeData.tsx               # Edge configuration (60 lines)
│
├── shared/
│   ├── UserLookup.tsx             # Reusable user selector (80 lines)
│   ├── FormSelector.tsx           # Reusable form selector (60 lines)
│   ├── ConditionalExecution.tsx   # Reusable condition editor (80 lines)
│   └── InfoBox.tsx                # Reusable info boxes (30 lines)
│
└── hooks/
    ├── useNodeConfig.ts           # Custom hook for node updates
    ├── useForms.ts                # Custom hook for form fetching
    └── useUsers.ts                # Custom hook for user management
```

#### Benefits
- ✅ Each file < 150 lines (manageable)
- ✅ Easy to test individual components
- ✅ Reusable components (UserLookup, FormSelector)
- ✅ Clear separation of concerns
- ✅ Easy to add new node types
- ✅ Better performance (granular re-renders)
- ✅ Easier code reviews
- ✅ Reduced merge conflicts

---

## 🟡 Frontend Issues

### 1. Hardcoded Constants
**Location:** `PropertiesSidebar.tsx` lines 5-13

```typescript
// ❌ BAD: Hardcoded in component
const AVAILABLE_USERS = [
    { id: 'jdoe', name: 'John Doe', email: 'john@example.com' },
    // ...
];
```

**Solution:**
```typescript
// ✅ GOOD: Centralized constants
src/constants/
├── users.ts
├── nodeTypes.ts
├── formFields.ts
└── apiEndpoints.ts
```

### 2. API Calls in Components
**Location:** Multiple components

```typescript
// ❌ BAD: Direct fetch in component
fetch('http://localhost:8081/api/forms')
    .then(res => res.json())
    .then(data => setAvailableForms(data))
```

**Solution:**
```typescript
// ✅ GOOD: Service layer
src/services/
├── api.ts              # Base API client
├── formService.ts      # Form-related API calls
├── workflowService.ts  # Workflow API calls
└── userService.ts      # User API calls

// Usage
import { formService } from '@/services/formService';
const forms = await formService.getAll();
```

### 3. Missing Error Boundaries
**Issue:** No error boundaries to catch component errors

**Solution:**
```typescript
src/components/ErrorBoundary.tsx
src/components/ErrorFallback.tsx
```

### 4. No Loading States
**Issue:** No consistent loading UI patterns

**Solution:**
```typescript
src/components/ui/
├── LoadingSpinner.tsx
├── Skeleton.tsx
└── LoadingOverlay.tsx
```

### 5. Repeated Styling Patterns
**Issue:** Tailwind classes repeated everywhere

**Solution:**
```typescript
// Create reusable styled components
src/components/ui/
├── Input.tsx
├── Select.tsx
├── Textarea.tsx
├── Button.tsx
└── Label.tsx
```

---

## 🟡 Backend Issues

### 1. Controller Responsibilities
**Current:** Controllers are clean ✅

**Recommendation:** Keep controllers thin, move business logic to services

### 2. Missing DTOs (Data Transfer Objects)
**Issue:** Using `Map<String, Object>` for API payloads

```java
// ❌ BAD: Untyped
@PostMapping("/save")
public ResponseEntity<?> saveWorkflow(@RequestBody Map<String, Object> payload)
```

**Solution:**
```java
// ✅ GOOD: Typed DTOs
src/main/java/com/snapflow/engine/dto/
├── WorkflowSaveRequest.java
├── WorkflowResponse.java
├── FormCreateRequest.java
└── TaskAssignmentRequest.java

@PostMapping("/save")
public ResponseEntity<WorkflowResponse> saveWorkflow(@RequestBody @Valid WorkflowSaveRequest request)
```

### 3. Exception Handling
**Issue:** Generic try-catch blocks

```java
// ❌ BAD
catch (Exception e) {
    e.printStackTrace();
    return ResponseEntity.status(500).body("Error: " + e.getMessage());
}
```

**Solution:**
```java
// ✅ GOOD: Global exception handler
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(WorkflowNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleWorkflowNotFound(WorkflowNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
```

### 4. Validation
**Issue:** Manual validation in controllers

**Solution:**
```java
// Use Bean Validation
public class WorkflowSaveRequest {
    @NotBlank(message = "Workflow name is required")
    private String name;
    
    @NotNull(message = "JSON definition is required")
    private Map<String, Object> json;
    
    @NotBlank(message = "XML definition is required")
    private String xml;
}
```

---

## 📊 Refactoring Priority Matrix

| Issue | Impact | Effort | Priority | Timeline |
|-------|--------|--------|----------|----------|
| PropertiesSidebar refactoring | 🔴 High | High | **P0** | This week |
| Create service layer (frontend) | 🟡 Medium | Medium | **P1** | Next week |
| Add DTOs (backend) | 🟡 Medium | Low | **P1** | Next week |
| Extract constants | 🟢 Low | Low | **P2** | 2 weeks |
| Add error boundaries | 🟡 Medium | Low | **P2** | 2 weeks |
| Global exception handler | 🟡 Medium | Low | **P2** | 2 weeks |
| Create UI component library | 🟢 Low | High | **P3** | 1 month |

---

## 🎯 Immediate Action Items

### Week 1: Critical Refactoring
1. **Refactor PropertiesSidebar.tsx**
   - Extract tab components
   - Extract config components
   - Extract data components
   - Create shared components
   - Create custom hooks

2. **Create Service Layer**
   - `src/services/api.ts` - Base API client
   - `src/services/formService.ts`
   - `src/services/workflowService.ts`

3. **Extract Constants**
   - `src/constants/users.ts`
   - `src/constants/apiEndpoints.ts`

### Week 2: Backend Improvements
1. **Create DTOs**
   - WorkflowSaveRequest
   - WorkflowResponse
   - FormCreateRequest

2. **Add Global Exception Handler**
   - Create custom exceptions
   - Implement @ControllerAdvice

3. **Add Validation**
   - Add @Valid annotations
   - Create custom validators

---

## 📝 Code Standards Going Forward

### Frontend
1. **Component Size:** Max 200 lines per component
2. **File Organization:** Group by feature, not by type
3. **API Calls:** Always use service layer
4. **Constants:** Never hardcode, use constants files
5. **Styling:** Create reusable UI components
6. **State:** Use custom hooks for complex logic

### Backend
1. **Controllers:** Thin controllers, delegate to services
2. **DTOs:** Always use typed DTOs for API contracts
3. **Validation:** Use Bean Validation annotations
4. **Exceptions:** Use custom exceptions with global handler
5. **Services:** Business logic lives here
6. **Repositories:** Data access only

---

## 🔍 Technical Debt Metrics

### Current State
- **Largest File:** PropertiesSidebar.tsx (562 lines) 🔴
- **Average Component Size:** ~150 lines 🟡
- **Code Duplication:** ~15% 🟡
- **Test Coverage:** Unknown (likely low) 🔴
- **Type Safety:** Good (TypeScript + Java) ✅

### Target State (3 months)
- **Largest File:** < 200 lines ✅
- **Average Component Size:** < 100 lines ✅
- **Code Duplication:** < 5% ✅
- **Test Coverage:** > 70% ✅
- **Type Safety:** Excellent ✅

---

## 🚀 Next Steps

1. **Review this document** with the team
2. **Prioritize** which refactoring to tackle first
3. **Create tickets** for each refactoring task
4. **Set up code review guidelines** to prevent regression
5. **Establish coding standards** document
6. **Add linting rules** to enforce standards

---

## 📚 Recommended Reading

- [React Component Patterns](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring: Improving the Design of Existing Code](https://martinfowler.com/books/refactoring.html)
- [Spring Boot Best Practices](https://www.baeldung.com/spring-boot-best-practices)

---

## ✅ Conclusion

The codebase is **functional but needs immediate attention** to prevent technical debt from spiraling out of control. The **PropertiesSidebar.tsx** file is the most critical issue and should be refactored **this week**.

**Recommendation:** Allocate 2-3 days for the PropertiesSidebar refactoring. This is an investment that will pay dividends in development velocity, code quality, and team happiness.

**Remember:** "Weeks of coding can save you hours of planning." - Unknown

---

*Generated: 2026-01-19*  
*Next Review: 2026-02-19*
