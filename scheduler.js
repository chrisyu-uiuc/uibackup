// scheduler.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const WORKDIR = '/Users/mac/uibackup'; // change if needed
const NODE = process.execPath; // uses the Node interpreter that started this process
const LOG_DIR = path.join(WORKDIR, 'logs');

fs.mkdirSync(LOG_DIR, { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function appendMasterLog(line) {
  fs.appendFileSync(path.join(LOG_DIR, 'scheduler-master.log'), `${timestamp()} ${line}\n`);
}

function workPath(script) {
  return path.isAbsolute(script) ? script : path.join(WORKDIR, script);
}

function run(script, name, cb) {
  const runId = Date.now();
  const outPath = path.join(LOG_DIR, `${name}-${runId}.out.log`);
  const errPath = path.join(LOG_DIR, `${name}-${runId}.err.log`);

  appendMasterLog(`START ${name} id=${runId} cmd="${NODE} ${workPath(script)}"`);

  const proc = exec(`${NODE} ${workPath(script)}`, { cwd: WORKDIR, env: process.env, windowsHide: true });

  const outStream = fs.createWriteStream(outPath);
  const errStream = fs.createWriteStream(errPath);

  proc.stdout.on('data', d => { process.stdout.write(d); outStream.write(d); });
  proc.stderr.on('data', d => { process.stderr.write(d); errStream.write(d); });

  proc.on('close', code => {
    outStream.end();
    errStream.end();
    appendMasterLog(`END ${name} id=${runId} code=${code} out=${path.basename(outPath)} err=${path.basename(errPath)}`);
    if (cb) cb(null, code);
  });

  proc.on('error', err => {
    outStream.end();
    errStream.end();
    appendMasterLog(`ERROR ${name} id=${runId} ${String(err)}`);
    if (cb) cb(err);
  });
}

// every 5 minutes at second 0
schedule.scheduleJob('0 0 * * * *', () => {
  appendMasterLog('TRIGGER fired for every-5-minutes job');
  run('generate-reports.js', 'generate-reports', (err, code) => {
    if (err || code !== 0) {
      appendMasterLog(`generate-reports failed (err=${err} code=${code}), skipping email-sender`);
      return;
    }
    appendMasterLog('generate-reports succeeded, starting email-sender');
    run('email-sender.js', 'email-sender', (err2, code2) => {
      if (err2 || code2 !== 0) {
        appendMasterLog(`email-sender failed (err=${err2} code=${code2})`);
        return;
      }
      appendMasterLog('email-sender finished successfully');
    });
  });
});

appendMasterLog('Scheduler started. Next run: ' + Object.values(schedule.scheduledJobs).map(j => j.nextInvocation && j.nextInvocation().toString()));
console.log('Scheduler running. Logs at:', LOG_DIR);
process.stdin.resume();

