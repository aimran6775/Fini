# FiniTax Guatemala — Copilot Instructions

## Project Overview
Multi-tenant accounting, FEL invoicing, payroll, and tax platform for Guatemalan businesses. Built with **Next.js 16 (App Router)**, **Supabase** (auth + Postgres), **Tailwind CSS v4**, and **Zod v4** for validation. All UI text is in **Spanish (es-GT)**. Deployed on **Railway** with standalone output.

## Architecture

- **`src/app/actions/`** — Server Actions (`"use server"`) are the primary data-mutation layer. Each domain has its own file: `invoices.ts`, `expenses.ts`, `payroll.ts`, `tax.ts`, `accounting.ts`, `banking.ts`, `auth.ts`. Actions use `createClient()` from `@/lib/supabase/server` and call Supabase directly — there is no separate API/service layer.
- **`src/app/dashboard/`** — All protected pages live here. Dashboard pages are **async Server Components** that fetch data directly via Supabase queries. Client interactivity is isolated to `"use client"` leaf components.
- **`src/lib/supabase/`** — Three Supabase client factories: `server.ts` (Server Components/Actions, uses `cookies()`), `client.ts` (browser, `createBrowserClient`), `middleware.ts` (session refresh in Next.js middleware).
- **`src/lib/rbac/`** — Role-Based Access Control with three roles: `admin`, `accountant`, `employee`. Use `requirePermission()` / `requireRole()` in Server Components and `<RequirePermission>` / `<RequireRole>` in Client Components. Permissions are defined as dot-notation strings (e.g., `"fel.create"`, `"payroll.approve"`).
- **`src/lib/types/`** — `database.ts` mirrors the Supabase schema as TypeScript types; `forms.ts` contains Zod schemas for validation.
- **`src/components/ui/`** — Radix UI primitives styled with `class-variance-authority` (shadcn/ui pattern). Use `cn()` from `@/lib/utils` for class merging.

## Key Conventions

### Multi-Tenancy
Every data query **must** filter by `organization_id`. The current org comes from `useOrg()` (client) or by querying `organization_members` for the user (server). Never query without an org scope.

### Server Actions Pattern
```ts
// Always: "use server" → createClient() → auth check → Supabase query → revalidatePath → redirect
export async function createSomething(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // ... insert/update ... 
  revalidatePath("/dashboard/something");
}
```
Actions accept `FormData` for mutations and return `{ error: string }` on failure.

### Guatemala Tax Domain
Tax rates and constants live in `src/lib/tax-utils.ts` (`TAX_RATES` object). Key rates: IVA 12% (included in price), ISR 25% (Utilidades) or 5%/7% (Simplificado), ISO 1%, IGSS 4.83% employee / 10.67% employer. **IVA is always included in the price** — extract with `amount / 1.12`. Currency is GTQ; format with `formatCurrency()` or `formatGTQ()`.

### FEL Invoicing
Guatemala's electronic invoicing system. Document types defined in `FEL_TYPE_LABELS` (`src/lib/tax-utils.ts`). Invoice flow: `DRAFT` → `CERTIFIED` → `AUTHORIZED`. Default client is "Consumidor Final" with NIT "CF".

### Database & Migrations
Schema is in `supabase/migrations/` (raw SQL). Deploy with `npm run db:migrate` (requires `DB_PASSWORD` in `.env.local`). All tables use UUID PKs and `organization_id` FK for tenant isolation. The `chart_of_accounts` table is seeded in migration `002`.

### Formatting & Locale
Use `formatCurrency()`, `formatDate()`, `formatNIT()`, `formatDPI()` from `@/lib/utils` and `@/lib/tax-utils`. NIT format: `XXXXXXXX-X`. DPI format: `XXXX XXXXX XXXX`. All dates use `es-GT` locale.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (standalone output)
- `npm run lint` — ESLint
- `npm run db:migrate` — Deploy SQL migrations to Supabase

## Environment Variables
Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DB_PASSWORD` (migrations), `ANTHROPIC_API_KEY` (AI chat).

## Do NOT
- Query Supabase tables without `organization_id` filter
- Use `@supabase/auth-helpers-nextjs` for new code — use `@supabase/ssr` pattern in `src/lib/supabase/`
- Hardcode tax rates — always reference `TAX_RATES` from `src/lib/tax-utils.ts`
- Write UI text in English — all user-facing strings must be in Spanish (es-GT)
