# lighthouse-sitemap

Tool to automate lighthouse scores for each URL in your Sitefinity sitemap.xml

## Requirements

- Install Chrome
- Install Node.js

### Instructions

- Download the `sitemap.xml` file that your site uses.  Sometimes this is `\sitemap\sitemap.xml`.  If you have a `\robots.txt` file, the path to your sitemap should be there. You might have to generate a Sitemap first.  [Sitemap generator](https://www.progress.com/documentation/sitefinity-cms/sitemap-generator)

- Execute the code via `node .\index.js`
- Distribute the `output.csv` to anyone in your business that wants performance data
