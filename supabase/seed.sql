-- NASAB Seed Data
-- Phase 1 — Prophetic lineage: first 8 generations, 30 verified historical figures
-- Covers the root node, Hasanid line, and Husaynid line
--
-- Apply via:  npx supabase db reset   (resets local DB + migrations + this seed)
--
-- Sources:
--   Ibn Hisham,                 "Al-Sira al-Nabawiyya"        (السيرة النبوية)
--   Ibn Sa'd,                   "Al-Tabaqat al-Kubra"         (الطبقات الكبرى)
--   al-Baladhuri,               "Ansab al-Ashraf"             (أنساب الأشراف)
--   Ibn Hazm,                   "Jamharat Ansab al-Arab"      (جمهرة أنساب العرب)
--   al-Shaykh al-Mufid,         "Al-Irshad"                   (الإرشاد)
--   Ibn Kathir,                 "Al-Bidaya wal-Nihaya"        (البداية والنهاية)
--   al-Tabari,                  "Tarikh al-Tabari"            (تاريخ الطبري)
--   Abu al-Faraj al-Isfahani,   "Maqatil al-Talibiyyin"       (مقاتل الطالبيين)
--   Ibn Idhari al-Marrakushi,   "Al-Bayan al-Mughrib"         (البيان المغرب)
--
-- UUID scheme: 00000000-0000-0000-0000-00000000000N  (N = sequential integer)
--
-- Tree structure (father_id links):
--   Gen 1  Prophet Muhammad
--   Gen 2  └── Fatimah al-Zahra  (daughter; lineage continues through her per prophetic hadith)
--            Ali ibn Abi Talib   (no father_id in this tree — cousin/son-in-law; root node)
--   Gen 3  Fatimah ──► Al-Hasan ibn Ali   [Hasanid root]
--                  └──► Al-Husayn ibn Ali  [Husaynid root]
--   Gen 4–8  Standard patrilineal descent from gen 3 onward
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── Generation 1: Root ──────────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'محمد بن عبد الله',
  'Muhammad ibn Abdullah',
  NULL, NULL, 'both', 1,
  '53 BH', '11 AH', '0570-01-01', '0632-01-01',
  '[{"title":"Al-Sira al-Nabawiyya","author":"Ibn Hisham","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"النبي","title_en":"The Prophet"},{"title":"المصطفى","title_en":"The Chosen One"},{"title":"رسول الله","title_en":"Messenger of God"},{"title":"خاتم الأنبياء","title_en":"Seal of the Prophets"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 2 ────────────────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'فاطمة الزهراء بنت محمد',
  'Fatimah al-Zahra bint Muhammad',
  '00000000-0000-0000-0000-000000000001',
  NULL, 'both', 2,
  'c. 5 BH', '11 AH', '0615-01-01', '0632-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[{"title":"الزهراء","title_en":"The Radiant"},{"title":"سيدة نساء أهل الجنة","title_en":"Lady of the Women of Paradise"},{"title":"البتول","title_en":"The Pure"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Ali ibn Abi Talib: Cousin and son-in-law of the Prophet. No father_id in this
-- tree (his paternal line is through Abu Talib, not tracked here). Included as a
-- generation-2 root node because the Prophet raised him from childhood.
INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'علي بن أبي طالب',
  'Ali ibn Abi Talib',
  NULL,
  'hashemite', 'both', 2,
  'c. 23 BH', '40 AH', '0600-01-01', '0661-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"أمير المؤمنين","title_en":"Commander of the Faithful"},{"title":"الإمام الأول","title_en":"First Imam (Shia)"},{"title":"الخليفة الرابع","title_en":"Fourth Caliph (Sunni)"},{"title":"أسد الله","title_en":"Lion of God"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 3 ────────────────────────────────────────────────────────────
