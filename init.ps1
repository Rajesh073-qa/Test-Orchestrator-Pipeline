$ErrorActionPreference = "Continue"
cd d:\Automation-git\AITesterBlueprint2x\Test_Orestor

Write-Host "Initializing Turborepo..."
npx -y create-turbo@latest temp-repo --package-manager npm

if (Test-Path "temp-repo") {
    Write-Host "Moving files to root..."
    Get-ChildItem -Path temp-repo -Force | Move-Item -Destination . -Force
    Remove-Item temp-repo -Recurse -Force
} else {
    Write-Host "Failed to create temp-repo."
    exit 1
}

Write-Host "Cleaning up default demo apps..."
Remove-Item apps\docs -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Setting up backend (NestJS)..."
cd apps
npx -y @nestjs/cli new api --package-manager npm --skip-git --skip-install

if (Test-Path "api\src") {
    cd api\src
    Write-Host "Creating NestJS modules..."
    New-Item -ItemType Directory -Force -Path auth, jira, test-plan, test-case, code-generator, ai | Out-Null
    cd ..\..\..
}

Write-Host "Setting up required packages..."
cd packages
New-Item -ItemType Directory -Force -Path types, config | Out-Null
New-Item -ItemType Directory -Force -Path ai\providers, ai\prompts, ai\services, ai\interfaces | Out-Null
cd ..

Write-Host "Setting up frontend directories..."
cd apps\web
New-Item -ItemType Directory -Force -Path components, hooks, services, features | Out-Null
cd ..\..

Write-Host "Setting up Environment files..."
Set-Content -Path apps\web\.env.local -Value "NEXT_PUBLIC_API_URL=http://localhost:3001`n"
Set-Content -Path apps\api\.env -Value "DATABASE_URL=`"postgresql://user:password@localhost:5432/test_orchestrator`"`nJWT_SECRET=`"your_secret`"`nOPENAI_API_KEY=`"sk-xxx`"`nJIRA_API_TOKEN=`"jira_token`"`n"

Write-Host "Initialization complete. Printing tree:"
tree apps packages /F /A
