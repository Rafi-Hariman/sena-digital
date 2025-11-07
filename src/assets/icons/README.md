# PWA Icons

Place your PWA icons in this directory with the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

You can generate these icons from your logo using tools like:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

Or use ImageMagick:
```bash
convert your-logo.png -resize 72x72 icon-72x72.png
convert your-logo.png -resize 96x96 icon-96x96.png
convert your-logo.png -resize 128x128 icon-128x128.png
convert your-logo.png -resize 144x144 icon-144x144.png
convert your-logo.png -resize 152x152 icon-152x152.png
convert your-logo.png -resize 192x192 icon-192x192.png
convert your-logo.png -resize 384x384 icon-384x384.png
convert your-logo.png -resize 512x512 icon-512x512.png
```
