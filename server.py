#!/usr/bin/python
from flask import Flask, request, send_file, after_this_request
import base64
import extract_metadata
import json
import os
import time
app = Flask(__name__)




@app.route('/', methods=['POST', 'GET'])
def image_storage():
    if request.method == 'POST':
        address = request.remote_addr.replace('.', '')
        split_data = request.data.split(b'&')
        url_data = base64.b64decode(split_data[0][26:])
        app.stored_image = open("{}.png".format(address), "wb") ## changed from image.png
        app.stored_image.write(url_data)
        app.stored_image.close()
        reqd = extract_metadata.get_coords_dict(json.loads(split_data[5][7:].decode('utf-8')))
        wtml_dict = {}
        for i in split_data[1:-1]:
            key = i[:i.index(b'=')].decode('utf-8')
            value = i[i.index(b'=') + 1:].decode('utf-8')
            wtml_dict[key] = value if value != '' else reqd[key]
        edit_wtml(wtml_dict, address)
        wtml_dict['x'] = reqd['x']
        wtml_dict['y'] = reqd['y']
        wtml_dict['address'] = address
        return json.dumps(wtml_dict)
    else:
        return send_file('saved.png', mimetype='image/png')


@app.route('/image.png', methods=['GET'])
def image_return():
    return send_file('saved.png', mimetype='image/png', cache_timeout=1)

@app.route('/<address>.png', methods=['GET'])
def unique_image_return(address):
    try:
        @after_this_request
        def remove_file(response):
            try:
                time.sleep(2)
                os.remove('{}.wtml'.format(address))
                os.remove('{}.png'.format(address))
            except:
                print('file not found')
            return response
        return send_file('{}.png'.format(address), mimetype='image/png', cache_timeout=1)
    except:
        return 'File not found'

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

@app.route('/<address>.wtml', methods=['GET'])
def unique_wtml_return(address):
    return send_file('{}.wtml'.format(address))

@app.route('/delete/<address>', methods=['GET'])
def delete_image_and_wtml(address):
    os.remove('{}.wtml'.format(address))
    os.remove('{}.png'.format(address))
    return 'success'

@app.route('/home', methods=['GET'])
def wwt_js9_home():
    return send_file('public/js9-1.12/WWT.html')

@app.route('/<file>', methods=['GET'])
def give_file(file):
    return send_file('public/js9-1.12/{}'.format(file))

def edit_wtml(dictionary, address):
    dictionary['CenterX'] = dictionary['RA']
    dictionary['CenterY'] = dictionary['Dec']
    dictionary['Url'] = 'http://wwt-js9-server.herokuapp.com/{}.png'.format(address)
    with open('template.wtml', 'r') as old, open('{}.wtml'.format(address), 'w') as new:
        for line in old.readlines():
            try:
                attribute = list(filter(lambda x: x in line, list(dictionary.keys())))[0]
                carrot = '>' if attribute == 'BaseDegreesPerTile' else ''
                new.write(' ' * 5 + attribute + '=' + '"' + str(dictionary[attribute]) + '"' + carrot + '\n')
            except IndexError:
                new.write(line)



if __name__ == '__main__':
    app.run()