-- Al-Hasan and al-Husayn are the Prophet's grandsons through Fatimah.
-- The Prophet said: "Al-Hasan and al-Husayn are the masters of the youth of
-- Paradise." Their father_id points to Fatimah, representing the prophetic
-- chain of descent through his daughter per the well-known hadith.

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'الحسن بن علي',
  'Al-Hasan ibn Ali',
  '00000000-0000-0000-0000-000000000002',
  'hasanid', 'both', 3,
  '3 AH', '50 AH', '0625-01-01', '0670-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[{"title":"الإمام الثاني","title_en":"Second Imam (Shia)"},{"title":"المجتبى","title_en":"The Chosen"},{"title":"سيد شباب أهل الجنة","title_en":"Master of Youth of Paradise"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'الحسين بن علي',
  'Al-Husayn ibn Ali',
  '00000000-0000-0000-0000-000000000002',
  'husaynid', 'both', 3,
  '4 AH', '61 AH', '0626-01-01', '0680-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"الإمام الثالث","title_en":"Third Imam (Shia)"},{"title":"سيد الشهداء","title_en":"Master of Martyrs"},{"title":"أبو الأحرار","title_en":"Father of the Free"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 4 — Hasanid ──────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  'الحسن المثنى بن الحسن',
  'Al-Hasan al-Muthanna ibn al-Hasan',
  '00000000-0000-0000-0000-000000000004',
  'hasanid', 'both', 4,
  'c. 36 AH', 'c. 97 AH', '0657-01-01', '0716-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"المثنى","title_en":"The Second (named after his grandfather)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000007',
  'زيد بن الحسن',
  'Zayd ibn al-Hasan',
  '00000000-0000-0000-0000-000000000004',
  'hasanid', 'both', 4,
  'c. 36 AH', 'c. 99 AH', '0657-01-01', '0718-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000008',
  'عمر بن الحسن',
  'Amr ibn al-Hasan',
  '00000000-0000-0000-0000-000000000004',
  'hasanid', 'both', 4,
  'c. 36 AH', NULL, '0657-01-01', NULL,
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 4 — Husaynid ─────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000009',
  'علي بن الحسين زين العابدين',
  'Ali ibn al-Husayn Zayn al-Abidin',
  '00000000-0000-0000-0000-000000000005',
  'husaynid', 'both', 4,
  '38 AH', '95 AH', '0659-01-01', '0713-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[{"title":"زين العابدين","title_en":"Ornament of the Worshippers"},{"title":"السجاد","title_en":"The Prostrator"},{"title":"الإمام الرابع","title_en":"Fourth Imam (Shia)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 5 — Hasanid ──────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'عبد الله الكامل بن الحسن المثنى',
  'Abdullah al-Kamil ibn al-Hasan al-Muthanna',
  '00000000-0000-0000-0000-000000000006',
  'hasanid', 'both', 5,
  'c. 72 AH', '145 AH', '0691-01-01', '0762-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[{"title":"الكامل","title_en":"The Complete / The Perfect"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000011',
  'إبراهيم بن الحسن المثنى',
  'Ibrahim ibn al-Hasan al-Muthanna',
  '00000000-0000-0000-0000-000000000006',
  'hasanid', 'both', 5,
  'c. 74 AH', '145 AH', '0693-01-01', '0762-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 5 — Husaynid ─────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000012',
  'محمد بن علي الباقر',
  'Muhammad ibn Ali al-Baqir',
  '00000000-0000-0000-0000-000000000009',
  'husaynid', 'both', 5,
  '57 AH', '114 AH', '0677-01-01', '0732-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"}]'::jsonb,
  '[{"title":"الباقر","title_en":"The Splitter of Knowledge"},{"title":"الإمام الخامس","title_en":"Fifth Imam (Shia)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000013',
  'زيد بن علي الشهيد',
  'Zayd ibn Ali al-Shahid',
  '00000000-0000-0000-0000-000000000009',
  'husaynid', 'both', 5,
  '75 AH', '122 AH', '0694-01-01', '0740-01-01',
  '[{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"الشهيد","title_en":"The Martyr"},{"title":"إمام الزيدية","title_en":"Imam of the Zaydis"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000014',
  'عمر الأشرف بن علي زين العابدين',
  'Umar al-Ashraf ibn Ali Zayn al-Abidin',
  '00000000-0000-0000-0000-000000000009',
  'husaynid', 'both', 5,
  'c. 65 AH', 'c. 110 AH', '0685-01-01', '0728-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[{"title":"الأشرف","title_en":"The Most Noble"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000015',
  'الحسين الأصغر بن علي زين العابدين',
  'Al-Husayn al-Asghar ibn Ali Zayn al-Abidin',
  '00000000-0000-0000-0000-000000000009',
  'husaynid', 'both', 5,
  'c. 63 AH', 'c. 100 AH', '0683-01-01', '0718-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 6 — Hasanid ──────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000016',
  'محمد النفس الزكية بن عبد الله',
  'Muhammad al-Nafs al-Zakiyya ibn Abdullah',
  '00000000-0000-0000-0000-000000000010',
  'hasanid', 'both', 6,
  'c. 100 AH', '145 AH', '0718-01-01', '0762-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"}]'::jsonb,
  '[{"title":"النفس الزكية","title_en":"The Pure Soul"},{"title":"الشهيد","title_en":"The Martyr"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000017',
  'إبراهيم بن عبد الله الكامل',
  'Ibrahim ibn Abdullah al-Kamil',
  '00000000-0000-0000-0000-000000000010',
  'hasanid', 'both', 6,
  'c. 104 AH', '145 AH', '0722-01-01', '0762-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"}]'::jsonb,
  '[{"title":"الشهيد","title_en":"The Martyr (killed at Bakhamra)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000018',
  'إدريس بن عبد الله الكامل',
  'Idris ibn Abdullah al-Kamil',
  '00000000-0000-0000-0000-000000000010',
  'hasanid', 'both', 6,
  'c. 106 AH', '177 AH', '0724-01-01', '0793-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Al-Bayan al-Mughrib","author":"Ibn Idhari al-Marrakushi","type":"classical_text"}]'::jsonb,
  '[{"title":"إدريس الأول","title_en":"Idris I"},{"title":"مؤسس الدولة الإدريسية","title_en":"Founder of the Idrisid Dynasty (Morocco)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000019',
  'يحيى بن عبد الله الكامل',
  'Yahya ibn Abdullah al-Kamil',
  '00000000-0000-0000-0000-000000000010',
  'hasanid', 'both', 6,
  'c. 108 AH', 'c. 186 AH', '0726-01-01', '0802-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 6 — Husaynid ─────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  'جعفر بن محمد الصادق',
  'Jafar ibn Muhammad al-Sadiq',
  '00000000-0000-0000-0000-000000000012',
  'husaynid', 'both', 6,
  '83 AH', '148 AH', '0702-01-01', '0765-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"}]'::jsonb,
  '[{"title":"الصادق","title_en":"The Truthful"},{"title":"الإمام السادس","title_en":"Sixth Imam (Shia)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000021',
  'يحيى بن زيد الشهيد',
  'Yahya ibn Zayd al-Shahid',
  '00000000-0000-0000-0000-000000000013',
  'husaynid', 'both', 6,
  'c. 105 AH', '125 AH', '0723-01-01', '0743-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Tarikh al-Tabari","author":"al-Tabari","type":"classical_text"}]'::jsonb,
  '[{"title":"الشهيد","title_en":"The Martyr (killed in Khurasan)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 7 — Hasanid ──────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000022',
  'إدريس بن إدريس',
  'Idris ibn Idris',
  '00000000-0000-0000-0000-000000000018',
  'hasanid', 'both', 7,
  '172 AH', '213 AH', '0789-01-01', '0828-01-01',
  '[{"title":"Al-Bayan al-Mughrib","author":"Ibn Idhari al-Marrakushi","type":"classical_text"},{"title":"Kitab al-Istibsar","author":"Ibn al-Qattan al-Fasi","type":"classical_text"}]'::jsonb,
  '[{"title":"إدريس الثاني","title_en":"Idris II"},{"title":"مؤسس مدينة فاس","title_en":"Founder of the City of Fes"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 7 — Husaynid ─────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000023',
  'موسى بن جعفر الكاظم',
  'Musa ibn Jafar al-Kazim',
  '00000000-0000-0000-0000-000000000020',
  'husaynid', 'both', 7,
  '128 AH', '183 AH', '0745-01-01', '0799-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"}]'::jsonb,
  '[{"title":"الكاظم","title_en":"The Restrainer of Anger"},{"title":"الإمام السابع","title_en":"Seventh Imam (Shia)"},{"title":"باب الحوائج","title_en":"Gateway of Needs"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000024',
  'إسماعيل بن جعفر',
  'Ismail ibn Jafar',
  '00000000-0000-0000-0000-000000000020',
  'husaynid', 'both', 7,
  'c. 103 AH', 'c. 138 AH', '0721-01-01', '0755-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[{"title":"إمام الإسماعيلية","title_en":"Eponymous Imam of the Ismaili branch"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000025',
  'محمد الديباج بن جعفر',
  'Muhammad al-Dibaj ibn Jafar',
  '00000000-0000-0000-0000-000000000020',
  'husaynid', 'both', 7,
  'c. 110 AH', 'c. 203 AH', '0728-01-01', '0818-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"الديباج","title_en":"The Brocade (a title for his beauty)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000026',
  'عبد الله الأفطح بن جعفر',
  'Abdullah al-Aftah ibn Jafar',
  '00000000-0000-0000-0000-000000000020',
  'husaynid', 'both', 7,
  'c. 112 AH', 'c. 149 AH', '0730-01-01', '0766-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[{"title":"الأفطح","title_en":"The Broad-Headed"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 8 — Hasanid ──────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000027',
  'محمد بن إدريس بن إدريس',
  'Muhammad ibn Idris ibn Idris',
  '00000000-0000-0000-0000-000000000022',
  'hasanid', 'both', 8,
  'c. 197 AH', 'c. 221 AH', '0812-01-01', '0836-01-01',
  '[{"title":"Al-Bayan al-Mughrib","author":"Ibn Idhari al-Marrakushi","type":"classical_text"}]'::jsonb,
  '[{"title":"محمد الثاني من الأدارسة","title_en":"Muhammad II of the Idrisid Dynasty"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ─── Generation 8 — Husaynid ─────────────────────────────────────────────────

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000028',
  'علي بن موسى الرضا',
  'Ali ibn Musa al-Ridha',
  '00000000-0000-0000-0000-000000000023',
  'husaynid', 'both', 8,
  '148 AH', '203 AH', '0765-01-01', '0818-01-01',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"}]'::jsonb,
  '[{"title":"الرضا","title_en":"The Pleased / The Pleasing"},{"title":"الإمام الثامن","title_en":"Eighth Imam (Shia)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000029',
  'أحمد بن موسى',
  'Ahmad ibn Musa',
  '00000000-0000-0000-0000-000000000023',
  'husaynid', 'both', 8,
  'c. 150 AH', 'c. 202 AH', '0767-01-01', '0817-01-01',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"شاه چراغ","title_en":"Shah Cheragh — Shah of the Lamp (revered in Shiraz)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO persons (
  id, name_ar, name_en, father_id, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000030',
  'إبراهيم بن موسى الكاظم',
  'Ibrahim ibn Musa al-Kazim',
  '00000000-0000-0000-0000-000000000023',
  'husaynid', 'both', 8,
  'c. 152 AH', 'c. 210 AH', '0769-01-01', '0825-01-01',
  '[{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- ─── Marriage Seed Data (Feature 1) ─────────────────────────────────────────

