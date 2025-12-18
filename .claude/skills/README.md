# SCC Admin Claude Skills

This directory contains custom Claude Code skills for the SCC Admin project.

## Available Skills

### scc-add-page

Add new pages to the SCC Admin dashboard following Next.js 14 App Router conventions.

**Use when:**
- Implementing new admin pages for accessibility management, quest management, challenge management, or other features
- Creating list pages with search and filtering
- Building detail pages with edit functionality
- Adding create pages for new items

**Features:**
- Workflow decision tree for choosing page type
- Template files for common patterns (list, detail, create pages)
- React Query integration for data fetching
- Form handling with React Hook Form
- Styling with Tailwind CSS and shadcn/ui (no Panda CSS styled-components for new files)
- Navigation integration
- Comprehensive troubleshooting guide

**Templates included:**
- `list-page.tsx` - List page with search, filtering, and DataTable
- `detail-page.tsx` - Detail page with view/edit toggle
- `create-page.tsx` - Create page with form
- `query.ts` - React Query hooks

**Documentation:**
- `SKILL.md` - Main workflow and instructions
- `references/page-patterns.md` - Detailed patterns and conventions

### react-ui-component

Create production-ready React UI components using shadcn/ui and Tailwind CSS.

**Use when:**
- Creating shared components
- Building forms, dialogs, tables, or any UI elements
- Need to install shadcn/ui components

## Using Skills

Skills are automatically loaded by Claude Code when working in this project. Simply ask Claude to perform tasks related to the skill's domain, and it will use the appropriate skill to guide the implementation.

**Examples:**
- "Add a new page for managing user reports" → Uses `scc-add-page`
- "Create a new dialog component for confirming actions" → Uses `react-ui-component`

## Adding New Skills

To add a new skill to this project:

1. Create the skill directory: `.claude/skills/[skill-name]/`
2. Add the skill files:
   - `SKILL.md` (required) - Main documentation with YAML frontmatter
   - `references/` (optional) - Reference documentation
   - `assets/` (optional) - Template files and assets
   - `scripts/` (optional) - Executable scripts
3. Document the skill in this README
4. Commit to the repository

For guidance on creating skills, see the [Claude Code documentation](https://github.com/anthropics/claude-code).
