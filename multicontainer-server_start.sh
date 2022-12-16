
#start the servers as daemons
docker run -p 3306:3306 \
    --name mysql-server \
    -e MYSQL_ROOT_PASSWORD=mygene \
    -e MYSQL_DATABASE=dnaiq_dallas \
    -v /home/nicholas/Desktop/mygene/intro_final/mysql:/docker-entrypoint-initdb.d \
    -d mysql:8

docker run -p 8080:80 \
    -v /home/nicholas/Desktop/mygene/intro_final/public:/var/www/html/ \
    -v /home/nicholas/Desktop/mygene/intro_final/public:/usr/share/nginx/html \
    --name nginx-server \
    -d nginx:1.22-alpine

echo "mysql server starting up. please wait 20 seconds...."

#copy data.sql so we can mount it:
#docker cp ./data.sql mysql-server:/docker-entrypoint-inidtdb.d

#add the ./public folder to nginx
#docker cp public/. nginx-server:/var/www/html/
docker cp public/. nginx-server:/usr/share/nginx/html/

#add the nginx configuration file to the server
#docker cp nginx.conf nginx-server:/etc/nginx/nginx.conf

#delete the apache default web page:
#docker exec -it nginx-server rm /var/www/html/index.html