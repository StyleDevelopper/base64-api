const express = require('express');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Enable CORS if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve a simple HTML form for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Base64 Encoder API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .container { margin-top: 20px; }
        form { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        input[type=file] { margin: 10px 0; }
        button { background: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        #result { margin-top: 20px; padding: 15px; background: #e9f7ef; border-radius: 5px; word-break: break-all; }
        textarea { width: 100%; min-height: 100px; margin-top: 10px; padding: 8px; font-family: monospace; }
        .copy-btn { background: #2196F3; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px; }
        .copy-btn:hover { background: #0b7dda; }
        .success { color: green; margin-left: 10px; display: none; }
      </style>
    </head>
    <body>
      <h1>Base64 Encoder API</h1>
      <div class="container">
        <form id="uploadForm" enctype="multipart/form-data">
          <h3>Select a file to encode:</h3>
          <input type="file" name="file" id="fileInput">
          <button type="submit">Encode to Base64</button>
        </form>
        <div id="result"></div>
      </div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData();
          const fileInput = document.getElementById('fileInput');
          
          if (fileInput.files.length === 0) {
            alert('Please select a file');
            return;
          }
          
          formData.append('file', fileInput.files[0]);
          
          try {
            const response = await fetch('/encode', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = 
              '<h3>Encoding Result:</h3>' +
              '<p><strong>Original Filename:</strong> ' + result.originalName + '</p>' +
              '<p><strong>File Type:</strong> ' + result.mimeType + '</p>' +
              '<p><strong>File Size:</strong> ' + result.fileSize + ' bytes</p>' +
              '<p><strong>Base64 Length:</strong> ' + result.base64.length + ' characters</p>' +
              '<p><strong>Base64 Preview:</strong> ' + result.base64.substring(0, 100) + '...</p>' +
              '<div>' +
              '<p><strong>Full Base64 String:</strong></p>' +
              '<textarea id="base64Output" readonly>' + result.base64 + '</textarea>' +
              '<div><button class="copy-btn" onclick="copyToClipboard()">Copy to Clipboard</button>' +
              '<span class="success" id="copySuccess">Copied!</span></div>' +
              '</div>' +
              '<div style="margin-top: 20px;">' +
              '<p><strong>Data URL Format:</strong></p>' +
              '<textarea id="dataUrlOutput" readonly>data:' + result.mimeType + ';base64,' + result.base64 + '</textarea>' +
              '<div><button class="copy-btn" onclick="copyDataUrlToClipboard()">Copy Data URL</button>' +
              '<span class="success" id="copyDataUrlSuccess">Copied!</span></div>' +
              '</div>';
          } catch (error) {
            console.error('Error:', error);
            alert('Error encoding file');
          }
        });
        
        function copyToClipboard() {
          const textarea = document.getElementById('base64Output');
          textarea.select();
          document.execCommand('copy');
          
          const successMsg = document.getElementById('copySuccess');
          successMsg.style.display = 'inline';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 2000);
        }
        
        function copyDataUrlToClipboard() {
          const textarea = document.getElementById('dataUrlOutput');
          textarea.select();
          document.execCommand('copy');
          
          const successMsg = document.getElementById('copyDataUrlSuccess');
          successMsg.style.display = 'inline';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 2000);
        }
      </script>
    </body>
    </html>
  `);
});

// POST endpoint for file encoding
app.post('/encode', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Convert buffer to base64
  const base64String = req.file.buffer.toString('base64');
  
  // Return the encoded data and file information
  res.json({
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    base64: base64String
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});