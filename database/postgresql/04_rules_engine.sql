-- SnapFlow Rules Engine Schema
-- Business rules engine with JSONB storage

-- ============================================
-- RULE SETS
-- ============================================

CREATE TABLE rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    category VARCHAR(100), -- loan_approval, discounts, routing, etc.
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rule_sets_status ON rule_sets(status);
CREATE INDEX idx_rule_sets_category ON rule_sets(category);
CREATE INDEX idx_rule_sets_team ON rule_sets(team_id);

-- ============================================
-- RULES
-- ============================================

CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_set_id UUID NOT NULL REFERENCES rule_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0, -- Higher priority = evaluated first
    conditions JSONB NOT NULL, -- Conditions with logic (AND/OR)
    actions JSONB NOT NULL, -- Actions to execute
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rules_rule_set_priority 
ON rules(rule_set_id, priority DESC, enabled) 
WHERE enabled = true;

-- GIN indexes for JSONB queries
CREATE INDEX idx_rules_conditions ON rules USING GIN (conditions);
CREATE INDEX idx_rules_actions ON rules USING GIN (actions);

-- ============================================
-- RULE EXECUTIONS (Audit Trail)
-- ============================================

CREATE TABLE rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_set_id UUID REFERENCES rule_sets(id),
    rule_id UUID REFERENCES rules(id),
    workflow_instance_id VARCHAR(255),
    node_id VARCHAR(255),
    input_data JSONB,
    output_data JSONB,
    matched BOOLEAN, -- Did this rule match?
    execution_time_ms INT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rule_executions_workflow 
ON rule_executions(workflow_instance_id, executed_at DESC);

CREATE INDEX idx_rule_executions_rule_set 
ON rule_executions(rule_set_id, executed_at DESC);

CREATE INDEX idx_rule_executions_executed_at 
ON rule_executions(executed_at DESC);

-- GIN indexes for JSONB audit queries
CREATE INDEX idx_rule_executions_input ON rule_executions USING GIN (input_data);
CREATE INDEX idx_rule_executions_output ON rule_executions USING GIN (output_data);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_rule_sets_updated_at BEFORE UPDATE ON rule_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample Rule Set: Loan Approval
INSERT INTO rule_sets (name, description, status, category) VALUES
('Loan Approval Rules', 'Automated loan approval decision rules', 'active', 'loan_approval');

-- Sample Rules
INSERT INTO rules (rule_set_id, name, priority, conditions, actions, description) VALUES
(
    (SELECT id FROM rule_sets WHERE name = 'Loan Approval Rules'),
    'Auto Approve - High Credit',
    100,
    '{
        "conditionLogic": "AND",
        "conditions": [
            {"field": "creditScore", "operator": "greaterThan", "value": 700, "type": "number"},
            {"field": "income", "operator": "greaterThan", "value": 50000, "type": "number"}
        ]
    }'::jsonb,
    '{
        "actions": [
            {"type": "setVariable", "variable": "decision", "value": "APPROVED"},
            {"type": "setVariable", "variable": "reason", "value": "Auto-approved: High credit score and income"}
        ]
    }'::jsonb,
    'Automatically approve loans for high credit score and income'
),
(
    (SELECT id FROM rule_sets WHERE name = 'Loan Approval Rules'),
    'Manual Review - Medium Credit',
    50,
    '{
        "conditionLogic": "AND",
        "conditions": [
            {"field": "creditScore", "operator": "greaterThan", "value": 650, "type": "number"},
            {"field": "debtRatio", "operator": "lessThan", "value": 0.4, "type": "number"}
        ]
    }'::jsonb,
    '{
        "actions": [
            {"type": "setVariable", "variable": "decision", "value": "REVIEW"},
            {"type": "setVariable", "variable": "reason", "value": "Requires manual review"},
            {"type": "routeTo", "targetNode": "manual-review-task"}
        ]
    }'::jsonb,
    'Route to manual review for medium credit scores'
),
(
    (SELECT id FROM rule_sets WHERE name = 'Loan Approval Rules'),
    'Reject - Low Credit',
    0,
    '{
        "conditionLogic": "AND",
        "conditions": []
    }'::jsonb,
    '{
        "actions": [
            {"type": "setVariable", "variable": "decision", "value": "REJECTED"},
            {"type": "setVariable", "variable": "reason", "value": "Does not meet minimum requirements"}
        ]
    }'::jsonb,
    'Default rule - reject if no other rules match'
);

SELECT 'Rules Engine schema created successfully!' AS status;
