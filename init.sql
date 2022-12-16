DELETE FROM mysql.user WHERE user='root' AND host='localhost'
UPDATE mysql.user SET host="%" WHERE user="root"