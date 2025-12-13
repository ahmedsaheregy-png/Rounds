$TargetFile = "C:\Users\pc\.gemini\antigravity\scratch\investment-shares\index.html"
$ShortcutFile = "$env:USERPROFILE\Desktop\rounds.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = $TargetFile
$Shortcut.Save()