-- Fatima bint al-Husayn (daughter of al-Husayn, historically documented)
INSERT INTO persons (id, name_ar, name_en, father_id, gender, branch,
  scholarly_tradition, generation, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000031',
  'فاطمة بنت الحسين', 'Fatima bint al-Husayn',
  '00000000-0000-0000-0000-000000000005',
  'female', 'husaynid', 'both', 4, true
) ON CONFLICT (id) DO NOTHING;

-- Update Fatima al-Zahra gender (id 000000000002)
UPDATE persons SET gender = 'female'
WHERE id = '00000000-0000-0000-0000-000000000002';

-- Cross-branch marriage: al-Hasan al-Muthanna ↔ Fatima bint al-Husayn
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000006',  -- al-Hasan al-Muthanna (Hasanid)
  '00000000-0000-0000-0000-000000000031',  -- Fatima bint al-Husayn (Husaynid)
  'c. 61 AH', 1, true
) ON CONFLICT DO NOTHING;

-- Link known children to their mother
UPDATE persons
SET mother_id   = '00000000-0000-0000-0000-000000000031',
    marriage_id = '00000000-0000-0000-0000-000000000101'
WHERE id IN (
  '00000000-0000-0000-0000-000000000010',  -- Abdullah al-Kamil
  '00000000-0000-0000-0000-000000000011'   -- Ibrahim ibn al-Hasan al-Muthanna
);
-- ═══════════════════════════════════════════════════════════════════════════════
-- NASAB Seed Extension — Prophetic Family
-- Wives of the Prophet ﷺ, his children, their spouses, and grandchildren
-- ───────────────────────────────────────────────────────────────────────────────
-- Append to seed.sql or run separately after the base seed.
--
-- Sources:
--   Ibn Sa'd,          "Al-Tabaqat al-Kubra"          (الطبقات الكبرى)
--   Ibn Hisham,        "Al-Sira al-Nabawiyya"          (السيرة النبوية)
--   al-Baladhuri,      "Ansab al-Ashraf"               (أنساب الأشراف)
--   Ibn Hazm,          "Jamharat Ansab al-Arab"         (جمهرة أنساب العرب)
--   Ibn Kathir,        "Al-Bidaya wal-Nihaya"           (البداية والنهاية)
--   al-Tabari,         "Tarikh al-Tabari"               (تاريخ الطبري)
--   al-Dhahabi,        "Siyar A'lam al-Nubala'"         (سير أعلام النبلاء)
--   Ibn Abd al-Barr,   "Al-Isti'ab fi Ma'rifat al-Ashab" (الاستيعاب)
--   Ibn Hajar,         "Al-Isaba fi Tamyiz al-Sahaba"   (الإصابة في تمييز الصحابة)
--
-- UUID scheme (continuing from base seed):
--   Persons:   032 – 099  (wives, children, spouses-in, grandchildren)
--   Marriages: 102 – 130
--
-- Generation notes:
--   Gen 1  = Prophet Muhammad ﷺ  (already in seed: 001)
--   Gen 2  = Wives (no generation number — lateral, not descendant)
--            Children of the Prophet (Gen 2 in descent)
--   Gen 3  = Grandchildren of the Prophet (through daughters)
--            Spouses of children are gen-2 lateral entries
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION A: WIVES OF THE PROPHET ﷺ
-- Listed in order of marriage
-- generation = NULL (wives are lateral entries, not descended from the Prophet)
-- father_id  = NULL (their paternal lines are outside this tree)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 032 — Khadijah bint Khuwaylid (first wife; mother of all surviving children)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000032',
  'خديجة بنت خويلد',
  'Khadijah bint Khuwaylid',
  NULL, 'female', NULL, 'both', NULL,
  'c. 68 BH', '3 BH', '0555-01-01', '0619-01-01',
  '[{"title":"Al-Sira al-Nabawiyya","author":"Ibn Hisham","type":"classical_text"},{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"سيدة نساء قريش","title_en":"Lady of the Women of Quraysh"},{"title":"الطاهرة","title_en":"The Pure One"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 033 — Sawdah bint Zam'ah (second wife)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000033',
  'سودة بنت زمعة',
  'Sawdah bint Zam''ah',
  NULL, 'female', NULL, 'both', NULL,
  'c. 45 BH', 'c. 54 AH', '0578-01-01', '0674-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Al-Isti''ab","author":"Ibn Abd al-Barr","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 034 — Aishah bint Abi Bakr (third wife; "Mother of the Faithful", narrator of hadith)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000034',
  'عائشة بنت أبي بكر',
  'Aishah bint Abi Bakr',
  NULL, 'female', NULL, 'both', NULL,
  'c. 9 BH', '58 AH', '0613-01-01', '0678-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"الصديقة","title_en":"The Truthful One"},{"title":"حميراء","title_en":"The Rosy-Cheeked"},{"title":"أعلم النساء","title_en":"Most Knowledgeable of Women"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 035 — Hafsah bint Umar (fourth wife; daughter of Umar ibn al-Khattab, keeper of the Quran)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000035',
  'حفصة بنت عمر',
  'Hafsah bint Umar',
  NULL, 'female', NULL, 'both', NULL,
  'c. 18 BH', '45 AH', '0605-01-01', '0665-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"حافظة المصحف","title_en":"Guardian of the Quran Manuscript"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 036 — Zaynab bint Khuzaymah (fifth wife; known as Umm al-Masakin, died during the Prophet's lifetime)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000036',
  'زينب بنت خزيمة',
  'Zaynab bint Khuzaymah',
  NULL, 'female', NULL, 'both', NULL,
  'c. 30 BH', '4 AH', '0593-01-01', '0625-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"أم المساكين","title_en":"Mother of the Poor"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 037 — Umm Salamah bint Abi Umayyah (sixth wife; scholar and advisor, longest-lived wife)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000037',
  'أم سلمة هند بنت أبي أمية',
  'Umm Salamah Hind bint Abi Umayyah',
  NULL, 'female', NULL, 'both', NULL,
  'c. 28 BH', 'c. 61 AH', '0595-01-01', '0680-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"الفقيهة","title_en":"The Jurist"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 038 — Zaynab bint Jahsh (seventh wife; marriage commanded by Quran, Surah al-Ahzab)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000038',
  'زينب بنت جحش',
  'Zaynab bint Jahsh',
  NULL, 'female', NULL, 'both', NULL,
  'c. 33 BH', '20 AH', '0590-01-01', '0641-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"أم المساكين","title_en":"Mother of the Poor (known for charity)"},{"title":"الموصولة بالسماء","title_en":"The One Connected to Heaven (her marriage was revealed in Quran)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 039 — Juwayriyyah bint al-Harith (eighth wife; her marriage caused the release of 100 captive families)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000039',
  'جويرية بنت الحارث',
  'Juwayriyyah bint al-Harith',
  NULL, 'female', NULL, 'both', NULL,
  'c. 22 BH', '56 AH', '0601-01-01', '0676-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"بركة قومها","title_en":"Blessing of her People (freed Banu Mustaliq captives)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 040 — Ramlah bint Abi Sufyan (Umm Habibah; ninth wife; daughter of Abu Sufyan)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000040',
  'رملة بنت أبي سفيان (أم حبيبة)',
  'Ramlah bint Abi Sufyan (Umm Habibah)',
  NULL, 'female', NULL, 'both', NULL,
  'c. 29 BH', '44 AH', '0594-01-01', '0664-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"أم حبيبة","title_en":"Umm Habibah (her kunya)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 041 — Safiyyah bint Huyayy (tenth wife; from Banu Nadir, of Jewish origin, converted to Islam)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000041',
  'صفية بنت حيي',
  'Safiyyah bint Huyayy',
  NULL, 'female', NULL, 'both', NULL,
  'c. 28 BH', '50 AH', '0595-01-01', '0670-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"بنت ملك بني النضير","title_en":"Daughter of the Chief of Banu Nadir"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 042 — Maymunah bint al-Harith (eleventh wife; last wife the Prophet married)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000042',
  'ميمونة بنت الحارث',
  'Maymunah bint al-Harith',
  NULL, 'female', NULL, 'both', NULL,
  'c. 27 BH', '51 AH', '0596-01-01', '0671-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"}]'::jsonb,
  '[{"title":"أم المؤمنين","title_en":"Mother of the Faithful"},{"title":"برة","title_en":"Barrah (her name before Islam)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Note: Mariyah al-Qibtiyyah was a concubine (umm walad), not a wife in the
