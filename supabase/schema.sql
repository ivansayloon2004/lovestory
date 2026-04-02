create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  relationship_id uuid,
  theme_mode text not null default 'system' check (theme_mode in ('light', 'dark', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
  started_on date,
  status text not null default 'open' check (status in ('open', 'paired')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  drop constraint if exists profiles_relationship_id_fkey;

alter table public.profiles
  add constraint profiles_relationship_id_fkey
  foreign key (relationship_id)
  references public.relationships(id)
  on delete set null;

create table if not exists public.relationship_members (
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (relationship_id, user_id)
);

create unique index if not exists relationship_members_user_unique
  on public.relationship_members (user_id);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  memory_date date not null,
  mood text not null,
  story_html text not null,
  tags text[] not null default '{}',
  location_label text,
  is_special_moment boolean not null default false,
  special_type text check (special_type in ('anniversary', 'birthday', 'trip', 'important_event') or special_type is null),
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists memories_relationship_date_idx
  on public.memories (relationship_id, memory_date desc, created_at desc);

create index if not exists memories_tags_gin_idx
  on public.memories using gin (tags);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists memory_photos_memory_idx
  on public.memory_photos (memory_id, sort_order);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  opened_at timestamptz
);

create index if not exists letters_relationship_created_idx
  on public.letters (relationship_id, created_at desc);

create table if not exists public.reminder_preferences (
  relationship_id uuid primary key references public.relationships(id) on delete cascade,
  weekly_memory_prompt boolean not null default true,
  weekly_memory_day integer not null default 0 check (weekly_memory_day between 0 and 6),
  weekly_memory_hour integer not null default 20 check (weekly_memory_hour between 0 and 23),
  anniversary_reminders boolean not null default true,
  anniversary_lead_days integer not null default 7 check (anniversary_lead_days between 1 and 30),
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.ensure_relationship_member_limit()
returns trigger
language plpgsql
as $$
declare
  member_total integer;
begin
  select count(*)
  into member_total
  from public.relationship_members
  where relationship_id = new.relationship_id;

  if member_total >= 2 then
    raise exception 'This diary already has two linked users.';
  end if;

  return new;
end;
$$;

drop trigger if exists relationship_members_limit_trigger on public.relationship_members;

create trigger relationship_members_limit_trigger
before insert on public.relationship_members
for each row execute function public.ensure_relationship_member_limit();

create or replace function public.sync_relationship_status()
returns trigger
language plpgsql
as $$
declare
  target_relationship uuid;
  member_total integer;
begin
  target_relationship = coalesce(new.relationship_id, old.relationship_id);

  select count(*)
  into member_total
  from public.relationship_members
  where relationship_id = target_relationship;

  update public.relationships
  set status = case when member_total >= 2 then 'paired' else 'open' end,
      updated_at = timezone('utc', now())
  where id = target_relationship;

  return coalesce(new, old);
end;
$$;

drop trigger if exists relationship_members_status_insert on public.relationship_members;
drop trigger if exists relationship_members_status_delete on public.relationship_members;

create trigger relationship_members_status_insert
after insert on public.relationship_members
for each row execute function public.sync_relationship_status();

create trigger relationship_members_status_delete
after delete on public.relationship_members
for each row execute function public.sync_relationship_status();

create or replace function public.is_relationship_member(target_relationship uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.relationship_members rm
    where rm.relationship_id = target_relationship
      and rm.user_id = auth.uid()
  );
$$;

create or replace function public.create_relationship_space(input_started_on date default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_uuid uuid;
  existing_relationship uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select relationship_id
  into existing_relationship
  from public.profiles
  where id = auth.uid();

  if existing_relationship is not null then
    raise exception 'You are already linked to a diary.';
  end if;

  insert into public.relationships (started_on, created_by)
  values (input_started_on, auth.uid())
  returning id into relationship_uuid;

  insert into public.relationship_members (relationship_id, user_id)
  values (relationship_uuid, auth.uid());

  update public.profiles
  set relationship_id = relationship_uuid,
      updated_at = timezone('utc', now())
  where id = auth.uid();

  insert into public.reminder_preferences (relationship_id)
  values (relationship_uuid)
  on conflict (relationship_id) do nothing;

  return relationship_uuid;
end;
$$;

create or replace function public.join_relationship_space(input_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_uuid uuid;
  existing_relationship uuid;
  member_total integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select relationship_id
  into existing_relationship
  from public.profiles
  where id = auth.uid();

  if existing_relationship is not null then
    raise exception 'You are already linked to a diary.';
  end if;

  select id
  into relationship_uuid
  from public.relationships
  where invite_code = upper(trim(input_code))
  limit 1;

  if relationship_uuid is null then
    raise exception 'Invite code not found.';
  end if;

  select count(*)
  into member_total
  from public.relationship_members
  where relationship_id = relationship_uuid;

  if member_total >= 2 then
    raise exception 'This diary is already paired.';
  end if;

  insert into public.relationship_members (relationship_id, user_id)
  values (relationship_uuid, auth.uid());

  update public.profiles
  set relationship_id = relationship_uuid,
      updated_at = timezone('utc', now())
  where id = auth.uid();

  insert into public.reminder_preferences (relationship_id)
  values (relationship_uuid)
  on conflict (relationship_id) do nothing;

  return relationship_uuid;
end;
$$;

grant execute on function public.create_relationship_space(date) to authenticated;
grant execute on function public.join_relationship_space(text) to authenticated;
grant execute on function public.is_relationship_member(uuid) to authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
drop trigger if exists relationships_touch_updated_at on public.relationships;
drop trigger if exists memories_touch_updated_at on public.memories;
drop trigger if exists reminder_preferences_touch_updated_at on public.reminder_preferences;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger relationships_touch_updated_at
before update on public.relationships
for each row execute function public.touch_updated_at();

create trigger memories_touch_updated_at
before update on public.memories
for each row execute function public.touch_updated_at();

create trigger reminder_preferences_touch_updated_at
before update on public.reminder_preferences
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.relationships enable row level security;
alter table public.relationship_members enable row level security;
alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;
alter table public.letters enable row level security;
alter table public.reminder_preferences enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "Profiles can read themselves and partner" on public.profiles;
create policy "Profiles can read themselves and partner"
on public.profiles
for select
using (
  id = auth.uid()
  or (relationship_id is not null and public.is_relationship_member(relationship_id))
);

drop policy if exists "Profiles update self" on public.profiles;
create policy "Profiles update self"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Relationships select by membership" on public.relationships;
create policy "Relationships select by membership"
on public.relationships
for select
using (public.is_relationship_member(id));

drop policy if exists "Relationships insert by creator" on public.relationships;
create policy "Relationships insert by creator"
on public.relationships
for insert
with check (created_by = auth.uid());

drop policy if exists "Relationships update by membership" on public.relationships;
create policy "Relationships update by membership"
on public.relationships
for update
using (public.is_relationship_member(id))
with check (public.is_relationship_member(id));

drop policy if exists "Relationship members select by membership" on public.relationship_members;
create policy "Relationship members select by membership"
on public.relationship_members
for select
using (public.is_relationship_member(relationship_id));

drop policy if exists "Memories select by membership" on public.memories;
create policy "Memories select by membership"
on public.memories
for select
using (public.is_relationship_member(relationship_id));

drop policy if exists "Memories insert by membership" on public.memories;
create policy "Memories insert by membership"
on public.memories
for insert
with check (
  public.is_relationship_member(relationship_id)
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "Memories update by membership" on public.memories;
create policy "Memories update by membership"
on public.memories
for update
using (public.is_relationship_member(relationship_id))
with check (public.is_relationship_member(relationship_id));

drop policy if exists "Memories delete by membership" on public.memories;
create policy "Memories delete by membership"
on public.memories
for delete
using (public.is_relationship_member(relationship_id));

drop policy if exists "Memory photos select by membership" on public.memory_photos;
create policy "Memory photos select by membership"
on public.memory_photos
for select
using (
  exists (
    select 1
    from public.memories m
    where m.id = memory_id
      and public.is_relationship_member(m.relationship_id)
  )
);

drop policy if exists "Memory photos insert by membership" on public.memory_photos;
create policy "Memory photos insert by membership"
on public.memory_photos
for insert
with check (
  exists (
    select 1
    from public.memories m
    where m.id = memory_id
      and public.is_relationship_member(m.relationship_id)
  )
);

drop policy if exists "Memory photos delete by membership" on public.memory_photos;
create policy "Memory photos delete by membership"
on public.memory_photos
for delete
using (
  exists (
    select 1
    from public.memories m
    where m.id = memory_id
      and public.is_relationship_member(m.relationship_id)
  )
);

drop policy if exists "Letters select by sender or recipient" on public.letters;
create policy "Letters select by sender or recipient"
on public.letters
for select
using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Letters insert by sender" on public.letters;
create policy "Letters insert by sender"
on public.letters
for insert
with check (
  sender_id = auth.uid()
  and public.is_relationship_member(relationship_id)
  and exists (
    select 1
    from public.relationship_members rm
    where rm.relationship_id = relationship_id
      and rm.user_id = recipient_id
  )
);

drop policy if exists "Letters update by participants" on public.letters;
create policy "Letters update by participants"
on public.letters
for update
using (sender_id = auth.uid() or recipient_id = auth.uid())
with check (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Reminder preferences by membership" on public.reminder_preferences;
create policy "Reminder preferences by membership"
on public.reminder_preferences
for select
using (public.is_relationship_member(relationship_id));

drop policy if exists "Reminder preferences update by membership" on public.reminder_preferences;
create policy "Reminder preferences update by membership"
on public.reminder_preferences
for update
using (public.is_relationship_member(relationship_id))
with check (public.is_relationship_member(relationship_id));

drop policy if exists "Push subscriptions own read" on public.push_subscriptions;
create policy "Push subscriptions own read"
on public.push_subscriptions
for select
using (user_id = auth.uid());

drop policy if exists "Push subscriptions own insert" on public.push_subscriptions;
create policy "Push subscriptions own insert"
on public.push_subscriptions
for insert
with check (user_id = auth.uid());

drop policy if exists "Push subscriptions own delete" on public.push_subscriptions;
create policy "Push subscriptions own delete"
on public.push_subscriptions
for delete
using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('memory-images', 'memory-images', false)
on conflict (id) do nothing;

drop policy if exists "Memory images select by relationship member" on storage.objects;
create policy "Memory images select by relationship member"
on storage.objects
for select
using (
  bucket_id = 'memory-images'
  and public.is_relationship_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Memory images upload by relationship member" on storage.objects;
create policy "Memory images upload by relationship member"
on storage.objects
for insert
with check (
  bucket_id = 'memory-images'
  and public.is_relationship_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Memory images update by relationship member" on storage.objects;
create policy "Memory images update by relationship member"
on storage.objects
for update
using (
  bucket_id = 'memory-images'
  and public.is_relationship_member(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'memory-images'
  and public.is_relationship_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "Memory images delete by relationship member" on storage.objects;
create policy "Memory images delete by relationship member"
on storage.objects
for delete
using (
  bucket_id = 'memory-images'
  and public.is_relationship_member(((storage.foldername(name))[1])::uuid)
);
