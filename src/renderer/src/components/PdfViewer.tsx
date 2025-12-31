import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/**
 * PdfViewer - PDF preview with zoom and navigation controls
 *
 * Features:
 * - Page navigation (prev/next)
 * - Zoom controls (in/out/fit)
 * - Page count display
 * - Loading states
 * - Error handling
 *
 * See: PLAN-HYBRID-EDITOR.md (Week 2: PDF Preview)
 */

interface PdfViewerProps {
  pdfPath: string | null
  className?: string
}

export function PdfViewer({ pdfPath, className = '' }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [error, setError] = useState<string | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error('[PdfViewer] Failed to load PDF:', error)
    setError(error.message)
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3.0))
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  function resetZoom() {
    setScale(1.0)
  }

  if (!pdfPath) {
    return (
      <div className={`flex items-center justify-center h-full bg-nexus-bg-secondary ${className}`}>
        <div className="text-center">
          <p className="text-nexus-text-muted">No PDF preview available</p>
          <p className="text-sm text-nexus-text-muted mt-2">Compile LaTeX to generate PDF</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-nexus-bg-secondary ${className}`}>
        <div className="text-center">
          <p className="text-red-500">Failed to load PDF</p>
          <p className="text-sm text-nexus-text-muted mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-nexus-bg-secondary ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-nexus-bg-tertiary border-b border-nexus-border">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 text-sm bg-nexus-bg-primary text-nexus-text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nexus-accent hover:text-white transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-nexus-text-primary">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 text-sm bg-nexus-bg-primary text-nexus-text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nexus-accent hover:text-white transition-colors"
          >
            Next
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 text-sm bg-nexus-bg-primary text-nexus-text-primary rounded hover:bg-nexus-accent hover:text-white transition-colors"
          >
            −
          </button>
          <span className="text-sm text-nexus-text-primary min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 text-sm bg-nexus-bg-primary text-nexus-text-primary rounded hover:bg-nexus-accent hover:text-white transition-colors"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-sm bg-nexus-bg-primary text-nexus-text-primary rounded hover:bg-nexus-accent hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <Document
          file={pdfPath}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="text-nexus-text-muted">Loading PDF...</div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={
              <div className="text-nexus-text-muted">Loading page...</div>
            }
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  )
}
