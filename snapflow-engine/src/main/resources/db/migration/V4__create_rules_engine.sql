-- Rules Engine Schema for PostgreSQL

-- Rule Sets (collections of rules)
CREATE TABLE rule_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'draft',  -- draft, active, archived
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual Rules
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID NOT NULL REFERENCES rule_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0,  -- Higher priority = evaluated first
    conditions JSONB NOT NULL,  -- Array of conditions with logic
    actions JSONB NOT NULL,     -- Array of actions to execute
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rule Execution History (Audit Trail)
CREATE TABLE rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_set_id UUID REFERENCES rule_sets(id),
    rule_id UUID REFERENCES rules(id),
    workflow_instance_id VARCHAR(255),
    node_id VARCHAR(255),
    input_data JSONB,
    output_data JSONB,
    matched BOOLEAN,  -- Did this rule match?
    execution_time_ms INT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rules_rule_set_priority 
ON rules(rule_set_id, priority DESC, enabled) 
WHERE enabled = true;

CREATE INDEX idx_rule_executions_workflow 
ON rule_executions(workflow_instance_id, executed_at DESC);

CREATE INDEX idx_rule_executions_rule_set 
ON rule_executions(rule_set_id, executed_at DESC);

-- GIN indexes for JSONB queries
CREATE INDEX idx_rules_conditions ON rules USING GIN (conditions);
CREATE INDEX idx_rules_actions ON rules USING GIN (actions);
CREATE INDEX idx_rule_executions_input ON rule_executions USING GIN (input_data);
CREATE INDEX idx_rule_executions_output ON rule_executions USING GIN (output_data);

-- Sample data for testing
INSERT INTO rule_sets (name, description, status) VALUES
('Loan Approval Rules', 'Automated loan approval decision rules', 'active'),
('Discount Calculation', 'Customer discount calculation rules', 'active'),
('Regional Routing', 'Route workflows based on region', 'draft');

-- Sample rules for Loan Approval
INSERT INTO rules (rule_set_id, name, priority, conditions, actions) VALUES
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
    }'::jsonb
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
            {"type": "setVariable", "variable": "reason", "value": "Requires manual review"}
        ]
    }'::jsonb
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
    }'::jsonb
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rule_sets_updated_at BEFORE UPDATE ON rule_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
