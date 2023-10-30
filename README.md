# fst

## setup

### local web-server

to run a local web-server to test the frontend, we assume Python3 is available. Do:

```
python3 -m http.server
```

and point your web browser to `localhost:8000`.

### solr

- install `apache solr`, [official docs](https://lucene.apache.org/solr/guide/7_5/taking-solr-to-production.html)
- make two new cores, named `readin-fst` and `name2gender`, with the following command ([ref](https://stackoverflow.com/a/43032588)):

```
cd /opt/solr
sudo -u solr ./bin/solr create -c <core-name>
sudo ls -la /var/solr/data // check folders are created
```

- run `python parser.py /path/to/readin.xml`.

the current VPS cannot handle parse a 30MB XML file so we need to run this on our machine. 

afterwards, upload the two folders `name2gender` and `readin-fst` from your local SOLR installation (eg under `./solr/server/solr`) to the VPS, and move each folder under `/var/solr/data` and fix the file + folder permissions:

```
sudo chown -R solr:solr /var/solr/data/readin-fst
sudo chown -R solr:solr /var/solr/data/name2gender
```

reload each SOLR core:

```
curl "http://localhost:8983/solr/admin/cores?action=RELOAD&core=name2gender"
curl "http://localhost:8983/solr/admin/cores?action=RELOAD&core=readin-fst"
```

then, add a new proxy pass in your `nginx` or `apache` config file:

- nginx, inside the main `server` block:

```
location /solr {
	proxy_pass http://localhost:8983/solr/readin-fst/query;
}
```

- apache, before `</VirtualHost>`:

```
ProxyRequest Off
ProxyPreserveHost On
<Proxy *>
	Order deny,allow
	Allow from all
</Proxy>
ProxyPass /solr http://localhost:8983/solr/readin-fst/query
```

for this to work, make sure to enable `sudo a2enmod proxy` and `sudo a2enmod proxy_http`, otherwise Apache can't do the `ProxyPass` and query the solr database ([ref](https://stackoverflow.com/a/26045183)).

#### solr help 

In case solr stops, or fails etc, try to simply restart it by doing

```
sudo service solr restart
```

it will restart the process under the `solr` user on the appropriate port (eg `8983`). this is using the `init.d` process.

to check the SOLR log:

```
sudo cat /var/solr/logs/solr.log
```

#### VPS and SOLR swap memory

make sure the VPS / VM has a swap file of 2gb or so, otherwise SOLR does not run. see for eg <https://www.devtutorial.io/how-to-create-swap-space-on-debian-12-p3119.html>.

#### VPS and SOLR ulimit

SOLR requires 65000 as limit for ulimit hard and soft settings. add the following to `/etc/security/limits.conf`:

```
solr    soft   nofile  65000
solr    hard   nofile  65000
solr    soft   nproc   65000
solr    hard   nproc   65000
```

### Java 11 for SOLR v7.5

in the process of downgrading from SOLR 9.5 to 7.5, we also had to downgrade the Java version used.

while SOLR asks for Java 8 JRE, we can install version 11. do:

```
$ wget https://download.java.net/openjdk/jdk11/ri/openjdk-11+28_linux-x64_bin.tar.gz

$ tar xvf openjdk-11+28_linux-x64_bin.tar.gz

$ sudo mv jdk-11*/ /opt/jdk11

$ sudo tee /etc/profile.d/jdk.sh <<EOF
export JAVA_HOME=/opt/jdk11
export PATH=\$PATH:\$JAVA_HOME/bin
EOF

$ source /etc/profile.d/jdk.sh

$ echo $JAVA_HOME

$ java -version
```

(ref <https://techviewleo.com/install-java-11-openjdk-11-on-debian-linux/?expand_article=1>)

SOLR 7.5 still uses a hardcode path to lookup for Java and will complain it can't find a functioning Java binary in the system.

to fix this, open `/opt/solr/bin/solr` at at line 217 replace:

```
JAVA=java
```

with 

```
JAVA=/opt/jdk11/bin/java
```

ref <https://stackoverflow.com/a/37125455>.

then you can run the `/op/solr/bin/solr` command to create / delete cores, etc.

#### SOLR setup

- Apache SOLR 7.5 (<https://archive.apache.org/dist/lucene/solr/7.5.0/>)
  - <https://archive.apache.org/dist/lucene/solr/7.5.0/solr-7.5.0.tgz>
  - <https://archive.apache.org/dist/lucene/solr/7.5.0/solr-7.5.0.tgz.asc>
  
- Java (see installaton steps above) :

```
openjdk 11 2018-09-25
OpenJDK Runtime Environment 18.9 (build 11+28)
OpenJDK 64-Bit Server VM 18.9 (build 11+28, mixed mode)
```

#### using solr APIs

- `s` = string
- `t` = text
- `i` = integer

some refs on building query:

- [JSON Facet API](http://yonik.com/json-facet-api/)
- [count distinct in solr](http://yonik.com/solr-count-distinct/)
- [multi-select faceting](http://yonik.com/multi-select-faceting/)

```
https://feministsearchtool.nl/solr?q=gender OR race OR intersectionality OR transgender OR "social class"&rows=150&fl=gender_s AND a_title_statement_t AND b_title_statement_t AND title_statement_t AND imprint_b
```

```
https://feministsearchtool.nl/solr?q=gender OR race OR intersectionality OR transgender OR"social class"&rows=150
```

### dokuwiki

1. toggle your options (eg, toggle off all languages except the one(s) you need to use)
2. click on Download and refuse the Save this file browser dialog (or let it go, depending on your browser prefs). copy the link of the download button (right-click, copy link), then in the home dir of your vps, do:
   - `curl -O <dokuwiki-download-url>`
3. `tar xzvf dokuwiki-stable-xxxxx.tgz`
4. `mv dokuwiki-xxxxx wiki` (or any name you like)
5. `sudo cp -r wiki /var/www/.`
6. change some files ownership for the dokuwiki installer to work properly
   - `sudo chown -R www-data data`
   - `sudo chown www-data lib/plugins/`
   - `sudo chown www-data conf`
7. last, visit `projectname.org/<name-of-wiki-folder>/install.php` and follow the instructions
8. `sudo rm install.php`
9. setup [nice-urls](https://www.dokuwiki.org/install:apache) and [this htaccess rules](https://ada.adrianheine.de/dokuwiki-php-execution#solutions_in_the_configuration) to put in `/etc/apache2/apache2.conf`
10. setup correct file permission [ref](https://www.howtoforge.com/tutorial/debian-dokuwiki-apache-installation/), make also `/var/www/wiki/conf/` writable by `www-data:root` (eg `sudo chown -R www-data:root`)
 
## folder structure

``` 
- opt/solr/
- /var/solr/data/
  - readin-fst
  - name2gender
- var/www/fst/
- var/www/pad
- var/www/wiki
```
