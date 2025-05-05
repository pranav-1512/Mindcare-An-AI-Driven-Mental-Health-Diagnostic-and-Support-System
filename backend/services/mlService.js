const { PythonShell } = require('python-shell');
const path = require('path');

class MLService {
    static analyzeEntry(text) {
        return new Promise((resolve, reject) => {
            const options = {
                mode: 'json',
                pythonPath: 'python3',
                pythonOptions: ['-u'], // unbuffered output
                scriptPath: path.join(__dirname, '../../ml_model'),
                args: [text]
            };

            PythonShell.run('mood_analysis.py', options, (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
    }
}

module.exports = MLService;