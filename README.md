# Kolara.app – Next.js + shadcn/ui

Port of the original HTML/CSS/JS prototype.

- `npm run dev` / `npm run build`
- Routes: `/` overview, `/tasks`, `/projects`, `/team`, `/calendar`, `/reports` (+ team chat panel, light/dark theme)
- `components/ui/*` – shadcn/ui primitives (Radix) restyled to the Kolara design
- `app/kolara.css` – original stylesheet (layout + bespoke visuals), loaded in the `components` layer so shadcn/Tailwind utilities win
- `lib/stores/*` – zustand stores (tasks, projects, team, calendar, chat, ui)
