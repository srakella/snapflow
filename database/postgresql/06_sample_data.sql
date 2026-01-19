-- SnapFlow Sample Data
-- Demo users, workflows, and configurations

-- ============================================
-- SAMPLE USERS
-- ============================================

INSERT INTO users (email, username, full_name, role) VALUES
('admin@snapflow.demo', 'admin', 'System Administrator', 'admin'),
('john.doe@snapflow.demo', 'john.doe', 'John Doe', 'user'),
('jane.smith@snapflow.demo', 'jane.smith', 'Jane Smith', 'user'),
('mike.johnson@snapflow.demo', 'mike.johnson', 'Mike Johnson', 'user'),
('sarah.chen@snapflow.demo', 'sarah.chen', 'Sarah Chen', 'user');

-- ============================================
-- SAMPLE TEAMS
-- ============================================

INSERT INTO teams (name, description, owner_id) VALUES
(
    'Engineering',
    'Engineering team',
    (SELECT id FROM users WHERE email = 'admin@snapflow.demo')
),
(
    'Finance',
    'Finance team',
    (SELECT id FROM users WHERE email = 'john.doe@snapflow.demo')
);

-- Add team members
INSERT INTO team_members (team_id, user_id, role) VALUES
(
    (SELECT id FROM teams WHERE name = 'Engineering'),
    (SELECT id FROM users WHERE email = 'admin@snapflow.demo'),
    'owner'
),
(
    (SELECT id FROM teams WHERE name = 'Engineering'),
    (SELECT id FROM users WHERE email = 'jane.smith@snapflow.demo'),
    'member'
),
(
    (SELECT id FROM teams WHERE name = 'Finance'),
    (SELECT id FROM users WHERE email = 'john.doe@snapflow.demo'),
    'owner'
),
(
    (SELECT id FROM teams WHERE name = 'Finance'),
    (SELECT id FROM users WHERE email = 'sarah.chen@snapflow.demo'),
    'member'
);

-- ============================================
-- SAMPLE WORKFLOWS
-- ============================================

INSERT INTO workflows (name, description, category, owner_id, team_id, status) VALUES
(
    'Loan Approval Process',
    'Automated loan approval workflow with rules engine',
    'approval',
    (SELECT id FROM users WHERE email = 'john.doe@snapflow.demo'),
    (SELECT id FROM teams WHERE name = 'Finance'),
    'active'
),
(
    'Employee Onboarding',
    'New employee onboarding process',
    'hr',
    (SELECT id FROM users WHERE email = 'admin@snapflow.demo'),
    (SELECT id FROM teams WHERE name = 'Engineering'),
    'active'
),
(
    'Expense Approval',
    'Expense report approval workflow',
    'approval',
    (SELECT id FROM users WHERE email = 'sarah.chen@snapflow.demo'),
    (SELECT id FROM teams WHERE name = 'Finance'),
    'draft'
);

-- ============================================
-- SAMPLE WORKFLOW VERSIONS
-- ============================================

INSERT INTO workflow_versions (workflow_id, version, data, commit_message, created_by) VALUES
(
    (SELECT id FROM workflows WHERE name = 'Loan Approval Process'),
    1,
    '{
        "nodes": [
            {"id": "start-1", "type": "start", "position": {"x": 100, "y": 200}, "data": {"label": "Start"}},
            {"id": "form-1", "type": "userTask", "position": {"x": 300, "y": 200}, "data": {"label": "Loan Application", "config": {"formId": "loan-app-form"}}},
            {"id": "rules-1", "type": "rulesEngine", "position": {"x": 500, "y": 200}, "data": {"label": "Evaluate Rules", "config": {"ruleSetId": "loan-approval-rules"}}},
            {"id": "gateway-1", "type": "gateway", "position": {"x": 700, "y": 200}, "data": {"label": "Decision"}},
            {"id": "approved-1", "type": "userTask", "position": {"x": 900, "y": 100}, "data": {"label": "Notify Approval"}},
            {"id": "review-1", "type": "userTask", "position": {"x": 900, "y": 200}, "data": {"label": "Manual Review"}},
            {"id": "rejected-1", "type": "userTask", "position": {"x": 900, "y": 300}, "data": {"label": "Notify Rejection"}},
            {"id": "end-1", "type": "end", "position": {"x": 1100, "y": 200}, "data": {"label": "End"}}
        ],
        "edges": [
            {"id": "e1", "source": "start-1", "target": "form-1"},
            {"id": "e2", "source": "form-1", "target": "rules-1"},
            {"id": "e3", "source": "rules-1", "target": "gateway-1"},
            {"id": "e4", "source": "gateway-1", "target": "approved-1", "label": "Approved"},
            {"id": "e5", "source": "gateway-1", "target": "review-1", "label": "Review"},
            {"id": "e6", "source": "gateway-1", "target": "rejected-1", "label": "Rejected"},
            {"id": "e7", "source": "approved-1", "target": "end-1"},
            {"id": "e8", "source": "review-1", "target": "end-1"},
            {"id": "e9", "source": "rejected-1", "target": "end-1"}
        ]
    }'::jsonb,
    'Initial version',
    (SELECT id FROM users WHERE email = 'john.doe@snapflow.demo')
);

-- ============================================
-- SAMPLE RULE SETS (Additional)
-- ============================================

INSERT INTO rule_sets (name, description, status, category) VALUES
('Discount Calculation', 'Customer discount rules based on tier and order value', 'active', 'pricing'),
('Regional Routing', 'Route workflows based on customer region', 'draft', 'routing');

-- Discount rules
INSERT INTO rules (rule_set_id, name, priority, conditions, actions) VALUES
(
    (SELECT id FROM rule_sets WHERE name = 'Discount Calculation'),
    'Gold Tier - Large Order',
    100,
    '{
        "conditionLogic": "AND",
        "conditions": [
            {"field": "customerTier", "operator": "equals", "value": "GOLD", "type": "string"},
            {"field": "orderValue", "operator": "greaterThan", "value": 1000, "type": "number"}
        ]
    }'::jsonb,
    '{
        "actions": [
            {"type": "setVariable", "variable": "discountPercent", "value": 15},
            {"type": "setVariable", "variable": "discountReason", "value": "Gold tier + large order"}
        ]
    }'::jsonb
),
(
    (SELECT id FROM rule_sets WHERE name = 'Discount Calculation'),
    'Silver Tier',
    50,
    '{
        "conditionLogic": "AND",
        "conditions": [
            {"field": "customerTier", "operator": "equals", "value": "SILVER", "type": "string"}
        ]
    }'::jsonb,
    '{
        "actions": [
            {"type": "setVariable", "variable": "discountPercent", "value": 10}
        ]
    }'::jsonb
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Sample data loaded successfully!' AS status,
       (SELECT COUNT(*) FROM users) AS users_count,
       (SELECT COUNT(*) FROM teams) AS teams_count,
       (SELECT COUNT(*) FROM workflows) AS workflows_count,
       (SELECT COUNT(*) FROM rule_sets) AS rule_sets_count,
       (SELECT COUNT(*) FROM rules) AS rules_count;
