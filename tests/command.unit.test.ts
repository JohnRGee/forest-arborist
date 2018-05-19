// Test parsing the CLI interface generates the expected internal calls:
// - CLI is backwards compatible
// - can use typed internal interface for other tests, CLI covered
//
// pattern:
// - simplest call
// - individual option and argument variations
// - most complex call
// - other tests

import * as command from "../src/command";
// Mine
import * as coreBranch from "../src/core-branch";
import * as coreClone from "../src/core-clone";
import * as coreForEach from "../src/core-for";
import * as coreInit from "../src/core-init";
import * as coreManifest from "../src/core-manifest";
import * as coreSnapshot from "../src/core-snapshot";


describe("clone cli", () => {
  let cloneSpy: jest.SpyInstance;

  beforeAll(() => {
    cloneSpy = jest.spyOn(coreClone, "doClone");
    cloneSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    cloneSpy.mockRestore();
  });

  afterEach(() => {
    cloneSpy.mockReset();
  });

  // simplest
  test("clone source", () => {
    command.fab(["clone", "source"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", undefined, expect.objectContaining({ }));
    const options: coreClone.CloneOptions = cloneSpy.mock.calls[0][2];
    expect(options.branch).toBeUndefined();
    expect(options.manifest).toBeUndefined();
  });

  test("clone source destination", () => {
    command.fab(["clone", "source", "destination"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", "destination", expect.objectContaining({ }));
  });

  test("clone -b name source", () => {
    command.fab(["clone", "-b", "name", "source"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", undefined, expect.objectContaining({ branch: "name" }));
  });

  test("clone --branch name source", () => {
    command.fab(["clone", "--branch", "name", "source"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", undefined, expect.objectContaining({ branch: "name" }));
  });

  test("clone -m name source", () => {
    command.fab(["clone", "-m", "name", "source"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", undefined, expect.objectContaining({ manifest: "name" }));
  });

  test("clone --manifest name source", () => {
    command.fab(["clone", "--manifest", "name", "source"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", undefined, expect.objectContaining({ manifest: "name" }));
  });

  // most complex
  test("clone --branch branchName --manifest manifestName source destination", () => {
    command.fab(["clone", "--branch", "branchName", "--manifest", "manifestName", "source", "destination"]);
    expect(cloneSpy).toHaveBeenCalledWith("source", "destination", expect.objectContaining({ branch: "branchName", manifest: "manifestName" }));
  });

});


describe("init cli", () => {
  let initSpy: jest.SpyInstance;

  beforeAll(() => {
    initSpy = jest.spyOn(coreInit, "doInit");
    initSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    initSpy.mockRestore();
  });

  afterEach(() => {
    initSpy.mockReset();
  });

  // simplest
  test("init", () => {
    command.fab(["init"]);
    expect(initSpy).toHaveBeenCalledWith(expect.objectContaining({ }));
    const options: coreInit.InitOptions = initSpy.mock.calls[0][0];
    expect(options.manifest).toBeUndefined();
    expect(options.root).toBeUndefined();
  });

  test("init --root ..", () => {
    command.fab(["init", "--root", ".."]);
    expect(initSpy).toHaveBeenCalledWith(expect.objectContaining({ root: ".." }));
  });

  test("init -m name", () => {
    command.fab(["init", "-m", "name"]);
    expect(initSpy).toHaveBeenCalledWith(expect.objectContaining({ manifest: "name" }));
  });

  test("init --manifest name", () => {
    command.fab(["init", "--manifest", "name"]);
    expect(initSpy).toHaveBeenCalledWith(expect.objectContaining({ manifest: "name" }));
  });

  // most complex
  test("init --manifest name --root ..", () => {
    command.fab(["init", "--manifest", "name", "--root", ".."]);
    expect(initSpy).toHaveBeenCalledWith(expect.objectContaining({ manifest: "name", root: ".." }));
  });

  test("init unexpected-param", () => {
    expect(() => {
      command.fab(["init", "unexpected-param"]);
    }).toThrow();
  });

});


describe("install cli", () => {
  let installSpy: jest.SpyInstance;

  beforeAll(() => {
    installSpy = jest.spyOn(coreClone, "doInstall");
    installSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    installSpy.mockRestore();
  });

  afterEach(() => {
    installSpy.mockReset();
  });

  // simplest
  test("install", () => {
    command.fab(["install"]);
    expect(installSpy).toHaveBeenCalledWith(expect.objectContaining({ }));
    const options: coreClone.InstallOptions = installSpy.mock.calls[0][0];
    expect(options.manifest).toBeUndefined();
  });

  test("install -m name", () => {
    command.fab(["install", "-m", "name"]);
    expect(installSpy).toHaveBeenCalledWith(expect.objectContaining({ manifest: "name" }));
  });

  test("install --manifest name", () => {
    command.fab(["install", "--manifest", "name"]);
    expect(installSpy).toHaveBeenCalledWith(expect.objectContaining({ manifest: "name" }));
  });

  test("install unexpected-param", () => {
    expect(() => {
      command.fab(["install", "unexpected-param"]);
    }).toThrow();
  });

});


describe("for-each cli", () => {
  let forEachSpy: jest.SpyInstance;

  beforeAll(() => {
    forEachSpy = jest.spyOn(coreForEach, "doForEach");
    forEachSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    forEachSpy.mockRestore();
  });

  afterEach(() => {
    forEachSpy.mockReset();
  });

  // simplest
  test("for-each command", () => {
    command.fab(["for-each", "command"]);
    expect(forEachSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ }));
    const options: coreForEach.ForOptions = forEachSpy.mock.calls[0][2];
    expect(options.keepgoing).toBeUndefined();
  });

  test("for-each -k command", () => {
    command.fab(["for-each", "-k", "command"]);
    expect(forEachSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ keepgoing: true }));
  });

  test("for-each --keepgoing command", () => {
    command.fab(["for-each", "--keepgoing", "command"]);
    expect(forEachSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ keepgoing: true }));
  });

  // alias
  test("forEach --keepgoing command", () => {
    command.fab(["forEach", "--keepgoing", "command"]);
    expect(forEachSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ keepgoing: true }));
  });

  // dash-dash, because we document that calling pattern
  test("for-each --keepgoing -- command --option argument", () => {
    command.fab(["for-each", "--keepgoing", "--", "command", "--option", "argument"]);
    expect(forEachSpy).toHaveBeenCalledWith("command", ["--option", "argument"], expect.objectContaining({ keepgoing: true }));
  });

});


describe("for-free cli", () => {
  let forFreeSpy: jest.SpyInstance;

  beforeAll(() => {
    forFreeSpy = jest.spyOn(coreForEach, "doForFree");
    forFreeSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    forFreeSpy.mockRestore();
  });

  afterEach(() => {
    forFreeSpy.mockReset();
  });

  // simplest
  test("for-free command", () => {
    command.fab(["for-free", "command"]);
    expect(forFreeSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ }));
    const options: coreForEach.ForOptions = forFreeSpy.mock.calls[0][2];
    expect(options.keepgoing).toBeUndefined();
  });

  test("for-free -k command", () => {
    command.fab(["for-free", "-k", "command"]);
    expect(forFreeSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ keepgoing: true }));
  });

  test("for-free --keepgoing command", () => {
    command.fab(["for-free", "--keepgoing", "command"]);
    expect(forFreeSpy).toHaveBeenCalledWith("command", [], expect.objectContaining({ keepgoing: true }));
  });

  // dash-dash, because we document that calling pattern
  test("for-free --keepgoing -- command --option argument", () => {
    command.fab(["for-free", "--keepgoing", "--", "command", "--option", "argument"]);
    expect(forFreeSpy).toHaveBeenCalledWith("command", ["--option", "argument"], expect.objectContaining({ keepgoing: true }));
  });

});


