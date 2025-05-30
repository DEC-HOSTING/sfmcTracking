#!/bin/bash
# Git History Cleanup Script
# This script removes sensitive data from git history

echo "🔒 Git History Cleanup for Credential Removal"
echo "============================================="

# Warning message
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  Make sure to coordinate with other developers"
echo "⚠️  All developers will need to re-clone the repository"
echo ""

# Create backup branch
echo "📁 Creating backup branch..."
git branch backup-before-cleanup

# Use git filter-branch to remove credentials from history
echo "🧹 Removing credentials from git history..."

# Remove sensitive credentials from all commits
git filter-branch --force --index-filter '
    git rm --cached --ignore-unmatch *.md || true
    git rm --cached --ignore-unmatch *.py || true
' --prune-empty --tag-name-filter cat -- --all

# Add cleaned files back
git add .
git commit -m "🔒 CLEANED: Credentials removed from history"

echo ""
echo "✅ Git history cleaned!"
echo "📋 Next steps:"
echo "   1. Force push to remote: git push --force-with-lease origin taskMaster"
echo "   2. Notify team members to re-clone the repository"
echo "   3. Delete backup branch: git branch -D backup-before-cleanup"
echo ""
echo "🛡️ Security Note:"
echo "   - Previous commits with credentials have been removed"
echo "   - admin@taskmaster.com / admin123 removed"
echo "   - camelia.ounesli@loreal.com / QueenCRM removed"
echo "   - thomas.nicoli@loreal.com removed"
echo "   - Use .env.example as template for local credentials"
echo "   - Never commit .env files to version control"
