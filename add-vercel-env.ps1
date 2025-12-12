# PowerShell script to add INSTANT_ADMIN_TOKEN to Vercel
$token = "5d27990a-84ed-4256-be65-5fec5cf226b1"
Write-Host "Adding INSTANT_ADMIN_TOKEN to Vercel..."
Write-Host "When prompted, paste this value: $token"
Write-Host "Mark as sensitive: y"
Write-Host ""
Write-Host "Running: vercel env add INSTANT_ADMIN_TOKEN production"
vercel env add INSTANT_ADMIN_TOKEN production

