export type FieldType = 'text' | 'number' | 'date' | 'email' | 'phone' | 'select' | 'checkbox' | 'radio' | 'toggle' | 'textarea' | 'people' | 'file' | 'signature';

// ============================================================================
// VALIDATION RULES - Per-field-type restrictions
// ============================================================================
export interface ValidationRules {
    required?: boolean;

    // Text validations
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;

    // Number validations
    min?: number;
    max?: number;
    decimalPlaces?: number;
    allowNegative?: boolean;

    // Date validations  
    minDate?: string; // ISO date or 'today'
    maxDate?: string;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    timezone?: string;

    // File validations
    acceptedTypes?: string[]; // e.g., ['pdf', 'docx', 'jpg']
    maxFileSize?: number; // in MB
    maxFiles?: number;

    // Custom message
    customMessage?: string;
}

export interface LogicRules {
    visibility?: string; // e.g., "status == 'Active'"
    disabled?: string;
}

export interface OptionItem {
    id: string;
    label: string;
}

export interface DataConfig {
    options?: string[] | OptionItem[];
    dataSource?: 'static' | 'api';
    apiEndpoint?: string;
    parentFieldKey?: string;
}

export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    key: string;
    placeholder?: string;
    helpText?: string;
    width: number; // Percentage width (10-100)
    validation: ValidationRules;
    logic: LogicRules;
    data: DataConfig;
    showOnStart?: boolean;
}

export interface FormRow {
    id: string;
    fields: FormField[];
}