describe("git (for)", () => {
  let forGitSpy: jest.SpyInstance;

  beforeAll(() => {
    forGitSpy = jest.spyOn(coreForEach, "doForGit");
    forGitSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    forGitSpy.mockRestore();
  });

  afterEach(() => {
    forGitSpy.mockReset();
  });

  // simplest
  test("git command", () => {
    command.fab(["git", "command"]);
    expect(forGitSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ }));
    const options: coreForEach.ForOptions = forGitSpy.mock.calls[0][1];
    expect(options.keepgoing).toBeUndefined();
  });

  test("git -k command", () => {
    command.fab(["git", "-k", "command"]);
    expect(forGitSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ keepgoing: true }));
  });

  test("git --keepgoing command", () => {
    command.fab(["git", "--keepgoing", "command"]);
    expect(forGitSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ keepgoing: true }));
  });

  // dash-dash, because we document that calling pattern
  test("git --keepgoing --- command --option argument", () => {
    command.fab(["git", "--keepgoing", "--", "command", "--option", "argument"]);
    expect(forGitSpy).toHaveBeenCalledWith(["command", "--option", "argument"], expect.objectContaining({ keepgoing: true }));
  });

});


describe("hg (for)", () => {
  let forHgSpy: jest.SpyInstance;

  beforeAll(() => {
    forHgSpy = jest.spyOn(coreForEach, "doForHg");
    forHgSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    forHgSpy.mockRestore();
  });

  afterEach(() => {
    forHgSpy.mockReset();
  });

  // simplest
  test("hg command", () => {
    command.fab(["hg", "command"]);
    expect(forHgSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ }));
    const options: coreForEach.ForOptions = forHgSpy.mock.calls[0][1];
    expect(options.keepgoing).toBeUndefined();
  });

  test("hg -k command", () => {
    command.fab(["hg", "-k", "command"]);
    expect(forHgSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ keepgoing: true }));
  });

  test("hg --keepgoing command", () => {
    command.fab(["hg", "--keepgoing", "command"]);
    expect(forHgSpy).toHaveBeenCalledWith(["command"], expect.objectContaining({ keepgoing: true }));
  });

  // dash-dash, because we document that calling pattern
  test("hg --keepgoing --- command --option argument", () => {
    command.fab(["hg", "--keepgoing", "--", "command", "--option", "argument"]);
    expect(forHgSpy).toHaveBeenCalledWith(["command", "--option", "argument"], expect.objectContaining({ keepgoing: true }));
  });

});


