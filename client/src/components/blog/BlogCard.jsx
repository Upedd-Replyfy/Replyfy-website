import { Link } from 'react-router-dom'

export const BLOG_CARD_STYLES = [
  { id: 'default', label: 'Default', hint: 'Classic vertical card with cover image on top' },
  { id: 'featured', label: 'Featured', hint: 'Wide hero card with gradient overlay' },
  { id: 'compact', label: 'Compact', hint: 'Horizontal layout with thumbnail' },
  { id: 'minimal', label: 'Minimal', hint: 'Text-first card with small accent' },
]

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogCard({ post, className = '' }) {
  const style = post.cardStyle || 'default'
  const date = formatDate(post.publishedAt || post.createdAt)

  if (style === 'featured') {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className={`group relative col-span-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 ${className}`}
      >
        <div className="relative aspect-[16/9] min-h-[220px]">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Featured · {post.author}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-2 line-clamp-2 text-sm text-white/80">{post.excerpt}</p>
            ) : null}
            {date ? <p className="mt-3 text-xs text-white/60">{date}</p> : null}
          </div>
        </div>
      </Link>
    )
  }

  if (style === 'compact') {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className={`group flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-4 ${className}`}
      >
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-32">
          {post.coverImage ? (
            <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-400">
              Blog
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[11px] font-medium text-sky-600">{post.author}</p>
          <h2 className="mt-1 line-clamp-2 text-base font-semibold tracking-tight text-slate-900 group-hover:text-sky-700">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
          ) : null}
          {date ? <p className="mt-2 text-[11px] text-slate-400">{date}</p> : null}
        </div>
      </Link>
    )
  }

  if (style === 'minimal') {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              {post.author}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-sky-700">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
            ) : null}
            {date ? <p className="mt-3 text-[11px] text-slate-400">{date}</p> : null}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md ${className}`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-medium text-slate-400">
            No cover image
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-medium text-sky-600">{post.author}</p>
        <h2 className="mt-1 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-sky-700">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
        ) : null}
        {date ? <p className="mt-3 text-[11px] text-slate-400">{date}</p> : null}
      </div>
    </Link>
  )
}
