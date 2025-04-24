// Map languages to Judge0 IDs and CodeMirror modes
const languageMap = {
    python: { id: 71, mode: 'python' },
    java: { id: 62, mode: 'java' },
    c: { id: 50, mode: 'clike' },
    cpp: { id: 54, mode: 'clike' },
    r: { id: 80, mode: 'r' },
  };
  
  // Sample codes for each language
  const sampleCodes = {
    python: 'print("Hello, World!")',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    c: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    r: 'print("Hello, World!")',
  };
  
  // Initialize CodeMirror editor
  const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    lineNumbers: true,
    mode: 'python',
    theme: 'dracula', // Dark theme for uniqueness
  });
  
  // Update editor when language changes
  document.getElementById('language').addEventListener('change', function() {
    const lang = this.value;
    editor.setOption('mode', languageMap[lang].mode);
    editor.setValue(sampleCodes[lang]);
  });
  
  // Run button click handler
  document.getElementById('run').addEventListener('click', function() {
    this.disabled = true;
    document.getElementById('spinner').classList.remove('hidden');
    const lang = document.getElementById('language').value;
    const code = editor.getValue();
    const stdin = document.getElementById('stdin').value;
  
    fetch('https://api.judge0.com/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('0142d4a357msh15c6b0fbd87752ep186e33jsn3ea3cd2b7d56:'), // Replace with your API key
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageMap[lang].id,
        stdin: stdin,
      }),
    })
    .then(response => response.json())
    .then(data => {
      const token = data.token;
      pollSubmission(token);
    })
    .catch(error => {
      document.getElementById('output').textContent = 'Error: ' + error;
      document.getElementById('run').disabled = false;
      document.getElementById('spinner').classList.add('hidden');
    });
  });
  
  // Poll Judge0 for submission results
  function pollSubmission(token) {
    const interval = setInterval(() => {
      fetch(`https://api.judge0.com/submissions/${token}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('0142d4a357msh15c6b0fbd87752ep186e33jsn3ea3cd2b7d56:'), // Replace with your API key
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.status.id >= 3) { // Status 3+ means processing is done
          clearInterval(interval);
          document.getElementById('output').textContent = data.stdout || data.stderr || data.compile_output || 'No output';
          document.getElementById('run').disabled = false;
          document.getElementById('spinner').classList.add('hidden');
        }
      })
      .catch(error => {
        clearInterval(interval);
        document.getElementById('output').textContent = 'Error: ' + error;
        document.getElementById('run').disabled = false;
        document.getElementById('spinner').classList.add('hidden');
      });
    }, 2000); // Check every 2 seconds
  }
  
  // Clear output button
  document.getElementById('clear').addEventListener('click', function() {
    document.getElementById('output').textContent = '';
  });
  
  // Run code with Ctrl+Enter
  editor.setOption('extraKeys', {
    'Ctrl-Enter': function() {
      document.getElementById('run').click();
    }
  });