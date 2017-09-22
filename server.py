#!/usr/bin/python
from flask import Flask, request, send_file
import base64
app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def image_storage():
    if request.method == 'POST':
        split_data = request.data.split(b'&')
        url_data = base64.b64decode(split_data[0][26:])
        app.stored_image = open("saved.png", "wb")
        app.stored_image.write(url_data)
        app.stored_image.close()
        print(b'dec is' + split_data[1][4:])
        print(b'ra is' + split_data[2][3:])
        return 'success'
    else:
        return send_file('saved.png', mimetype='image/png')

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

if __name__ == '__main__':
    app.run()
