#!/usr/bin/python
from flask import Flask, request, send_file
import random
import base64
app = Flask(__name__)



def uniqueid():
    seed = random.getrandbits(32)
    while True:
        yield seed
        seed += 1
app.num = uniqueid()

@app.route('/<num>', methods=['GET'])
def image_return(num):
    return send_file('saved.png', mimetype='image/png')


@app.route('/', methods=['POST'])
def image_storage():
    data = base64.b64decode(request.data[22:])
    app.stored_image = open("saved.png", "wb")
    app.stored_image.write(data)
    app.stored_image.close()
    return str(next(app.num))


@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

if __name__ == '__main__':
    app.run()
