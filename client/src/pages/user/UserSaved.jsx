import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkX, Clock, ExternalLink } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { userApi } from '../../services/api'
import { getSavedQuestionIds, toggleSavedQuestion } from '../../utils/savedAnswers'
import { formatDistanceToNow } from '../../utils/date'

export default function UserSaved() {
  const [savedIds, setSavedIds] = useState(() => getSavedQuestionIds())

  const { data, isLoading } = useQuery({
    queryKey: ['my-questions'],
    queryFn: () => userApi.getQuestions({ limit: 100 }),
  })

  const savedQuestions = useMemo(() => {
    const questions = data?.questions || []
    return questions.filter((q) => savedIds.includes(q._id))
  }, [data?.questions, savedIds])

  const handleRemove = (id) => {
    toggleSavedQuestion(id)
    setSavedIds(getSavedQuestionIds())
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 lg:py-10"
      >
        {/* ── Page Header ── */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              Bookmarks
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Saved Answers
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Answers you bookmarked for quick reference.
            </p>
          </div>

          {/* Count badge */}
          {savedQuestions.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
              <Bookmark size={13} className="text-indigo-400" />
              <span className="text-xs font-bold text-ink">{savedQuestions.length} Saved</span>
            </div>
          )}
        </header>

        {/* ── Content ── */}
        <div className="mt-8">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded-lg bg-card" />
                        <div className="h-3 w-1/3 rounded-lg bg-card" />
                      </div>
                      <div className="h-8 w-20 rounded-lg bg-card" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : savedQuestions.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 ring-1 ring-border">
                <Bookmark size={26} className="text-indigo-400" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-ink">No saved answers yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Open a completed question and tap{' '}
                <span className="font-semibold text-ink">Save answer</span> to bookmark it here.
              </p>
              <Link
                to="/dashboard/questions"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
              >
                View my questions
              </Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              {/* Section Header */}
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <p className="text-sm font-bold text-ink">Saved answers</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {savedQuestions.length} bookmarked in your workspace
                  </p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  Quick access
                </div>
              </div>

              <div className="space-y-3">
                {savedQuestions.map((q, index) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.2) }}
                    className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5"
                  >
                    {/* Left: icon + content */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-sm">
                        <Bookmark size={14} />
                      </span>
                      <Link
                        to={`/dashboard/questions/${q._id}`}
                        className="min-w-0 flex-1 group/link"
                      >
                        <p className="truncate text-[14px] font-bold text-ink group-hover/link:text-indigo-600 transition-colors">
                          {q.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                          {q.category?.name ? (
                            <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-0.5 font-semibold">
                              {q.category.name}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            Saved {formatDistanceToNow(q.updatedAt || q.createdAt)}
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to={`/dashboard/questions/${q._id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-muted transition hover:bg-card hover:text-ink"
                      >
                        <ExternalLink size={11} />
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(q._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-100"
                      >
                        <BookmarkX size={11} />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
