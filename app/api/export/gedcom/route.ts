import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function escapeGedcom(s: string): string {
  return s.replace(/\n/g, ' ').replace(/@/g, '@@')
}

export async function GET(req: Request): Promise<Response> {
  const supabase = await createClient()

  // Auth check — require admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: userRow } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (!userRow || !['admin', 'superadmin'].includes(userRow.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: persons } = await supabase.from('persons').select('*')
  const { data: marriages } = await supabase.from('marriages').select('*')

  if (!persons) return NextResponse.json({ error: 'No data' }, { status: 500 })

  const lines: string[] = [
    '0 HEAD',
    '1 GEDC',
    '2 VERS 5.5.1',
    '1 CHAR UTF-8',
    '1 SOUR NASAB',
    '2 NAME NASAB Family Tree',
  ]

  // INDI records
  for (const p of persons) {
    lines.push(`0 @I${p.id}@ INDI`)
    lines.push(`1 NAME ${escapeGedcom(p.name_en)} /${escapeGedcom(p.name_ar)}/`)
    lines.push(`2 GIVN ${escapeGedcom(p.name_en)}`)
    if (p.gender === 'male')   lines.push('1 SEX M')
    if (p.gender === 'female') lines.push('1 SEX F')
    if (p.birth_date_gregorian) {
      lines.push('1 BIRT')
      lines.push(`2 DATE ${p.birth_date_gregorian}`)
    }
    if (p.birth_date_hijri) {
      lines.push(`1 _HIJRI_BIRT ${escapeGedcom(p.birth_date_hijri)}`)
    }
    if (p.death_date_gregorian) {
      lines.push('1 DEAT')
      lines.push(`2 DATE ${p.death_date_gregorian}`)
    }
    if (p.death_date_hijri) {
      lines.push(`1 _HIJRI_DEAT ${escapeGedcom(p.death_date_hijri)}`)
    }
    if (p.father_id) lines.push(`1 FAMC @F${p.father_id}@`)
  }

  // FAM records from marriages
  for (const m of marriages ?? []) {
    lines.push(`0 @F${m.id}@ FAM`)
    lines.push(`1 HUSB @I${m.husband_id}@`)
    lines.push(`1 WIFE @I${m.wife_id}@`)
    if (m.date_hijri)     lines.push(`1 MARR\n2 DATE ${escapeGedcom(m.date_hijri)}`)
    // Add children
    const children = persons.filter((p) => p.marriage_id === m.id)
    for (const c of children) lines.push(`1 CHIL @I${c.id}@`)
  }

  lines.push('0 TRLR')

  const gedcom = lines.join('\n')
  return new Response(gedcom, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="nasab-export.ged"',
    },
  })
}
