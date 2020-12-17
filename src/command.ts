import * as commander from "commander";
import * as path from "path";
// Mine
import * as completion from "./completion";
import * as core from "./core";
import * as coreBranch from "./core-branch";
import * as coreClone from "./core-clone";
import * as coreFor from "./core-for";
import * as coreInit from "./core-init";
import * as coreManifest from "./core-manifest";
import * as corePull from "./core-pull";
import * as coreSnapshot from "./core-snapshot";
import * as util from "./util";
// Trickery to cope with different relative paths for typescipt and javascript
// eslint-disable-next-line @typescript-eslint/no-var-requires
const myPackage = require("dummy_for_node_modules/../../package.json");


function doStatus() {
  const startDir = process.cwd();
  core.cdRootDirectory();
  const forestRepos = core.readManifest(
    { fromRoot: true, addSeedToDependencies: true }
  ).dependencies;

  Object.keys(forestRepos).forEach((repoPath) => {
    const entry = forestRepos[repoPath];
    if (entry.repoType === "git") {
      // Using short form of options to reduce amount of output for commonly used command
      util.execCommandSync(
        "git", ["status", "-sb"], { cwd: repoPath }
      );
    } else if (entry.repoType === "hg") {
      util.execCommandSync(
        "hg", ["status"], { cwd: repoPath }
      );
    }
  });
  process.chdir(startDir);
}


// ------------------------------------------------------------------------------
// Command line processing. Returning new object to allow multiple calls for testing.

export type Command = commander.Command;

export function makeProgram(options?: { exitOverride: boolean }): Command {
  const program = new commander.Command();

  // Configuration
  if (options?.exitOverride) {
    program.exitOverride();
  }

  program
    .version(myPackage.version)
    .option("--debug", "include debugging information, such as stack dump");

  // Extra help
  /* istanbul ignore next  */
  program.on("--help", () => {
    console.log(`
Files:
  ${core.manifestPath({})} default manifest for forest
  ${core.fabRootFilename} marks root of forest (do not commit to VCS)

Commands Summary:
  Forest management: clone, init, install
  Utility: status, pull, for-each, for-free, git, hg
  Branch: make-branch, switch
  Reproducible state: snapshot, recreate, restore
  Display: root, seed, manifest
  Manifest management: manifest --edit, --list, --add, --delete

See https://github.com/shadowspawn/forest-arborist.git for usage overview.
See also "fab <command> --help" for individual command options and further help.`);
  });

  program
    .command("clone <source> [destination]")
    .option("-b, --branch <branchname>", "branch to checkout for free repos")
    .option("-m, --manifest <name>", "custom manifest file")
    .description("clone source and install its dependencies")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Description:

  Clones a forest by cloning the seed repo into a newly created directory
  and installing its dependencies.

  The optional destination is the name for the newly created root directory.
  For a nested forest the new directory is the seed repo, like with
  the git and hg clone commands. For a sibling forest the new directory
  is the root directory for the forest and not a repository itself.`);
    })
    .action((source, destination, options) => {
      coreClone.doClone(source, destination, options);
    });

  program
    .command("completion")
    .description("output shell completion script")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Description:

  Output shell completion script.

  For trying out shell completion without writing files on Linux:
      source < (fab completion)
  on macOS:
      eval \`$(fab completion)\`

  To install, write the output to a shell startup file, or to a file and invoke from a shell startup file.
  (c.f. npm completion)`);
    })
    .action(() => {
      completion.completion(program);
    });

  program
    .command("init")
    .option("--sibling", "dependent repos are beside seed repo, root directory is above seed repo")
    .option("--nested", "dependent repos inside seed repo, root directory is seed repo")
    .option("--root <dir>", "root directory of forest relative to seed repo")
    .option("-m, --manifest <name>", "custom manifest file")
    .description("add manifest in current directory, and marker file at root of forest")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Description:

  Use init to create the manifest based on your current sandpit.
  Run from your seed repo and it finds the dependent repos.
  Specify the forest layout with --sibling, --nested, or --root.

