import * as pdfjs from "pdfjs-dist";

// Set worker source via CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

/**
 * Splits a PDF file into individual PNG page blobs wrapped as File objects.
 * Renders each page at 2x scale for higher quality.
 */
export async function splitPdfToPages(file: File): Promise<File[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pages: File[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const scale = 2;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
        "image/png"
      );
    });

    const pageName = `${file.name.replace(/\.pdf$/i, "")}_page${pageNum}.png`;
    pages.push(new File([blob], pageName, { type: "image/png" }));
  }

  return pages;
}
