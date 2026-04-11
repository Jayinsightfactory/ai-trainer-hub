[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Task,
  [string[]]$Files = @(),
  [int]$MaxDiffLines = 220,
  [int]$MaxOutputChars = 14000
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Limit-Text {
  param(
    [string]$Text,
    [int]$MaxChars
  )

  if ([string]::IsNullOrEmpty($Text)) {
    return ""
  }

  if ($Text.Length -le $MaxChars) {
    return $Text
  }

  return $Text.Substring(0, $MaxChars) + "`n... (truncated)"
}

function Safe-Git {
  param([string[]]$Args)
  try {
    return & git @Args 2>&1 | Out-String
  }
  catch {
    return ""
  }
}

$repoRoot = (Resolve-Path ".").Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$outDir = Join-Path $repoRoot ".gemini\session\$stamp"
New-Item -Path $outDir -ItemType Directory -Force | Out-Null

$gitStatus = Safe-Git @("status", "--short")
$stagedDiff = Safe-Git @("diff", "--staged", "--unified=1", "--no-color")
$unstagedDiff = Safe-Git @("diff", "--unified=1", "--no-color")
$recentCommits = Safe-Git @("log", "--oneline", "-n", "8")

$diffBody = (($stagedDiff + "`n" + $unstagedDiff).Trim())
$diffBody = Limit-Text -Text $diffBody -MaxChars $MaxOutputChars

if ($Files.Count -gt 0) {
  $fileList = ($Files | ForEach-Object { "- $($_)" }) -join "`n"
}
else {
  $fileList = "- (not provided)"
}

$prompt = @"
# Gemini Harness Prompt

## Goal
$Task

## Constraints
- Keep response concise and implementation-first.
- Do not refactor unrelated modules.
- Prefer minimal diffs with clear rationale.
- Return: (1) patch plan, (2) exact edits, (3) quick verification commands.

## Focus Files
$fileList

## Current Git Status
$(Limit-Text -Text $gitStatus -MaxChars 2200)

## Recent Commits
$(Limit-Text -Text $recentCommits -MaxChars 2200)

## Working Diff Snapshot
$diffBody
"@

$checklist = @"
# Harness Checklist

1) Define one primary objective and one success metric.
2) Run one bounded prompt; avoid multi-topic asks.
3) Apply patch, then run only relevant checks.
4) If output is long, ask for delta-only continuation.
5) Every 20-30 minutes, regenerate snapshot and re-anchor context.
"@

$nextPrompt = @"
# Continuation Prompt

Continue from your last answer.

Rules:
- Return only remaining edits (delta-only).
- Keep changes bounded to the same objective.
- Include short verification commands.

---

# Ieeoseo Yocheong Prompt (KO)

Ieeoseo jinhaenghae-jwo.

Gyuchik:
- Nameungeotman.
- Geu mokpyo an-eseoman.
- Geomjeung myeongryeong jjalge.
"@

$promptPath = Join-Path $outDir "prompt.md"
$checklistPath = Join-Path $outDir "checklist.md"
$nextPromptPath = Join-Path $outDir "next-message.md"

Set-Content -Path $promptPath -Value $prompt -Encoding UTF8
Set-Content -Path $checklistPath -Value $checklist -Encoding UTF8
Set-Content -Path $nextPromptPath -Value $nextPrompt -Encoding UTF8

Write-Host "Harness generated:"
Write-Host " - $promptPath"
Write-Host " - $checklistPath"
Write-Host " - $nextPromptPath"
Write-Host ""
Write-Host "Usage tip:"
Write-Host "1) Open prompt.md, copy into Gemini."
Write-Host "2) Keep each request single-goal."
Write-Host "3) Regenerate after major edits:"
Write-Host "   npm run gemini:harness -- -Task `"next patch`" -Files src/app/page.tsx"
