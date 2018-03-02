import ast
import testcase
import extract_metadata
import json
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2
import urllib
# import pytest
from flask import Flask
from flask_testing import LiveServerTestCase

PARAMS_TABLE_VIEWS = [
    '/home', '/verification_html', '/', '/image.fits', '/test.png', '/image_export.js', '/wwt_control.js', '/js9prefs.js', '/js9support.min.js', '/js9.min.js', '/js9plugins.js'
]

class MyTest(LiveServerTestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['TESTING'] = True
        # Default port is 5000
        app.config['LIVESERVER_PORT'] = 5000
        # Default timeout is 5 seconds
        app.config['LIVESERVER_TIMEOUT'] = 10
        return app

    def test_server_is_up_and_running(self):
        response = urllib2.urlopen(self.get_server_url())
        self.assertEqual(response.code, 200)

    def test_each_view_returns_200(self):
        for route in PARAMS_TABLE_VIEWS:
            response = urllib2.urlopen(self.get_server_url() + route)
            self.assertEqual(response.code, 200)

    def test_home_view_has_proper_html(self):
        response = urllib2.urlopen(self.get_server_url() + '/home')
        self.assertIn('<title>WWT/JS9 port</title>', str(response.read()))

    def test_verification_view_has_proper_html(self):
        response = urllib2.urlopen(self.get_server_url() + '/verification_html')
        self.assertIn('<title>Fits verification</title>', str(response.read()))

    def test_image_storage(self):
        req = urllib2.Request(self.get_server_url() + '/', testcase.case)
        req.add_header('Content-Type', 'text/plain;charset=UTF-8')
        response = urllib2.urlopen(req)
        response_body = ast.literal_eval(response.read().decode('utf-8'))
        self.assertIsInstance(response_body, dict)
        image = urllib2.urlopen(self.get_server_url() + '/' + response_body['address'] + '.png')
        self.assertEqual(image.getheader('Content-Type'), 'image/png')


    def test_get_meta_dictionary(self):
        data = testcase.case.split(b'&')[5][7:].decode('utf-8')
        reqd = extract_metadata.get_coords_dict(json.loads(data))
        self.assertEqual(reqd, {'x': 457, 'y': 471, 'RA': 189.65693199, 'Dec': 32.7603806435, 'Rotation': -180.00010826155915, 'BaseDegreesPerTile': 1.1359209872912663})

    def test_verify_fits_no_headers(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [])
        self.assertIn("Card 'OBSERVAT' is not FITS standard", warnings)

    def test_verify_fits_with_broken_header(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [('observat', 'test')])
        self.assertNotIn("Card 'OBSERVAT' is not FITS standard", warnings)
        self.assertIn('Broken header observat will be replaced with test', warnings)

    def test_verify_fits_with_naxis_header(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [('naxis1', 'test')])
        self.assertIn("Naxis values cannot be changed", warnings)

    def test_verify_fits_with_new_header(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [('newhead', 'test')])
        self.assertIn('New header newhead will be added with value test', warnings)

    def test_verify_fits_with_changed_header(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [('crval1', 'test')])
        self.assertIn('The value for header crval1 will be changed from 189.65693199 to test', warnings)

    def test_verify_fits_with_each_type_of_header(self):
        warnings = extract_metadata.verify_fits('cvnidwabcut.fits', [('crval1', 'test'), ('newhead', 'test'), ('naxis1', 'test'),('observat', 'test')])
        self.assertIn('The value for header crval1 will be changed from 189.65693199 to test', warnings)
        self.assertIn('Broken header observat will be replaced with test', warnings)
        self.assertIn('New header newhead will be added with value test', warnings)
        self.assertIn("Naxis values cannot be changed", warnings)
        self.assertNotIn("Card 'OBSERVAT' is not FITS standard", warnings)