describe("switch cli", () => {
  let switchSpy: jest.SpyInstance;

  beforeAll(() => {
    switchSpy = jest.spyOn(coreBranch, "doSwitch");
    switchSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    switchSpy.mockRestore();
  });

  afterEach(() => {
    switchSpy.mockReset();
  });

  // simplest
  test("switch branch", () => {
    command.fab(["switch", "branch"]);
    expect(switchSpy).toHaveBeenCalledWith("branch");
  });

});


describe("make-branch cli", () => {
  let makeBranchSpy: jest.SpyInstance;

  beforeAll(() => {
    makeBranchSpy = jest.spyOn(coreBranch, "doMakeBranch");
    makeBranchSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    makeBranchSpy.mockRestore();
  });

  afterEach(() => {
    makeBranchSpy.mockReset();
  });

  // simplest
  test("make-branch branch", () => {
    command.fab(["make-branch", "branch"]);
    expect(makeBranchSpy).toHaveBeenCalledWith("branch", undefined, expect.objectContaining({ }));
    const options: coreBranch.MakeBranchOptions = makeBranchSpy.mock.calls[0][2];
    expect(options.publish).toBeUndefined();
  });

  test("make-branch branch start-point", () => {
    command.fab(["make-branch", "branch", "start-point"]);
    expect(makeBranchSpy).toHaveBeenCalledWith("branch", "start-point", expect.objectContaining({ }));
  });

  test("make-branch -p branch", () => {
    command.fab(["make-branch", "-p", "branch"]);
    expect(makeBranchSpy).toHaveBeenCalledWith("branch", undefined, expect.objectContaining({ publish: true }));
  });

  test("make-branch --publish branch", () => {
    command.fab(["make-branch", "--publish", "branch"]);
    expect(makeBranchSpy).toHaveBeenCalledWith("branch", undefined, expect.objectContaining({ publish: true }));
  });

  // most complex
  test("make-branch --publish branch start-point", () => {
    command.fab(["make-branch", "--publish", "branch", "start-point"]);
    expect(makeBranchSpy).toHaveBeenCalledWith("branch", "start-point", expect.objectContaining({ publish: true }));
  });

});


