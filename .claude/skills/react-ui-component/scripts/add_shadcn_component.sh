#!/bin/bash
# Script to add shadcn/ui components to the project
# Usage: ./add_shadcn_component.sh <component-name> [component-name2 ...]
#
# Example: ./add_shadcn_component.sh button dialog
# Example: ./add_shadcn_component.sh form

set -e

if [ $# -eq 0 ]; then
    echo "Error: No component name provided"
    echo "Usage: $0 <component-name> [component-name2 ...]"
    echo "Example: $0 button dialog"
    exit 1
fi

# Check if components.json exists
if [ ! -f "components.json" ]; then
    echo "Error: components.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Add components using npx shadcn
echo "Adding shadcn/ui components: $@"
npx shadcn@latest add "$@"

echo "Components added successfully!"
