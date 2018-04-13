import tmp = require("tmp");
// Mine
import cc = require("./core-common");
import command = require("../src/command");
// import coreFor = require("../src/core-for");
import repo = require("../src/repo");
import util = require("../src/util");


describe("core for:", () => {
  const startDir = process.cwd();
  const tempFolder = tmp.dirSync({ unsafeCleanup: true });

  beforeAll(() => {
    process.chdir(tempFolder.name);
    cc.makeNestedGitForest();
  });

  afterAll(() => {
    process.chdir(startDir);
  });

  beforeEach(() => {
    process.chdir(tempFolder.name);
  });

  afterEach(() => {
    // process.chdir(startDir);
  });


  test("for-free", () => {
    const freeBranch = "freeBranch";
    command.fab(["for-free", "--", "git", "checkout", "--quiet", "-b", freeBranch]);
    expect(repo.getBranch(".")).toEqual(freeBranch);
    expect(repo.getBranch("free")).toBe(freeBranch);
    expect(repo.getBranch("pinned")).toBeUndefined();
    expect(repo.getBranch("locked")).toBe("master");
    command.fab(["switch", "master"]);
  });

  test("for-each", () => {
    const eachBranch = "eachBranch";
    command.fab(["for-each", "--", "git", "checkout", "--quiet", "-b", eachBranch]);
    expect(repo.getBranch(".")).toEqual(eachBranch);
    expect(repo.getBranch("free")).toEqual(eachBranch);
    expect(repo.getBranch("pinned")).toEqual(eachBranch);
    expect(repo.getBranch("locked")).toEqual(eachBranch);
  });

  test("forEach --keepgoing", () => {
    // Test alias and error handling. Using fab for a cross-platform command can make fail!
    // throw on errors
    expect(() => {
      command.fab(["forEach", "fab", "bogusCommand"]);
    }).toThrow();

    // keepgoing
    expect(() => {
      command.fab(["forEach",  "--keepgoing", "fab", "bogusCommand"]);
    }).not.toThrow();
  });

  test("for-free --keepgoing", () => {
    // Using fab for a cross-platform command can make fail!
    // throw on errors
    expect(() => {
      command.fab(["for-free", "fab", "bogusCommand"]);
    }).toThrow();

    // keepgoing
    expect(() => {
      command.fab(["for-free",  "--keepgoing", "fab", "bogusCommand"]);
    }).not.toThrow();
  });

});
