-- SnapFlow Forms Schema
-- Dynamic form builder with JSONB storage

-- ============================================
-- FORMS
-- ============================================

CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL, -- Form field definitions
    ui_schema JSONB, -- UI configuration
    validation_rules JSONB, -- Validation rules
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    version INT DEFAULT 1,
    created_by UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_team ON forms(team_id);
CREATE INDEX idx_forms_schema ON forms USING GIN (schema);

-- ============================================
-- FORM SUBMISSIONS
-- ============================================

CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    workflow_instance_id VARCHAR(255), -- Link to workflow instance
    task_id VARCHAR(255), -- Flowable task ID
    data JSONB NOT NULL, -- Submitted form data
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_workflow ON form_submissions(workflow_instance_id);
CREATE INDEX idx_form_submissions_task ON form_submissions(task_id);
CREATE INDEX idx_form_submissions_user ON form_submissions(submitted_by);
CREATE INDEX idx_form_submissions_data ON form_submissions USING GIN (data);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample Form: Loan Application
INSERT INTO forms (name, description, schema, status) VALUES
(
    'Loan Application Form',
    'Standard loan application form',
    '{
        "fields": [
            {
                "id": "applicantName",
                "type": "text",
                "label": "Full Name",
                "required": true,
                "placeholder": "Enter your full name"
            },
            {
                "id": "email",
                "type": "email",
                "label": "Email Address",
                "required": true,
                "validation": {"pattern": "^[^@]+@[^@]+\\.[^@]+$"}
            },
            {
                "id": "loanAmount",
                "type": "number",
                "label": "Loan Amount",
                "required": true,
                "min": 1000,
                "max": 1000000
            },
            {
                "id": "purpose",
                "type": "select",
                "label": "Loan Purpose",
                "required": true,
                "options": [
                    {"value": "home", "label": "Home Purchase"},
                    {"value": "car", "label": "Vehicle"},
                    {"value": "education", "label": "Education"},
                    {"value": "business", "label": "Business"},
                    {"value": "other", "label": "Other"}
                ]
            },
            {
                "id": "income",
                "type": "number",
                "label": "Annual Income",
                "required": true
            },
            {
                "id": "creditScore",
                "type": "number",
                "label": "Credit Score",
                "required": false,
                "min": 300,
                "max": 850
            }
        ]
    }'::jsonb,
    'active'
);

SELECT 'Forms schema created successfully!' AS status;
