# archlint

[![Release](https://img.shields.io/github/v/release/archlinter/action)](https://github.com/archlinter/action/releases)
[![License](https://img.shields.io/github/license/archlinter/action)](https://github.com/archlinter/action/blob/main/LICENSE)

Official GitHub Action for [archlint](https://archlinter.github.io/archlint/) to prevent architectural regressions in your Pull Requests.

## Features

- **🚀 Architectural Gate**: Block PRs that introduce new circular dependencies, layer violations, or other smells.
- **📝 Beautiful PR Comments**: Detailed reports with "Why" and "How to fix" explanations.
- **📍 Inline Annotations**: See exactly where architectural issues occur in your code diff.
- **⚙️ Ratchet Approach**: Enforce improvement without forcing a full rewrite—just don't let it get worse.

## Usage

Create a `.github/workflows/architecture.yml` file in your repository:

```yaml
name: Architecture

on:
  pull_request:
    branches: [ main ]

jobs:
  arch-check:
    name: Architecture Gate
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write # Required for posting comments and annotations
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Important: Required for git diff comparison

      - name: Run archlint
        uses: archlinter/action@v1
        with:
          # Compare current PR against the target branch
          baseline: origin/${{ github.base_ref }}
          # Fail only on medium or higher severity smells
          fail-on: medium
          # Enable PR commenting
          comment: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Default |
| :--- | :--- | :--- |
| `baseline` | Git ref (branch/tag/commit) or path to a snapshot file to compare against. | `origin/main` |
| `fail-on` | Minimum severity to cause the action to fail. Options: `low`, `medium`, `high`, `critical`. | `medium` |
| `comment` | Whether to post a summary report as a PR comment. | `true` |
| `annotations` | Whether to show inline annotations in the "Files changed" tab. | `true` |
| `working-directory` | Directory where `archlint` should run (useful for monorepos). | `.` |
| `github-token` | Token used for API requests. | `${{ github.token }}` |

## Advanced Examples

### Monorepo Setup

If your project is in a subdirectory:

```yaml
- uses: archlinter/action@v1
  with:
    working-directory: ./packages/backend
    baseline: origin/main
```

### Custom Snapshot Baseline

If you prefer to compare against a pre-generated snapshot:

```yaml
- uses: archlinter/action@v1
  with:
    baseline: .archlint/baseline.json
```

## Permissions

This action requires the following permissions:

```yaml
permissions:
  contents: read      # To checkout code
  pull-requests: write # To post comments and annotations
```

## License

MIT © [archlint](https://github.com/archlinter)
