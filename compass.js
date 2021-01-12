#!/usr/bin/env node

const child_process = require('child_process');
const os = require('os');

function toUnix(arg) {
  return arg.replace(/\\/g, '/');
}

function main(args) {
  const tmpdir = os.tmpdir();
  const tmpdir_unix = toUnix(tmpdir);
  const workdir = process.cwd();
  const docker_tmpdir = '/compass/tmp';
  const docker_workdir = '/compass/workdir';
  const compass_args = args.map((arg) => {
    arg = toUnix(arg);
    if (arg.startsWith(tmpdir_unix)) {
      return arg.replace(tmpdir_unix, docker_tmpdir);
    }
    return arg;
  });
  const run_opts = [
    '--rm',
    `--volume=${tmpdir}:${docker_tmpdir}`,
    `--volume=${workdir}:${docker_workdir}`,
  ];
  if (process.getuid) {
    run_opts.push(`--user=${process.getuid()}`);
  }
  const docker_args = [].concat(
    ['run'],
    run_opts,
    ['gabrys/compass'],
    ['compass'],
    compass_args
  );

  console.error('>> compass-docker IN: compass', args.join(' '));
  console.error('>> compass-docker OUT: docker', docker_args.join(' '))

  const cp = child_process.spawnSync('docker', docker_args, {stdio: 'inherit'});
  if (cp.error) {
    console.error('Failed to run compass via docker. Docker is not installed')
    return 127;
  }
  return cp.status;
}

process.exit(main(process.argv.slice(2)));