-- legal sense (no marriage contract). She is the mother of Ibrahim ibn Muhammad.
-- Included here for genealogical completeness.
-- 043 — Mariyah al-Qibtiyyah (concubine; mother of Ibrahim ibn Muhammad)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_hijri, death_date_hijri, birth_date_gregorian, death_date_gregorian,
  sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000043',
  'مارية القبطية',
  'Mariyah al-Qibtiyyah',
  NULL, 'female', NULL, 'both', NULL,
  'c. 22 BH', '16 AH', '0601-01-01', '0637-01-01',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"أم إبراهيم","title_en":"Mother of Ibrahim"},{"title":"أم الولد","title_en":"Umm Walad (concubine who bore a child)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION B: MARRIAGES OF THE PROPHET ﷺ
-- UUID range: 102–114
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO marriages (id, husband_id, wife_id, date_hijri, date_gregorian, order_num, is_verified, notes_en)
VALUES
  -- 1. Khadijah (married before Prophethood, 595 CE)
  ('00000000-0000-0000-0000-000000000102',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000032',
   'c. 25 BH', '0595-01-01', 1, true,
   'First and only wife for 25 years until her death. All children except Ibrahim are from her.'),
  -- 2. Sawdah (married shortly after Khadijah''s death)
  ('00000000-0000-0000-0000-000000000103',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000033',
   'c. 3 BH', '0619-01-01', 2, true,
   'Married after Khadijah''s death. No children from this marriage.'),
  -- 3. Aishah (betrothed young; marriage consummated after migration)
  ('00000000-0000-0000-0000-000000000104',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000034',
   '1 AH', '0623-01-01', 3, true,
   'No children from this marriage. Narrated thousands of hadith.'),
  -- 4. Hafsah
  ('00000000-0000-0000-0000-000000000105',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000035',
   '3 AH', '0625-01-01', 4, true,
   'No children from this marriage. Entrusted with the Quran manuscript.'),
  -- 5. Zaynab bint Khuzaymah
  ('00000000-0000-0000-0000-000000000106',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000036',
   '3 AH', '0625-01-01', 5, true,
   'Died approximately 8 months after marriage. No children.'),
  -- 6. Umm Salamah
  ('00000000-0000-0000-0000-000000000107',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000037',
   '4 AH', '0626-01-01', 6, true,
   'She had children from her first husband. No children with the Prophet.'),
  -- 7. Zaynab bint Jahsh
  ('00000000-0000-0000-0000-000000000108',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000038',
   '5 AH', '0627-01-01', 7, true,
   'Marriage ordained in Surah al-Ahzab (33:37). No children.'),
  -- 8. Juwayriyyah bint al-Harith
  ('00000000-0000-0000-0000-000000000109',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000039',
   '5 AH', '0627-01-01', 8, true,
   'Marriage led Companions to free all Banu Mustaliq captives. No children.'),
  -- 9. Umm Habibah (Ramlah bint Abi Sufyan)
  ('00000000-0000-0000-0000-000000000110',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000040',
   '6 AH', '0628-01-01', 9, true,
   'Contracted in Abyssinia by Negus on behalf of the Prophet. No children with Prophet.'),
  -- 10. Safiyyah bint Huyayy
  ('00000000-0000-0000-0000-000000000111',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000041',
   '7 AH', '0629-01-01', 10, true,
   'Married after Khaybar. No children.'),
  -- 11. Maymunah bint al-Harith (last wife)
  ('00000000-0000-0000-0000-000000000112',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000042',
   '7 AH', '0629-01-01', 11, true,
   'Last wife; married during the Umrah al-Qada. No children.')
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION C: CHILDREN OF THE PROPHET ﷺ
-- All by Khadijah except Ibrahim (by Mariyah al-Qibtiyyah)
-- Generation 2 in the descent tree
-- father_id = 001 (Prophet Muhammad)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: Seed already has Fatimah al-Zahra (id 002). We update her mother_id here.
-- The existing seed did not assign mother_id or marriage_id to her.

UPDATE persons
SET mother_id   = '00000000-0000-0000-0000-000000000032',
    marriage_id = '00000000-0000-0000-0000-000000000102',
    gender      = 'female'
WHERE id = '00000000-0000-0000-0000-000000000002';  -- Fatimah al-Zahra

-- ── Sons (all died in infancy or childhood) ──────────────────────────────────

-- 044 — Al-Qasim ibn Muhammad (first son; the Prophet took his kunya Abu al-Qasim from him)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000044',
  'القاسم بن محمد',
  'Al-Qasim ibn Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000102',
  'male', NULL, 'both', 2,
  '0598-01-01', '0600-01-01',
  'c. 33 BH', 'c. 31 BH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"أبو القاسم","title_en":"Abu al-Qasim (kunya taken by the Prophet)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 045 — Abd Allah ibn Muhammad (also called al-Tayyib and al-Tahir; died in infancy)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000045',
  'عبد الله بن محمد',
  'Abd Allah ibn Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000102',
  'male', NULL, 'both', 2,
  '0611-01-01', '0612-01-01',
  'c. 2 BH', 'c. 1 BH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Sira al-Nabawiyya","author":"Ibn Hisham","type":"classical_text"}]'::jsonb,
  '[{"title":"الطيب","title_en":"Al-Tayyib (the Good)"},{"title":"الطاهر","title_en":"Al-Tahir (the Pure)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 046 — Ibrahim ibn Muhammad (by Mariyah al-Qibtiyyah; born in Madinah, died at ~18 months)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000046',
  'إبراهيم بن محمد',
  'Ibrahim ibn Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000043',
  'male', NULL, 'both', 2,
  '0630-01-01', '0632-01-01',
  '8 AH', '10 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- ── Daughters ─────────────────────────────────────────────────────────────────
-- Note: Fatimah (id 002) already in seed. The other three daughters are added here.

-- 047 — Zaynab bint Muhammad (eldest daughter; married Abul-As ibn al-Rabi)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000047',
  'زينب بنت محمد',
  'Zaynab bint Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000102',
  'female', NULL, 'both', 2,
  '0599-01-01', '0629-01-01',
  'c. 30 BH', '8 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[{"title":"أكبر بنات النبي","title_en":"Eldest Daughter of the Prophet"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 048 — Ruqayyah bint Muhammad (second daughter; married Uthman ibn Affan, died at Battle of Badr)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000048',
  'رقية بنت محمد',
  'Ruqayyah bint Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000102',
  'female', NULL, 'both', 2,
  '0601-01-01', '0624-01-01',
  'c. 28 BH', '2 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 049 — Umm Kulthum bint Muhammad (third daughter; married Uthman ibn Affan after Ruqayyah's death)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000049',
  'أم كلثوم بنت محمد',
  'Umm Kulthum bint Muhammad',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000102',
  'female', NULL, 'both', 2,
  '0603-01-01', '0630-01-01',
  'c. 26 BH', '9 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION D: SPOUSES OF THE PROPHET'S DAUGHTERS
