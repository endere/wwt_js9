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
        reqd = extract_metadata.get_coords_dict(json.loads(split_data[5][7:].decode('utf-8')))
        wtml_dict = {}
        for i in split_data[1:-1]:
            key = i[:i.index(b'=')].decode('utf-8')
            value = i[i.index(b'=') + 1:].decode('utf-8')
            wtml_dict[key] = value if value != '' else reqd[key]
        edit_wtml(wtml_dict)
        wtml_dict['x'] = reqd['x']
        wtml_dict['y'] = reqd['y']
        return json.dumps(wtml_dict)
    else:
        return send_file('saved.png', mimetype='image/png')
#

@app.route('/image.png', methods=['GET'])
def image_return():
    return send_file('saved.png', mimetype='image/png', cache_timeout=1)

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

@app.route('/home', methods=['GET'])
def wwt_js9_home():
        return send_file('public/js9-1.12/WWT.html')


@app.route('/<file>', methods=['GET'])
def give_file(file):
    return send_file('public/js9-1.12/{}'.format(file))

def edit_wtml(dictionary):
    dictionary['CenterX'] = dictionary['RA']
    dictionary['CenterY'] = dictionary['Dec']
    with open('template.wtml', 'r') as old, open('images.wtml', 'w') as new:
        for line in old.readlines():
            try:
                attribute = list(filter(lambda x: x in line, list(dictionary.keys())))[0]
                carrot = '>' if attribute == 'BaseDegreesPerTile' else ''
                new.write(' ' * 5 + attribute + '=' + '"' + str(dictionary[attribute]) + '"' + carrot + '\n')
            except IndexError:
                new.write(line)



if __name__ == '__main__':
    app.run()
