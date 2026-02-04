# PowerShell script to set up Git repository and link to GitHub
# Run this script after installing Git

Write-Host "Setting up Git repository..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository if not already initialized
if (Test-Path .git) {
    Write-Host "Git repository already initialized" -ForegroundColor Yellow
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
}

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git remote set-url origin https://github.com/ryannnsevidal/cat-funny.git
        Write-Host "Remote updated successfully" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote repository..." -ForegroundColor Cyan
    git remote add origin https://github.com/ryannnsevidal/cat-funny.git
    Write-Host "Remote added successfully" -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to staging..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Cyan
    git commit -m "Initial commit: Cat Meme Generator app"
    Write-Host "Changes committed successfully" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Set branch to main
Write-Host "Setting branch to 'main'..." -ForegroundColor Cyan
git branch -M main

Write-Host "`nSetup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Make sure you're authenticated with GitHub" -ForegroundColor Yellow
Write-Host "2. Run: git push -u origin main" -ForegroundColor Yellow
Write-Host "`nIf you need to authenticate, you may need to use a Personal Access Token:" -ForegroundColor Cyan
Write-Host "   Create one at: https://github.com/settings/tokens" -ForegroundColor Cyan

