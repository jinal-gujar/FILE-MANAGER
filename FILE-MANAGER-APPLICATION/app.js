const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const JSZip = require('jszip');

const app = express();
const port = process.env.PORT || 3000;
const folderPath = 'C:\\Users\\bguja\\OneDrive\\Desktop\\new'; // Replace with your folder path

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Init upload
const upload = multer({
  storage: storage
}).array('files', 10); // Allow uploading up to 10 files

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

async function listFilesRecursively(directory) {
  let files = [];
  const items = await fs.promises.readdir(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = await fs.promises.stat(itemPath);

    if (stats.isDirectory()) {
      const subFiles = await listFilesRecursively(itemPath);
      files = files.concat(subFiles);
    } else {
      files.push(itemPath);
    }
  }

  return files;
}

app.get('/', async (req, res, next) => {
  try {
    const files = await listFilesRecursively(folderPath);

    const fileCheckboxes = files.map((file) => {
      const fileName = path.relative(folderPath, file);
      return `
        <label class="file-checkbox">
          <input type="checkbox" name="selectedFiles" value="${fileName}">
          ${fileName}
        </label><br>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>File Manager</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
          }

          h1 {
            text-align: center;
            background-color: #007bff;
            color: #fff;
            padding: 20px;
          }

          .file-checkbox {
            display: block;
            margin-bottom: 10px;
          }

          button[type="submit"] {
            background-color: #007bff;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1>File Manager</h1>
        <form action="/download" method="post">
          ${fileCheckboxes}
          <br>
          <button type="submit">Download Selected Files</button>
        </form>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="files" multiple>
          <button type="submit">Upload Files</button>
        </form>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    next(err);
  }
});

app.post('/download', async (req, res, next) => {
  const selectedFiles = req.body.selectedFiles;
  try {
    if (!Array.isArray(selectedFiles) || selectedFiles.length === 0) {
      throw new Error('No files selected for download.');
    }

    const zipFileName = 'selected_files.zip';
    const zipFilePath = path.join(__dirname, 'public', zipFileName);
    const zip = new JSZip();

    // Add selected files to the ZIP archive with correct relative paths
    for (const file of selectedFiles) {
      const filePath = path.join(folderPath, file);
      const relativePath = path.relative(folderPath, filePath);
      const fileData = await fs.promises.readFile(filePath);
      zip.file(relativePath, fileData);
    }

    const zipData = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(zipFilePath, zipData);

    res.download(zipFilePath, zipFileName, (err) => {
      if (err) {
        next(err);
      } else {
        fs.unlink(zipFilePath, (err) => {
          if (err) {
            next(err);
          }
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading files.');
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
