// Client-side PDF export: renders each `.print-page` section as its OWN A4
// page. Every section is captured separately at A4 print width and scaled to
// fit inside the printable area, so a section is never split across two pages
// and the page order matches the on-screen section order exactly.
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
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  // Render at a fixed A4-ish CSS width so proportions match the print preview.
  const A4_CSS_WIDTH = 794; // 210mm @ 96dpi
  const prevWidth = container.style.width;
  const prevMax = container.style.maxWidth;
  container.style.width = `${A4_CSS_WIDTH}px`;
  container.style.maxWidth = `${A4_CSS_WIDTH}px`;

  const sections = Array.from(
    container.querySelectorAll<HTMLElement>(".print-page"),
  ).filter((el) => !el.classList.contains("no-print") && el.offsetHeight > 0);

  const targets: HTMLElement[] = sections.length ? sections : [container];

  const pages: string[] = [];
  try {
    for (let i = 0; i < targets.length; i++) {
      const el = targets[i]!;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: A4_CSS_WIDTH,
        ignoreElements: (node) => node.classList?.contains("no-print"),
      });

      // Fit the whole section inside the printable area (contain), keeping
      // aspect ratio. Tall sections shrink instead of spilling to a new page.
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const drawW = canvas.width * ratio;
      const drawH = canvas.height * ratio;
      const offsetX = margin + (maxW - drawW) / 2;
      const offsetY = margin;

      // Compose onto a full A4 canvas so the preview images are true A4 sheets.
      const sheet = document.createElement("canvas");
      const sheetScale = canvas.width / (drawW || 1);
      sheet.width = Math.round(pageW * sheetScale);
      sheet.height = Math.round(pageH * sheetScale);
      const ctx = sheet.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sheet.width, sheet.height);
      ctx.drawImage(
        canvas,
        Math.round(offsetX * sheetScale),
        Math.round(offsetY * sheetScale),
        Math.round(drawW * sheetScale),
        Math.round(drawH * sheetScale),
      );

      const img = sheet.toDataURL("image/jpeg", 0.92);
      pages.push(img);

      if (i > 0) pdf.addPage("a4", orientation);
      const sectionImg = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(sectionImg, "JPEG", offsetX, offsetY, drawW, drawH, undefined, "FAST");
    }
  } finally {
    container.style.width = prevWidth;
    container.style.maxWidth = prevMax;
  }

  const blob = pdf.output("blob");
  if (output === "preview") return { blob, pages };
  if (output === "blob") return blob;

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}
