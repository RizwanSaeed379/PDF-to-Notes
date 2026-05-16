'use client';

import { useState, useCallback } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle, Download, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { extractTextFromPDF } from '@/app/utils/pdfExtractor';

export default function Home() {
  const [file, setFile] = useState(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);

  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: '/api/summarize',
    streamProtocol: 'text',
    onError: (err) => setError(`AI Error: ${err.message}`),
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setCompletion('');
    setIsExtracting(true);
    setPdfProgress(0);

    try {
      const text = await extractTextFromPDF(selectedFile, (progress) => {
        setPdfProgress(progress);
      });
      
      setIsExtracting(false);
      
      if (!text) {
        throw new Error('No text content found in PDF.');
      }

      await complete(text);
    } catch (err) {
      console.error('[Extraction Error]', err);
      const errorMessage = err.message || 'An unexpected error occurred while reading the PDF.';
      setError(`Extraction Error: ${errorMessage}`);
      setIsExtracting(false);
    }
  }, [complete, setCompletion]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isExtracting || isLoading,
  });

  const handleExport = () => {
    if (!completion) {
      setError('Missing content to export.');
      return;
    }
    
    // Set document title temporarily to ensure saved PDF has a good default name
    const originalTitle = document.title;
    document.title = file ? `${file.name.replace('.pdf', '')}-notes` : 'lecture-notes';
    
    // Trigger native print dialog which allows "Save as PDF"
    window.print();
    
    // Restore original title
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 print:bg-white print:min-h-0">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 print:p-0 print:m-0 print:max-w-none">
        {/* Header */}
        <header className="text-center mb-16 space-y-4 print:hidden">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl"
          >
            Lecture <span className="text-indigo-600">Alchemist</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Transform long, complex lecture PDFs into elegant, bulleted key notes in seconds.
            Download your notes directly as a PDF.
          </motion.p>
        </header>

        {/* Dropzone */}
        <div 
          {...getRootProps()} 
          className={`
            relative overflow-hidden group cursor-pointer print:hidden
            border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}
            ${(isExtracting || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'}`}>
              <FileUp className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {file ? file.name : "Drop your lecture PDF here"}
              </p>
              <p className="text-sm text-slate-500">
                Up to 100 pages • Instant AI Summarization
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {isExtracting && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${pdfProgress * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        <div className="print:hidden">
          <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {(isLoading || completion) && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-6"
            >
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Key Notes Summary</h2>
                </div>
                
                {completion && !isLoading && (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                )}
              </div>

              <div id="markdown-content" className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] print:p-0 print:border-none print:shadow-none">
                {isLoading && !completion && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p>AI is distilling your lecture...</p>
                  </div>
                )}
                <ReactMarkdown>{completion}</ReactMarkdown>
                {isLoading && completion && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
