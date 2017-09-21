#!/usr/bin/python
from flask import Flask, request, send_file
import random
import base64
app = Flask(__name__)


@app.route('/<num>', methods=['GET'])
def image_return():
    return send_file('saved.png', mimetype='image/png')


@app.route('/', methods=['POST'])
def image_storage():
    data = base64.b64decode(request.data[22:])
    app.stored_image = open("saved.png", "wb")
    app.stored_image.write(data)
    app.stored_image.close()
    return next(app.num)

def uniqueid():
    seed = random.getrandbits(32)
    while True:
        yield seed
        seed += 1


if __name__ == '__main__':
    app.run()
    app.num = uniqueid()
