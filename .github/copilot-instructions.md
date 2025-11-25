# Copilot Instructions: Data Breach Intelligence Dashboard

## Project Overview
This is a cybersecurity data visualization portfolio website analyzing data breach incidents globally. It's a single-page application (SPA) built with vanilla JavaScript and Chart.js v4, deployed as a GitHub Pages site with dual language support (English/Hungarian).

## Architecture & Key Components

### Frontend Stack
- **HTML5**: Semantic structure in `index.html` (primary) and `website-hu.html` (Hungarian version)
- **CSS3**: `style.css` (723 lines) with custom properties for neon theme (cyan, purple, pink)
- **JavaScript**: `script.js` (690 lines) contains all visualization logic and page interactivity
- **Chart.js v4**: CDN-loaded library for data visualization (bar, line, bubble charts)

### Theme & Styling
- **Design System**: Glassmorphism UI with neon accent colors (CSS variables defined in `:root`)
- **Color Palette**: `--neon-cyan: #00f0ff`, `--neon-purple: #b026ff`, `--neon-pink: #ff00f5`, `--dark-bg: #0a0e27`
- **Visual Effects**: Animated gradient background, grid overlay animation, glitch text effect on title
- **Responsive**: Mobile-first approach with hamburger menu toggle and viewport meta tag

### Data Flow
1. **Raw Datasets** (in `script.js`): `breachData`, `recordsByYearData`, `rawMethodVsCategoryData`
2. **Data Transformation**: `categorizeMethod()` function maps raw breach methods to 8 categories:
   - External Attack, Poor Security/Configuration, Accidental Exposure, Physical Loss/Theft
   - Insider Threat, Unknown, Social Engineering, Vulnerability Exploit
3. **Aggregation**: Two-level aggregation maps organize data for visualization
4. **Visualization**: Three Chart.js instances render to canvas elements with formatted numbers (B/M/K suffix)

## Patterns & Conventions

### Chart Creation Pattern
```javascript
// All charts follow this structure in createChartN() functions:
function createChart1() {
    const ctx = document.getElementById('visualization1').getContext('2d');
    // 1. Data sorting/transformation
    // 2. Gradient/color generation (using createGradient helper)
    // 3. Chart instantiation with options
    // 4. Custom tooltip formatting (showing detailed breach info)
}
// Initialize on DOMContentLoaded with 100ms setTimeout
```

### Data Processing Conventions
- Use `categorizeMethod()` to normalize breach methods before visualization (handles case variations)
- Map aggregation pattern: create new Map → process items → convert to Array for charts
- Always preserve original data references while adding computed fields

### Utility Functions
- `formatNumber(num)`: Returns human-readable notation (3.8B, 201M, 45K)
- `createGradient(ctx, colorStops)`: Generates linear gradients from color stop arrays
- `scrollToSection(sectionId)`: Smooth scroll to named sections (used by CTA buttons)

## Important Developer Notes

### Language Support Workflow
- Two separate HTML files: `index.html` (English) and `website-hu.html` (Hungarian)
- Both link to same `script.js` and `style.css`
- Language switcher in navbar links between versions
- **When adding features**: Update BOTH HTML files identically (except language content)

### Adding New Visualizations
1. Add canvas element: `<canvas id="visualizationN"></canvas>`
2. Create corresponding `createChartN()` function following chart pattern
3. Call function in DOMContentLoaded event (add to setTimeout)
4. Ensure color scheme matches neon palette and maintains visual hierarchy

### Chart.js Customization
- All charts use `responsive: true, maintainAspectRatio: false` for container sizing
- Tooltips styled to match dark theme with border colors matching chart series colors
- Axis grid uses semi-transparent neon colors for subtle effect
- Font family standardized as `'Inter, sans-serif'` throughout

### Navigation & Scrolling
- Navbar has `scrolled` class applied when `window.scrollY > 50` for visual feedback
- Mobile menu toggle via hamburger button with aria-label
- All nav links prevent default and trigger smooth scroll via `scrollToSection()`
- Section IDs: `welcome`, `about`, `viz1`, `viz2`, `viz3`, `contact` (used in href anchors)

## External Dependencies
- **Chart.js v4**: `https://cdn.jsdelivr.net/npm/chart.js@4` (canvas rendering)
- **Favicon**: Wikimedia Commons emoji SVG (lock icon)
- **Font**: System font stack (`Inter`, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- No npm/build system - pure vanilla JavaScript

## When Modifying Data
- Always preserve `breachData` structure: Entity, Year, Records, Organization type, Method
- Update `recordsByYearData` for historical trend lines
- Add new entries to `rawMethodVsCategoryData` with exact category matching for aggregation
- Test that aggregation maps rebuild correctly after data changes
- Verify `categorizeMethod()` handles new method strings

## Testing Patterns
- Open HTML file directly in browser (no server required)
- Test mobile responsiveness by toggling hamburger menu
- Verify Chart.js renders without console errors (check DevTools)
- Test smooth scrolling on all navigation links
- Validate language switcher links between HTML versions
