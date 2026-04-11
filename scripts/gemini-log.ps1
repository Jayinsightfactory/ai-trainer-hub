[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Task,
  [ValidateSet("fix", "feature", "review", "custom")]
  [string]$Mode = "custom",
  [string]$Note = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path ".").Path
$logDir = Join-Path $repoRoot ".gemini\logs"
New-Item -Path $logDir -ItemType Directory -Force | Out-Null

$logPath = Join-Path $logDir "session-log.csv"
if (-not (Test-Path $logPath)) {
  "timestamp,mode,task,note" | Set-Content -Path $logPath -Encoding UTF8
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$safeTask = $Task.Replace('"', "'")
$safeNote = $Note.Replace('"', "'")

$row = """$timestamp"",""$Mode"",""$safeTask"",""$safeNote"""
Add-Content -Path $logPath -Value $row -Encoding UTF8

Write-Host "Logged: $logPath"
