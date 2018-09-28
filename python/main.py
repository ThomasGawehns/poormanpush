from pywebpush import webpush,WebPushException
import requests
import sys
from getopt import getopt
import base64
import json

#urlreplace: no padding + -> - und / -> _

def urlreplace(text):
    return text.replace('+', '-').replace('/', '_')

#usage: main.py -k <keyfile> -r <resturl> -m <message> -t <targeturl> -e <responsible>

keyfile="Path to your keyfile on local machine"
resturl='URL to the database on server"
message='a message'
targeturl='https://gawehns.de'
responsible='mailto:someone@somemail.com'

try: 
    opts, args = getopt(sys.argv[1:], "k:r:m:t:e:")
    for opt, arg in opts:
        print(opt + ' ' + arg)
        if opt == '-k': 
            keyfile=arg
        elif opt == '-r': 
            resturl=arg
        elif opt == '-m': 
            message=arg
        elif opt == '-t': 
            targeturl=arg
        elif opt == '-e': 
            responsible=arg
except:
    print "#usage: main.py -k <keyfile> -r <resturl> -m <message> -t <targeturl> -e <responsible>"
    sys.exit()

r = requests.get(resturl)

data =r.json()
print(data['data'])
# sys.exit()
for i in data['data']:
    try: 
        webpush(i, 
                json.dumps(
                    {'url': targeturl,
                        'msg': message}),
                vapid_private_key=keyfile,
                vapid_claims={"sub": responsible})
    except WebPushException as e:
        if e.response.status_code == 410 or e.response.status_code == 404:
            print("should delete Entry")
            print(base64.encodestring(i['endpoint']))
            requests.delete(resturl + '/'
                    + urlreplace(base64.encodestring(i['endpoint'])))
        else: 
            print(e)
    except Exception as e:
        print(e)
