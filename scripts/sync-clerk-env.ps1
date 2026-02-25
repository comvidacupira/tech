$ErrorActionPreference = "Stop"

$rootEnv = Join-Path $PSScriptRoot "..\.env.local"
$scriptsEnv = Join-Path $PSScriptRoot ".env.local"
$cursosEnv = Join-Path $PSScriptRoot "..\_cursos\.env.local"

$envFile = if (Test-Path $rootEnv) { $rootEnv } elseif (Test-Path $scriptsEnv) { $scriptsEnv } elseif (Test-Path $cursosEnv) { $cursosEnv } else { $null }

if (-not $envFile) {
  throw "Arquivo .env.local nao encontrado na raiz, scripts ou _cursos."
}

$line = Get-Content $envFile | Where-Object { $_ -match "^\s*NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\s*=" } | Select-Object -First 1

if (-not $line) {
  throw "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY nao encontrada em $envFile"
}

$key = ($line -split "=", 2)[1].Trim()
$key = $key.Trim('"').Trim("'")

if ([string]::IsNullOrWhiteSpace($key)) {
  throw "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY vazia em $envFile"
}

$dbLine = Get-Content $envFile | Where-Object { $_ -match "^\s*NEXT_PUBLIC_DATABASE_URL\s*=" } | Select-Object -First 1
$dbUrl = "http://localhost:3080"
if ($dbLine) {
  $dbUrl = ($dbLine -split "=", 2)[1].Trim().Trim('"').Trim("'")
}

$outFile = Join-Path $PSScriptRoot "..\_includes\clerk-config.html"
$content = @"
<script>
  window.CLERK_PUBLISHABLE_KEY = "$key";
  window.PUBLIC_DATABASE_URL = "$dbUrl";
</script>
"@

Set-Content -Path $outFile -Value $content -NoNewline
Write-Output "Arquivo gerado: $outFile"
