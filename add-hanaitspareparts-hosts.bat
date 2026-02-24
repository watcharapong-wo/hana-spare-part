@echo off
REM Run as Administrator!
set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts
set ENTRY=172.31.60.5   hanaitspareparts

findstr /C:"%ENTRY%" "%HOSTS_FILE%" >nul 2>&1
if %errorlevel%==0 (
    echo hosts file already contains hanaitspareparts entry.
) else (
    echo Adding hanaitspareparts to hosts file...
    echo %ENTRY%>>"%HOSTS_FILE%"
    echo Done.
)
pause