-- Lateral entries; father_id = NULL (their own lineage not tracked here)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 050 — Abul-As ibn al-Rabi (husband of Zaynab bint Muhammad; nephew of Khadijah)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000050',
  'أبو العاص بن الربيع',
  'Abul-As ibn al-Rabi',
  NULL, 'male', NULL, 'both', NULL,
  '0580-01-01', '0633-01-01',
  'c. 43 BH', '12 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"الأمين","title_en":"The Trustworthy (praised by the Prophet)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 051 — Uthman ibn Affan (husband of Ruqayyah, then Umm Kulthum; third Caliph)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000051',
  'عثمان بن عفان',
  'Uthman ibn Affan',
  NULL, 'male', NULL, 'both', NULL,
  '0576-01-01', '0656-01-01',
  'c. 47 BH', '35 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"ذو النورين","title_en":"The Possessor of Two Lights (married two daughters of the Prophet)"},{"title":"الخليفة الثالث","title_en":"Third Caliph"},{"title":"أمير المؤمنين","title_en":"Commander of the Faithful"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Note: Ali ibn Abi Talib (id 003) married Fatimah al-Zahra (id 002). Already in seed.


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION E: MARRIAGES OF THE PROPHET'S DAUGHTERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Marriage 113: Zaynab bint Muhammad ↔ Abul-As ibn al-Rabi
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000113',
  '00000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000047',
  'c. 10 BH', 1, true,
  'Married before Prophethood. After he accepted Islam (much later) their marriage was re-affirmed.'
) ON CONFLICT DO NOTHING;

