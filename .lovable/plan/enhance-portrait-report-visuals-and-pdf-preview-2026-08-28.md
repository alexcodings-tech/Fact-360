# Enhance portrait report visuals and PDF preview

## Goal
Turn the first five portrait-report pages into a varied, data-honest visual summary and replace the blocked Chrome PDF tab with an in-app A4 preview that matches the downloaded document.

## Visual report changes
- Keep the first five pages visual-first, followed by the existing narrative pages.
- Reorganize the existing report metrics into a balanced set of suitable visuals, including:
  - horizontal and vertical bars
  - stacked bar and stacked column comparisons
  - butterfly and dumbbell comparisons for opposing personality dimensions
  - bullet and dot plots for scores versus useful benchmarks
  - radar/spider profile
  - line and area trends across ordered behavioural measures
  - scatter/bubble relationships between derived behavioural dimensions
  - heatmap of dimension/capability intensity
  - funnel for prioritized development areas
  - pie/donut and hierarchical treemap-style composition
  - Pareto and waterfall views for ranked contribution and score composition
- Reuse the real section, personality-dimension, and behavioural scores already returned by the report. Avoid chart types that would invent unsupported time-series, financial, project, network, or geographic data (for example candlestick, Gantt, Sankey, maps, control charts, violin/density plots).
- Use compact SVG/CSS and the existing Recharts dependency so every visual captures reliably in PDF and remains readable at A4 portrait size.
- Remove redundant text-heavy repetitions from the visual pages while keeping accessible chart titles and values.

## A4 preview and download
- Replace `window.open()` and blob-tab navigation—the source of `ERR_BLOCKED_BY_CLIENT`—with an in-app preview dialog.
- Generate the PDF and its page images from the same canvas slices, so the preview is an exact representation of the downloaded A4 pages.
- Show the pages in a scrollable A4 preview with page numbers and clear Download/Close controls.
- Download through a temporary anchor from the existing user interaction rather than navigating Chrome to a blob URL.
- Preserve safe page boundaries: if a report block cannot fit in the remaining page area, begin it on the next page rather than splitting it.

## Validation
- Open a real portrait report, generate the preview, and verify there is no blocked tab or browser PDF error.
- Inspect representative preview pages for clipping, large unintended gaps, unreadable labels, and split sections.
- Download the generated file, confirm valid A4 portrait dimensions and page count, then visually inspect rendered PDF pages.
