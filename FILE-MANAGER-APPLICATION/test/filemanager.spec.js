// test/main.spec.js

// Mocking the fetch function
function mockFetch(response) {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      text: () => Promise.resolve(response),
      blob: () => Promise.resolve(new Blob())
    }));
  }
  
  describe('Main.js tests', () => {
    let fileInput, uploadBtn, downloadBtn, selectedFiles;
  
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="file" id="fileInput" multiple>
        <ul id="selectedFiles"></ul>
        <button id="uploadBtn">Upload</button>
        <button id="downloadBtn">Download</button>
      `;
  
      fileInput = document.getElementById('fileInput');
      uploadBtn = document.getElementById('uploadBtn');
      downloadBtn = document.getElementById('downloadBtn');
      selectedFiles = document.getElementById('selectedFiles');
  
      // Re-initialize the event listeners
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
    });
  
    it('should display selected file names', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const fileList = {
        length: 1,
        0: file,
        item: function(index) { return this[index]; }
      };
  
      spyOnProperty(fileInput, 'files', 'get').and.returnValue(fileList);
  
      const event = new Event('change');
      fileInput.dispatchEvent(event);
  
      expect(selectedFiles.children.length).toBe(1);
      expect(selectedFiles.children[0].textContent).toBe('test.txt');
    });
  
    it('should alert when no files are selected for upload', () => {
      spyOn(window, 'alert');
  
      const event = new Event('click');
      uploadBtn.dispatchEvent(event);
  
      expect(window.alert).toHaveBeenCalledWith('Please select files to upload.');
    });
  
    it('should call fetch with the correct parameters for upload', (done) => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const fileList = {
        length: 1,
        0: file,
        item: function(index) { return this[index]; }
      };
  
      spyOnProperty(fileInput, 'files', 'get').and.returnValue(fileList);
      mockFetch('Upload successful');
  
      const event = new Event('click');
      uploadBtn.dispatchEvent(event);
  
      setTimeout(() => {
        expect(window.fetch).toHaveBeenCalledWith('/upload', jasmine.any(Object));
        done();
      }, 0);
    });
  
    it('should alert when no files are selected for download', () => {
      spyOn(window, 'alert');
  
      const event = new Event('click');
      downloadBtn.dispatchEvent(event);
  
      expect(window.alert).toHaveBeenCalledWith('Please select files to download.');
    });
  
    it('should call fetch with the correct parameters for download', (done) => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const fileList = {
        length: 1,
        0: file,
        item: function(index) { return this[index]; }
      };
  
      spyOnProperty(fileInput, 'files', 'get').and.returnValue(fileList);
      mockFetch('');
  
      const event = new Event('click');
      downloadBtn.dispatchEvent(event);
  
      setTimeout(() => {
        expect(window.fetch).toHaveBeenCalledWith('/download?files=test.txt', { method: 'GET' });
        done();
      }, 0);
    });
  
    it('should create a download link for the downloaded file', (done) => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const fileList = {
        length: 1,
        0: file,
        item: function(index) { return this[index]; }
      };
  
      spyOnProperty(fileInput, 'files', 'get').and.returnValue(fileList);
      mockFetch('');
  
      const event = new Event('click');
      downloadBtn.dispatchEvent(event);
  
      setTimeout(() => {
        const a = document.querySelector('a[download="files.zip"]');
        expect(a).not.toBeNull();
        expect(a.href).toContain('blob:');
        done();
      }, 0);
    });
  });
  