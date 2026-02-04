# Setting Up Git and GitHub Repository

Follow these steps to link your local project to GitHub and push your code.

## Step 1: Install Git

If Git is not installed on your Windows machine:

1. Download Git from: https://git-scm.com/download/win
2. Run the installer and follow the setup wizard
3. Restart your terminal/PowerShell after installation

## Step 2: Configure Git (First Time Only)

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Git Repository

Navigate to your project directory and run:

```powershell
cd "D:\files (1)"
git init
```

## Step 4: Add Remote Repository

```powershell
git remote add origin https://github.com/ryannnsevidal/cat-funny.git
```

## Step 5: Add and Commit Files

```powershell
git add .
git commit -m "Initial commit: Cat Meme Generator app"
```

## Step 6: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

You may be prompted for your GitHub credentials. If you have 2FA enabled, you'll need to use a Personal Access Token instead of your password.

## Future Updates

After making changes to your code, use these commands to update GitHub:

```powershell
# Check what files have changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Troubleshooting

### If you get authentication errors:
- Use a Personal Access Token instead of your password
- Create one at: https://github.com/settings/tokens
- Use the token as your password when prompted

### If the remote already exists:
```powershell
git remote remove origin
git remote add origin https://github.com/ryannnsevidal/cat-funny.git
```

