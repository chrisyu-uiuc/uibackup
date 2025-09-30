# stop any old pm2 process
pm2 stop midnight-scheduler || true
pm2 delete midnight-scheduler || true

# start with explicit interpreter (replace with `which node` output)
pm2 start scheduler.js --name midnight-scheduler --interpreter $(which node) --cwd /Users/mac/uibackup

# save for startup
pm2 save

# view recent logs
pm2 logs midnight-scheduler --lines 150

