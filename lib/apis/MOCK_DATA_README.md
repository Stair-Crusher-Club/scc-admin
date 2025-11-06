# Mock Data Guide

## Accessibility Inspection Results Mock Data

### Overview
Mock data has been created for the accessibility inspection results page to facilitate development and testing without requiring backend API access.

### Files
- `mockAccessibilityInspectionData.ts` - Contains 100 dummy inspection results with various filters
- `api.ts` - Updated with mock data toggle flag

### How to Use

#### Enabling/Disabling Mock Data
In `lib/apis/api.ts`, find the flag at the top of the file:

```typescript
// Toggle this to enable/disable mock data for accessibility inspection results
const USE_MOCK_ACCESSIBILITY_INSPECTION_DATA = true
```

- Set to `true` to use mock data
- Set to `false` to use real API

### Mock Data Features

The mock data includes:
- **100 sample records** with various combinations of filters
- **Accessibility Types**: Place, Building, PlaceReview, ToiletReview, UNKNOWN
- **Inspector Types**: HUMAN, AI, UNKNOWN
- **Result Types**: OK, MODIFY, DELETE, UNKNOWN
- **Handled Status**: Mix of handled and unhandled items
- **Sample Images**: Uses picsum.photos for placeholder images
- **Realistic Timestamps**: Created/updated dates spread over recent days
- **Detailed Contents**: JSON with descriptions, overall codes, and image-specific reason codes

### Sample Place Names
Includes realistic Korean business names:
- 스타벅스 강남점
- 올리브영 홍대점
- CGV 영등포
- 신세계백화점 본점
- And many more...

### Filtering & Pagination
The mock data supports all the same filters as the real API:
- Accessibility type filtering
- Inspector type filtering
- Result type filtering
- Handled/unhandled status filtering
- Date range filtering
- Page size selection (10, 20, 50, 100)
- Pagination with proper page navigation

### Network Simulation
The mock data includes a 300ms delay to simulate network latency, making the loading states visible during development.

### Testing Different Scenarios
You can easily test:
1. **Empty states**: Apply strict filters that return no results
2. **Large datasets**: Increase page size to 100
3. **Pagination**: Navigate between pages
4. **Filter combinations**: Try different filter combinations
5. **Loading states**: The simulated delay shows loading indicators
