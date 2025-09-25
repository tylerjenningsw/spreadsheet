# Vue 3 Spreadsheet Component

A lightweight, Excel-style spreadsheet component built with Vue 3 and TypeScript, featuring all core spreadsheet functionality without external grid libraries.

## Features

### Core Functionality
- **Cell Navigation**: Arrow keys, Tab, Home, End, PageUp/Down
- **Cell Editing**: Double-click, Enter, F2, or start typing
- **Copy/Paste**: Ctrl+C/V for single cells and ranges
- **Undo/Redo**: Ctrl+Z/Y for undo/redo operations
- **Dynamic Grid**: Auto-expands when navigating or pasting beyond boundaries
- **Column Resizing**: Drag column borders to resize
- **Auto-expand**: Drag selection beyond grid to add rows/columns

### Advanced Features
- **Formula Support**: Basic arithmetic expressions (=A1+B1, =B2*C2)
- **Cell References**: Reference other cells in formulas
- **CSV Import/Export**: Full CSV support with proper escaping
- **Multi-cell Selection**: Click and drag or Shift+Click
- **Virtualization**: Performance optimization for large datasets

## Technology Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast builds
- **Bootstrap 5** for styling
- **pnpm** for package management

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Usage

The application runs at `http://localhost:5173/` by default.

### Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Navigate cells | Arrow keys |
| Navigate horizontally | Tab / Shift+Tab |
| Start editing | F2, Enter, or type |
| Cancel editing | Escape |
| Copy selection | Ctrl+C |
| Paste | Ctrl+V |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y or Ctrl+Shift+Z |
| Go to first cell | Ctrl+Home |
| Go to last cell | Ctrl+End |

### Formula Syntax

Formulas start with `=` and support:
- Basic arithmetic: `+`, `-`, `*`, `/`, `^`
- Cell references: `A1`, `B2`, etc.
- Parentheses for grouping: `=(A1+B1)*C1`

Example formulas:
- `=A1+B1` - Add two cells
- `=B2*1.1` - Multiply by constant
- `=(A1+A2+A3)/3` - Average of three cells

## Demo

Click "Load Demo Data" on startup to see a sample spreadsheet with:
- Product sales data
- Quarterly figures
- Formula calculations
- Row/column totals

## Performance

- Virtualization for large datasets (10,000+ rows)
- Efficient formula dependency tracking
- Optimized re-renders with Vue 3 reactivity
- Lazy evaluation of off-screen cells

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
