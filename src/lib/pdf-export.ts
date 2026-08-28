// Client-side PDF export: renders the whole report as one continuous canvas at
// A4 width and slices it into A4 pages. Cuts are made at safe element
// boundaries so a card/section is never split across two pages — if a block
// does not fit on the current page it moves entirely to the next one.
export type PdfPreviewResult = { blob: Blob; pages: string[] };

export async function exportPagesToPdf(
  container: HTMLElement,
  fileName: string,
  orientation: "portrait" | "landscape" = "portrait",
  output: "save" | "blob" | "preview" = "save",
): Promise<Blob | PdfPreviewResult | void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 6;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  // Render at a fixed A4-ish CSS width so proportions match the print preview.
  const A4_CSS_WIDTH = 794; // 210mm @ 96dpi
  const prevWidth = container.style.width;
  const prevMax = container.style.maxWidth;
  container.style.width = `${A4_CSS_WIDTH}px`;
  container.style.maxWidth = `${A4_CSS_WIDTH}px`;

  // Collect break-safe boundaries (top/bottom of each block) in CSS px,
  // measured while the container is at print width.
  const containerTop = container.getBoundingClientRect().top;
  const blocks: HTMLElement[] = Array.from(
    container.querySelectorAll<HTMLElement>(".print-page > *, .print-block"),
  );
  const cssBoundaries = new Set<number>([0]);
  for (const el of blocks) {
    if (el.classList.contains("no-print")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;
    cssBoundaries.add(rect.top - containerTop);
    cssBoundaries.add(rect.bottom - containerTop);
  }

  // Hard breaks: every `.print-page` section always starts on a new PDF page.
  const cssHardBreaks: number[] = [];
  for (const el of Array.from(container.querySelectorAll<HTMLElement>(".print-page"))) {
    if (el.classList.contains("no-print")) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;
    const top = rect.top - containerTop;
    cssHardBreaks.push(top);
    cssBoundaries.add(top);
  }

  let canvas: HTMLCanvasElement;
  let renderedWidth = A4_CSS_WIDTH;
  try {
    renderedWidth = container.offsetWidth;
    canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: A4_CSS_WIDTH,
      ignoreElements: (el) => el.classList?.contains("no-print"),
    });
  } finally {
    container.style.width = prevWidth;
    container.style.maxWidth = prevMax;
  }

  const pxPerCss = canvas.width / renderedWidth || 2;
  const boundaries = [...cssBoundaries]
    .map((v) => Math.round(v * pxPerCss))
    .filter((v) => v > 0 && v < canvas.height)
    .sort((a, b) => a - b);

  // Fit width to the printable area, then walk down in page-height chunks.
  const scale = maxW / canvas.width; // mm per source pixel
  const pageHeightPx = Math.floor(maxH / scale);

  const hardBreaks = cssHardBreaks
    .map((v) => Math.round(v * pxPerCss))
    .filter((v) => v > 0 && v < canvas.height)
    .sort((a, b) => a - b);

  let y = 0;
  let pageIndex = 0;
  const pages: string[] = [];
  while (y < canvas.height) {
    let cut = Math.min(y + pageHeightPx, canvas.height);
    if (cut < canvas.height) {
      // Prefer the last block boundary that fits on this page.
      const candidates = boundaries.filter((b) => b > y + pageHeightPx * 0.35 && b <= cut);
      if (candidates.length) cut = candidates[candidates.length - 1]!;
    }
    // A new report section always starts its own page.
    const hard = hardBreaks.find((b) => b > y + 4 && b <= cut);
    if (hard !== undefined) cut = hard;
    const sh = cut - y;
    if (sh <= 0) break;

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = pageHeightPx; // full page height keeps geometry consistent
    const ctx = slice.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, sh, 0, 0, canvas.width, sh);

    const img = slice.toDataURL("image/jpeg", 0.92);
    pages.push(img);
    if (pageIndex > 0) pdf.addPage("a4", orientation);
    pdf.addImage(img, "JPEG", margin, margin, maxW, maxH, undefined, "FAST");

    pageIndex++;
    y = cut;
  }

  const blob = pdf.output("blob");
  if (output === "preview") return { blob, pages };
  if (output === "blob") return blob;

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
