(() => {
  const K = window.KARGIL;
  const ALL = [...window.LISTINGS].sort((a, b) => b.posted.localeCompare(a.posted));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const rentText = (l) => l.rentLabel || inr(l.rent);
  const rentUnit = (l) => (l.rentLabel ? "per month" : "per month");
  const sizeText = (l) => (l.size ? `${l.size.toLocaleString("en-IN")} ${l.sizeKind || "sq ft"}` : "Size on request");
  const asset = (l, f) => `assets/listings/${l.id}/${f}`;
  const isNew = (l) => (Date.now() - new Date(l.posted).getTime()) / 864e5 <= 7;
  const waLink = (text) => `https://wa.me/${K.phoneIntl}?text=${encodeURIComponent(text)}`;
  const listingUrl = (l) => `${location.origin}${location.pathname}#${l.id}`;
  // The enquiry is a normal WhatsApp chat to the business number, pre-typed with the
  // property's name, rent, reference and a link back to it. Nothing passes through this site.
  const listingMsg = (l) =>
    `Hi Kargil Realtor, I'm interested in this space:\n${l.title}\n${l.location}\nRent: ${rentText(l)}\nRef: ${l.id}\n${listingUrl(l)}\n\nIs it available for a site visit?`;

  // ---------- business details into the page ----------
  $$("[data-tel]").forEach((a) => (a.href = `tel:+${K.phoneIntl}`));
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-google]").forEach((a) => (a.href = K.googleUrl));
  $$("[data-phone]").forEach((e) => (e.textContent = K.phoneDisplay));
  $$("[data-rating]").forEach((e) => (e.textContent = K.googleRating));
  $$("[data-reviews]").forEach((e) => (e.textContent = K.googleReviews));
  $$("[data-address]").forEach((e) => (e.textContent = K.address));
  $$("[data-hours]").forEach((e) => (e.textContent = K.hours));
  $$("[data-ig-handle]").forEach((e) => (e.textContent = K.instagramHandle || ""));
  $$("[data-yt-name]").forEach((e) => (e.textContent = K.youtubeName || ""));
  // Google Map is ~1 MB: load it only when the contact section comes near the screen
  const mapBox = $("#map");
  if (mapBox) {
    const mio = new IntersectionObserver(
      (ents) => {
        if (!ents.some((e) => e.isIntersecting)) return;
        mio.disconnect();
        const f = Object.assign(document.createElement("iframe"), {
          src: K.mapEmbed,
          title: "Kargil Realtor on Google Maps",
          loading: "lazy",
          referrerPolicy: "no-referrer-when-downgrade",
        });
        mapBox.append(f);
      },
      { rootMargin: "400px" },
    );
    mio.observe(mapBox);
  }
  [["[data-ig]", K.instagramUrl], ["[data-yt]", K.youtubeUrl]].forEach(([sel, url]) =>
    $$(sel).forEach((a) => {
      if (url) {
        a.href = url;
        a.hidden = false;
      }
    }),
  );

  const available = ALL.filter((l) => l.status !== "rented");

  // ---------- hero rent card ----------
  const card = $("#rentcard");
  const dots = $("#rc-dots");
  let rcIndex = 0;
  let rcTimer;
  const showRent = (i, animate = true) => {
    rcIndex = (i + available.length) % available.length;
    const l = available[rcIndex];
    const paint = () => {
      $("#rc-img").src = asset(l, "poster.webp");
      $("#rc-img").alt = l.title;
      $("#rc-what").textContent = `${l.type} in ${l.area}`;
      $("#rc-price").textContent = rentText(l);
      $("#rc-meta").textContent = l.rentLabel ? l.rentNote : `${sizeText(l)}, per month`;
      $$("button", dots).forEach((d, j) => d.setAttribute("aria-selected", String(j === rcIndex)));
    };
    if (animate && !reduceMotion) {
      card.classList.remove("is-flipping");
      void card.offsetWidth;
      card.classList.add("is-flipping");
      setTimeout(paint, 250);
    } else paint();
  };
  available.forEach((l, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", l.title);
    b.addEventListener("click", () => {
      showRent(i);
      restartTimer();
    });
    dots.append(b);
  });
  const restartTimer = () => {
    clearInterval(rcTimer);
    if (!reduceMotion) rcTimer = setInterval(() => showRent(rcIndex + 1), 3800);
  };
  card.addEventListener("click", () => openDetail(available[rcIndex]));
  showRent(0, false);
  restartTimer();

  // ---------- filters + grid ----------
  const grid = $("#grid");
  const form = $("#filters");
  const areaSel = $("#f-area");
  [...new Set(ALL.map((l) => l.area))].sort().forEach((a) => areaSel.append(new Option(a, a)));

  const cardHTML = (l) => `
    <li>
      <article class="card${l.status === "rented" ? " card--rented" : ""}" data-id="${l.id}">
        <div class="card__media" role="button" tabindex="0" aria-label="Open ${l.title}">
          <img src="${asset(l, "poster.webp")}" alt="${l.title}" loading="lazy" width="640" height="800" />
          ${l.preview ? `<video muted playsinline loop preload="none" src="${asset(l, "preview.mp4")}"></video>` : ""}
          <span class="card__type">${l.type}</span>
          ${isNew(l) && l.status !== "rented" ? `<span class="card__new">New</span>` : ""}
          ${l.reel ? `<span class="card__reel"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>Video tour</span>` : ""}
          <span class="card__price"><strong>${rentText(l)}</strong><small>${l.rentLabel ? "per month" : "per month"}</small></span>
        </div>
        <div class="card__body">
          <h3>${l.title}</h3>
          <p class="card__loc">${l.location}</p>
          <ul class="card__facts">
            <li>${sizeText(l)}</li>
            ${l.features.slice(0, 2).map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>
        <div class="card__ctas">
          <a class="btn btn--wa" href="${waLink(listingMsg(l))}" target="_blank" rel="noopener">WhatsApp</a>
          <button class="btn btn--ghost" type="button" data-open>Details</button>
        </div>
      </article>
    </li>`;

  const render = () => {
    const f = new FormData(form);
    const type = f.get("type");
    const area = f.get("area");
    const [lo, hi] = f.get("budget") === "all" ? [0, Infinity] : f.get("budget").split("-").map(Number);
    let list = ALL.filter((l) => (type === "all" || l.type === type) && (area === "all" || l.area === area) && l.rent >= lo && l.rent <= hi);
    const sort = f.get("sort");
    if (sort === "rent-asc") list.sort((a, b) => a.rent - b.rent);
    if (sort === "rent-desc") list.sort((a, b) => b.rent - a.rent);
    if (sort === "size-desc") list.sort((a, b) => (b.size || 0) - (a.size || 0));
    if (sort === "new") list.sort((a, b) => (a.status === "rented") - (b.status === "rented") || b.posted.localeCompare(a.posted));
    grid.innerHTML = list.map(cardHTML).join("");
    $("#empty").hidden = list.length > 0;
    const n = list.filter((l) => l.status !== "rented").length;
    $("#count").textContent = `${n} space${n === 1 ? "" : "s"} available`;
    wireCards();
  };

  // previews: play while hovered (desktop) or while mostly on screen (touch)
  const touch = matchMedia("(hover: none)").matches;
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = $("video", e.target);
        if (!v || reduceMotion) return;
        if (e.isIntersecting) {
          v.play().then(() => e.target.classList.add("is-playing")).catch(() => {});
        } else {
          v.pause();
          e.target.classList.remove("is-playing");
        }
      }),
    { threshold: 0.7 },
  );
  const wireCards = () => {
    $$(".card").forEach((c) => {
      const l = ALL.find((x) => x.id === c.dataset.id);
      const media = $(".card__media", c);
      const open = () => openDetail(l);
      media.addEventListener("click", open);
      media.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open()));
      $("[data-open]", c).addEventListener("click", open);
      const v = $("video", media);
      if (!v || reduceMotion) return;
      if (touch) io.observe(media);
      else {
        media.addEventListener("mouseenter", () => v.play().then(() => media.classList.add("is-playing")).catch(() => {}));
        media.addEventListener("mouseleave", () => (v.pause(), media.classList.remove("is-playing")));
      }
    });
  };
  form.addEventListener("change", render);
  render();

  // ---------- reels strip ----------
  const reelrow = $("#reelrow");
  reelrow.innerHTML = ALL.filter((l) => l.reel)
    .map(
      (l) => `
      <li class="reel">
        <button class="reel__phone" type="button" data-id="${l.id}" aria-label="Play the reel for ${l.title}">
          <img src="${asset(l, "reel.webp")}" alt="" loading="lazy" />
          <span class="reel__play" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
        <p class="reel__cap">${l.title}</p>
      </li>`,
    )
    .join("");
  $$(".reel__phone").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-playing")) return;
      // stop any other playing reel
      $$(".reel__phone.is-playing").forEach((o) => {
        $("video", o)?.remove();
        o.classList.remove("is-playing");
      });
      const l = ALL.find((x) => x.id === btn.dataset.id);
      const v = Object.assign(document.createElement("video"), {
        src: asset(l, "reel.mp4"),
        controls: true,
        autoplay: true,
        playsInline: true,
      });
      btn.append(v);
      btn.classList.add("is-playing");
    }),
  );

  // reels: arrow buttons + yellow position track instead of a browser scrollbar
  const prev = $("#reel-prev");
  const next = $("#reel-next");
  const thumb = $("#reel-thumb");
  const syncTrack = () => {
    const max = reelrow.scrollWidth - reelrow.clientWidth;
    // everything fits on screen: no slider needed
    $(".reelnav").hidden = max <= 4;
    const w = Math.max(12, (reelrow.clientWidth / reelrow.scrollWidth) * 100);
    // clamp so the thumb sits flush at both ends even with sub-pixel scroll positions
    const pos = max > 0 ? Math.min(1, Math.max(0, reelrow.scrollLeft / max)) : 0;
    const p = pos < 0.01 ? 0 : pos > 0.99 ? 1 : pos;
    thumb.style.width = `${w}%`;
    thumb.style.left = `${p * (100 - w)}%`;
    prev.disabled = p === 0;
    next.disabled = p === 1;
  };
  const step = () => Math.max(250, reelrow.clientWidth * 0.8);
  prev.addEventListener("click", () => reelrow.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
  next.addEventListener("click", () => reelrow.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
  reelrow.addEventListener("scroll", syncTrack, { passive: true });
  addEventListener("resize", syncTrack);
  syncTrack();

  // ---------- detail dialog ----------
  const dlg = $("#detail");
  function openDetail(l) {
    if (!l) return;
    $("#d-type").textContent = `${l.type} for rent${l.status === "rented" ? " (rented)" : ""}`;
    $("#d-title").textContent = l.title;
    $("#d-loc").textContent = l.location;
    $("#d-price").innerHTML = `<strong>${rentText(l)}</strong><span>${l.rentLabel ? l.rentNote : "per month" + (l.rentNote ? ", " + l.rentNote : "")}</span>`;
    $("#d-features").innerHTML = [sizeText(l), ...l.features].map((f) => `<li>${f}</li>`).join("");
    $("#d-wa").href = waLink(listingMsg(l));
    $("#d-wa").target = "_blank";
    $("#d-posted").textContent = `Listed on ${new Date(l.posted).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Ref: ${l.id}`;
    $("#d-media").innerHTML = l.reel
      ? `<video src="${asset(l, "reel.mp4")}" poster="${asset(l, "reel.webp")}" controls playsinline preload="auto"></video>`
      : `<img src="${asset(l, "poster.webp")}" alt="${l.title}" />`;
    $("#d-share").onclick = async () => {
      const url = `${location.origin}${location.pathname}#${l.id}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: l.title, text: `${l.title}, ${rentText(l)}`, url });
        } catch {}
      } else {
        await navigator.clipboard?.writeText(url);
        $("#d-share").textContent = "Link copied";
        setTimeout(() => ($("#d-share").textContent = "Share"), 1800);
      }
    };
    // channel / post links under the buttons
    const soc = $("#d-social");
    const links = [
      (l.instagram || K.instagramUrl) && `<a href="${l.instagram || K.instagramUrl}" target="_blank" rel="noopener">${l.instagram ? "Watch on Instagram" : "More reels on Instagram"}</a>`,
      (l.youtube || K.youtubeUrl) && `<a href="${l.youtube || K.youtubeUrl}" target="_blank" rel="noopener">${l.youtube ? "Watch on YouTube" : "More on YouTube"}</a>`,
    ].filter(Boolean);
    soc.innerHTML = links.join("");
    soc.hidden = !links.length;

    history.replaceState(null, "", `#${l.id}`);
    dlg.showModal();
    autoPlay();
  }

  // The reel starts on its own when a property opens. Clicking counts as permission for
  // sound in most browsers; if a browser still blocks it, play muted with a "Tap for sound" button.
  const soundBtn = $("#d-sound");
  function autoPlay() {
    const v = $("video", dlg);
    soundBtn.hidden = true;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
      soundBtn.hidden = false;
    });
  }
  soundBtn.addEventListener("click", () => {
    const v = $("video", dlg);
    if (!v) return;
    v.muted = false;
    v.play();
    soundBtn.hidden = true;
  });
  const closeDetail = () => {
    $("video", dlg)?.pause();
    dlg.close();
  };
  $("#d-close").addEventListener("click", closeDetail);
  dlg.addEventListener("click", (e) => e.target === dlg && closeDetail());
  dlg.addEventListener("close", () => {
    $("video", dlg)?.pause();
    if (location.hash) history.replaceState(null, "", location.pathname);
  });
  // deep link: site.com/#vn-office-840 opens that listing
  const fromHash = ALL.find((l) => `#${l.id}` === location.hash);
  if (fromHash) openDetail(fromHash);

  // ---------- owner form -> WhatsApp ----------
  $("#ownerform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = [
      "Hi Kargil Realtor, I want to list my property for rent.",
      `Type: ${f.get("type")}`,
      `Location: ${f.get("area")}`,
      f.get("size") && `Size: ${f.get("size")} sq ft`,
      f.get("rent") && `Expected rent: ${f.get("rent")}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  });
})();