Examples:

  For a forest layout with dependent repos nested in the seed repo, either:
      fab init --nested
      fab init --root .

  For a forest layout with sibling repositories beside the seed repo, either:
      fab init --sibling
      fab init --root ..`);
    })
    .action((options) => {
      if (!options.nested && !options.sibling && (options.root === undefined)) {
        util.terminate("please specify one of --sibling, --nested, --root to specify forest layout");
      }
      if ((options.nested && options.sibling) || (options.nested && options.root !== undefined) || (options.sibling && options.root !== undefined)) {
        util.terminate("specify only one of --sibling, --nested, --root to specify forest layout");
      }
      if (options.sibling) {
        options.root = "..";
      }
      if (options.nested) {
        options.root = ".";
      }
      coreInit.doInit(options);
    });

  program
    .command("install")
    .option("-m, --manifest <name>", "custom manifest file")
    .description("clone missing (new) dependent repositories")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Description:

  Run Install from the seed repo.

  Target repos: all missing and pinned repos. Pinned repos will be updated
  to match the <pinRevision> from the manifest if necessary.`);
    })
    .action((options) => {
      coreClone.doInstall(options);
    });

  program
    .command("status")
    .description("show concise status for each repo in the forest")
    .action((options) => {
      doStatus();
    });

  program
    .command("pull")
    .description("git-style pull, which is fetch and merge")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Target repos: free and branch-locked, excludes repos pinned to a revision.`);
    })
    .action((options) => {
      corePull.doPull();
    });

  program
    .command("root")
    .description("show the root directory of the forest")
    .action((options) => {
      core.cdRootDirectory();
      console.log(process.cwd());
    });

  program
    .command("seed")
    .description("show the seed directory of the forest")
    .action((options) => {
      core.cdRootDirectory();
      const rootObject = core.readRootFile();
      const seedPath = path.resolve(process.cwd(), rootObject.seedPath);
      console.log(seedPath);
    });

  program
    .command("for-each")
    .alias("forEach") // because javascript has forEach so very familiar
    .description("run specified command on each repo in the forest, e.g. \"fab for-each -- ls -al\"")
    .arguments("-- <command> [args...]")
    .option("-k, --keepgoing", "ignore intermediate errors and process all the repos")
    .action((command, args, options) => {
      coreFor.doForEach(command, args, options);
    });

  program
    .command("for-free")
    .description("run specified command on repos which are not locked or pinned")
    .arguments("-- <command> [args...]")
    .option("-k, --keepgoing", "ignore intermediate errors and process all the repos")
    .action((command, args, options) => {
      coreFor.doForFree(command, args, options);
    });

  program
    .command("git")
    .option("-k, --keepgoing", "ignore intermediate errors and process all the repos")
    .description("run specified git command on each git repo in the forest, e.g. \"fab git -- remote -v\"")
    .arguments("-- [args...]")
    .action((args, options) => {
      coreFor.doForGit(args, options);
    });

  program
    .command("hg")
    .option("-k, --keepgoing", "ignore intermediate errors and process all the repos")
    .description("run specified hg command on each hg repo in the forest, e.g. \"fab hg -- outgoing\"")
    .arguments("-- [args...]")
    .action((args, options) => {
      coreFor.doForHg(args, options);
    });

  program
    .command("switch <branch>")
    .description("switch branch of free repos")
    .action((branch) => {
      coreBranch.doSwitch(branch);
    })
    .on("completion:", (context: completion.CompletionContext) => {
      coreBranch.completeSwitch(context);
    });

  program
    .command("make-branch <branch> [start_point]")
    .option("-p, --publish", "push newly created branch")
    .description("create new branch in free repos")
    .action((branch, startPoint, options) => {
      coreBranch.doMakeBranch(branch, startPoint, options);
    });

  program
    .command("snapshot")
    .option("-o, --output <file>", "write snapshot to file rather then stdout")
    .description("display state of forest")
    .action((options) => {
      coreSnapshot.doSnapshot(options);
    });

  program
    .command("recreate <snapshot> [destination]")
    .description("clone repos to recreate forest in past state")
    .action((snapshot, destination) => {
      coreSnapshot.doRecreate(snapshot, destination);
    });

  program
    .command("restore [snapshot]")
    .description("checkout repos to restore forest in past state")
    .action((snapshot) => {
      coreSnapshot.doRestore(snapshot);
    });

  // Hidden command for trying things out
  /* istanbul ignore next  */
  program
    .command("_test", { noHelp: true })
    .description("Placeholder for internal development code")
    .option("--expected")
    .action(() => {
      console.log("Called _test");
    });

  // Side note: switched from options to subcommands and still using old calling pattern.
  const manifestCommand = program
    .command("manifest")
    .description("manage manifest dependencies")
    .on("--help", () => {
      /* istanbul ignore next  */
      console.log(`
Description:

  Specify a command to list or make changes to manifest. Can be used from
  anywhere in forest.

  You can optionally specify the repo-path for add and delete,
  which otherwise default to the current working directory.

  edit uses the EDITOR or VISUAL environment variable if specified,
  and falls back to Notepad on Windows and vi on other platforms.`);
    });

  manifestCommand
    .command("add [repo-path]")
    .description("add entry to manifest dependencies")
    .action((repoPath) => coreManifest.doManifest({ add: repoPath || true }));
  manifestCommand
    .command("delete [repo-path]")
    .description("delete entry from manifest dependencies")
    .action((repoPath) => coreManifest.doManifest({ delete: repoPath || true }));
  manifestCommand
    .command("edit")
    .description("open manifest in editor")
    .action(() => coreManifest.doManifest({ edit: true }));
  manifestCommand
    .command("list")
    .description("list dependencies from manifest")
    .action(() => coreManifest.doManifest({ list: true }));
  manifestCommand
    .command("path")
    .description("show path of manifest")
    .action(() => coreManifest.doManifest({ }));

  return program;
}


export function fab(args: string[]): void {
  makeProgram({ exitOverride: true }).parse(args, { from: "user" });
}
