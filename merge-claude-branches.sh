#!/bin/bash

# Script om alle Claude branches automatisch naar main te mergen
# Gemaakt voor het Sintspel project

set -e  # Stop bij fouten

echo "🔄 Fetching alle branches van remote..."
git fetch origin

echo "📋 Checkout main branch..."
git checkout main

echo "⬇️  Pull laatste wijzigingen van main..."
git pull origin main

echo ""
echo "🔍 Zoeken naar Claude branches..."
claude_branches=$(git branch -r | grep 'origin/claude/' | sed 's/origin\///' | sed 's/^[[:space:]]*//')

if [ -z "$claude_branches" ]; then
    echo "❌ Geen Claude branches gevonden!"
    exit 0
fi

echo "📝 Gevonden branches:"
echo "$claude_branches"
echo ""

# Teller voor gemergte branches
merged_count=0

# Loop door alle Claude branches
while IFS= read -r branch; do
    if [ ! -z "$branch" ]; then
        echo "🔀 Mergen van $branch naar main..."

        # Probeer te mergen
        if git merge "origin/$branch" --no-edit -m "Merge $branch into main"; then
            echo "✅ Succesvol gemerged: $branch"
            ((merged_count++))
        else
            echo "⚠️  Merge conflict bij $branch - handmatige actie vereist"
            git merge --abort
            exit 1
        fi

        echo ""
    fi
done <<< "$claude_branches"

echo "📊 Totaal gemerged: $merged_count branches"

if [ $merged_count -gt 0 ]; then
    echo ""
    echo "⬆️  Pushen naar remote main..."
    git push origin main
    echo "✅ Alle wijzigingen gepusht naar main!"
else
    echo "ℹ️  Geen branches om te mergen"
fi

echo ""
echo "🎉 Klaar!"
