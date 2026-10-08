@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ==============================================
echo   會考小老師：打包 Android 測試版（APK）
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 Node.js。請先到 https://nodejs.org 下載安裝「LTS」版本，裝好後重新執行。
  goto :fail
)

if not exist ".env" (
  echo [錯誤] 找不到 .env 設定檔。
  echo        請把 app 資料夾裡的 .env.example 複製一份，改名成 .env，
  echo        填入 Supabase 的網址與 publishable key（README 第 4 節步驟 2）。
  goto :fail
)
findstr /b /c:"EXPO_PUBLIC_SUPABASE_URL=https://" ".env" >nul
if errorlevel 1 (
  echo [錯誤] .env 裡的 EXPO_PUBLIC_SUPABASE_URL 還沒填（要是 https:// 開頭的 Supabase 網址）。
  goto :fail
)
findstr /b /r /c:"EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=..*" ".env" >nul
if errorlevel 1 (
  echo [錯誤] .env 裡的 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY 還沒填。
  goto :fail
)

echo [1/5] 安裝套件（第一次會比較久）...
call npm install
if errorlevel 1 goto :fail

echo [2/5] 檢查程式...
call npx tsc --noEmit
if errorlevel 1 goto :fail

echo [3/5] 登入 Expo（沒有帳號請先到 https://expo.dev 免費註冊）...
call npx eas-cli@latest whoami >nul 2>nul
if errorlevel 1 (
  call npx eas-cli@latest login
  if errorlevel 1 goto :fail
)
call npx eas-cli@latest init
if errorlevel 1 goto :fail

echo [4/5] 把 .env 的設定上傳到 Expo（測試版 preview 環境）...
for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env") do (
  if not "%%b"=="" (
    echo       - %%a
    call npx eas-cli@latest env:set --name %%a --value "%%b" --environment preview --visibility plaintext
  )
)

echo [5/5] 送到 Expo 雲端打包（約 10～20 分鐘）...
call npx eas-cli@latest build --platform android --profile preview
if errorlevel 1 goto :fail

echo.
echo 完成！上面會顯示一個下載網址和 QR code：
echo 用 Android 手機掃描 QR code，下載 APK 後安裝即可測試。
echo （手機若提示「不明來源」，請允許這次安裝。）
pause
exit /b 0

:fail
echo.
echo 打包沒有完成，請把上面的訊息截圖給 Claude 看。
pause
exit /b 1
