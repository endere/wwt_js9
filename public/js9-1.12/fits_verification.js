
$(document).ready(function(){
  $('#theForm').on('submit', function(event){
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
          res = res.split('+++++');
          filename = res[0];
          res = res[1];
          res = res.split('warnings.warn(line, VerifyWarning)');
          warningText = ''
          for (var i = 0; i < res.length; i++){
            warningText += res[i].split('VerifyWarning:')[1] + '\n'
          }
          warningText = warningText.substring(0, warningText.length - 10);
          if (warningText.substr(warningText.length - 46, warningText.length) == ' --below are fixes that the server can make--\n'){
            warningText = warningText.substring(0, warningText.length - 46) + '--There is nothing the server can do to further to automatically fix your image! Custom headers can still be implemented.--'
          }
          $('#warningHolder').append($('<textarea id="warnings"></textarea>').text(warningText).height(500).width(500))
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
    $('#headers').append($(`<div><input placeholder = "new header" class="newHeader"></input><input placeholder = "header value" class="headerValue"></input><button class="removeHeader" type="button">Cancel add/edit header</button></div>`).height(200).width(150));
    $($('#headers').children()[$('#headers').children().length - 1]).children('button').on('click', function(event){
      $(this).parent('div').remove();
    });
  });
$('#FolderForm').on('submit', function(event){
  event.preventDefault();
  if(fixing == false){
  $('#warnings').remove();
  valid = [];
  invalid = [];
  total = this.folder.files.length;
  for (var i = 0; i < this.folder.files.length; i++){
    var filename = this.folder.files[i].name;
    if (filename.substring(filename.length - 4, filename.length).toLowerCase() != 'fits'){
      total -= 1;
      continue;
    }
    var formData = new FormData();
    formData.append("file", this.folder.files[i], filename);
    formData.append("upload_file", true);
    formData.append('headers', '');
    $.ajax({
    url: 'http://wwt-js9-server.herokuapp.com/verify',
    type: 'POST',
    data: formData,
    async: true,
    contentType: false,
    processData: false,
    timeout: 60000,
    success: function(res){
      res = res.split('+++++');
      filename = res[0];
      res = res[1];
      res = res.split('warnings.warn(line, VerifyWarning)');
      warningText = ''
      for (var j = 0; j < res.length; j++){
        warningText += res[j].split('VerifyWarning:')[1] + '\n'
      }
      warningText = warningText.substring(0, warningText.length - 10);
      if (warningText.substr(warningText.length - 46, warningText.length) == ' --below are fixes that the server can make--\n'){
        valid.push(filename);
      } else {
        invalid.push(filename);
      }
      if (valid.length + invalid.length === total){
        folderWarnings = 'These are the files that are valid.\n'
        for (var k = 0; k < valid.length; k++){
          folderWarnings += valid[k] + '\n'
        }
        folderWarnings += 'These files are not valid. Please use the single upload tool for more information and fixing.\n'
        for (var k = 0; k < invalid.length; k++){
          folderWarnings += invalid[k] + '\n'
        }
        $('#warningHolder').append($('<textarea id="warnings"></textarea>').text(folderWarnings).height(500).width(500))
      }
    }
    });
  }
} else {
  var zip = new JSZip();
  for (var i = 0; i < this.folder.files.length; i++){
    if (this.folder.files[i].name.substring(this.folder.files[i].name.length - 4, this.folder.files[i].name.length).toLowerCase() != 'fits'){
      continue;
    }
    zip.file(this.folder.files[i].name, this.folder.files[i], {base64: true});
  }
  zip.generateAsync({type:"blob"})
  .then(function(content) {
    console.log(content);
    var formData = new FormData();
    formData.append("file", content, 'zipped');
    formData.append("upload_file", true);
    formData.append('headers', '');
    $.ajax({
      url: 'http://wwt-js9-server.herokuapp.com/verify/fix_folder',
      type: 'POST',
      data: formData,
      async: true,
      contentType: false,
      processData: false,
      timeout: 60000,
      xhrFields: {responseType: 'blob'},
      success: function(res){
        var a = document.createElement('a');
        var url = window.URL.createObjectURL(res);
        a.href = url;
        a.download = 'fixed_fits_images';
        a.click();
        window.URL.revokeObjectURL(url);
        
      }
    });


});
}
  });

});

