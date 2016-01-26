sudo apt-get mysql-server

echo "RUN mysql > create database rutgers_exchange"
echo "RUN mysql > create user 'exchangeuser'@'localhost' identified by password 'exchangepassword'"
echo "RUN mysql > grant all on rutgers_exchange.* to 'exchangeuser'@'localhost'"
