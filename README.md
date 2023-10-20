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

we don't need to create a core for each folder beforehand on the VPS, as we copy the full folder in there.

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
