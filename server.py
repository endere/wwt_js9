#!/usr/bin/python
from flask import Flask, request, send_file
import base64
app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def image_storage():
    if request.method == 'POST':
        # data = base64.b64decode(request.data[22:])
        # app.stored_image = open("saved.png", "wb")
        # app.stored_image.write(data)
        # app.stored_image.close()
        print(request.data.split(b'&'))
        return 'success'
    else:
        return send_file('saved.png', mimetype='image/png')

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

if __name__ == '__main__':
    app.run()
