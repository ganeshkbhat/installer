

const { exec } = require('child_process');
const readline = require('readline');


// Function to check if a command exists
function commandExists(command, callback) {
  exec(`command -v ${command}`, (error, stdout) => {
    callback(stdout.trim().length > 0);
  });
}

// Function to install a package using apt-get
function installPackage(packageName, callback) {
  exec(`sudo apt-get update && sudo apt-get install -y ${packageName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing ${packageName}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    callback(stdout.trim());
  });
}

// Check if bluez is installed
commandExists('bluetoothctl', (exists) => {
  if (exists) {
    console.log('bluez and bluetoothctl are already installed.');
  } else {
    console.log('bluez and bluetoothctl are not installed. Installing...');
    installPackage('bluez', (result) => {
      console.log('Installation result:', result);
    });
  }
});

// install package

function checkAndInstall(packageName) {
  return new Promise((resolve, reject) => {
    // Check if the package is already installed
    exec(`dpkg -s ${packageName}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`${packageName} is not installed. Installing...`);

        // Update the package list and install the package
        exec(`sudo apt-get update && sudo apt-get install -y ${packageName}`, (installError, installStdout, installStderr) => {
          if (installError) {
            console.error(`Failed to install ${packageName}: ${installStderr}`);
            reject(installError);
          } else {
            console.log(`${packageName} installed successfully.`);
            resolve();
          }
        });
      } else {
        console.log(`${packageName} is already installed.`);
        resolve();
      }
    });
  });
}


// async function main() {
//   try {
//     await checkAndInstall('bluez');
//     await checkAndInstall('bluetoothctl');
//     console.log('All packages are installed.');
//   } catch (error) {
//     console.error('An error occurred during installation:', error);
//   }
// }
// main();

