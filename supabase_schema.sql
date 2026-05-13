-- Tabela de análises de imagens
create table if not exists analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  image_path text,
  image_url text,
  context text,
  opportunity text,
  potential text,
  potential_reasons jsonb default '[]',
  improvement_tips jsonb default '[]',
  created_at timestamptz default now()
);

-- Tabela de conteúdos gerados
create table if not exists content_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  analysis_id uuid references analyses(id) on delete cascade,
  ideas jsonb default '[]',
  scripts jsonb default '[]',
  caption_instagram text,
  caption_tiktok text,
  editing_suggestions jsonb default '[]',
  saved integer default 0,
  created_at timestamptz default now()
);

-- Tabela de eventos do calendário
create table if not exists calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid references content_items(id) on delete set null,
  title text,
  date date,
  pillar text default 'educativo',
  platform text default 'instagram',
  status text default 'pendente',
  series text,
  episode text,
  created_at timestamptz default now()
);

-- Tabela de métricas
create table if not exists content_metrics (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references content_items(id) on delete cascade,
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  saves integer default 0,
  platform text,
  posted_at timestamptz,
  created_at timestamptz default now(),
  unique(content_id, platform)
);

-- Habilitar RLS (Row Level Security)
alter table analyses enable row level security;
alter table content_items enable row level security;
alter table calendar_events enable row level security;
alter table content_metrics enable row level security;

-- Políticas: cada usuário vê/edita apenas seus próprios dados
create policy "users_own_analyses" on analyses for all using (auth.uid() = user_id);
create policy "users_own_content" on content_items for all using (auth.uid() = user_id);
create policy "users_own_events" on calendar_events for all using (auth.uid() = user_id);
create policy "users_own_metrics" on content_metrics for all
  using (content_id in (select id from content_items where user_id = auth.uid()));

-- Service role bypassa RLS (o backend usa service role key)
