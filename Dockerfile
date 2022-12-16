
#Start the mysql server
FROM mysql:8 AS mysql

#Create the necessary environment variables
ENV MYSQL_ROOT_PASSWORD=mygene
ENV MYSQL_ROOT_HOST='%'
ENV MYSQL_DATABASE=dnaiq_dallas
ENV MYSQL_PORT=3306

#Give mysql root ownership
#RUN chown -R mysql:root /var/lib/mysql/

#Run staging_labs.sql (data.sql) in the server when it runs.
#(We do this by putting ./data.sql in /docker-entrypoint-inidtdb.d on the container)
COPY ./data.sql /docker-entrypoint-initdb.d

EXPOSE 3306
EXPOSE 3307