-- 1. Tabela de E-mails Autorizados (Para o Admin controlar quem pode se cadastrar)
create table if not exists public.authorized_emails (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.authorized_emails enable row level security;

-- Política: Todos podem ler (para verificação durante o cadastro)
create policy "Todos podem ler authorized_emails"
  on public.authorized_emails for select
  using (true);

-- Política: Apenas Admin (dilamarhs@gmail.com) pode gerenciar
create policy "Admin pode gerenciar authorized_emails"
  on public.authorized_emails for all
  using (auth.jwt() ->> 'email' = 'dilamarhs@gmail.com');


-- 2. Tabela de Perfis de Usuário (Para armazenar os dados dos logins cadastrados)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  cpf text, -- Agora opcional
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Política: Perfis são visíveis por todos (ou restrinja conforme necessidade)
create policy "Perfis visíveis por todos"
  on public.profiles for select
  using (true);

-- Política: Usuário pode atualizar seu próprio perfil
create policy "Usuário pode editar próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Política: Admin pode excluir qualquer perfil
create policy "Admin pode excluir perfis"
  on public.profiles for delete
  using (auth.jwt() ->> 'email' = 'dilamarhs@gmail.com');

-- 3. Trigger para criar Perfil automaticamente ao criar Usuário no Auth
-- Pega o CPF se existir (pode vir de cadastros antigos ou meta customizada)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, cpf)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'cpf'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado após insert em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
