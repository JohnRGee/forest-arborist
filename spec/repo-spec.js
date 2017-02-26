'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const tmp = require('tmp');
// Mine
const repo = require('../lib/repo');
const util = require('../lib/util');
//
// const cc = require('./core-common');


describe('repo:', () => {
  const startDir = process.cwd();
  let tempFolder;

  beforeAll(() => {
    tempFolder = tmp.dirSync({ unsafeCleanup: true });
    process.chdir(tempFolder.name);

    fs.mkdirSync('notRepo');
    childProcess.execFileSync('git', ['init', 'gitRepo']);
    childProcess.execFileSync('hg', ['init', 'hgRepo']);
  });

  afterAll(() => {
    process.chdir(startDir);
  });

  beforeEach(() => {
    process.chdir(tempFolder.name);
  });

  afterEach(() => {
    process.chdir(startDir);
  });

  it('isGitRepository', () => {
    expect(repo.isGitRepository('notRepo')).toBe(false);
    expect(repo.isGitRepository('gitRepo')).toBe(true);
    expect(repo.isGitRepository('hgRepo')).toBe(false);
  });

  it('isHgRepository', () => {
    expect(repo.isHgRepository('notRepo')).toBe(false);
    expect(repo.isHgRepository('gitRepo')).toBe(false);
    expect(repo.isHgRepository('hgRepo')).toBe(true);
  });

  it('getRepoTypeForLocalPath', () => {
    expect(() => {
      util.muteCall(() => {
        repo.getRepoTypeForLocalPath('notRepo');
      });
    }).toThrowError(util.suppressTerminateExceptionMessage);
    expect(repo.getRepoTypeForLocalPath('gitRepo')).toEqual('git');
    expect(repo.getRepoTypeForLocalPath('hgRepo')).toEqual('hg');
  });

  // getOrigin

  // getBranch

  // getRevision
});