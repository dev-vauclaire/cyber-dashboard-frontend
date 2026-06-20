# Cyber Dashboard Frontend

Interface web React pour visualiser les attaques, alertes IP communes, sources,
topologie, enrichissements CTI et paramètres d'administration.

## Stack

- React 19
- TypeScript strict
- Vite
- MUI / MUI X
- TanStack React Query
- React Router
- Dayjs

## Prérequis

- Backend disponible sur l'URL configurée dans `VITE_API_BASE_URL`
- Node.js 24.17.0
- npm 11.13.0

## Configuration

Créer un fichier `.env.local` si nécessaire :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

En développement, Vite proxy les appels `/api` vers `VITE_API_BASE_URL`.

## Scripts

```bash
nvm use
npm ci
npm run dev
npm run build
npm run lint
npm run preview
```

## Architecture

```txt
src/
  app/
    App.tsx
    router.tsx
    providers/
    queryClient.ts
  shared/
    api/
    cti/
    sources/
    theme/
    ui/
    utils/
    types/
  pages/
    dashboard/
      sections/
        alerts/
          api/
          components/
          queryKeys.ts
          types/
          utils/
        attacks/
        charts/
        overview/
        sources/
        topology/
    settings/
      sections/
        collectors/
        cti/
        emails/
        sources/
```

## Règles D'organisation

- `app` contient le bootstrap, le router et les providers globaux.
- `pages` contient les pages et leurs sections.
- Tout ce qui est interne à une section reste dans cette section : API, types,
  query keys, hooks, composants et utilitaires.
- Tout ce qui est partagé par plusieurs sections ou pages va dans `shared`.
- `shared` peut contenir du socle technique (`api`, `theme`, `ui`, `utils`,
  `types`) et du métier réellement partagé (`sources`, `cti`).
- Les composants de rendu ne font pas d'appel API directement.
- Les query keys React Query sont centralisées dans la section propriétaire ou
  dans le module `shared` propriétaire si elles sont partagées.
- Les fichiers génériques `utils/utils.ts`, `api/api.ts`, `types/types.ts` sont
  évités au profit de noms explicites.
- Les gros composants sont découpés en `components`, `hooks`, `utils`,
  `queryKeys`, `types`.

## Conventions

- Composants React : `PascalCase.tsx`.
- Hooks : `useXxx.ts`.
- Utilitaires : exports nommés.
- Types : exports nommés, pas de constantes dans les fichiers de types.
- Query keys : factories `as const`.
- Les imports métier doivent pointer vers la section propriétaire ou vers
  `shared` si le code est réellement partagé.
- Pas de duplication entre types globaux, modules `shared` et sections locales.
- Pas de logique métier lourde dans le JSX.

## Qualité

ESLint et TypeScript strict sont les normes automatisées actuelles. Prettier n'est
pas configuré dans le projet ; ne pas lancer de formatteur non versionné.

Avant merge :

```bash
npm run lint
npm run build
```

Checklist PR :

- Le code modifié reste dans `cyber-dashboard-frontend`.
- Les query keys ajoutées sont centralisées dans la section ou dans `shared`.
- Les appels API sont dans la section propriétaire ou dans `shared` si l'API est
  consommée par plusieurs sections/pages.
- Les composants volumineux sont découpés si une nouvelle responsabilité apparaît.
- `npm run lint` et `npm run build` passent.

## Scénarios Manuels Minimum

- Dashboard charge sans erreur.
- Filtres dates/sources fonctionnent.
- Alertes et attaques paginent correctement.
- Dialogs alertes, attaques, CTI et email s'ouvrent correctement.
- Settings CTI, SMTP, collecteurs et sources restent fonctionnels.
