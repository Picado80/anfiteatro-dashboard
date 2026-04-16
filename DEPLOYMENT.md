# Anfiteatro Audit Dashboard - Vercel Deployment Guide

## Overview
This Next.js application is configured for deployment on Vercel with automatic Google Sheets data integration. The dashboard automatically fetches audit data every 15-30 minutes and displays real-time metrics and analytics.

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com (free tier available)
2. **GitHub Account** - For Git integration (recommended) or use Vercel's Git integration
3. **Google Service Account** - For Google Sheets API access
4. **Google Sheet** - A compiled sheet with all audit data from the 12+ forms

## Step 1: Set Up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account name (e.g., "Audit Dashboard")
   - Click "Create and Continue"
   - Skip optional steps, click "Done"
5. Create API Key:
   - Click the service account you just created
   - Go to "Keys" tab > "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file - **KEEP THIS SECURE**
6. Share your Google Sheet with the service account email:
   - Open your compiled audit sheet
   - Click "Share"
   - Add the service account email (found in the downloaded JSON as `client_email`)
   - Give it "Editor" access

## Step 2: Prepare Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# From the JSON key file you downloaded
GOOGLE_SHEETS_API_KEY=your-api-key-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Your compiled Google Sheet ID (from the URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
GOOGLE_SHEET_ID=your-sheet-id-here

# Sheet tab names (must match exactly your sheet tabs)
CAVERNAS_TOUR_SHEET=Cavernas_Tour
CAVERNAS_APERTURA_CIERRE_SHEET=Cavernas_AperturaCierre
SALON_SERVICIO_SHEET=Salón_Servicio
SALON_OPERACION_SHEET=Salón_Operación
SALON_ENCUESTA_CLIENTE_SHEET=Salón_EncuestaCliente
COCINA_GENERAL_SHEET=Cocina_General
COCINA_INDIVIDUAL_SHEET=Cocina_Individual
INVENTARIOS_SHEET=Inventarios
CAJA_SORPRESA_SHEET=Caja_Sorpresa
PLANILLA_HORAS_SHEET=Planilla_Horas
PAGOS_FACTURAS_SHEET=Pagos_Facturas
CONTROL_PROVEEDORES_SHEET=Control_Proveedores

# Refresh interval (15-30 minutes recommended)
REFRESH_INTERVAL_MINUTES=15

# Dashboard settings
DASHBOARD_TITLE=Anfiteatro Villa - Audit Dashboard
TIMEZONE=America/Costa_Rica
```

### Extracting Environment Variables from JSON Key

From the JSON key file downloaded from Google Cloud:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `"client_email"` value
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = `"private_key"` value (keep the \n characters)
- `GOOGLE_SHEETS_API_KEY` = You can use your Google API key or leave as placeholder

## Step 3: Deploy to Vercel

### Option A: Using GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." > "Project"
4. Import your GitHub repository
5. Configure project settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   - Go to "Settings" > "Environment Variables"
   - Add all variables from `.env.local`
   - **IMPORTANT**: Make sure `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` is set correctly with `\n` characters preserved
7. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Follow the prompts to configure project
4. Add environment variables when prompted

## Step 4: Verify Deployment

1. Go to your Vercel deployment URL (something like `https://anfiteatro-dashboard.vercel.app`)
2. Check the home page loads with area cards
3. Click on an area to verify data is loading
4. Check the "Auditorías" tab to see the full audit log
5. Test filters on the audit page

## Step 5: Configure Auto-Refresh

The dashboard automatically refreshes data every 15 minutes (configurable via `REFRESH_INTERVAL_MINUTES`). The refresh happens:

- When the page first loads
- Every 15 minutes while the page is open
- When the "Actualizar" button is clicked

## Monitoring and Troubleshooting

### Check API Endpoint
Visit `https://your-domain.com/api/audits` to see raw audit data and verify connection.

### View Logs
- Vercel Dashboard > Your Project > "Deployments" > Select deployment > "Logs"
- Look for any error messages related to Google Sheets API

### Common Issues

**"Failed to fetch audit data"**
- Verify environment variables are set correctly in Vercel Settings
- Ensure Service Account email has access to the Google Sheet
- Check that sheet tab names match exactly in environment variables

**"Data loading but shows empty results"**
- Verify Google Sheet has data in correct columns
- Check that area names match the 5 predefined areas (Cavernas, Salón, Cocina, Inventarios, Administración)

**"Refresh not updating data"**
- API caching is intentional (15 minute interval)
- Click "Actualizar" button to force immediate refresh
- Check browser console for any JavaScript errors

## Performance Optimization

- **Caching**: Data is cached for 15-30 minutes to reduce API calls
- **Incremental Static Generation**: Pages are pre-rendered and updated periodically
- **Image Optimization**: Next.js automatically optimizes images
- **Code Splitting**: Recharts library is lazy-loaded

## Security Considerations

1. **Never commit `.env.local`** - Add to `.gitignore` (already done)
2. **Keep private key safe** - Only add to Vercel through the dashboard UI
3. **Use environment variables** - Never hardcode credentials in code
4. **Restrict sheet access** - Only share Google Sheet with the service account email

## Updates and Maintenance

### Update Dependencies
```bash
npm update
npm run build  # Test build locally
git push       # Auto-deploys to Vercel
```

### Change Refresh Interval
1. Update `REFRESH_INTERVAL_MINUTES` environment variable in Vercel Settings
2. No redeploy needed - takes effect on next page load

### Add New Areas
1. Update the 5 area configurations in environment variables
2. Update `lib/audit-scoring.ts` if area-specific scoring changes needed
3. Update `components/Layout.tsx` navigation if new areas added
4. Redeploy to Vercel

## Sharing the Dashboard

Once deployed, share the Vercel URL with team members:
- No installation needed
- Works on desktop and mobile
- Real-time data updates every 15 minutes
- Dark mode support included

## Support & Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
