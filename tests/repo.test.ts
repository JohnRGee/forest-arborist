import * as childProcess from "child_process";
import * as fs from "fs";
import * as tmp from "tmp";
// Mine
import * as cc from "./core-common";
import * as repo from "../src/repo";
import * as util from "../src/util";


describe("repo:", () => {
  const startDir = process.cwd();
  let tempFolder: tmp.SynchrounousResult;
  const testOrigin = "git@ex.com:path/to/main.git";

  beforeAll(() => {
    tempFolder = tmp.dirSync({ unsafeCleanup: true, keep: true });
    process.chdir(tempFolder.name);

    fs.mkdirSync("notRepo");
    childProcess.execFileSync("git", ["init", "gitRepo"]);
    childProcess.execFileSync("hg", ["init", "hgRepo"]);
    cc.makeOneGitRepo("hasOrigin", testOrigin);
    cc.makeOneGitRepo("detached", testOrigin);
    cc.commitAndDetach("detached");
  });

  afterAll(() => {
    process.chdir(startDir);
    tempFolder.removeCallback();
  });

  beforeEach(() => {
    process.chdir(tempFolder.name);
  });

  afterEach(() => {
    // process.chdir(startDir);
  });

  test("isGitRepository", () => {
    expect(repo.isGitRepository("notRepo")).toBe(false);
    expect(repo.isGitRepository("gitRepo")).toBe(true);
    expect(repo.isGitRepository("detached")).toBe(true);
    expect(repo.isGitRepository("hgRepo")).toBe(false);
    expect(repo.isGitRepository("doesNotExist")).toBe(false);
  });

  test("isHgRepository", () => {
    expect(repo.isHgRepository("notRepo")).toBe(false);
    expect(repo.isHgRepository("gitRepo")).toBe(false);
    expect(repo.isHgRepository("hgRepo")).toBe(true);
    expect(repo.isGitRepository("doesNotExist")).toBe(false);
  });

  test("getRepoTypeForLocalPath", () => {
    expect(() => {
      repo.getRepoTypeForLocalPath("notRepo");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    expect(repo.getRepoTypeForLocalPath("gitRepo")).toEqual("git");
    expect(repo.getRepoTypeForLocalPath("detached")).toEqual("git");
    expect(repo.getRepoTypeForLocalPath("hgRepo")).toEqual("hg");
    expect(() => {
      repo.getRepoTypeForLocalPath("doesNotExist");
    }).toThrowError(util.suppressTerminateExceptionMessage);
  });

  test("getOrigin", () => {
    expect(() => {
      repo.getOrigin("notRepo");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    // We have local only repos, so no origin.
    expect(repo.getOrigin("gitRepo")).toBeUndefined();
    expect(repo.getOrigin("gitRepo", "git")).toBeUndefined();
    expect(repo.getOrigin("hgRepo")).toBeUndefined();
    expect(repo.getOrigin("hgRepo", "hg")).toBeUndefined();
    expect(repo.getOrigin("hasOrigin")).toBe(testOrigin);
    expect(repo.getOrigin("detached")).toBe(testOrigin);
    expect(() => {
      repo.getOrigin("doesNotExist");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    // Add some real origins?
  });

  test("getBranch", () => {
    expect(() => {
      repo.getBranch("notRepo");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    // We have local only repos, so no origin.
    expect(repo.getBranch("gitRepo")).toBe("master");
    expect(repo.getBranch("gitRepo", "git")).toBe("master");
    expect(repo.getBranch("detached")).toBeUndefined();
    expect(repo.getBranch("hgRepo")).toBe("default");
    expect(repo.getBranch("hgRepo", "hg")).toBe("default");
    expect(() => {
      repo.getBranch("doesNotExist");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    // Add some real origins?
  });

  test("getRevision", () => {
    // Basic checks, thow on no repo
    expect(() => {
      repo.getRevision("notRepo");
    }).toThrowError(util.suppressTerminateExceptionMessage);
    expect(() => {
      repo.getRevision("doesNotExist");
    }).toThrowError(util.suppressTerminateExceptionMessage);

    // Empty repo is messy for git
    expect(() => {
      repo.getRevision("gitRepo");
    }).toThrowError();
    expect(repo.getRevision("hgRepo")).toBe("0000000000000000000000000000000000000000");
    expect(repo.getRevision("hgRepo", "hg")).toBe("0000000000000000000000000000000000000000");
  });
});
