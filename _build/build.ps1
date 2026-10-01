<#
  Gera as páginas HTML finais do site a partir de:
    _build\layout.html   -> estrutura base (head, schema, main)
    _build\header.html   -> menu
    _build\footer.html   -> rodapé + botão de WhatsApp
    _build\pages\*.html  -> conteúdo de cada página + bloco de metadados

  Uso:  powershell -ExecutionPolicy Bypass -File _build\build.ps1
#>

$ErrorActionPreference = 'Stop'

$buildDir = $PSScriptRoot
$root     = Split-Path -Parent $buildDir
$base     = 'https://www.seudominio.com.br/'   # TROCAR: domínio definitivo do site

$layout = [System.IO.File]::ReadAllText((Join-Path $buildDir 'layout.html'))
$header = [System.IO.File]::ReadAllText((Join-Path $buildDir 'header.html'))
$footer = [System.IO.File]::ReadAllText((Join-Path $buildDir 'footer.html'))
$utf8   = New-Object System.Text.UTF8Encoding($false)

$pagesDir = Join-Path $buildDir 'pages'
$urls = New-Object System.Collections.Generic.List[string]
$count = 0

foreach ($file in (Get-ChildItem $pagesDir -Filter '*.html' | Sort-Object Name)) {
    $raw = [System.IO.File]::ReadAllText($file.FullName)

    if ($raw -notmatch '(?s)^\s*<!--(.*?)-->') {
        throw "Bloco de metadados ausente em $($file.Name)"
    }
    $metaRaw = $Matches[1]
    $body    = $raw.Substring($Matches[0].Length).Trim()

    $meta = @{}
    foreach ($line in ($metaRaw -split "`r?`n")) {
        if ($line -match '^\s*([A-Za-z0-9_]+)\s*:\s*(.+?)\s*$') {
            $meta[$Matches[1].ToLower()] = $Matches[2]
        }
    }

    foreach ($required in 'titulo', 'descricao', 'og') {
        if (-not $meta.ContainsKey($required)) { throw "Metadado '$required' ausente em $($file.Name)" }
    }

    $outName   = $file.Name
    $outPath   = Join-Path $root $outName
    $canonical = if ($outName -eq 'index.html') { $base } else { $base + $outName }

    $html = $layout
    $html = $html.Replace('{{TITLE}}', $meta['titulo'])
    $html = $html.Replace('{{DESCRIPTION}}', $meta['descricao'])
    $html = $html.Replace('{{CANONICAL}}', $canonical)
    $html = $html.Replace('{{OG_IMAGE}}', $base + $meta['og'])
    $html = $html.Replace('{{BASE}}', $base)
    $html = $html.Replace('{{HEADER}}', $header)
    $html = $html.Replace('{{FOOTER}}', $footer)
    $html = $html.Replace('{{CONTENT}}', $body)

    [System.IO.File]::WriteAllText($outPath, $html, $utf8)
    $urls.Add($canonical)
    $count++
    Write-Host "  + $outName"
}

# ------------------------------------------------------------- sitemap.xml
$today = (Get-Date).ToString('yyyy-MM-dd')
$sitemap = New-Object System.Text.StringBuilder
[void]$sitemap.Append('<?xml version="1.0" encoding="UTF-8"?>' + "`n")
[void]$sitemap.Append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n")
foreach ($u in $urls) {
    [void]$sitemap.Append("  <url>`n    <loc>$u</loc>`n    <lastmod>$today</lastmod>`n  </url>`n")
}
[void]$sitemap.Append('</urlset>')
[System.IO.File]::WriteAllText((Join-Path $root 'sitemap.xml'), $sitemap.ToString(), $utf8)

Write-Host "`n$count página(s) geradas em $root"
