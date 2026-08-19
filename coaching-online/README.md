# Ta Consultation Personnalisée — VD Performance

Landing page + questionnaire multi-étapes (15 écrans) pour capter des leads
pour le coaching en ligne VD Performance. Next.js 16 + React 19 + Tailwind 4,
même stack que `305-cpr-training`.

## Démarrer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3004](http://localhost:3004).

## Avant de lancer en prod

1. **Silhouettes** — ajoute les 10 images dans
   `public/images/silhouettes/` avec les noms exacts listés dans le
   [README de ce dossier](public/images/silhouettes/README.md). Sans elles,
   la page affiche un placeholder pointillé (pas de crash).
2. **Réception des données** — déploie `google-apps-script/Code.gs` en Web
   App (instructions en tête du fichier), puis copie l'URL `/exec` dans
   `NEXT_PUBLIC_SUBMIT_ENDPOINT` (fichier `.env.local`, à créer à partir de
   `.env.example`). Sans ça, le bouton final échoue proprement avec un
   message d'erreur au lieu d'envoyer les données dans le vide.
   - Tu n'es pas encore sûr d'utiliser Google Sheet ou Setsmart : ce n'est
     pas bloquant. Le funnel poste toujours le même payload JSON (voir
     `submitAnswers()` dans `components/FunnelApp.tsx`) — tu peux pointer
     `NEXT_PUBLIC_SUBMIT_ENDPOINT` vers n'importe quel endpoint qui répond
     `{ "success": true }`, y compris un webhook Setsmart si son API accepte
     du JSON en POST.
3. **Pixels publicitaires** — renseigne `NEXT_PUBLIC_META_PIXEL_ID` et/ou
   `NEXT_PUBLIC_GOOGLE_ADS_ID` (+ `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`)
   dans `.env.local` pour activer le tracking. Événements envoyés :
   - Début du questionnaire → `InitiateCheckout` (Meta) / `quiz_start` (GA4)
   - Soumission finale → `Lead` (Meta) / `generate_lead` + conversion Google
     Ads (GA4/Google)
4. **Email de notification** — `NOTIFICATION_EMAIL` dans
   `google-apps-script/Code.gs` est réglé sur `vaal671@gmail.com` par
   défaut, à changer si besoin.

## Structure du questionnaire

Voir `lib/questionnaire-data.ts` pour l'ordre exact des 15 écrans. L'étape
"Combien de kg à perdre" ne s'affiche que si l'objectif choisi est
"Perdre du gras" (logique conditionnelle gérée dans `FunnelApp.tsx`).

## Déploiement

Comme `305-cpr-training`, ce projet se déploie tel quel sur Vercel (aucune
config spécifique nécessaire).
