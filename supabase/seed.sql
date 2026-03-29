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