-- Marriage 114: Ruqayyah bint Muhammad ↔ Uthman ibn Affan
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000114',
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000048',
  'c. 2 BH', 1, true,
  'Uthman migrated with Ruqayyah to Abyssinia. She died while he was at the Battle of Badr.'
) ON CONFLICT DO NOTHING;

-- Marriage 115: Umm Kulthum bint Muhammad ↔ Uthman ibn Affan (after Ruqayyah died)
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000115',
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000049',
  '3 AH', 2, true,
  'Second marriage for Uthman with the Prophet''s daughters; hence the title Dhu al-Nurayn.'
) ON CONFLICT DO NOTHING;

-- Marriage 116: Fatimah al-Zahra ↔ Ali ibn Abi Talib (already in seed; link records)
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000116',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  '2 AH', 1, true,
  'The Prophet arranged this marriage himself. One of the most celebrated marriages in Islamic history.'
) ON CONFLICT DO NOTHING;

-- Link Hasan & Husayn to marriage 116
UPDATE persons
SET marriage_id = '00000000-0000-0000-0000-000000000116'
WHERE id IN (
  '00000000-0000-0000-0000-000000000004',  -- Al-Hasan ibn Ali
  '00000000-0000-0000-0000-000000000005'   -- Al-Husayn ibn Ali
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION F: GRANDCHILDREN OF THE PROPHET ﷺ
-- Through his daughters only (the line continues only through Fatimah per hadith)
-- Generation 3
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Through Zaynab bint Muhammad ─────────────────────────────────────────────

-- 052 — Umamah bint Abi al-As (granddaughter; the Prophet used to carry her during prayer)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000052',
  'أمامة بنت أبي العاص',
  'Umamah bint Abi al-As',
  '00000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000047',
  '00000000-0000-0000-0000-000000000113',
  'female', NULL, 'both', 3,
  '0606-01-01', '0661-01-01',
  'c. 23 BH', 'c. 40 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[{"title":"حفيدة النبي","title_en":"Granddaughter of the Prophet (he carried her during salah)"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 053 — Ali ibn Abi al-As (grandson through Zaynab; died young)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000053',
  'علي بن أبي العاص',
  'Ali ibn Abi al-As',
  '00000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000047',
  '00000000-0000-0000-0000-000000000113',
  'male', NULL, 'both', 3,
  '0608-01-01', '0624-01-01',
  'c. 21 BH', 'c. 3 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- ── Through Ruqayyah bint Muhammad ───────────────────────────────────────────

-- 054 — Abd Allah ibn Uthman (grandson; died at age 6; the Prophet wept at his grave)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000054',
  'عبد الله بن عثمان',
  'Abd Allah ibn Uthman',
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000048',
  '00000000-0000-0000-0000-000000000114',
  'male', NULL, 'both', 3,
  '0616-01-01', '0622-01-01',
  'c. 5 BH', 'c. 4 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Al-Isaba fi Tamyiz al-Sahaba","author":"Ibn Hajar","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- ── Through Fatimah al-Zahra (already have Hasan id=004 and Husayn id=005)
-- Additional children of Fatimah and Ali:

-- 055 — Zaynab bint Ali (great granddaughter of the Prophet through Fatimah; heroine of Karbala)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000055',
  'زينب بنت علي',
  'Zaynab bint Ali',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000116',
  'female', NULL, 'both', 3,
  '0627-01-01', '0682-01-01',
  '5 AH', '62 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"},{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"}]'::jsonb,
  '[{"title":"عقيلة بني هاشم","title_en":"The Noblewoman of Banu Hashim"},{"title":"أم المصائب","title_en":"Mother of Calamities"},{"title":"بطلة كربلاء","title_en":"Heroine of Karbala"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 056 — Umm Kulthum bint Ali (daughter of Fatimah and Ali; married Umar ibn al-Khattab per some narrations)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000056',
  'أم كلثوم بنت علي',
  'Umm Kulthum bint Ali',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000116',
  'female', NULL, 'both', 3,
  '0629-01-01', '0680-01-01',
  '7 AH', '61 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 057 — Muhsin ibn Ali (third son of Fatimah and Ali; died in early childhood per Shia narrations)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000057',
  'محسن بن علي',
  'Muhsin ibn Ali',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000116',
  'male', NULL, 'both', 3,
  '0630-01-01', '0632-01-01',
  '8 AH', '10 AH',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[{"title":"المُحسن","title_en":"Muhsin — mentioned mainly in Shia sources, died in infancy"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION G: SPOUSES OF THE PROPHET'S GRANDCHILDREN
-- (children of Fatimah and Ali, and children of Zaynab bint Muhammad)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 058 — Abdullah ibn Jafar al-Tayyar (husband of Zaynab bint Ali; son of Jafar ibn Abi Talib)
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000058',
  'عبد الله بن جعفر الطيار',
  'Abdullah ibn Jafar al-Tayyar',
  NULL, 'male', 'hashemite', 'both', NULL,
  '0619-01-01', '0699-01-01',
  '2 AH', '80 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"}]'::jsonb,
  '[{"title":"بحر الجود","title_en":"Sea of Generosity — renowned for his charity"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 059 — Umar ibn al-Khattab (second Caliph; married Umm Kulthum bint Ali per narrations)
-- Note: historically debated but recorded in classical sources.
INSERT INTO persons (
  id, name_ar, name_en, father_id, gender, branch, scholarly_tradition, generation,
  birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000059',
  'عمر بن الخطاب',
  'Umar ibn al-Khattab',
  NULL, 'male', NULL, 'both', NULL,
  '0584-01-01', '0644-01-01',
  'c. 40 BH', '23 AH',
  '[{"title":"Al-Tabaqat al-Kubra","author":"Ibn Sa''d","type":"classical_text"},{"title":"Siyar A''lam al-Nubala''","author":"al-Dhahabi","type":"classical_text"},{"title":"Al-Bidaya wal-Nihaya","author":"Ibn Kathir","type":"classical_text"}]'::jsonb,
  '[{"title":"الفاروق","title_en":"Al-Faruq — The Distinguisher between Truth and Falsehood"},{"title":"الخليفة الثاني","title_en":"Second Caliph"},{"title":"أمير المؤمنين","title_en":"Commander of the Faithful"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Marriage 117: Zaynab bint Ali ↔ Abdullah ibn Jafar
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000117',
  '00000000-0000-0000-0000-000000000058',
  '00000000-0000-0000-0000-000000000055',
  'c. 25 AH', 1, true,
  'Ali ibn Abi Talib arranged this marriage for his daughter Zaynab.'
) ON CONFLICT DO NOTHING;

-- Marriage 118: Umm Kulthum bint Ali ↔ Umar ibn al-Khattab (contested in some traditions)
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000118',
  '00000000-0000-0000-0000-000000000059',
  '00000000-0000-0000-0000-000000000056',
  'c. 17 AH', 1, true,
  'Recorded in Al-Tabaqat al-Kubra and other classical sources; debated in some Shia traditions.'
) ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION H: CHILDREN OF ZAYNAB BINT ALI (great-grandchildren of the Prophet)
-- Generation 4 through the Ali-Fatimah-Muhammad line
-- ═══════════════════════════════════════════════════════════════════════════════

-- 060 — Ali ibn Abdullah ibn Jafar (son of Zaynab bint Ali)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000060',
  'علي بن عبد الله بن جعفر',
  'Ali ibn Abdullah ibn Jafar',
  '00000000-0000-0000-0000-000000000058',
  '00000000-0000-0000-0000-000000000055',
  '00000000-0000-0000-0000-000000000117',
  'male', NULL, 'both', 4,
  '0647-01-01', '0714-01-01',
  'c. 26 AH', 'c. 95 AH',
  '[{"title":"Jamharat Ansab al-Arab","author":"Ibn Hazm","type":"classical_text"},{"title":"Ansab al-Ashraf","author":"al-Baladhuri","type":"classical_text"}]'::jsonb,
  '[]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 061 — Awn ibn Abdullah ibn Jafar (son of Zaynab bint Ali; accompanied her to Karbala)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000061',
  'عون بن عبد الله بن جعفر',
  'Awn ibn Abdullah ibn Jafar',
  '00000000-0000-0000-0000-000000000058',
  '00000000-0000-0000-0000-000000000055',
  '00000000-0000-0000-0000-000000000117',
  'male', NULL, 'both', 4,
  '0649-01-01', '0680-01-01',
  'c. 28 AH', '61 AH',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"شهيد كربلاء","title_en":"Martyr of Karbala"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- 062 — Muhammad ibn Abdullah ibn Jafar (son of Zaynab bint Ali; also martyred at Karbala)
INSERT INTO persons (
  id, name_ar, name_en, father_id, mother_id, marriage_id, gender, branch,
  scholarly_tradition, generation, birth_date_gregorian, death_date_gregorian,
  birth_date_hijri, death_date_hijri, sources, titles, is_verified
) VALUES (
  '00000000-0000-0000-0000-000000000062',
  'محمد بن عبد الله بن جعفر',
  'Muhammad ibn Abdullah ibn Jafar',
  '00000000-0000-0000-0000-000000000058',
  '00000000-0000-0000-0000-000000000055',
  '00000000-0000-0000-0000-000000000117',
  'male', NULL, 'both', 4,
  '0651-01-01', '0680-01-01',
  'c. 30 AH', '61 AH',
  '[{"title":"Al-Irshad","author":"al-Shaykh al-Mufid","type":"classical_text"},{"title":"Maqatil al-Talibiyyin","author":"Abu al-Faraj al-Isfahani","type":"classical_text"}]'::jsonb,
  '[{"title":"شهيد كربلاء","title_en":"Martyr of Karbala"}]'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION I: UMAMAH BINT ABI AL-AS — SPOUSE AND CHILDREN
-- (granddaughter of the Prophet through Zaynab bint Muhammad;
--  the Prophet carried Umamah during prayer — Sahih Bukhari)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 063 — Ali ibn Abi Talib married Umamah bint Abi al-As after Fatimah's death
-- Ali (id 003) is already in seed. Marriage:
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified, notes_en)
VALUES (
  '00000000-0000-0000-0000-000000000119',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000052',
  'c. 12 AH', 2, true,
  'Fatimah herself requested on her deathbed that Ali marry Umamah. Recorded in Al-Tabaqat al-Kubra.'
) ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION J: SUMMARY COMMENT — UUID REGISTRY
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PERSONS ADDED IN THIS FILE:
--  032  Khadijah bint Khuwaylid             (wife 1)
--  033  Sawdah bint Zam'ah                  (wife 2)
--  034  Aishah bint Abi Bakr                (wife 3)
--  035  Hafsah bint Umar                    (wife 4)
--  036  Zaynab bint Khuzaymah               (wife 5)
--  037  Umm Salamah                         (wife 6)
--  038  Zaynab bint Jahsh                   (wife 7)
--  039  Juwayriyyah bint al-Harith          (wife 8)
--  040  Ramlah / Umm Habibah                (wife 9)
--  041  Safiyyah bint Huyayy                (wife 10)
--  042  Maymunah bint al-Harith             (wife 11)
--  043  Mariyah al-Qibtiyyah                (concubine / umm walad)
--  044  Al-Qasim ibn Muhammad               (son, d. infancy)
--  045  Abd Allah ibn Muhammad              (son, d. infancy)
--  046  Ibrahim ibn Muhammad                (son by Mariyah, d. infancy)
--  047  Zaynab bint Muhammad                (daughter)
--  048  Ruqayyah bint Muhammad              (daughter)
--  049  Umm Kulthum bint Muhammad           (daughter)
--  050  Abul-As ibn al-Rabi                 (husband of Zaynab bint Muhammad)
--  051  Uthman ibn Affan                    (husband of Ruqayyah then Umm Kulthum)
--  052  Umamah bint Abi al-As               (granddaughter through Zaynab)
--  053  Ali ibn Abi al-As                   (grandson through Zaynab, d. young)
--  054  Abd Allah ibn Uthman                (grandson through Ruqayyah, d. age 6)
--  055  Zaynab bint Ali                     (granddaughter through Fatimah)
--  056  Umm Kulthum bint Ali                (granddaughter through Fatimah)
--  057  Muhsin ibn Ali                      (grandson through Fatimah, d. infancy)
--  058  Abdullah ibn Jafar al-Tayyar        (husband of Zaynab bint Ali)
--  059  Umar ibn al-Khattab                 (husband of Umm Kulthum bint Ali)
--  060  Ali ibn Abdullah ibn Jafar          (great-grandson through Zaynab bint Ali)
--  061  Awn ibn Abdullah ibn Jafar          (great-grandson; martyred Karbala)
--  062  Muhammad ibn Abdullah ibn Jafar     (great-grandson; martyred Karbala)
--
-- MARRIAGES ADDED IN THIS FILE:
--  102  Prophet ↔ Khadijah
--  103  Prophet ↔ Sawdah
--  104  Prophet ↔ Aishah
--  105  Prophet ↔ Hafsah
--  106  Prophet ↔ Zaynab bint Khuzaymah
--  107  Prophet ↔ Umm Salamah
--  108  Prophet ↔ Zaynab bint Jahsh
--  109  Prophet ↔ Juwayriyyah
--  110  Prophet ↔ Umm Habibah
--  111  Prophet ↔ Safiyyah
--  112  Prophet ↔ Maymunah
--  113  Abul-As ↔ Zaynab bint Muhammad
--  114  Uthman ↔ Ruqayyah bint Muhammad
--  115  Uthman ↔ Umm Kulthum bint Muhammad
--  116  Ali ↔ Fatimah al-Zahra
--  117  Abdullah ibn Jafar ↔ Zaynab bint Ali
--  118  Umar ibn al-Khattab ↔ Umm Kulthum bint Ali
--  119  Ali ↔ Umamah bint Abi al-As (second marriage)
--
-- Next available person UUID: 063
-- Next available marriage UUID: 120
-- ═══════════════════════════════════════════════════════════════════════════════