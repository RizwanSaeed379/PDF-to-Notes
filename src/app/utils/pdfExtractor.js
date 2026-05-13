/**
 * Extracts text from a PDF file on the client side.
 * @param {File} file - The PDF file from an input.
 * @param {Function} onProgress - Callback for progress updates (0 to 1).
 * @returns {Promise<string>} - The full text content.
 */
export async function extractTextFromPDF(file, onProgress) {
  // Dynamically import pdfjs-dist to prevent SSR errors (DOMMatrix is not defined)
  const pdfjs = await import('pdfjs-dist');
  
  // Set worker path for pdfjs to the correct .mjs file for version 5+
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(' ') + '\n\n';
    
    if (onProgress) {
      onProgress(i / numPages);
    }
  }

  return fullText.trim();
}
