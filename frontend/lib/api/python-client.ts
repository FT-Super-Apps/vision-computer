import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * Python API Client untuk integrasi dengan Rumah Plagiasi Bypass API
 * Created by devnolife
 */

class PythonAPIClient {
  private client: AxiosInstance
  private baseURL: string
  private apiKey: string | undefined

  constructor() {
    this.baseURL = process.env.PYTHON_API_URL || 'http://localhost:8000'
    this.apiKey = process.env.PYTHON_API_KEY

    // Warn if API key is not set
    if (!this.apiKey) {
      console.warn('⚠️  WARNING: PYTHON_API_KEY not set in environment variables!')
      console.warn('⚠️  Python API requests may fail if API key authentication is enabled.')
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(process.env.PYTHON_API_TIMEOUT || '300000'),
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    })
  }

  /**
   * Analyze document for flags
   */
  async analyzeDocument(file: File | Buffer, filename: string) {
    const formData = new FormData()

    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename)
    } else {
      formData.append('file', file)
    }

    const response = await this.client.post('/analyze/flags', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    })

    return response.data
  }

  /**
   * Perform bypass on document
   */
  async bypassDocument(
    file: File | Buffer,
    filename: string,
    strategy: string = 'header_focused'
  ) {
    const formData = new FormData()
    
    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename)
    } else {
      formData.append('file', file)
    }
    formData.append('strategy', strategy)

    const response = await this.client.post('/bypass/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
      responseType: 'blob',
    })

    return response.data
  }

  /**
   * Get available strategies
   */
  async getStrategies() {
    const response = await this.client.get('/config/strategies')
    return response.data
  }

  /**
   * Perform unified processing (analyze + bypass)
   */
  async unifiedProcess(
    file: File | Buffer,
    filename: string,
    strategy: string = 'header_focused'
  ) {
    const formData = new FormData()
    
    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename)
    } else {
      formData.append('file', file)
    }
    formData.append('strategy', strategy)

    const response = await this.client.post('/unified/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    })

    return response.data
  }

  /**
   * OCR processing for PDFs
   */
  async ocrPdf(file: File | Buffer, filename: string) {
    const formData = new FormData()
    
    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename)
    } else {
      formData.append('file', file)
    }

    const response = await this.client.post('/analyze/ocr-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    })

    return response.data
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await this.client.get('/health')
    return response.data
  }

  /**
   * Get API version
   */
  async getVersion() {
    const response = await this.client.get('/')
    return response.data
  }
}

// Export singleton instance
export const pythonAPI = new PythonAPIClient()
export default pythonAPI
