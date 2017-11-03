# wwt_js9

This is an application that creates a JS9 user interface for a user to edit a FITS image. It then reads reads astronomical data from the FITS image header and places the edited image in an external view of the World Wide Telescope.

Back end:
server.py is a flask server that receives and deploys images given to it.
extract_metadata.py parses astronomical data into a the proper form for return to the front end.

Front end:
Inside the public folder is js9-1.12, JS9 has a large amount of dependencies within it, and the server needs to house those dependencies, and supply them to the front end.
Inside that folder are three files made for the application's front end.

WWT.html is the html home that houses the JS9, and has an embedded World Wide Telescop window.

wwt_control.js controls the embeded World Wide Telescope window (work in progress)

image_export.js gathers image data from the FITS and transforms the image itself into an image url. It sends this information to the back end, which interprets and hosts the image, and return a dictionary of processed RA, Dec, rotaton, scale, and a unique image code to the front end. Image_export.js then uses this dictionary to create a request to place the image onto the external view of World Wide Telescope.