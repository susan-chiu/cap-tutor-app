@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ==============================================
echo   會考小老師：上傳到 GitHub（之後 GitHub 會自動打包 APK）
echo ==============================================
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 找不到 Git。請先到 https://git-scm.com/download/win 下載安裝（一路按 Next 即可），裝好後重新執行。
  goto :end
)
set REPO=https://github.com/yskyskygirl19830613-design/cap-tutor-app.git
if not exist ".git" (
  echo [錯誤] 這個資料夾沒有 .git 紀錄，請用 Claude 給你的 cap-app.zip 解壓縮後的資料夾執行。
  goto :end
)
git remote remove origin >nul 2>nul
git remote add origin %REPO%
echo 正在上傳到 %REPO%
echo （第一次會跳出 GitHub 登入視窗，登入你的帳號即可）
git push -u origin main
if errorlevel 1 (
  echo.
  echo [失敗] 上傳沒有成功。請確認 GitHub 上已經建立 cap-tutor-app 這個空的儲存庫。
  goto :end
)
echo.
echo 上傳完成！打開 https://github.com/yskyskygirl19830613-design/cap-tutor-app/actions
echo 可以看到自動打包的進度，大約 15～25 分鐘後在那次執行的頁面最下方「Artifacts」下載 APK。
:end
echo.
pause
