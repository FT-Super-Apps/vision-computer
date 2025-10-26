import { NextRequest, NextResponse } from 'next/server'

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

    // Get Python API URL from environment
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'
    const pythonApiKey = process.env.PYTHON_API_KEY

    // Fetch file from Python backend
    const response = await fetch(
      `${pythonApiUrl}/bypass/download/${encodeURIComponent(filename)}`,
      {
        headers: {
          ...(pythonApiKey && { 'X-API-Key': pythonApiKey }),
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: response.status }
      )
    }

    // Get the file blob
    const blob = await response.blob()

    // Determine content type
    const contentType = response.headers.get('content-type') ||
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    // Return file as download
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('[FILE_DOWNLOAD_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to download file', details: error.message },
      { status: 500 }
    )
  }
}
