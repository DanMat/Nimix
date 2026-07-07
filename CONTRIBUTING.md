# Contributing to Nimix

Thanks for your interest in improving this project! It's a small, dependency-free
game, so contributing is easy.

## Getting started

1. **Fork** the repository and **clone** your fork.
2. Open `index.html` directly in a browser, or serve the folder:
   ```bash
   python3 -m http.server 8000   # then visit http://localhost:8000
   ```
3. Create a branch for your change:
   ```bash
   git checkout -b feature/my-improvement
   ```

## Guidelines

- **No build step, no dependencies.** Keep it plain HTML, CSS, and vanilla JS.
- **Match the existing style.** Tabs for indentation, and follow the naming
  conventions already in `css/style.css` (BEM-ish `board__*` / `btn--*`) and
  `js/game.js`.
- **Theme with CSS custom properties.** Add colors as variables in `:root` and
  the `[data-theme='...']` blocks rather than hard-coding them.
- **Keep the AI honest.** If you touch `bestMove`, make sure _Perfect_ still
  plays the optimal misère line (it should be unbeatable from the standard start).
- **Test all three themes and mobile width** before opening a pull request.
- Keep the JavaScript readable and commented where the intent isn't obvious.

## Submitting changes

1. Commit with a clear, descriptive message.
2. Push to your fork and open a **pull request** against `main`.
3. Fill out the pull request template and describe *what* changed and *why*.
4. Link any related issue (e.g. `Closes #12`).

## Reporting bugs & ideas

Use the [issue templates](.github/ISSUE_TEMPLATE) to file a bug report or
suggest a feature. Please include steps to reproduce and your browser/OS for bugs.

By contributing, you agree that your contributions will be licensed under the
project's [MIT License](LICENSE).
