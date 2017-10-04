#!/usr/bin/env python
import os
import sys

import astropy.units as u
import numpy as np

from astropy.coordinates import SkyCoord
from astropy.io import fits
from astropy.wcs import WCS
from astropy.wcs.utils import proj_plane_pixel_scales








# FROM ASTROPY PYREGION, WILL ADD IMPORT WHEN ITS OUT OF DEV VERSION!!!
def _calculate_rotation_angle(reg_coordinate_frame, header):
    """Calculates the rotation angle from the region to the header's frame

    This attempts to be compatible with the implementation used by SAOImage
    DS9. In particular, this measures the rotation of the north axis as
    measured at the center of the image, and therefore requires a
    `~astropy.io.fits.Header` object with defined 'NAXIS1' and 'NAXIS2'
    keywords.

    Parameters
    ----------
    reg_coordinate_frame : str
        Coordinate frame used by the region file

    header : `~astropy.io.fits.Header` instance
        Header describing the image

    Returns
    -------
    y_axis_rot : float
        Degrees by which the north axis in the region's frame is rotated when
        transformed to pixel coordinates
    """
    new_wcs = WCS(header)
    region_frame = SkyCoord(
        '0d 0d',
        frame=reg_coordinate_frame,
        obstime='J2000')
    region_frame = SkyCoord(
        '0d 0d',
        frame=reg_coordinate_frame,
        obstime='J2000',
        equinox=region_frame.equinox)

    origin = SkyCoord.from_pixel(
        header['NAXIS1']/2,
        header['NAXIS2']/2,
        wcs=new_wcs,
        origin=1).transform_to(region_frame)

    offset = proj_plane_pixel_scales(new_wcs)[1]

    origin_x, origin_y = origin.to_pixel(new_wcs, origin=1)
    origin_lon = origin.data.lon.degree
    origin_lat = origin.data.lat.degree

    offset_point = SkyCoord(
        origin_lon, origin_lat+offset, unit='degree',
        frame=origin.frame.name, obstime='J2000')
    offset_x, offset_y = offset_point.to_pixel(new_wcs, origin=1)

    north_rot = np.arctan2(
        offset_y-origin_y,
        offset_x-origin_x) / np.pi*180.

    cdelt = new_wcs.wcs.get_cdelt()
    if (cdelt > 0).all() or (cdelt < 0).all():
        return north_rot - 90
    else:
        return -(north_rot - 90)

public_folder = '/home/AAS/js9_wwt_server/'
base_url = 'http://www.worldwidetelescope.org/wwtweb/ShowImage.aspx?'

def viewinwwt(header2):
    # dirpath = sys.argv[1]
    # filenames = [f for f in os.listdir(filepath) if f.endswith('fits')]
    # fname = '{:s}.txt'.format(os.path.splitext(os.path.split(filename)[1])[0])
    # outfile = fname
    header = fits.header.Header(header2)
    print(header)
    print(dir(SkyCoord))
    print('----------------------------')
    # print(header2)
    # print(type(header))
    # print(type(header2))

    reqd = {}
    reqd['x'] = header['CRPIX1']
    reqd['y'] = header['CRPIX2']
    try:
        ra_str = header['RA']
        dec_str = header['DEC']
        coord = SkyCoord('{} {}'.format(ra_str, dec_str), unit=(u.hourangle, u.deg))
        reqd['ra'] = coord.ra.value
        reqd['dec'] = coord.dec.value
    except:
        try:
            reqd['ra'] = header['RA_CENT']
            reqd['dec'] = header['DEC_CENT']
        except:
            print('Header does not have the needed header keys')
            return


    reqd['rotation'] = _calculate_rotation_angle('icrs', header)

    wcs = WCS(header)
    # print(test_wcs)
    # print(wcs.to_header())

    reqd['scale'] = proj_plane_pixel_scales(wcs)[0]
    # reqd['name'] = os.path.split(filename)[0]
    # print(reqd)
    # request = 'ra={ra}&dec={dec}&x={x}&y={y}&rotation={rotation}&Scale={scale}'.format(**reqd)
    # print('request is:' + request)
    # print(reqd['scale'])
    # with open(outfile, 'w') as outp:
    #     outp.write('{0:s}{1:s}'.format(base_url, request))
    # print(request)
    return reqd



if __name__ == "__main__":
    # directory = sys.argv[1]
    # filenames = [f for f in os.path.listdir(directory) if f.endswith('fits')]
    # for filename in filenames:
    filename = 'cvnidwabcut.fits'
    # imageurl = makepng(filename)
    viewinwwt(test_dict)