describe("snapshot cli", () => {
  let snapshotSpy: jest.SpyInstance;

  beforeAll(() => {
    snapshotSpy = jest.spyOn(coreSnapshot, "doSnapshot");
    snapshotSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    snapshotSpy.mockRestore();
  });

  afterEach(() => {
    snapshotSpy.mockReset();
  });

  // simplest
  test("snapshot", () => {
    command.fab(["snapshot"]);
    expect(snapshotSpy).toHaveBeenCalledWith(expect.objectContaining({ }));
    const options: coreSnapshot.SnapshotOptions = snapshotSpy.mock.calls[0][0];
    expect(options.output).toBeUndefined();
  });

  test("snapshot -o file", () => {
    command.fab(["snapshot", "-o", "file"]);
    expect(snapshotSpy).toHaveBeenCalledWith(expect.objectContaining({ output: "file" }));
  });

  test("snapshot --output file", () => {
    command.fab(["snapshot", "--output", "file"]);
    expect(snapshotSpy).toHaveBeenCalledWith(expect.objectContaining({ output: "file" }));
  });

  test("snapshot unexpected-param", () => {
    expect(() => {
      command.fab(["snapshot", "unexpected-param"]);
    }).toThrow();
  });

});


describe("recreate cli", () => {
  let recreateSpy: jest.SpyInstance;

  beforeAll(() => {
    recreateSpy = jest.spyOn(coreSnapshot, "doRecreate");
    recreateSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    recreateSpy.mockRestore();
  });

  afterEach(() => {
    recreateSpy.mockReset();
  });

  // simplest
  test("recreate snapshot", () => {
    command.fab(["recreate", "snapshot"]);
    expect(recreateSpy).toHaveBeenCalledWith("snapshot", undefined);
  });

  test("recreate snapshot destination", () => {
    command.fab(["recreate", "snapshot", "destinaton"]);
    expect(recreateSpy).toHaveBeenCalledWith("snapshot", "destinaton");
  });

});


describe("restore cli", () => {
  let restoreSpy: jest.SpyInstance;

  beforeAll(() => {
    restoreSpy = jest.spyOn(coreSnapshot, "doRestore");
    restoreSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    restoreSpy.mockRestore();
  });

  afterEach(() => {
    restoreSpy.mockReset();
  });

  // simplest
  test("restore", () => {
    command.fab(["restore"]);
    expect(restoreSpy).toHaveBeenCalledWith(undefined);
  });

  test("restore snapshot", () => {
    command.fab(["restore", "snapshot"]);
    expect(restoreSpy).toHaveBeenCalledWith("snapshot");
  });

});


describe("manifest cli", () => {
  let manifestSpy: jest.SpyInstance;

  beforeAll(() => {
    manifestSpy = jest.spyOn(coreManifest, "doManifest");
    manifestSpy.mockReturnValue(undefined);
  });

  afterAll(() => {
    manifestSpy.mockRestore();
  });

  afterEach(() => {
    manifestSpy.mockReset();
  });

  // simplest
  test("manifest", () => {
    command.fab(["manifest"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ }));
    const options: coreManifest.ManifestOptions = manifestSpy.mock.calls[0][0];
    expect(options.edit).toBeUndefined();
    expect(options.list).toBeUndefined();
    expect(options.add).toBeUndefined();
    expect(options.delete).toBeUndefined();
  });

  test("manifest -e", () => {
    command.fab(["manifest", "-e"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ edit: true }));
  });

  test("manifest --edit", () => {
    command.fab(["manifest", "--edit"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ edit: true }));
  });

  test("manifest -l", () => {
    command.fab(["manifest", "-l"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ list: true }));
  });

  test("manifest --list", () => {
    command.fab(["manifest", "--list"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ list: true }));
  });

  test("manifest -a", () => {
    command.fab(["manifest", "-a"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ add: true }));
  });

  test("manifest --add", () => {
    command.fab(["manifest", "--add"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ add: true }));
  });

  test("manifest --add depend", () => {
    command.fab(["manifest", "--add", "depend"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ add: "depend" }));
  });

  test("manifest -d", () => {
    command.fab(["manifest", "-d"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ delete: true }));
  });

  test("manifest --delete", () => {
    command.fab(["manifest", "--delete"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ delete: true }));
  });

  test("manifest --delete depend", () => {
    command.fab(["manifest", "--delete", "depend"]);
    expect(manifestSpy).toHaveBeenCalledWith(expect.objectContaining({ delete: "depend" }));
  });

  // Not blocking multiple options together, but not supporting it either, so not testing.

  // An unexpected command is a likely mistake, as `fab manifest list` is a reasonable mistake.
  test("manifest unexpected-param", () => {
    expect(() => {
      command.fab(["manifest", "unexpected-param"]);
    }).toThrow();
  });

});
