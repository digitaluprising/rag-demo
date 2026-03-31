# General Sans (source)

Place **General Sans** desktop/web files here if you manage them outside the bundled copies.

The app loads **WOFF2** files from this folder and mirrors them under `src/assets/fonts/` (see project task list). Current webfont files were fetched from [Fontshare](https://www.fontshare.com/fonts/general-sans) (ITF Free Font License).

To refresh weights, you can regenerate URLs via Fontshare’s CSS API, e.g.:

`https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap`

Then download the linked `.woff2` assets and name them `GeneralSans-{400|500|600|700}.woff2`, and copy into `src/assets/fonts/`.
