document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
  
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        const selectedFiles = document.getElementById('selectedFiles');
        selectedFiles.innerHTML = '';
  
        for (let i = 0; i < this.files.length; i++) {
          const fileName = this.files[i].name;
          const listItem = document.createElement('li');
          listItem.textContent = fileName;
          selectedFiles.appendChild(listItem);
        }
      });
    }
  
    if (uploadBtn) {
      uploadBtn.onclick = uploadFiles;
    }
  
    if (downloadBtn) {
      downloadBtn.onclick = downloadFiles;
    }
  });
  
  function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
  
    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
  
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(message => alert(message))
      .catch(error => alert('Upload failed: ' + error));
    } else {
      alert('Please select files to upload.');
    }
  }
  
  function downloadFiles() {
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = fileInput.files;
  
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i].name);
      }
  
      fetch('/download?files=' + formData.getAll('files').join(','), {
        method: 'GET'
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'files.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => alert('Download failed: ' + error));
    } else {
      alert('Please select files to download.');
    }
  }
  