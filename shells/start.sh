cd ~/rutgers_exchange/backend
rails server -b 45.33.79.201 -p 80 > ~/server_log &> ~/server_log &
disown %1
ps -ef|grep rails
