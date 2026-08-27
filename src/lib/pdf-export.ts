// Client-side PDF export: renders the whole report as one continuous canvas at
// A4 width and slices it into full-height A4 pages, so pages are always filled
// edge to edge (matching the on-screen print preview) with no half-page gaps.
export async function exportPagesToPdf(
  container: HTMLElement,
  fileName: string,
  orientation: "portrait" | "landscape" = "portrait",
  output: "save" | "blob" = "save",
) {
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

  let canvas: HTMLCanvasElement;
  try {
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

  // Fit width to the printable area, then slice into exact page-height chunks.
  const scale = maxW / canvas.width; // mm per source pixel
  const sliceHeightPx = Math.floor(maxH / scale);
  const totalSlices = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

  for (let s = 0; s < totalSlices; s++) {
    const sy = s * sliceHeightPx;
    const sh = Math.min(sliceHeightPx, canvas.height - sy);
    if (sh <= 0) break;

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeightPx; // always full page height -> no gaps
    const ctx = slice.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

    const img = slice.toDataURL("image/jpeg", 0.92);
    if (s > 0) pdf.addPage("a4", orientation);
    pdf.addImage(img, "JPEG", margin, margin, maxW, maxH, undefined, "FAST");
  }

  if (output === "blob") return pdf.output("blob");

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
