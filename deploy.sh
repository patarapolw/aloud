rm -rf dist  # Ensure that dist folder isn't exist in the first place
git worktree add dist heroku
sed '/aloud.config.js/d' aloud.config.js > dist/aloud.config.js
cd dist
git add .
git commit -m 'Deploy to Heroku'
git push heroku heroku:master
cd ..
git worktree remove dist