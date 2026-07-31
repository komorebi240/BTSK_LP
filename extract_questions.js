const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('const AXIS_LABELS =');
const endMarker = 'configureHybridQuestions();';
const end = html.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Không tìm thấy ngân hàng câu hỏi trong index.html');

const source = html.slice(start, end + endMarker.length) + '\nthis.questionExport = { AXIS_LABELS, profileQuestion, childAgeQuestion, QUESTION_SETS };';
const sandbox = { console: { log() {} } };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
process.stdout.write(JSON.stringify(sandbox.questionExport));
