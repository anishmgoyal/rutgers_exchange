export LIST=`ps -ef|grep rails`
export LIST=`echo $LIST | awk '{print $2}'`
echo "Killing $LIST"
kill -9 $LIST
echo "Killed."
ps -ef|grep rails
