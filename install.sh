#!/bin/bash

BASEDIR="/wardrobe"

#check Qt
qmake -v >/dev/null 2>&1
[ $? -ne 0 ] && echo "Qt developer tool is not installed" && exit

#check mysql
mysql --version >/dev/null 2>&1
[ $? -ne 0 ] && echo "No mysql client tools installed" && exit


echo "Please type mariadb/mysql host name"
read HOST
echo "Please type mariadb/mysql root password"
read PASS
echo "Please type mariadb/mysql wardrobe password"
read WPASS

mkdir -p $BASEDIR/src
mkdir -p $BASEDIR/ems
mkdir -p $BASEDIR/RAW-DATA
mkdir -p $BASEDIR/bin
mkdir -p $BASEDIR/indices/gtf
mkdir -p $BASEDIR/STAR/gtf
mkdir -p $BASEDIR/tmp
mkdir -p $BASEDIR/upload

>${BASEDIR}/tmp/install.log

cd $BASEDIR/src

echo "Creating dtabase structure ems/experiments"
mysql -h${HOST} -p${PASS} -uroot < ${BASEDIR}/src/sql/wardrobe.sql >>${BASEDIR}/tmp/install.log 2>&1
mysql -h${HOST} -p${PASS} -uroot -N -e "DROP USER 'wardrobe'@'localhost';" 
mysql -h${HOST} -p${PASS} -uroot -N -e "CREATE USER 'wardrobe'@'localhost' IDENTIFIED BY '${WPASS}';"
mysql -h${HOST} -p${PASS} -uroot -N -e "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, REFERENCES, INDEX, ALTER, CREATE VIEW, SHOW VIEW, EXECUTE ON *.* TO 'wardrobe'@'localhost';"
mysql -h${HOST} -p${PASS} -uroot -N -e "REVOKE GRANT OPTION, CREATE TEMPORARY TABLES, LOCK TABLES, EVENT,ALTER ROUTINE, CREATE ROUTINE, TRIGGER ON *.* FROM 'wardrobe'@'localhost';"
mysql -h${HOST} -p${PASS} -uroot -N -e "FLUSH PRIVILEGES;"

#mysql settings
#BINS=$(mysql -h${HOST} -p${PASS} -uroot -N -e "select group_concat(\`value\` order by \`key\` desc separator '/') from ems.settings where \`key\` in ('wardrobe','bin')")
#"

echo "Writing config"

CONFIG=$(cat << EOF
#Do not remove comments they are usefull for some scripts
#MariaDB/MySQL host to connect
${HOST}

#MariaDB/MySQL User
wardrobe

#MariaDB/MySQL password
${WPASS}

#Wardrobe DB
ems

#MariaDB/MySQL port
3306

#C++ variables
#MariaDB/MySQL Qt5 Driver
QMYSQL
EOF
)
echo "${CONFIG}" >/etc/wardrobe/wardrobe


echo "Setting rights"

chmod 0660 /etc/wardrobe/wardrobe
chmod 0755 $BASEDIR
chmod 0775 $BASEDIR/RAW-DATA
chmod 0777 $BASEDIR/tmp

${BASEDIR}/src/assemble.sh

cd ./scripts/

for i in *.py; do 
ln -sf $(pwd)/${i} $BASEDIR/bin/${i}
done

cd ..

echo "Setting rights"
if [ z"`uname`" == "zDarwin" ]; then
chown _www /etc/wardrobe/wardrobe
chown _www $BASEDIR/RAW-DATA
chown _www $BASEDIR/tmp
fi

if [ z"`head -n 1 /etc/SuSE-release 2>/dev/null`" == "zopenSUSE 13.2 (x86_64)" ]; then
useradd -U -m wardrobe
chown wwwrun:wardrobe /etc/wardrobe/wardrobe
chown wwwrun:wardrobe $BASEDIR/RAW-DATA
chown wwwrun:wardrobe $BASEDIR/tmp
chmod g+s $BASEDIR/RAW-DATA
setfacl -m "default:group::rwx" $BASEDIR/RAW-DATA
chmod g+s $BASEDIR/tmp
setfacl -m "default:group::rwx" $BASEDIR/tmp

ln -s ${BASEDIR}/src/scripts/DefFunctions.py /usr/local/lib64/python2.7/site-packages/DefFunctions.py
ln -s ${BASEDIR}/src/scripts/Settings.py /usr/local/lib64/python2.7/site-packages/Settings.py

crontab -l -u wardrobe | { cat; echo "*/10 * * * *    . ~/.profile && ${BASEDIR}/bin/DownloadRequests.py >> ${BASEDIR}/tmp/Download.log 2>&1"; } | crontab -
crontab -l -u wardrobe | { cat; echo "*/10 * * * *    . ~/.profile && ${BASEDIR}/bin/RunDNA.py >> ${BASEDIR}/tmp/RunDNA.log 2>&1"; } | crontab -
crontab -l -u wardrobe | { cat; echo "*/10 * * * *    . ~/.profile && ${BASEDIR}/bin/RunRNA.py >> ${BASEDIR}/tmp/RunRNA.log 2>&1"; } | crontab -
crontab -l -u wardrobe | { cat; echo "*/10 * * * *    . ~/.profile && ${BASEDIR}/bin/ForceRun.py >> ${BASEDIR}/tmp/ForceRun.log 2>&1"; } | crontab -

sed -i '/\[Service\]/a\UMask=0002' /etc/systemd/system/apache2.service 

[ -f /etc/apache2/vhosts.d/wardrobe.conf ] || cp $BASEDIR/src/doc/wardrobe.conf /etc/apache2/vhosts.d/wardrobe.conf

cp -R $BASEDIR/src/EMS/* $BASEDIR/ems

fi

