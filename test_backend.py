
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2
import pytest
from flask import Flask
from flask_testing import LiveServerTestCase

PARAMS_TABLE_VIEWS = [
    '/home', '/verification_html', '/', '/image.fits', '/test.png'
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

    # def test_verification_view_view_returns_200(self):
    #     response = urllib2.urlopen(self.get_server_url() + '/verification_html')
    #     self.assertEqual(response.code, 200)





# import pytest
# PARAMS_TABLE = [
#         ("CCC[CCC]FCC[CCCCC]CFFFF[CCC]FFFF", "...[CCC]F..[CCCCC].FFFF[CCC]FFFF"),
#         ("...[CCC]...[CCCFC].....[CCC]....", "...[CCC]...[...F.].....[CCC]...."),
#         ("CCC[CCC]FCC[CCCFC]CFFFF[CCC]FFFF", "...[CCC]F..[...F.].FFFF[CCC]FFFF"),
#         ("CCC[CCC]CCC[CCCFC]CCCCC[CCC]CCCC", "CCC[CCC]CCC[...F.]CCCCC[CCC]CCCC"),
#         ("CCCFFFF", "...FFFF"),
#         ("[C]", "[C]"),
#         ("CCC[FFFC", "CCC[FFF.")

# ]


# @pytest.mark.parametrize("farm, result", PARAMS_TABLE)
# def test_trib(farm, result):
#     """Test to see which chickens survive night, based on rules supplied in kata (written in foxes.py)."""
#     from foxes import hungry_foxes
#     assert hungry_foxes(farm) == result
