#!/usr/bin/python
from flask import Flask, request, send_file
import base64
import extract_metadata
import json
app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def image_storage():
    if request.method == 'POST':
        split_data = request.data.split(b'&')
        url_data = base64.b64decode(split_data[0][26:])
        app.stored_image = open("saved.png", "wb")
        app.stored_image.write(url_data)
        app.stored_image.close()
        print('-------------')
        reqd = extract_metadata.viewinwwt(json.loads(split_data[5][7:].decode('utf-8')))
        print('-------------')
        ra = split_data[2][3:] if split_data[2][3:] != b'' else reqd['ra']
        print('--------------')
        # app.ra = split_data[2][3:].decode('utf-8')
        # app.dec = split_data[1][4:].decode('utf-8')
        for i in split_data:
            print(i)
            print(i.index(b'='))
            print(i[i.index(b'=')])
            print('======')
        edit_wtml({'Dec': split_data[1][4:], 'RA': split_data[2][3:], 'Rotation': split_data[3][9:], 'BaseDegreesPerTile': split_data[4][19:]})
        return 'success'
    else:
        return send_file('saved.png', mimetype='image/png')
#

@app.route('/image.png', methods=['GET'])
def image_return():
    return send_file('saved.png', mimetype='image/png', cache_timeout=1)

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')


# @app.route('/RA', methods=['GET'])
# def get_RA():
#         return send_file('public/js9-1.12/WWT.html')


# @app.route('/images2.wtml', methods=['GET'])
# def second_wtml_return():
#     return send_file('images.wtml')

@app.route('/home', methods=['GET'])
def wwt_js9_home():
        return send_file('public/js9-1.12/WWT.html')


@app.route('/<file>', methods=['GET'])
def give_file(file):
    return send_file('public/js9-1.12/{}'.format(file))


# @app.route('/header', methods=['POST'])
# def headerParse():
#     # extract_metadata.viewinwwt(request.data.decode('utf-8'))
#     print(extract_metadata.viewinwwt(json.loads(request.data.decode('utf-8'))))
#     return 'success'

def edit_wtml(dictionary):
    dictionary['CenterX'] = dictionary['RA']
    dictionary['CenterY'] = dictionary['Dec']
    with open('template.wtml', 'r') as old, open('images.wtml', 'w') as new:
        for line in old.readlines():
            try:
                attribute = list(filter(lambda x: x in line, list(dictionary.keys())))[0]
                carrot = '>' if attribute == 'BaseDegreesPerTile' else ''
                new.write(' ' * 5 + attribute + '=' + '"' + dictionary[attribute].decode('utf-8') + '"' + carrot + '\n')
            except IndexError:
                new.write(line)



if __name__ == '__main__':
    app.run()
    # edit_wtml({'RA': b'1000', 'Dec': b'50'})
