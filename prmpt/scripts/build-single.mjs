// Inlines the Vite build (JS + CSS) into one self-contained dist/prmpt.html.
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const read = (url) => fs.readFileSync(path.join(dist, url.replace(/^\//, '')), 'utf8')

const html = fs
  .readFileSync(path.join(dist, 'index.html'), 'utf8')
  .replace(
    /<script type="module" crossorigin src="([^"]+)"><\/script>/,
    (_, src) => `<script type="module">${read(src).replaceAll('</script', '<\\/script')}</script>`,
  )
  .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, (_, href) => `<style>${read(href)}</style>`)

if (/(src|href)="\/assets\//.test(html)) throw new Error('an asset was not inlined')
fs.writeFileSync(path.join(dist, 'prmpt.html'), html)
console.log(`dist/prmpt.html (${(html.length / 1024).toFixed(0)} kB)`)
