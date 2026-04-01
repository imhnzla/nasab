'use client'
import React, { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

type BookmarkStarProps = {
  personId: string
}

export function BookmarkStar({ personId }: BookmarkStarProps): React.ReactElement {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const toggle = trpc.bookmarks.toggle.useMutation({
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked)
    },
  })

  // Check initial bookmark status (could be done via a query)
  // For simplicity, we assume not bookmarked initially; but we could fetch from a list query.
  const handleClick = () => {
    toggle.mutate({ person_id: personId })
  }

  return (
    <button
      onClick={handleClick}
      className="focus:outline-none"
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        className={`h-5 w-5 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-none'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.98l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.98l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  )
}
