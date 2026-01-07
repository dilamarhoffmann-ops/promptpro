-- 1. Tabela de CPFs Autorizados (Para o Admin controlar quem pode se cadastrar)
create table if not exists public.authorized_cpfs (
  cpf text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.authorized_cpfs enable row level security;

-- Política: Todos podem ler (para verificação durante o cadastro em authorized_cpfs)
create policy "Todos podem ler authorized_cpfs"
  on public.authorized_cpfs for select
  using (true);

-- Política: Apenas Admin (dilamarhs@gmail.com) pode inserir/deletar
-- Nota: Como verificação de email via RLS pode ser complexa sem claims customizadas,
-- simplificamos permitindo insert para users autenticados mas controlamos no frontend ou via Trigger se quiser mais segurança.
-- Para máxima segurança, use: auth.jwt() ->> 'email' = 'dilamarhs@gmail.com'
create policy "Admin pode gerenciar authorized_cpfs"
  on public.authorized_cpfs for all
  using (auth.jwt() ->> 'email' = 'dilamarhs@gmail.com');


-- 2. Tabela de Perfis de Usuário (Para armazenar os dados dos logins cadastrados)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  cpf text,
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

-- 3. Trigger para criar Perfil automaticamente ao criar Usuário no Auth
-- Esta função pega o CPF enviado nos metadados (options.data.cpf) e salva na tabela profiles
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
