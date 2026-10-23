-- ============================================================================
-- RankHub - OPTIONAL Seed Demo Data
-- Only run this if you want sample demo boards and participants in development!
-- DO NOT run this in production if you want a clean database.
-- ============================================================================

insert into public.boards (id, slug, title, description, banner_notes, sort_order, unit_type, status, deadline, visibility, config)
values (
  'board-subsecond-w10',
  'lelang-subsecond-w10',
  'SubSecond Priority Queue W10',
  'Papan lelang penentuan urutan prioritas eksekusi bot SubSecond untuk Batch Week 10.',
  'Urutan eksekusi bot SubSecond ditentukan murni berdasarkan nominal lelang terverifikasi. Deadline otomatis diperpanjang 2 menit jika ada bid di menit terakhir.',
  'DESC',
  'CURRENCY_IDR',
  'ACTIVE',
  (now() + interval '3 days')::text,
  'PUBLIC',
  '{"allowPublicSubmit": true, "maskIdentifiersByDefault": true, "enablePodium": true, "enableAntiSniping": true, "antiSnipingThresholdSec": 60, "antiSnipingExtensionSec": 120}'::jsonb
) on conflict (id) do nothing;

insert into public.participants (id, board_id, name, identifier, value, status, custom_meta)
values
  ('part-ss-01', 'board-subsecond-w10', 'Syahrul Hidayat', 'syahrul_0812***', 1250000, 'VERIFIED', '{"telegram": "@syahrul_dev", "notes": "Node SG-1 Priority", "delayOffsetMs": 0}'),
  ('part-ss-02', 'board-subsecond-w10', 'Budi Santoso', 'budi_santoso@***', 950000, 'VERIFIED', '{"telegram": "@budi_trader", "notes": "Tokyo Edge Worker", "delayOffsetMs": 15}'),
  ('part-ss-03', 'board-subsecond-w10', 'Dewi Lestari', 'dewilestari_99@***', 850000, 'VERIFIED', '{"telegram": "@dewi_algo", "notes": "Jakarta Fiber Route", "delayOffsetMs": 30}'),
  ('part-ss-04', 'board-subsecond-w10', 'Reza Pratama', 'reza_p@***', 600000, 'VERIFIED', '{"notes": "Worker #4", "delayOffsetMs": 45}'),
  ('part-ss-05', 'board-subsecond-w10', 'Siti Rahma', 'siti_rahma***', 500000, 'VERIFIED', '{"notes": "Worker #5", "delayOffsetMs": 60}'),
  ('part-ss-06', 'board-subsecond-w10', 'Kevin Sanjaya', 'kevin_s@***', 450000, 'VERIFIED', '{"notes": "Worker #6", "delayOffsetMs": 75}'),
  ('part-ss-07', 'board-subsecond-w10', 'Ahmad Fadillah', 'ahmad_fad@***', 350000, 'VERIFIED', '{"notes": "Worker #7", "delayOffsetMs": 90}'),
  ('part-ss-08', 'board-subsecond-w10', 'Fajar Nugraha', 'fajar_nug@***', 300000, 'VERIFIED', '{"notes": "Worker #8", "delayOffsetMs": 105}'),
  ('part-ss-09', 'board-subsecond-w10', 'Nadia Putri', 'nadia_putri@***', 250000, 'VERIFIED', '{"notes": "Worker #9", "delayOffsetMs": 120}'),
  ('part-ss-10', 'board-subsecond-w10', 'Rian Ardianto', 'rian_ard@***', 150000, 'VERIFIED', '{"notes": "Worker #10", "delayOffsetMs": 135}')
on conflict (id) do nothing;
