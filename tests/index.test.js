


const { expect } = require('chai');
const sinon = require('sinon');
const child_process = require('child_process');
const proxyquire = require('proxyquire');

// Import the script using proxyquire to mock child_process
const { checkAndInstall } = proxyquire('../installBluetooth', {
  'child_process': child_process
});

describe('checkAndInstall', () => {
  let execStub;

  beforeEach(() => {
    execStub = sinon.stub(child_process, 'exec');
  });

  afterEach(() => {
    execStub.restore();
  });

  it('should not install the package if already installed', async () => {
    execStub.onFirstCall().callsFake((cmd, callback) => callback(null, 'Status: install ok installed', ''));
    
    await checkAndInstall('bluez');

    expect(execStub.callCount).to.equal(1);
    expect(execStub.firstCall.args[0]).to.equal('dpkg -s bluez');
  });

  it('should install the package if not installed', async () => {
    execStub.onFirstCall().callsFake((cmd, callback) => callback(new Error('package not installed'), '', ''));
    execStub.onSecondCall().callsFake((cmd, callback) => callback(null, 'Installation complete', ''));

    await checkAndInstall('bluez');

    expect(execStub.callCount).to.equal(2);
    expect(execStub.firstCall.args[0]).to.equal('dpkg -s bluez');
    expect(execStub.secondCall.args[0]).to.equal('sudo apt-get update && sudo apt-get install -y bluez');
  });

  it('should handle installation errors', async () => {
    execStub.onFirstCall().callsFake((cmd, callback) => callback(new Error('package not installed'), '', ''));
    execStub.onSecondCall().callsFake((cmd, callback) => callback(new Error('installation failed'), '', 'Error installing'));

    try {
      await checkAndInstall('bluez');
    } catch (error) {
      expect(error.message).to.equal('installation failed');
    }

    expect(execStub.callCount).to.equal(2);
    expect(execStub.firstCall.args[0]).to.equal('dpkg -s bluez');
    expect(execStub.secondCall.args[0]).to.equal('sudo apt-get update && sudo apt-get install -y bluez');
  });
});

