import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, UserRound } from 'lucide-react'
import { catalogApi } from '../services/api'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => catalogApi.getBlog(slug),
    enabled: Boolean(slug),
  })

  const blog = data?.blog

  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-10 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !blog) {
    return (
      <div className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <h1 className="text-2xl font-semibold text-slate-900">Post not found</h1>
          <p className="mt-2 text-sm text-slate-500">This article may have been removed or unpublished.</p>
          <Link
            to="/blog"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            <ArrowLeft size={16} /> Back to blog
          </Link>
        </div>
      </div>
    )
  }

  const paragraphs = String(blog.content || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <article className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          <ArrowLeft size={16} /> All posts
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {blog.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={15} /> {blog.author}
            </span>
            {blog.publishedAt || blog.createdAt ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={15} /> {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
            ) : null}
          </div>
        </header>

        {blog.coverImage ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src={blog.coverImage} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        ) : null}

        <div className="prose prose-slate mt-8 max-w-none space-y-5 text-[15px] leading-relaxed text-slate-600">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
