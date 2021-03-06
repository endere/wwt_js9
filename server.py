#!/usr/bin/python
from flask import Flask, request, send_file, redirect, url_for
from werkzeug import secure_filename
import base64
import extract_metadata
import json
import os
import time
import zipfile
import uuid
from flask_cors import CORS
from threading import Thread
app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST', 'GET'])
def image_storage():
    if request.method == 'POST':
        try:
            address = str(uuid.uuid4())
            split_data = request.data.split(b'&')
            url_data = base64.b64decode(split_data[0][26:])
            app.stored_image = open("{}.png".format(address), "wb")
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
        except:
            return 'Invalid header.'
    else:
        return send_file('public/js9-1.12/WWT.html')


@app.route('/image.fits', methods=['GET'])
def image_return():
    return send_file('cvnidwabcut.fits', mimetype='image/fits', cache_timeout=1)

@app.route('/<address>.png', methods=['GET'])
def unique_image_return(address):
    try:
        def remove_file():
            try:
                time.sleep(5)
                os.remove('{}.wtml'.format(address))
                os.remove('{}.png'.format(address))
            except:
                pass
        t = Thread(target=remove_file)
        t.start()
        return send_file('{}.png'.format(address), mimetype='image/png', cache_timeout=1)
    except:
        return send_file('saved.png', mimetype='image/png', cache_timeout=1)

@app.route('/images.wtml', methods=['GET'])
def wtml_return():
    return send_file('images.wtml')

@app.route('/<address>.wtml', methods=['GET'])
def unique_wtml_return(address):
    return send_file('{}.wtml'.format(address))

@app.route('/delete/<address>', methods=['DELETE'])
def delete_image_and_wtml(address):
    os.remove('{}.wtml'.format(address))
    os.remove('{}.png'.format(address))
    return 'success'

@app.route('/home', methods=['GET'])
def wwt_js9_home():
    return send_file('public/js9-1.12/WWT.html')

@app.route('/verification_html', methods=['GET'])
def verification():
    return send_file('public/js9-1.12/fits_verification.html')

@app.route('/<file>', methods=['GET'])
def give_file(file):
    return send_file('public/js9-1.12/{}'.format(file))

@app.route('/verify', methods=['POST'])
def verify_fits():
        headers_list = []
        headers = request.values['headers'].split('&')
        for pair in headers:
            try:
                headers_list.append((pair.split('=')[0], pair.split('=')[1]))
            except IndexError:
                pass
        f = request.files['file']
        key = str(uuid.uuid4())
        f.save(secure_filename(key))
        response = extract_metadata.verify_fits(key, headers_list)
        os.remove(key)
        return f.filename + '+++++' + response


@app.route('/verify/folder', methods=['POST'])
def verify_folder():
    f = request.files['file']
    key = str(uuid.uuid4())
    f.save(secure_filename(key))
    zip_ref = zipfile.ZipFile(key, 'r')
    valid = 'Valid files \n'
    invalid = 'Invalid files \n'
    for filename in zip_ref.namelist():
        zip_ref.extract(filename)
        raised_warnings = extract_metadata.mass_verify(filename)
        if raised_warnings:
            invalid += filename + '\n'
        else:
            valid += filename + '\n'
        os.remove(filename)
    os.remove(key)
    return valid + '\n' + invalid


@app.route('/verify/fix', methods=['POST'])
def fix_fits():
    headers_list = []
    headers = request.values['headers'].split('&')
    for pair in headers:
        try:
            headers_list.append((pair.split('=')[0], pair.split('=')[1]))
        except IndexError:
            pass
    f = request.files['file']
    f.save(secure_filename(f.filename))
    key = extract_metadata.fix(f.filename, headers_list)

    def yield_file():
        with open(key, 'rb') as file:
            yield from file
        os.remove(f.filename)
        os.remove(key)

    r = app.response_class(yield_file(), mimetype='image/fits')
    r.headers.set('Content-Disposition', 'attachment', filename=f.filename)
    return r


@app.route('/verify/fix_folder', methods=['POST'])
def fix_folder():
    f = request.files['file']
    key = str(uuid.uuid4())
    key2 = str(uuid.uuid4())
    f.save(secure_filename(key))
    zip_ref = zipfile.ZipFile(key, 'r')
    fixed_zip_file = zipfile.ZipFile(key2, 'w')
    for filename in zip_ref.namelist():
        zip_ref.extract(filename)
        fitskey = extract_metadata.fix(filename, [])
        os.remove(filename)
        os.rename(fitskey, filename)
        fixed_zip_file.write(filename)
        os.remove(filename)
    os.remove(key)

    def yield_file():
        with open(key2, 'rb') as file:
            yield from file
        os.remove(key2)

    r = app.response_class(yield_file(), mimetype='application/zip')
    r.headers.set('Content-Disposition', 'attachment', filename='fixed_fits_images.zip')
    return r



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
    app.run(debug=True)
