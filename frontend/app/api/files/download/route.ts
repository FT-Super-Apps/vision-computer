import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Determine file path based on filename pattern
    // Original files (uploaded DOCX/PDF) are in uploads/documents/
    // Bypass results start with "unified_bypass_" and are in backend
    const isBypassResult = filename.startsWith('unified_bypass_')

    if (isBypassResult) {
      // Download bypass result from Python backend
      const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
      const pythonApiKey = process.env.PYTHON_API_KEY

      const response = await fetch(
        `${pythonApiUrl}/bypass/download/${encodeURIComponent(filename)}`,
        {
          headers: {
            ...(pythonApiKey && { 'X-API-Key': pythonApiKey }),
          },
        }
      )

      if (!response.ok) {
        return NextResponse.json(
          { error: 'File not found in backend' },
          { status: 404 }
        )
      }

      const blob = await response.blob()
      const contentType = response.headers.get('content-type') ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else {
      // Download original file from local uploads folder
      const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')
      let filePath = path.join(uploadsDir, filename)
      let actualFilename = filename

      // Check if file exists
      try {
        await fs.access(filePath)
      } catch {
        // File not found with exact name, try searching with pattern
        // Files are saved with prefix: timestamp-random-originalname.ext
        console.log('[FILE_NOT_FOUND] Exact match not found, searching pattern:', filename)

        try {
          const files = await fs.readdir(uploadsDir)
          // Find file that ends with the requested filename
          const matchedFile = files.find(f => f.endsWith(filename))

          if (matchedFile) {
            console.log('[FILE_FOUND] Matched file:', matchedFile)
            filePath = path.join(uploadsDir, matchedFile)
            actualFilename = matchedFile
          } else {
            console.error('[FILE_NOT_FOUND] No match found for:', filename)
            return NextResponse.json(
              { error: 'File not found', filename: filename },
              { status: 404 }
            )
          }
        } catch (readDirError) {
          console.error('[READ_DIR_ERROR]', readDirError)
          return NextResponse.json(
            { error: 'Failed to search for file' },
            { status: 500 }
          )
        }
      }

      // Read file
      const fileBuffer = await fs.readFile(filePath)

      // Determine content type based on extension
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'application/octet-stream'

      if (ext === '.docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (ext === '.pdf') {
        contentType = 'application/pdf'
      } else if (ext === '.doc') {
        contentType = 'application/msword'
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }
  } catch (error: any) {
    console.error('[FILE_DOWNLOAD_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to download file', details: error.message },
      { status: 500 }
    )
  }
}
