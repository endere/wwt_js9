function sendURL(input) {
  // console.log(input.files[0]);
  console.log(typeof input.files[0]);
  console.log('here')
  file = JSON.stringify(input.files[0]);
  console.log(file);
  // console.log(JS9.InstallDir(document.getElementById('image-file').value))
  // console.log(JS9.LookupImage(document.getElementById('image-file').value))
  // console.log($('#image-file').files);
  // var formdata = new FormData(input.files[0]);
  // formdata['photo'] = input.files[0];
  // // console.log($('#image-file').files[0]);
  // var file = input.files[0]
  // var formData = new FormData();
  // formData.append("fileToUpload", file)
  $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:5000/',
        crossDomain: true,
        processData: false,
        contentType: false,
        data: file
    }).done(success).fail(failed);
}


// function verificationRequest(attatchment) {
//     $.ajax({
//         type: 'POST',
//         url: 'http://wwt-js9-server.herokuapp.com/verify',
//         crossDomain: true,
//         processData: false,
//         contentType: false,
//         data: attatchment
//     }).done(success).fail(failed);
// }


// $(document).ready(function(){
//     $('#viewInwwt').click(function(event){
//         event.preventDefault();
//        })
//     // JS9.Load('http://wwt-js9-server.herokuapp.com/image.fits');
// });

function failed(response){
    console.log(response);
    console.log('failed');
}

function success(response) {
    console.log(response);
    console.log('success!');
}