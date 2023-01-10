
#start the servers as daemons
echo "MySQL Server starting up. Waiting 20 seconds before initial connection"
docker run -p 3306:3306 \
    --name mysql-server \
    -e MYSQL_ROOT_PASSWORD=mygene \
    -e MYSQL_DATABASE=dnaiq_dallas \
    -v mysql-volume:/home/nicholas/Desktop/mygene/intro_final/volume_mysql \
    -v /home/nicholas/Desktop/mygene/intro_final/mysql:/docker-entrypoint-initdb.d \
    -d mysql:8

echo "PHP server started"
docker run -p 9000 \
    --name php-server \
    -d \
    -e VIRTUAL_ROOT=/var/www/html/ \
    php:8.0-fpm-alpine

echo "Nginx server started"
docker run -p 8080:80 \
    -v /home/nicholas/Desktop/mygene/intro_final/public:/var/www/html/ \
    -v /home/nicholas/Desktop/mygene/intro_final/public:/usr/share/nginx/html \
    --name nginx-server \
    -d \
    nginx:1.22-alpine

#sleep 20
#echo "Starting Node.JS server"
#node server.js

#copy data.sql so we can mount it:
#docker cp ./data.sql mysql-server:/docker-entrypoint-inidtdb.d

#add the ./public folder to nginx
#docker cp public/. nginx-server:/var/www/html/
docker cp public/. nginx-server:/usr/share/nginx/html/

#add the nginx configuration file to the server
docker cp nginx.conf nginx-server:/etc/nginx/nginx.conf
echo "Added Nginx configuration file to /etc/nginx/"

#delete the apache default web page:
#docker exec -it nginx-server rm /var/www/html/index.html