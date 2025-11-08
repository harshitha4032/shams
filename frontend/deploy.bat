@echo off
echo Building the frontend...
npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo Deploying to Netlify...
netlify deploy --prod
if %errorlevel% neq 0 (
    echo Deployment failed!
    exit /b %errorlevel%
)

echo Deployment completed!