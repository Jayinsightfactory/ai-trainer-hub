[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Preset,
  [Parameter(Mandatory = $true)]
  [string]$Task,
  [string[]]$Files = @()
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path ".").Path
$presetPath = Join-Path $repoRoot "scripts\gemini-presets.json"

if (-not (Test-Path $presetPath)) {
  throw "Preset config not found: $presetPath"
}

$presetData = Get-Content -Raw -Path $presetPath | ConvertFrom-Json
$selected = $presetData.$Preset

if ($null -eq $selected) {
  $available = ($presetData.PSObject.Properties.Name | Sort-Object) -join ", "
  throw "Unknown preset: $Preset. Available presets: $available"
}

$finalTask = @"
[$($selected.label)]
$Task

Instruction:
$($selected.instruction)

Verification:
$($selected.verify)
"@

$harnessScript = Join-Path $repoRoot "scripts\gemini-harness.ps1"

& powershell -ExecutionPolicy Bypass -File $harnessScript -Task $finalTask -Files $Files
