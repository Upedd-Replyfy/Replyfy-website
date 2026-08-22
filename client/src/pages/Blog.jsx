import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import BlogCard from '../components/blog/BlogCard'
import { catalogApi } from '../services/api'

export default function Blog() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => catalogApi.getBlogs(),
  })

  const blogs = data?.blogs || []

  return (
    <div className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Insights</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Replyfy Blog
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Practical advice, founder stories, and mentor perspectives on careers, business, and
          decision-making.
        </p>

        {isLoading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center text-sm text-rose-700">
            Could not load blog posts. Please try again later.
          </div>
        ) : blogs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <BookOpen className="mx-auto text-slate-300" size={36} />
            <p className="mt-4 text-base font-medium text-slate-800">No posts yet</p>
            <p className="mt-2 text-sm text-slate-500">Check back soon for new articles.</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                className={post.cardStyle === 'featured' ? 'lg:col-span-2' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
