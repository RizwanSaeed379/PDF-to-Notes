/**
 * Extracts text from a PDF file on the client side.
 * @param {File} file - The PDF file from an input.
 * @param {Function} onProgress - Callback for progress updates (0 to 1).
 * @returns {Promise<string>} - The full text content.
 */
export async function extractTextFromPDF(file, onProgress) {
  try {
    // Dynamically import pdfjs-dist
    const pdfjs = await import('pdfjs-dist');
    
    // Handle different import results (some bundlers wrap it in .default)
    const pdfjsLib = pdfjs.default || pdfjs;
    
    // Set worker path with a robust version fallback
    const version = pdfjsLib.version || '5.7.284';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true, // Reduces issues with specific fonts in some environments
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Defensive check: ensure items exists and is an array
        if (content && Array.isArray(content.items)) {
          const pageStrings = content.items
            .filter(item => typeof item.str === 'string') // Only extract text items
            .map((item) => item.str);
          
          fullText += pageStrings.join(' ') + '\n\n';
        }
        
        if (onProgress) {
          onProgress(i / numPages);
        }
      } catch (pageError) {
        console.warn(`[PDFExtractor] Error on page ${i}:`, pageError);
        // Continue to next page
      }
    }

    const finalResult = fullText.trim();
    if (!finalResult && numPages > 0) {
      throw new Error('No readable text content found. The PDF might be scanned or protected.');
    }

    return finalResult;
  } catch (err) {
    console.error('[PDFExtractor] Extraction failed:', err);
    throw err;
  }
}
