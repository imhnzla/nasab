// Phase 1 — Person detail page
// Public route: /[locale]/person/[id]
// Next.js 16: params is a Promise

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PersonRow, MarriageRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: person } = await supabase
    .from('persons')
    .select('name_ar, name_en, branch, generation, bio_en')
    .eq('id', id)
    .single()

  if (!person) return { title: 'Person not found' }

  const branchLabel = person.branch
    ? person.branch.charAt(0).toUpperCase() + person.branch.slice(1)
    : ''

  return {
    title: `${person.name_en} — NASAB`,
    description: person.bio_en?.slice(0, 160)
      ?? `${branchLabel} descendant, Generation ${person.generation}`,
    openGraph: {
      title: `${person.name_ar} / ${person.name_en}`,
      description: person.bio_en?.slice(0, 160) ?? `${branchLabel}, Gen. ${person.generation}`,
      type: 'profile',
    },
  }
}

export default async function PersonPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: personData } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .eq('is_verified', true)
    .single()

  if (!personData) notFound()

  const person = personData as PersonRow

  const { data: marriagesData } = await supabase
    .from('marriages')
    .select('*')
    .or(`husband_id.eq.${id},wife_id.eq.${id}`)

  const marriages = (marriagesData ?? []) as MarriageRow[]

  // Optional: fetch spouse names for better display
  // For brevity, this example only shows IDs; you can enhance by fetching names.

  const branchColour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'
  const bio = locale === 'ar' ? person.bio_ar : person.bio_en

  const born = person.birth_date_hijri
    ? `${person.birth_date_hijri} AH`
    : person.birth_date_gregorian ?? null
  const died = person.death_date_hijri
    ? `${person.death_date_hijri} AH`
    : person.death_date_gregorian ?? null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-xl">
        {/* Header card */}
        <div
          className="rounded-xl bg-white shadow-md overflow-hidden mb-6"
          style={{ borderTop: `4px solid ${branchColour}` }}
        >
          <div className="p-6">
            {/* Photo */}
            {person.photo_url && (
              <img
                src={person.photo_url}
                alt={person.name_en}
                className="h-20 w-20 rounded-full object-cover mb-4 border-2"
                style={{ borderColor: branchColour }}
              />
            )}

            <h1 dir="rtl" className="text-2xl font-bold text-gray-900 mb-1">
              {person.name_ar}
            </h1>
            <p className="text-base text-gray-500 mb-4">{person.name_en}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {person.branch && (
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: branchColour }}
                >
                  {person.branch.charAt(0).toUpperCase() + person.branch.slice(1)}
                </span>
              )}
              {person.gender === 'female' && (
                <span className="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-semibold text-pink-800">
                  Female / أنثى
                </span>
              )}
              {person.is_verified && (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                  ✓ Verified
                </span>
              )}
              {person.generation !== null && (
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-700">
                  Generation {person.generation}
                </span>
              )}
            </div>

            {/* Dates */}
            {(born ?? died) && (
              <div className="text-sm text-gray-600 space-y-0.5 mb-4">
                {born && <p>Born: {born}</p>}
                {died && <p>Died: {died}</p>}
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="text-sm text-gray-700 leading-relaxed"
              >
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Marriages */}
        {marriages.length > 0 && (
          <div className="rounded-xl bg-white shadow-md p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Marriages / الزيجات
            </h2>
            <div className="flex flex-col gap-2">
              {marriages.map((m) => (
                <div key={m.id} className="text-sm text-gray-700 border rounded-md p-2">
                  {m.husband_id === id
                    ? `Wife: ${m.wife_id} (order ${m.order_num})`
                    : `Husband: ${m.husband_id}`}
                  {m.date_hijri && ` — ${m.date_hijri} AH`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to tree */}
        <Link
          href={`/${locale}/tree`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          ← View in family tree
        </Link>
      </div>
    </div>
  )
}
