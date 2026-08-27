// Client-side PDF export: renders the report to images and slices them into
// full-bleed A4 pages so there is no half-empty space at the bottom of a page.
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

  const pages = Array.from(container.querySelectorAll<HTMLElement>(".print-page"));
  const targets = pages.length ? pages : [container];

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8; // mm breathing space on all sides
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  let first = true;

  for (const target of targets) {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Scale to the full printable width, then slice vertically into A4 pages.
    const scale = maxW / canvas.width;
    const sliceHeightPx = Math.floor(maxH / scale); // source pixels per PDF page
    const totalSlices = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

    for (let s = 0; s < totalSlices; s++) {
      const sy = s * sliceHeightPx;
      const sh = Math.min(sliceHeightPx, canvas.height - sy);
      if (sh <= 0) break;

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sh;
      const ctx = slice.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

      const img = slice.toDataURL("image/jpeg", 0.92);
      const w = maxW;
      const h = sh * scale;

      if (!first) pdf.addPage("a4", orientation);
      first = false;
      pdf.addImage(img, "JPEG", margin, margin, w, h, undefined, "FAST");
    }
  }

  if (output === "blob") return pdf.output("blob");

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
