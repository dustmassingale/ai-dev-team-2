@echo off
set PORT=8000
set HOST=127.0.0.1

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting Python HTTP server on port %PORT%...
  start "Static Server" py -3 -m http.server %PORT% --bind %HOST%
  timeout /t 1 >nul
  start "" http://%HOST%:%PORT%/
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting Python HTTP server on port %PORT%...
  start "Static Server" python -m http.server %PORT% --bind %HOST%
  timeout /t 1 >nul
  start "" http://%HOST%:%PORT%/
  goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting http-server via npx on port %PORT%...
  start "Static Server" npx http-server -p %PORT% -a %HOST%
  timeout /t 1 >nul
  start "" http://%HOST%:%PORT%/
  goto :eof
)

echo Could not find Python or npx. Opening index.html directly.
start "" index.html
pause
