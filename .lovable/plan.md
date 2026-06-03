## Fe Paldolfi — Sistema de Reservas de Eventos

Sistema para clientes reservarem vagas em eventos/workshops da loja, com ranking de engajamento e painel admin completo.

### Funcionalidades

**Área pública / cliente**
- Landing com identidade visual da Fe Paldolfi
- Login com Google
- Listagem de eventos disponíveis (data, hora, vagas restantes, descrição)
- Reserva de vaga em 1 clique
- "Minhas reservas" (próximas e passadas) com opção de cancelar
- Ranking público dos clientes mais ativos (Top 10 + posição do usuário logado)
- Perfil do usuário com pontuação e badges

**Painel admin**
- Acesso restrito por role `admin`
- CRUD de eventos (criar, editar, cancelar, definir vagas)
- Lista de reservas por evento + marcar presença (check-in)
- Gestão de usuários (ver, promover a admin)
- Dashboard com métricas (reservas totais, taxa de presença, top usuários)

**Ranking**
- +10 pontos por reserva confirmada
- +25 pontos por presença confirmada (marcada pelo admin)
- −5 pontos por cancelamento tardio (< 24h antes)
- Ranking exibido em tempo real

### Stack e arquitetura

- TanStack Start + Lovable Cloud (Supabase)
- Login Google via broker Lovable
- Rotas públicas: `/`, `/eventos`, `/ranking`, `/auth`
- Rotas autenticadas: `/_authenticated/minhas-reservas`, `/_authenticated/perfil`
- Rotas admin: `/_authenticated/admin/*` (gated por role)

### Schema do banco

```text
profiles (id → auth.users, nome, avatar_url, pontos int default 0)
user_roles (user_id, role enum['admin','user'])  -- separado por segurança
events (id, titulo, descricao, data_inicio, data_fim, vagas_total, vagas_ocupadas, local, imagem_url, status)
reservations (id, event_id, user_id, status enum['confirmada','cancelada','presente','ausente'], created_at)
```

- Função `has_role()` security-definer
- Trigger: criar profile ao signup
- Trigger: ao mudar status de reserva → atualizar `profiles.pontos` e `events.vagas_ocupadas`
- RLS: usuário vê/edita só suas reservas; admin vê tudo; ranking lê profiles publicamente (campos limitados)

### Design

Estética sofisticada de boutique — paleta neutra quente (off-white, terracota suave, preto), tipografia editorial (serif display + sans clean), layout arejado com fotos em destaque dos eventos.

### Plano de execução

1. Ativar Lovable Cloud
2. Criar migrations (tabelas, enums, função has_role, triggers, RLS, grants)
3. Configurar Google OAuth (broker)
4. Layout base + tema Fe Paldolfi
5. Auth (login Google, página /auth, layout _authenticated)
6. Catálogo de eventos + página de detalhe + reserva
7. Minhas reservas + cancelamento
8. Ranking público
9. Painel admin (CRUD eventos, check-in, usuários)
10. Polish, SEO, responsividade

### Perguntas pendentes (posso assumir defaults)

- Imagem/logo da Fe Paldolfi: posso gerar placeholders ou você envia?
- Primeiro admin: defino você manualmente via SQL após o primeiro login.
