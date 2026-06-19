@echo off
echo ========================================
echo  MovieCloud - Hostinger Deployment
echo ========================================
echo.

set PROJECT_DIR=G:\AI Projects\Movies\moviecloud
set DEPLOY_DIR=G:\AI Projects\Movies\moviecloud-deploy
set ZIP_FILE=G:\AI Projects\Movies\moviecloud-hostinger.zip

echo [1/5] Cleaning deploy folder...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

echo [2/5] Building Next.js client...
cd /d "%PROJECT_DIR%\client"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Client build failed!
    pause
    exit /b 1
)

echo [3/5] Copying files to deploy folder...
cd /d "%PROJECT_DIR%"

REM Copy server
xcopy /E /I /Q server "%DEPLOY_DIR%\server"
REM Copy client build output
xcopy /E /I /Q client\.next "%DEPLOY_DIR%\client\.next"
xcopy /E /I /Q client\public "%DEPLOY_DIR%\client\public"
copy /Y client\next.config.js "%DEPLOY_DIR%\client\"
copy /Y client\package.json "%DEPLOY_DIR%\client\"
copy /Y client\tsconfig.json "%DEPLOY_DIR%\client\"
copy /Y client\tailwind.config.ts "%DEPLOY_DIR%\client\"
copy /Y client\postcss.config.js "%DEPLOY_DIR%\client\"

REM Copy env file for Hostinger
copy /Y .env.hostinger "%DEPLOY_DIR%\.env"

REM Copy production server entry
copy /Y server\index.js "%DEPLOY_DIR%\server\"

REM Clean node_modules from deploy
if exist "%DEPLOY_DIR%\server\node_modules" rmdir /s /q "%DEPLOY_DIR%\server\node_modules"
if exist "%DEPLOY_DIR%\client\node_modules" rmdir /s /q "%DEPLOY_DIR%\client\node_modules"

echo [4/5] Creating ZIP file...
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"
powershell -command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"

echo [5/5] Done!
echo.
echo Deployment package created:
echo   %ZIP_FILE%
echo.
echo Next steps:
echo   1. Login to Hostinger hPanel
echo   2. Go to Databases ^> phpMyAdmin
echo   3. Import database\moviecloud_export.sql
echo   4. Go to Websites ^> Add Website ^> Node.js App
echo   5. Upload the ZIP file
echo   6. Set environment variables
echo   7. Set start command: node server/index.js
echo   8. Assign domain: dastuk.cat-chemicals.com
echo.
pause
