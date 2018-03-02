#!/usr/bin/env python
import os
import sys
import uuid
import logging
import warnings
import astropy.units as u
import numpy as np
import ast

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


def get_coords_dict(head):
    header = fits.header.Header(head)
    reqd = {}
    reqd['x'] = header['CRPIX1']
    reqd['y'] = header['CRPIX2']
    try:
        reqd['RA'] = header['CRVAL1']
        reqd['Dec'] = header['CRVAL2']
    except:
        print('Header does not have the needed header keys')
        return
    wcs = WCS(header)
    p1 = SkyCoord(header['lowestPoint'], unit=(u.hourangle, u.deg))
    p2 = SkyCoord(header['highestPoint'], unit=(u.hourangle, u.deg))
    xy1 = wcs.wcs_world2pix(p1.ra.value, p1.dec.value, 1)
    xy2 = wcs.wcs_world2pix(p2.ra.value, p2.dec.value, 1)
    averageDec = (p1.dec.value + p2.dec.value) / 2
    deltaRA = ((p2.ra.value - p1.ra.value) * np.cos(averageDec * (np.pi/180))) * 3600
    deltaDec = (p2.dec.value - p1.dec.value) * 3600
    pixelSep = np.sqrt((xy1[0] + xy2[0]) ** 2 + (xy1[1] + xy2[1]) ** 2)
    angularSep = np.sqrt(deltaRA ** 2 + deltaDec ** 2)
    scale = angularSep / pixelSep
    reqd['Rotation'] = _calculate_rotation_angle('icrs', header) - 180
    reqd['BaseDegreesPerTile'] = scale
    return reqd




def verify_fits(file, header_list):
    key = str(uuid.uuid4())
    logging.captureWarnings(True)
    formatter = logging.Formatter('%(asctime)s\t%(levelname)s\t%(message)s')
    open(key + '.log', 'w')
    console_handler = logging.FileHandler(key + '.log')
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    warnings_logger = logging.getLogger("py.warnings")
    warnings_logger.addHandler(console_handler)
    try:
        f = fits.open(file)
        for item in header_list:
            try:
                item = (item[0], ast.literal_eval(item[1]))
            except:
                pass
            if 'naxis' in item[0].lower():
                warnings_logger.warning('VerifyWarning: --Naxis values cannot be changed--warnings.warn(line, VerifyWarning)')
                continue
            try:
                warnings_logger.warning('VerifyWarning: --The value for header {} will be changed from {} to {}--warnings.warn(line, VerifyWarning)'.format(item[0], f[0].header[item[0]], item[1]))
                f[0].header[item[0]] = item[1]
            except KeyError:
                warnings_logger.warning('VerifyWarning: --New header {} will be added with value {}--warnings.warn(line, VerifyWarning)'.format(item[0], item[1]))
                f[0].header[item[0]] = item[1]
            except:
                warnings_logger.warning('VerifyWarning: --Broken header {} will be replaced with {}--warnings.warn(line, VerifyWarning)'.format(item[0], item[1]))
                warnings_logger.removeHandler(console_handler)
                print(f[0].header)
                warnings_logger.addHandler(console_handler)
                f[0].header[item[0]] = item[1]
        f.verify()
        warnings_logger.warning('VerifyWarning: --below are fixes that the server can make--warnings.warn(line, VerifyWarning)')
        f.verify('fix')
        f.close()
    except OSError:
        pass
    warnings.resetwarnings()
    warnings_logger.removeHandler(console_handler)
    to_return = ''
    for line in open(key + '.log', 'r'):
        to_return += line
    os.remove(key + '.log')
    return to_return

def fix(file, header_list):
    """The print statement in this function is important. Astropy modified their print statement so it has an impact on saving the file."""
    key = str(uuid.uuid4())
    f = fits.open(file)
    f.verify('fix')
    for item in header_list:
        try:
            item = (item[0], ast.literal_eval(item[1]))
        except:
            pass
        if 'naxis' in item[0].lower():
            continue
        f[0].header[item[0]] = item[1]
    print(f[0].header)
    f.writeto(key + '.fits')
    f.close()
    return key + '.fits'

def mass_verify(file):
    f = fits.open(file)
    with warnings.catch_warnings(record=True) as w:
        f.verify()
        return len(w) > 0

