@echo off
echo ========================================
echo  MovieCloud - MySQL Database Export
echo ========================================
echo.

set DB_NAME=moviecloud
set OUTPUT_DIR=G:\AI Projects\Movies\moviecloud\database

echo Exporting database '%DB_NAME%'...
echo Output: %OUTPUT_DIR%\moviecloud_export.sql
echo.

mysqldump -u root %DB_NAME% > "%OUTPUT_DIR%\moviecloud_export.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Database exported to:
    echo %OUTPUT_DIR%\moviecloud_export.sql
    echo.
    echo Upload this file to Hostinger phpMyAdmin:
    echo 1. Login to Hostinger hPanel
    echo 2. Go to Databases ^> phpMyAdmin
    echo 3. Select your database: u448889024_movie
    echo 4. Click Import tab
    echo 5. Choose the SQL file
    echo 6. Click Go
) else (
    echo.
    echo ERROR: Export failed. Make sure MySQL is running in XAMPP.
)

echo.
pause
