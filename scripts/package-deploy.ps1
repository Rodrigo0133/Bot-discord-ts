$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'artifacts'
$zipPath = Join-Path $outputDirectory 'bot-discord-2x-de-sorte-deploy.zip'
$files = @(
    'package.json', 'package-lock.json', 'tsconfig.json', 'README.md',
    'LICENSE', '.env.example', '.dockerignore',
    'dockerfile', 'docker-compose.yml', 'scripts/package-deploy.ps1'
)
# As instrucoes pessoais podem existir apenas no pacote de entrega.
if (Test-Path -LiteralPath (Join-Path $projectRoot 'DEPLOY.md') -PathType Leaf) {
    $files += 'DEPLOY.md'
}
foreach ($directory in @('src', 'assets', 'dist', 'tests')) {
    $directoryPath = Join-Path $projectRoot $directory
    if (-not (Test-Path -LiteralPath $directoryPath -PathType Container)) {
        throw "Pasta em falta: $directory. Executa o build antes de empacotar."
    }
    foreach ($file in Get-ChildItem -LiteralPath $directoryPath -Recurse -File) {
        $files += $file.FullName.Substring($projectRoot.Length + 1)
    }
}

foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file) -PathType Leaf)) {
        throw "Ficheiro em falta: $file"
    }
    if ($file -match '(^|[\\/])(\.git|node_modules|\.env)([\\/]|$)' -or
        $file -match '\.(zip|pem|key|pfx)$' -or
        ($file -match '(^|[\\/])\.env\.' -and $file -ne '.env.example')) {
        throw "Ficheiro proibido no pacote: $file"
    }
}

[void][System.IO.Directory]::CreateDirectory($outputDirectory)
# Create substitui apenas o ZIP de saída definido acima.
$stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        $entryName = $file.Replace('\', '/')
        [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, (Join-Path $projectRoot $file), $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        )
    }
} finally {
    $archive.Dispose()
    $stream.Dispose()
}
Write-Output "ZIP criado: $zipPath ($($files.Count) ficheiros)"
