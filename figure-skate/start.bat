@echo off
echo Starting Vincent Massingale Figure Skating Fan Page Server...
cd /d %~dp0

:: Check if PHP is available
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP is not installed or not in your PATH.
    echo Please install PHP to run the development server.
    pause
    exit /b 1
)

echo Starting PHP development server in background...
start /b php -S localhost:8000 > server.log 2>&1

:: Wait a moment for server to start
timeout /t 2 /nobreak >nul

echo Server is running at http://localhost:8000/
echo Opening browser...
start http://localhost:8000/

echo.
echo Press any key to stop the server and exit...
pause >nul

:: Kill the background php process
taskkill /fi "windowtitle eq php  -S localhost:8000" /f >nul 2>&1
:: Alternative for just killing php if the above fails
taskkill /im php.exe /f >nul 2>&1

echo Server stopped.
exit /b 0
