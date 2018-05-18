// System tests with shared setup of full playground.

import * as childProcess from "child_process";
import * as fs from "fs";
import * as fsX from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
// Mine
import * as command from "../src/command";
import * as core from "../src/core";
import * as coreBranch from "../src/core-branch";
import * as coreClone from "../src/core-clone";
import * as repo from "../src/repo";
import * as util from "../src/util";
import * as sandpit from "./sandpit";


describe("system (full functionality)", () => {
  const startDir = process.cwd();
  let tempFolder: tmp.SynchrounousResult;
  let pinnedRevision: string;
  let nestedRoot: string;
  let siblingRoot: string;
  let remotes: string;

  beforeAll(() => {
    tempFolder = tmp.dirSync({ unsafeCleanup: true, keep: true });
    pinnedRevision = sandpit.makePlayground(tempFolder.name);
    process.chdir(tempFolder.name);
    nestedRoot = path.join(process.cwd(), "nested");
    siblingRoot = path.join(process.cwd(), "sibling");
    remotes = path.join(tempFolder.name, "remotes"); // avoid resolving to /private on mac
    process.chdir(startDir);
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

  test("unexpected command throws", () => {
    expect(() => {
      command.fab(["unexpected-command"]);
    }).toThrow(util.suppressTerminateExceptionMessage);
  });

  test("playground init of hg nested", () => {
    process.chdir(nestedRoot);

    const rootObject = core.readRootFile();
    expect(rootObject.mainPath).toEqual(".");
    expect(rootObject.manifest).toBeUndefined();

    const manifestObject = core.readManifest({ fromRoot: true });
    expect(manifestObject.rootDirectory).toEqual(".");
    expect(manifestObject.mainPathFromRoot).toEqual(".");

    const dependencies = manifestObject.dependencies;
    expect(dependencies["free"]).toEqual(       { repoType: "hg", origin: path.join(remotes, "hg", "free") });
    // expect(dependencies["libs/pinned"]).toEqual({ repoType: "hg", origin: path.join(remotes, "hg", "libs", "pinned"), pinRevision: pinnedRevision });
    expect(dependencies["libs/locked"]).toEqual({ repoType: "hg", origin: path.join(remotes, "hg", "libs", "locked"), lockBranch: "lockedBranch" });
  });

  test("playground init of git sibling", () => {
    process.chdir(siblingRoot);

    const rootObject = core.readRootFile();
    expect(rootObject.mainPath).toEqual("main");
    expect(rootObject.manifest).toBeUndefined();

    const manifestObject = core.readManifest({ fromRoot: true });
    expect(manifestObject.rootDirectory).toEqual("..");
    expect(manifestObject.mainPathFromRoot).toEqual("main");

    const dependencies = manifestObject.dependencies;
    expect(dependencies["free"]).toEqual(       { repoType: "git", origin: path.join(remotes, "git", "free") });
    expect(dependencies["libs/pinned"]).toEqual({ repoType: "git", origin: path.join(remotes, "git", "libs", "pinned"), pinRevision: pinnedRevision });
    expect(dependencies["libs/locked"]).toEqual({ repoType: "git", origin: path.join(remotes, "git", "libs", "locked"), lockBranch: "lockedBranch" });
  });


  describe ("test display commands", () => {
    let spy: jest.SpyInstance;

    beforeAll(() => {
      spy = jest.spyOn(global.console, 'log');
    });

    afterAll(() => {
      spy.mockRestore();
    });

    test("root (no forest) throws", () => {
      expect(() => {
        command.fab(["root"]);
      }).toThrow();
    });

    test("root from nested root", () => {
      process.chdir("nested");
      command.fab(["root"]);
      expect(spy).toHaveBeenLastCalledWith(nestedRoot);
      });

    test("root from nested forest", () => {
      process.chdir(path.join("nested", "libs"));
      command.fab(["root"]);
      expect(spy).toHaveBeenLastCalledWith(nestedRoot);
      });

    test("root from sibling root", () => {
      process.chdir("sibling");
      command.fab(["root"]);
      expect(spy).toHaveBeenLastCalledWith(siblingRoot);
      });

    test("root from sibling main", () => {
      process.chdir(path.join("sibling", "main"));
      command.fab(["root"]);
      expect(spy).toHaveBeenLastCalledWith(siblingRoot);
      });

    test("root from sibling forest", () => {
      process.chdir(path.join("sibling", "libs"));
      command.fab(["root"]);
      expect(spy).toHaveBeenLastCalledWith(siblingRoot);
      });

    test("main from nested forest", () => {
      process.chdir(path.join("nested", "libs"));
      command.fab(["main"]);
      expect(spy).toHaveBeenLastCalledWith(nestedRoot);
      });

    test("main from nested forest", () => {
      process.chdir(path.join("nested", "libs"));
      command.fab(["main"]);
      expect(spy).toHaveBeenLastCalledWith(nestedRoot);
      });

    test("main from sibling forest", () => {
      process.chdir(path.join("sibling", "libs"));
      command.fab(["main"]);
      expect(spy).toHaveBeenLastCalledWith(path.join(siblingRoot, "main"));
      });

  });


  describe("clone nested #hg", () => {
    let clonesSandpit: string;

    beforeAll(() => {
      clonesSandpit = path.join(tempFolder.name, "clone-nested");
      fs.mkdirSync(clonesSandpit);
    });

    beforeEach(() => {
      process.chdir(clonesSandpit);
    });

    // Somewhat pairwise, some permutations.

    test("clone nested --manifest slim", () => {
      coreClone.doClone(path.join(remotes, "hg", "main"), undefined, { manifest: "slim" });

      // Check root
      expect(fs.existsSync("main")).toBe(true);
      process.chdir("main");
      expect(fs.existsSync(core.fabRootFilename)).toBe(true);
      // Check for slim repos, no libs
      expect(repo.getBranch(".")).toEqual("default");
      expect(repo.getBranch("free")).toEqual("default");
      expect(fs.existsSync("libs")).toBe(false);
    });

    test("clone nested destination --branch develop", () => {
      const branch = "develop";
      // Make a branch using previous clone
      process.chdir("main");
      coreBranch.doMakeBranch(branch, undefined, { publish: true });

      process.chdir(clonesSandpit);
      coreClone.doClone(path.join(remotes, "hg", "main"), "nested2", { branch });

      // Check root
      expect(fs.existsSync("nested2")).toBe(true);
      process.chdir("nested2");
      expect(fs.existsSync(core.fabRootFilename)).toBe(true);
      // Check for full suite
      expect(repo.getBranch(".")).toEqual(branch);
      expect(repo.getBranch("free")).toEqual(branch);
      process.chdir("libs");
      expect(repo.getBranch("locked")).toEqual("lockedBranch");
      // Have not got pinned via init working for pinned yet
      // expect(repo.getRevision("pinned")).toEqual(pinnedRevision);
    });

  });

  describe("clone sibling #git", () => {
    let clonesSandpit: string;

    beforeAll(() => {
      clonesSandpit = path.join(tempFolder.name, "clones-sibling");
      fs.mkdirSync(clonesSandpit);
    });

    beforeEach(() => {
      process.chdir(clonesSandpit);
    });

    // Somewhat pairwise, some permutations.

    test("clone sibling --manifest slim", () => {
      coreClone.doClone(path.join(remotes, "git", "main"), undefined, { manifest: "slim" });

      // Check root
      expect(fs.existsSync("main-forest")).toBe(true);
      process.chdir("main-forest");
      expect(fs.existsSync(core.fabRootFilename)).toBe(true);
      // Check for slim repos, no libs
      expect(repo.getBranch("main")).toEqual("master");
      expect(repo.getBranch("free")).toEqual("master");
      expect(fs.existsSync("libs")).toBe(false);
    });

    test("clone sibling destination --branch develop", () => {
      const branch = "develop";
      // Make a branch using previous clone
      process.chdir("main-forest");
      coreBranch.doMakeBranch(branch, undefined, { publish: true });

      process.chdir(clonesSandpit);
      coreClone.doClone(path.join(remotes, "git", "main"), "sibling2", { branch });

      // Check root
      expect(fs.existsSync("sibling2")).toBe(true);
      process.chdir("sibling2");
      expect(fs.existsSync(core.fabRootFilename)).toBe(true);
      // Check for full suite
      expect(repo.getBranch("main")).toEqual(branch);
      expect(repo.getBranch("free")).toEqual(branch);
      process.chdir("libs");
      expect(repo.getBranch("locked")).toEqual("lockedBranch");
      expect(repo.getRevision("pinned")).toEqual(pinnedRevision);
    });

  });

  describe("install", () => {
    let installsSandpit: string;

    beforeAll(() => {
      installsSandpit = path.join(tempFolder.name, "installs");
      fs.mkdirSync(installsSandpit);
    });

    beforeEach(() => {
      process.chdir(installsSandpit);
    });

    // Install gets indirectly tested by clone, but do some explicit tests.

    test("install --manifest slim #hg #nested #clean", () => {
      const branch = "develop";
      childProcess.execFileSync("hg", ["clone", "--branch", branch, path.join(remotes, "hg", "main"), "nested"]);

      process.chdir("nested");
      coreClone.doInstall({ manifest: "slim" });
      // Check root
      expect(fs.existsSync(core.fabRootFilename)).toBe(true);
      // Check for slim repos, no libs
      expect(repo.getBranch(".")).toEqual(branch);
      expect(repo.getBranch("free")).toEqual(branch);
      expect(fs.existsSync("libs")).toBe(false);
    });

    test("install #git #sibling #dirty", () => {
      coreClone.doClone(path.join(remotes, "git", "main"), "sibling");

      // Make changes to check install imposes changes. Missing repo, and change locked and pinned.
      process.chdir("sibling");
      fsX.removeSync("free");
      childProcess.execFileSync("git", ["checkout", "master"], { cwd: path.join("libs", "locked")});
      childProcess.execFileSync("git", ["checkout", "master"], { cwd: path.join("libs", "pinned")});

      expect(fs.existsSync("free")).toBe(false);
      expect(repo.getBranch(path.join("libs", "locked"))).not.toEqual("lockedBranch");
      expect(repo.getRevision(path.join("libs", "pinned"))).not.toEqual(pinnedRevision);
      //
      process.chdir("main");
      coreClone.doInstall({ });
      process.chdir("..");
      //
      expect(fs.existsSync("free")).toBe(true);
      expect(repo.getBranch("free")).toEqual("master");
      expect(repo.getBranch(path.join("libs", "locked"))).toEqual("lockedBranch");
      expect(repo.getRevision(path.join("libs", "pinned"))).toEqual(pinnedRevision);
    });

  });

});