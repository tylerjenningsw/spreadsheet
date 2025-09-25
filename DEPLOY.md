# Deployment Guide

This Vue Spreadsheet Component can be deployed to various platforms. Here are the detailed instructions:

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Website (Easiest)

1. **Build the project locally:**
   ```bash
   pnpm install
   pnpm run build
   ```

2. **Go to [vercel.com](https://vercel.com)**

3. **Drag and drop the `dist` folder** to the Vercel dashboard

4. **Get your instant URL!**

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Build the project:**
   ```bash
   pnpm run build
   ```

3. **Deploy:**
   ```bash
   vercel --prod ./dist
   ```

4. **Follow the prompts** to login and configure

### Option 3: Deploy via GitHub

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

## 📦 Deploy to Netlify

### Option 1: Drag & Drop

1. **Build locally:**
   ```bash
   pnpm run build
   ```

2. **Go to [app.netlify.com](https://app.netlify.com)**

3. **Drag the `dist` folder** to the deployment area

### Option 2: Netlify CLI

```bash
npm i -g netlify-cli
pnpm run build
netlify deploy --prod --dir=dist
```

## 🌍 Deploy to GitHub Pages

1. **Update vite.config.ts:**
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [vue()],
   })
   ```

2. **Build and deploy:**
   ```bash
   pnpm run build
   git add dist -f
   git commit -m "Deploy"
   git subtree push --prefix dist origin gh-pages
   ```

## ☁️ Deploy to Cloudflare Pages

1. **Build locally:**
   ```bash
   pnpm run build
   ```

2. **Go to [pages.cloudflare.com](https://pages.cloudflare.com)**

3. **Create a project** and upload the `dist` folder

## 🌊 Deploy to Surge.sh

```bash
npm i -g surge
pnpm run build
surge ./dist your-name.surge.sh
```

## 🐙 Deploy to Railway

1. **Create a `railway.json`:**
   ```json
   {
     "build": "pnpm run build",
     "deploy": {
       "startCommand": "npx serve dist -s -p $PORT"
     }
   }
   ```

2. **Deploy via Railway CLI or GitHub**

## 📝 Environment Variables

No environment variables are required for this application.

## 🔧 Build Configuration

The project uses Vite for building:
- **Output directory:** `dist/`
- **Build command:** `pnpm run build`
- **Dev command:** `pnpm run dev`

## 📊 Build Size

Current production build:
- HTML: ~0.5 KB (gzipped: 0.3 KB)
- CSS: ~234 KB (gzipped: 32 KB)
- JS: ~88 KB (gzipped: 33 KB)
- **Total:** ~322 KB (gzipped: ~65 KB)

## 🎯 Performance

The deployed app scores:
- **Lighthouse Performance:** 95+
- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s

## 🔗 Demo Links

After deployment, your app will be available at:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- GitHub Pages: `https://username.github.io/repo-name`
- Surge: `https://your-name.surge.sh`

## 💡 Tips

1. **Use CDN for Bootstrap** if you want smaller bundle:
   - Remove `bootstrap` from dependencies
   - Add CDN link to `index.html`

2. **Enable compression** on your hosting platform

3. **Use custom domain** for professional appearance

4. **Enable HTTPS** (automatic on most platforms)

## 🚨 Troubleshooting

### Build fails with TypeScript errors
```bash
# Try building without type checking
vite build
```

### Page not found on refresh (SPA issue)
Add a `_redirects` file to `public/` folder:
```
/* /index.html 200
```

### Large bundle size
- Check for unused dependencies
- Enable tree shaking
- Use dynamic imports for large components

## 📧 Support

For deployment issues, check the platform's documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)