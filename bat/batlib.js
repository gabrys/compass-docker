#!/usr/bin/env node

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');


function check_compass_bat() {
  const cp = child_process.spawnSync('compass.bat', ['--help']);
  return !cp.error;
}


function find_bin(file_name) {
  let current_path = process.argv[1];
  let parent_path;
  while (true) {
    let cmd_path = path.join(current_path, file_name);
    if (fs.existsSync(cmd_path)) {
      return cmd_path;
    }
    parent_path = path.dirname(current_path);
    if (parent_path === current_path) {
      return null;
    }
    current_path = parent_path;
  }
}


function is_windows() {
  return process.platform === 'win32';
}


function uninstall_bat() {
  if (!is_windows()) {
    console.log("No need to uninstall compass.bat: we're not on Windows");
    return;
  }

  const bat_works = check_compass_bat();
  const bat_path = find_bin('compass.bat');

  if (!bat_works && !bat_path) {
    console.log("No need to uninstall compass.bat: already uninstalled");
    return;
  }

  if (!bat_path) {
    console.log("compass.bat is installed, but it doesn't look like our file. Leaving it alone");
    return;
  }

  fs.unlinkSync(bat_path);
  verify_uninstall();
}


function verify_uninstall() {
  const bat_works = check_compass_bat();
  const bat_path = find_bin('compass.bat');

  if (!bat_path && !bat_works) {
    console.log("Success: compass.bat uninstalled");
    return;
  }

  if (bat_path) {
    console.log("Failed removing compass.bat");
    return;
  }

  if (bat_works) {
    console.log("compass.bat still in PATH after uninstalling it (might be the Ruby one?)");
    return;
  }
}


function install_bat() {
  if (!is_windows()) {
    console.log("No need to install compass.bat: we're not on Windows");
    return;
  }

  if (check_compass_bat()) {
    console.log('No need to install compass.bat: already installed');
    return;
  }

  const cmd_path = find_bin('compass.cmd');
  if (!cmd_path) {
    console.log('Failed installing compass.bat: Could not find compass.cmd');
    return;
  }

  const bat_path = cmd_path.replace(/\.cmd$/i, '.bat');
  console.log(`Renaming ${cmd_path} to ${bat_path}`);
  fs.renameSync(cmd_path, bat_path);

  if (!check_compass_bat()) {
    console.log("Error: we just installed compass.bat, but calling it doesn't seem to work. Maybe a PATH issue?");
    return;
  }

  console.log('Success: compass.bat installed properly');
  return;
}

module.exports = {
  install_bat,
  uninstall_bat
};
