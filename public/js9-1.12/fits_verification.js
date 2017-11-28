
$(document).ready(function(){
  $('#theForm').on('submit', function(event){
    console.log('here');
    event.preventDefault();
    var formData = new FormData();
    var filename = this.file.files[0].name;
    formData.append("file", this.file.files[0], filename);
    formData.append("upload_file", true);
    headerValues = '';
    for (var i = 0; i < $('#headers').children().length; i++){
      headerValues += $($('#headers').children()[i]).children('.newHeader')[0].value + '=' + $($('#headers').children()[i]).children('.headerValue')[0].value + '&';
    }
    headerValues = headerValues.slice(0, -1);
    formData.append('headers', headerValues);
    $.ajax({
      url: fixing ? 'http://wwt-js9-server.herokuapp.com/verify/fix' : 'http://wwt-js9-server.herokuapp.com/verify',
      type: 'POST',
      data: formData,
      async: true,
      contentType: false,
      processData: false,
      timeout: 60000,
      xhrFields: fixing ? {
        responseType: 'blob'
      } : null,
      success: function(res){
        if(fixing == false){
          $('#warnings').remove();
          res = res.split('warnings.warn(line, VerifyWarning)');
          warningText = ''
          for (var i = 0; i < res.length; i++){
            warningText += res[i].split('VerifyWarning:')[1] + '\n'
          }
          warningText = warningText.substring(0, warningText.length - 10);
          $('body').append($('<textarea id="warnings"></textarea>').text(warningText).height(500).width(500))
        } else {
          var a = document.createElement('a');
          var url = window.URL.createObjectURL(res);
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    });    
  });
  $('#addOrEdit').on('click', function(event){
    $('#headers').append($(`<div><input placeholder = "new header" class="newHeader"></input><input placeholder = "header value" class="headerValue"></input><button class="removeHeader" type="button">Cancel add/edit header</button></div>`).height(80).width(150));
    $($('#headers').children()[$('#headers').children().length - 1]).children('button').on('click', function(event){
      $(this).parent('div').remove();
    });
  });
});

