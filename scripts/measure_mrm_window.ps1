param(
  [Parameter(Mandatory = $true)][string]$DbName,
  [int]$DurationSeconds = 45,
  [string]$OutFile = "scripts\\mrm_metrics_windows.jsonl"
)

$ErrorActionPreference = "Stop"

$proc = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq "MongoDB Relational Migrator.exe" } |
  Sort-Object WorkingSetSize -Descending |
  Select-Object -First 1
if (-not $proc) {
  throw "MongoDB Relational Migrator process not found."
}
$procId = [int]$proc.ProcessId

$logicalCores = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
if (-not $logicalCores -or $logicalCores -lt 1) { $logicalCores = 1 }

$startProc = Get-Process -Id $procId
$startCpuSec = $startProc.CPU
$startTime = Get-Date
$maxCpuPct = 0.0
$maxMemMb = [math]::Round($startProc.WorkingSet64 / 1MB, 2)

# MongoDB container Block I/O baseline (used as disk I/O proxy for MRM writes)
$blockBase = 0.0
try {
  $line = docker stats --no-stream --format "{{.BlockIO}}" mongodb_target 2>$null
  if ($line) {
    $parts = $line -split "/"
    if ($parts.Count -ge 2) {
      $write = ($parts[1]).Trim()
      if ($write -match "([0-9]*\.?[0-9]+)\s*([kKmMgG]i?[bB])") {
        $num = [double]$matches[1]
        $unit = $matches[2].ToLower()
        $factor = switch ($unit) {
          "kb" { 1/1024 }
          "kib" { 1/1024 }
          "mb" { 1 }
          "mib" { 1.048576 }
          "gb" { 1000 }
          "gib" { 1073.741824 }
          default { 0 }
        }
        $blockBase = $num * $factor
      }
    }
  }
} catch {}

$deadline = (Get-Date).AddSeconds($DurationSeconds)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
  $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
  if (-not $p) { break }

  $now = Get-Date
  $elapsed = ($now - $startTime).TotalSeconds
  if ($elapsed -gt 0) {
    $cpuDeltaSec = $p.CPU - $startCpuSec
    $cpuPct = [math]::Max(0.0, ($cpuDeltaSec / $elapsed) * 100.0 / $logicalCores)
    if ($cpuPct -gt $maxCpuPct) { $maxCpuPct = $cpuPct }
  }

  $memMb = $p.WorkingSet64 / 1MB
  if ($memMb -gt $maxMemMb) { $maxMemMb = $memMb }
}

$blockNow = $blockBase
try {
  $line = docker stats --no-stream --format "{{.BlockIO}}" mongodb_target 2>$null
  if ($line) {
    $parts = $line -split "/"
    if ($parts.Count -ge 2) {
      $write = ($parts[1]).Trim()
      if ($write -match "([0-9]*\.?[0-9]+)\s*([kKmMgG]i?[bB])") {
        $num = [double]$matches[1]
        $unit = $matches[2].ToLower()
        $factor = switch ($unit) {
          "kb" { 1/1024 }
          "kib" { 1/1024 }
          "mb" { 1 }
          "mib" { 1.048576 }
          "gb" { 1000 }
          "gib" { 1073.741824 }
          default { 0 }
        }
        $blockNow = $num * $factor
      }
    }
  }
} catch {}

$entry = [ordered]@{
  tool = "MRM"
  db = $DbName
  exit_code = 0
  elapsed_sec = [math]::Round($DurationSeconds, 3)
  peak_cpu_percent = [math]::Round($maxCpuPct, 2)
  peak_mem_mb = [math]::Round($maxMemMb, 2)
  peak_block_io_mb = [math]::Round([math]::Max(0.0, $blockNow - $blockBase), 2)
  note = "Measured over fixed window during MRM UI migration run."
}

($entry | ConvertTo-Json -Compress) | Add-Content -Path $OutFile -Encoding UTF8
Write-Output "WROTE:$DbName"
