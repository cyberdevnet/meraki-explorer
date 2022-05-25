import redis
import gevent
from dotenv import load_dotenv
import os
from flask import Flask
from flask_sock import Sock

load_dotenv(verbose=True)

WEBSOCKET_ENV_DEFAULT = 'production'

try:
    if os.getenv('WEBSOCKET_ENV',    WEBSOCKET_ENV_DEFAULT) == 'development':
        # Using a developmet configuration
        print("Environment is development")

        redis_url = 'redis://localhost:6379/0'
        channel = 'live_log'
    else:
        # Using a production configuration
        print("Environment is production")

        redis_url = 'redis://redis:6379/0'
        channel = 'live_log'

except Exception as error:
    print('error: ', error)
    pass


connection = redis.StrictRedis.from_url(redis_url, decode_responses=True)


class PubSubListener(object):
    def __init__(self):
        self.clients = []
        self.pubsub = connection.pubsub(ignore_subscribe_messages=False)
        self.pubsub.subscribe(**{channel: self.handler})
        self.thread = self.pubsub.run_in_thread(sleep_time=0.001)

    def register(self, client):
        self.clients.append(client)

    def handler(self, message):
        _message = message['data']

        if type(_message) != int:
            self.send(_message)

    def send(self, data):
        for client in self.clients:
            try:

                client.send(data)
            except Exception:
                self.clients.remove(client)


pslistener = PubSubListener()

app = Flask(__name__)
app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 25}
sockets = Sock(app)


@sockets.route('/live_logs')
def live_logs(ws):
    pslistener.register(ws)

    while ws.connected:
        gevent.sleep(0.1)


@sockets.route('/global_logs')
def global_logs(ws):
    print("MODE", ws.mode)
    try:
        pslistener.register(ws)

        with open("../log/log.txt") as fp:

            ws.send(fp.read())
    except Exception as err:
        print("CIAOOO", err)


@app.route('/')
def hello():
    return "What's up?"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


# start also with: gunicorn -b :5000 --threads 100 websocketserver:app --log-level debug
