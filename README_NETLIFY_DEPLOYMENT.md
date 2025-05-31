# Netlify Deployment Guide

This guide will help you deploy your React application to Netlify.

## Prerequisites

1. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com) if you don't have an account

## Deployment Methods

### Method 1: Git-based Deployment (Recommended)

1. **Push your code to Git repository**:
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Log in to your Netlify dashboard
   - Click "New site from Git"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Configure build settings:
     - **Branch to deploy**: `main` (or your default branch)
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

3. **Configure custom domain** (Optional):
   - Go to Site settings → Domain management
   - Add your custom domain
   - Configure DNS settings as instructed

### Method 2: Manual Deployment

1. **Build your project locally**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to your Netlify dashboard
   - Drag and drop the `dist` folder to the deployment area
   - Your site will be deployed instantly

## Configuration Files Added

### `netlify.toml`
- Build configuration
- Redirect rules for React Router
- Security headers
- Performance optimizations

### `public/_redirects`
- Fallback redirects for client-side routing
- Ensures all routes work correctly in production

## Environment Variables

If your app uses environment variables:

1. **In Netlify Dashboard**:
   - Go to Site settings → Environment variables
   - Add your variables (e.g., `VITE_API_URL`)

2. **Local Development**:
   - Create `.env.local` file
   - Add your variables with `VITE_` prefix

## Continuous Deployment

Once connected to Git, Netlify will:
- Automatically deploy when you push to your main branch
- Run build previews for pull requests
- Provide deployment notifications

## Custom Domains

To use a custom domain:

1. **Add domain in Netlify**:
   - Site settings → Domain management
   - Add custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to your Netlify subdomain
   - Or use Netlify DNS for full management

## Build Optimization

The `netlify.toml` includes:
- CSS and JS minification
- Asset caching headers
- Security headers
- Gzip compression

## Troubleshooting

### Common Issues:

1. **404 errors on refresh**:
   - Ensure `_redirects` file is in the `public` folder
   - Check that redirects are properly configured

2. **Build failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check build logs in Netlify dashboard

3. **Environment variables not working**:
   - Ensure variables have `VITE_` prefix
   - Check they're added in Netlify dashboard

### Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)

## Site Information

After deployment, you'll get:
- **Site URL**: `https://[random-name].netlify.app`
- **Admin URL**: Access to deployment logs and settings
- **Form handling**: Built-in form submission handling (if needed)

Your React app with React Router will work perfectly with the configured redirects!