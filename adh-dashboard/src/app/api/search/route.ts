import { NextResponse } from 'next/server'
import { getClient } from '@/lib/redis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || '*'
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const client = await getClient()

    const results = await client.ft.search(
      'idx:complete_requests',
      `@__key:{request:*} ${query}`,
      {
        LIMIT: { from: offset, size: limit },
        RETURN: ['$'] // Restituisce tutto il documento JSON
      }
    )

    return NextResponse.json({
      success: true,
      total: results.total,
      results: results.documents.map(doc => ({
        id: doc.id,
        ...doc.value
      }))
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
