'use client'
import React, { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

type PersonEditorProps = {
  person?: {
    id: string
    name_ar: string
    name_en: string
    gender: 'male' | 'female' | 'unknown'
    photo_url: string | null
    generation: number | null
    branch: string | null
    scholarly_tradition: string | null
    bio_ar: string | null
    bio_en: string | null
  }
  onSaved?: () => void
}

export function PersonEditor({ person, onSaved }: PersonEditorProps): React.ReactElement {
  const [photoPreview, setPhotoPreview] = useState<string | null>(person?.photo_url ?? null)
  const isEdit = !!person

  const createMutation = trpc.persons.create.useMutation({
    onSuccess: () => onSaved?.(),
  })
  const updateMutation = trpc.persons.update.useMutation({
    onSuccess: () => onSaved?.(),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    // TODO: upload to Supabase Storage and set photo_url field
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      name_ar: fd.get('name_ar') as string,
      name_en: fd.get('name_en') as string,
      gender: fd.get('gender') as 'male' | 'female' | 'unknown',
      photo_url: photoPreview,
      generation: fd.get('generation') ? Number(fd.get('generation')) : null,
      branch: ((fd.get('branch') as string) || null) as 'hasanid' | 'husaynid' | 'hashemite' | null,
      scholarly_tradition: ((fd.get('scholarly_tradition') as string) || null) as 'sunni' | 'shia' | 'both' | null,
      bio_ar: (fd.get('bio_ar') as string) || null,
      bio_en: (fd.get('bio_en') as string) || null,
    }
    if (isEdit && person) {
      updateMutation.mutate({ id: person.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-lg">
      <h2 className="text-sm font-bold text-gray-900">
        {isEdit ? 'Edit Person' : 'Add Person'} / {isEdit ? 'تعديل' : 'إضافة شخص'}
      </h2>

      {/* Photo upload */}
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full border-2 border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 text-xs">
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
          ) : (
            'Photo'
          )}
        </div>
        <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Upload photo
          <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
        </label>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Arabic name / الاسم بالعربية</label>
          <input
            name="name_ar"
            dir="rtl"
            defaultValue={person?.name_ar}
            required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">English name</label>
          <input
            name="name_en"
            defaultValue={person?.name_en}
            required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Gender / الجنس</label>
        <select
          name="gender"
          defaultValue={person?.gender ?? 'male'}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="male">Male / ذكر</option>
          <option value="female">Female / أنثى</option>
          <option value="unknown">Unknown / غير معروف</option>
        </select>
      </div>

      {/* Generation + Branch */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Generation</label>
          <input
            name="generation"
            type="number"
            min={1}
            max={30}
            defaultValue={person?.generation ?? ''}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Branch</label>
          <select
            name="branch"
            defaultValue={person?.branch ?? ''}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">— none —</option>
            <option value="hasanid">Hasanid</option>
            <option value="husaynid">Husaynid</option>
            <option value="hashemite">Hashemite</option>
          </select>
        </div>
      </div>

      {/* Scholarly tradition */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Scholarly tradition</label>
        <select
          name="scholarly_tradition"
          defaultValue={person?.scholarly_tradition ?? ''}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">— none —</option>
          <option value="sunni">Sunni</option>
          <option value="shia">Shia</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Bios */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Biography (Arabic)</label>
        <textarea
          name="bio_ar"
          dir="rtl"
          rows={3}
          defaultValue={person?.bio_ar ?? ''}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700">Biography (English)</label>
        <textarea
          name="bio_en"
          rows={3}
          defaultValue={person?.bio_en ?? ''}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
      >
        {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add person'}
      </button>

      {createMutation.isError && (
        <p className="text-xs text-red-600">{createMutation.error.message}</p>
      )}
      {updateMutation.isError && (
        <p className="text-xs text-red-600">{updateMutation.error.message}</p>
      )}
    </form>
  )
}
