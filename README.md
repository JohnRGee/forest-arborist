# arm

Another Repository Manager

Provide convenient operations on a forest of repositories. The forest can be nested under a master repo or siblings in a plain directory. Support both Git and Mercurial repositories. Inspired by experience with Mercurial subrepositories.

Uses a configuration file in the forest and a marker file at the root of the forest. Allow commands to be run from anywhere in the forest, by searching up for the root marker file.

Terminology
* forest: a collection of repos and their working trees.
* root: directory at the root of the forest.

Other name ideas
* fab: forest arborist
* farm: forest arborist - repo manager, for all repos mentioned

## Configuration File Format (arm.json)

The config file can be automatically generated by:
* `arm init` from master repository for a nested forest
* `arm init --root ..` from main repo for a sibling forest

arm.json specifies working directory names and origin repositories for forest, relative to root. Origin supports paths relative to main repo. Dependent repos can be pinned to a revision (pinRevision), locked to a branch (lockBranch), or free and use the same branch as the main repo when specified for clone.

    {
      "dependencies": {
        "TestRenamed": {
          "origin": "git@github.com:JohnRGee/Test.git",
          "repoType": "git"
        }
      },
      "rootDirectory": ".."
    }

## Usage

    Usage: arm [options] [command]


    Commands:

      clone [options] <source> [destination]        clone source and install its dependencies
      init [options]                                add manifest in current directory, and marker file at root of forest
      install [options]                             clone missing (new) dependent repositories
      status                                        show concise status for each repo in the forest
      pull                                          git-style pull, which is fetch and merge
      outgoing                                      show new changesets that have not been pushed
      root                                          show the root directory of the forest
      for-each [command...]                         run specified command on each repo in the forest, e.g. "arm foreach -- pwd"
      for-free [command...]                         run specified command on repos which are not locked or pinned
      switch <branch>                               switch branch of free repos
      make-branch [options] <branch> [start_point]  create new branch in free repos
      snapshot|ss                                   display state of forest
      recreate <snapshot> [destination]             clone repos to recreate forest in past state
      \_restore <snapshot>                            checkout repos to restore forest in past state

    Options:

      -h, --help     output usage information
      -V, --version  output the version number

    Files:
    arm.json manifest file for forest
    .arm-root.json marks root of forest (do not commit to VCS)

    Forest management: clone, init, install
    Utility: status, pull, outgoing, for-each, for-free
    Branch: make-branch, switch
    Reproducible state: snapshot, recreate, restore

    Commands starting with an underscore are still in development.
    See https://github.com/JohnRGee/arm.git for usage overview.
    See also 'arm <command> --help' for command options and further help.

## Example Usage

(ToDo) Examples of forest management, utility, branch, and reproducible state.

## Installing

Requires node and npm. Easy install:

    npm install --global @shadowspawn/arm

To manage install location and command yourself:

    git clone https://github.com/JohnRGee/arm.git
    cd arm
    npm install
    node arm.js

i.e. setup command to run "node <installFolder>arm.js".

## Status

Pre-release. "arm init" is great for trying out on an existing checkout.

Main development on Mac OS X. Limited testing on Microsoft Windows and Linux.
