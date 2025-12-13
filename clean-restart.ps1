# Clean restart script for Next.js
Write-Host "Cleaning caches..."

# Remove Next.js cache
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✓ Removed .next cache"
}

# Remove node_modules cache if exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "✓ Removed node_modules cache"
}

Write-Host ""
Write-Host "✅ Cache cleared! Now restart your dev server with: npm run dev"
Write-Host ""

