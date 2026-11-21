# Kargil Realtor website

A fast, free-to-host static site (no server, no database). Everything lives in this folder.

```
website/
  index.html            page layout and copy
  css/site.css          design (colours, fonts, layout)
  js/config.js          phone, address, Google link, Instagram / YouTube links
  js/listings.js        THE LISTINGS: add / edit / mark rented here
  js/app.js             filters, rent card, video previews, WhatsApp links
  assets/listings/<id>/ poster.jpg, preview.mp4 (optional), reel.mp4 + reel.jpg (optional)
  assets/mascot-broker.png, assets/og.jpg (share image), favicon.svg
```

## Add a new property (2 steps)

1. Make its pictures and videos from the raw clip and the finished reel:
   ```
   tools\.venv\Scripts\python.exe tools\site_assets.py <new-id> --poster input\<folder>\walk.mp4 --poster-at 12 ^
       --preview input\<folder>\walk.mp4 --preview-at 10 --reel output\<reel>.mp4
   ```
   (`--bright 1.6` for dark footage; a photo also works as `--poster`.)
2. Copy a block in `js/listings.js`, give it the same `id`, fill in title, type, area, size, rent, features and `posted` date.

New listings show a red "New" badge for 7 days and appear first.

## Mark a property as rented

Change `status: "available"` to `status: "rented"`. The card gets a "Rented" overlay, moves to the bottom and leaves the hero card. Or delete the block to remove it.

## Instagram / YouTube buttons

Paste the profile links into `instagramUrl` and `youtubeUrl` in `js/config.js`. The buttons stay hidden until then.

## Preview on this computer

```
python -m http.server 8090 --directory website
```
then open http://localhost:8090

## Put it online (free)

Recommended: **Netlify** (free plan). Sign up, choose "Add new site → Deploy manually", and drag the whole `website` folder onto the page. You get a link like `kargilrealtor.netlify.app`. To update, drag the folder again.
Optional: buy a domain (e.g. `kargilrealtor.in`) and connect it in Netlify → Domain settings. Then add the link to the Google Business Profile, Instagram bio and YouTube channel.

Other free hosts that work the same way: Cloudflare Pages, GitHub Pages.
