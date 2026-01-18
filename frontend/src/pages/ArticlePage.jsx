import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Article slug to file mapping
const ARTICLE_MAP = {
  'what-is-space-xy': '01-what-is-space-xy.html',
  'space-xy-rtp-house-edge': '02-space-xy-rtp-house-edge.html',
  'space-xy-statistics-patterns': '03-space-xy-statistics-patterns.html',
  'how-to-play-space-xy': '04-how-to-play-space-xy.html',
  'space-xy-strategies': '05-space-xy-strategies.html',
  'space-xy-vs-aviator': '06-space-xy-vs-aviator.html',
  'space-xy-multiplier-analysis': '07-space-xy-multiplier-analysis.html',
  'space-xy-tips-beginners': '08-space-xy-tips-beginners.html',
  'history-of-space-xy': '09-history-of-space-xy.html',
  'space-xy-responsible-gambling': '10-space-xy-responsible-gambling.html',
  'spacexy-demo': '11-spacexy-demo.html',
  'spacexy-casinos': '12-spacexy-casinos.html',
  'spacexy-predictor-scam': '13-spacexy-predictor-scam.html'
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      setError(null)

      const cleanSlug = slug?.replace(/\/$/, '')
      const filename = ARTICLE_MAP[cleanSlug]

      if (!filename) {
        setError('Article not found')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/articles/${filename}`)
        if (!res.ok) throw new Error('Failed to load article')
        const html = await res.text()
        setContent(html)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-xl text-center py-12">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Article Not Found</h1>
          <p className="text-slate-400">The requested article could not be found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <article
        className="prose prose-invert prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  )
}
