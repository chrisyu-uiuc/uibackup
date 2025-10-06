# stop any old pm2 process
pm2 stop midnight-scheduler || true
pm2 delete midnight-scheduler || true

# start with explicit interpreter using current directory
pm2 start scheduler.js --name midnight-scheduler --interpreter $(which node) --cwd $(pwd)

# save for startup
pm2 save

# view recent logs
pm2 logs midnight-scheduler --lines 150

