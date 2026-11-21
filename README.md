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

## Online (GitHub Pages, free)

Live at **https://somesh-thakur.github.io/kargil-realtor/** (repo `Somesh-Thakur/kargil-realtor`).
To publish changes: `git add -A`, `git commit -m "..."`, `git push` from this folder; the site updates about a minute later.

### Custom domain (when the owner decides)
1. Buy the domain (e.g. `kargilrealtor.in`) from any registrar.
2. At the registrar, add DNS records: four `A` records for `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, and a `CNAME` for `www` → `somesh-thakur.github.io`.
3. Repo → Settings → Pages → Custom domain → enter the domain → tick "Enforce HTTPS".
4. Put the new link on the Google Business Profile, Instagram bio and YouTube channel.
