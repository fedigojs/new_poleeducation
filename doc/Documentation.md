# Create volume backup on server in folder /var/www/poleeducation/backup

-   docker run --rm -v poleeducation_db_data:/data -v /var/www/poleeducation/backup:/backup busybox tar czf /backup/poleeducation_db_backup.tar.gz -C /data .

# Restore volume from backup

-   docker stop poleeducation_db;
-   docker run --rm -v poleeducation_db_data:/var/lib/postgresql/data -v /var/www/poleeducation/backup:/backup busybox tar xzf /backup/poleeducation_db_backup.tar.gz -C /var/lib/postgresql/data;
-   docker start poleeducation_db;
-   docker logs poleeducation_db;

# Firewall test open ports on server

-   nmap -Pn 185.156.42.59
