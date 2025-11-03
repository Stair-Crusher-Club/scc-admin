import { AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO } from "@/lib/generated-sources/openapi"

/**
 * V2 Form Field - Unified state for both built-in and custom fields
 */
export interface FormField {
  id: string                    // UUID for React keys
  type: 'builtin' | 'custom'    // Field type discriminator

  // Built-in field properties
  builtinName?: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO

  // Custom field properties
  customKey?: string            // Immutable key (camelCase, e.g., "customField1")

  // Common properties
  customDisplayName?: string    // Display name (built-in override or custom required)
  options: string[] | null      // Multiple choice options, null = free text
  optionsText: string          // UI input value (comma-separated)
}

export interface BuiltinFieldOption {
  label: string
  value: AdminChallengeB2bFormSchemaAvailableFieldNameEnumDTO
}
