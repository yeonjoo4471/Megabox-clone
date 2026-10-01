// 상단 광고 닫기
const topAd = document.querySelector(".top-ad");
const topAdClose = document.querySelector(".top-ad-close");

if (topAd && topAdClose) {
  topAdClose.addEventListener("click", function() {
    topAd.classList.add("is-hidden");

    document.querySelector(".logo a")?.focus();
  });
}

// 헤더 메가메뉴
const header = document.querySelector(".header");

if (header) {
  const menuItems = header.querySelectorAll(".gnb-item");

  function closeMenus() {
    header.classList.remove("is-menu-open");

    menuItems.forEach(function (item) {
      item.classList.remove("is-open");

      const link = item.querySelector(":scope > a");

      if (item.querySelector(".sub-menu")) {
        link.setAttribute("aria-expanded", "false");
      }
    });
  }

  function openMenu(item) {
    closeMenus();

    item.classList.add("is-open");

    const submenu = item.querySelector(".sub-menu");
    const link = item.querySelector(":scope > a");

    if (!submenu) return;

    header.classList.add("is-menu-open");
    link.setAttribute("aria-expanded", "true");
  }

  menuItems.forEach(function (item, index) {
    const link = item.querySelector(":scope > a");
    const submenu = item.querySelector(".sub-menu");

    if (submenu) {
      submenu.id = `header-submenu-${index}`;

      link.setAttribute("aria-controls", submenu.id);
      link.setAttribute("aria-expanded", "false");
    }

    item.addEventListener("mouseenter", function() {
      openMenu(item);
    });

    item.addEventListener("focusin", function() {
      if (!item.classList.contains("is-open")) {
        openMenu(item);
      }
    });
  });

  header.addEventListener("mouseleave", function() {
    const focusedItem = document.activeElement.closest(".gnb-item");

    if (focusedItem && header.contains(focusedItem)) {
      openMenu(focusedItem);
    } else {
      closeMenus();
    }
  });

  header.addEventListener("focusout", function (event) {
    const nextItem = event.relatedTarget?.closest(".gnb-item");

    if (!nextItem || !header.contains(nextItem)) {
      closeMenus();
    }
  });

  header.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    const activeLink = header.querySelector(".gnb-item.is-open > a");

    activeLink?.focus();
    closeMenus();
  });

  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) {
      closeMenus();
    }
  });
}

// 영화 좋아요
const likeButtons = document.querySelectorAll(".like-btn");

likeButtons.forEach(function (button) {
  const countText = button.querySelector(".like-count");

  if (!countText) return;

  const displayedCount = countText.textContent
    .trim()
    .toLowerCase()
    .replaceAll(",", "");

  let count;

  if (button.dataset.count) {
    count = Number(button.dataset.count);
  } else if (displayedCount.endsWith("k")) {
    count = Math.round(parseFloat(displayedCount) * 1000);
  } else {
    count = Number(displayedCount);
  }

  if (!Number.isFinite(count)) return;

  button.dataset.count = String(count);

  button.addEventListener("click", function() {
    const isLiked = button.getAttribute("aria-pressed") === "true";

    count += isLiked ? -1 : 1;

    button.setAttribute("aria-pressed", String(!isLiked));
    button.dataset.count = String(count);

    countText.textContent = count.toLocaleString("ko-KR");
  });
});

// 혜택 
const benefitArea = document.querySelector(".benefit-slide");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (benefitArea && typeof Swiper !== "undefined") {
  const swiperElement = benefitArea.querySelector(".benefit-swiper");
  const playButton = benefitArea.querySelector(".benefit-play");
  const countText = benefitArea.querySelector(".benefit-count");
  const slideCount = swiperElement.querySelectorAll(".swiper-slide").length;

  const benefitSwiper = new Swiper(swiperElement, {
    slidesPerView: 1,
    speed: reduceMotion ? 0 : 1200,
    rewind: true,
    grabCursor: true,
    watchOverflow: true,

    autoplay: {
      enabled: slideCount > 1 && !reduceMotion,
      delay: 6500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    navigation: {
      prevEl: benefitArea.querySelector(".benefit-prev"),
      nextEl : benefitArea.querySelector(".benefit-next"),
    },

    pagination: {
      el: benefitArea.querySelector(".benefit-pagination"),
      clickable: true,

      renderBullet: function (index, className) {
        return `
          <button
            type="button"
            class = "${className}"
            aria-label = "${index + 1}번째 혜택 보기"
          ></button>
        `;
      },
    },

    a11y: {
      prevSlideMessage: "이전 혜택",
      nextSlideMessage: "다음 혜택",
      paginationBulletMessage: "{{index}}번째 혜택 보기",
    },

    on: {
      init: updateBenefitCount,
      slideChange: updateBenefitCount,
    },
  });

  function updateBenefitCount(swiper) {
    countText.textContent = `${swiper.realIndex + 1} / ${slideCount}`;
  }

  function updateBenefitPlay() {
    const isPlaying = benefitSwiper.autoplay.running;

    playButton.classList.toggle("is-paused", !isPlaying);

    playButton.setAttribute("aria-label", isPlaying ? "자동재생 정지" : "자동재생 시작");
  }

  playButton.disabled = slideCount < 2;

  playButton.addEventListener("click", function() {
    if (benefitSwiper.autoplay.running) {
      benefitSwiper.autoplay.stop();
    } else {
      benefitSwiper.autoplay.start();
    }
  });

  benefitSwiper.on("autoplayStart", updateBenefitPlay);
  benefitSwiper.on("autoplayStop", updateBenefitPlay);

  updateBenefitPlay();

  benefitArea.addEventListener("focusin", function(event) {
    if (playButton.contains(event.target)) return;

    benefitSwiper.autoplay.stop();
  });
}

// 메인 팝업
const mainPopup = document.querySelector(".main-popup");

if (mainPopup) {
  const popupClose = mainPopup.querySelector(".popup-close");
  const popupToday = mainPopup.querySelector(".popup-hide-today");
  const popupPlay = mainPopup.querySelector(".popup-play");
  const popupPlayImage = popupPlay.querySelector("img");

  const storageKey = "megabox-popup-hide-until";
  let hideUntil = 0;
  let popupSwiper = null;

  try {
    hideUntil = Number(localStorage.getItem(storageKey)) || 0;
  } catch {
    hideUntil = 0;
  }

  if (Date.now() >= hideUntil) {
    mainPopup.hidden = false;

    if (typeof Swiper !== "undefined") {
      const popupSlideCount = mainPopup.querySelectorAll(
        ".popup-swiper .swiper-slide"
      ).length;

      popupSwiper = new Swiper(
        mainPopup.querySelector(".popup-swiper"),
        {
          slidesPerView: 1,
          speed: reduceMotion ? 0 : 400,
          rewind: true,
          grabCursor: true,
          watchOverflow: true,

          autoplay: {
            enabled: popupSlideCount > 1 && !reduceMotion,
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },

          pagination: {
            el: mainPopup.querySelector(".popup-pagination"),
            clickable: true,

            renderBullet: function (index, className) {
              return `
                <button
                  type="button"
                  class="${className}"
                  aria-label="${index + 1}번째 광고 보기"
                ></button>
              `;
            },
          },

          a11y: {
            paginationBulletMessage: "{{index}}번째 광고 보기",
          },
        }
      );

      popupPlay.disabled = popupSlideCount < 2;

      popupSwiper.on("autoplayStart", updatePopupPlay);
      popupSwiper.on("autoplayStop", updatePopupPlay);

      updatePopupPlay();
    } else {
      popupPlay.disabled = true;
    }
  }

  function updatePopupPlay() {
    const isPlaying = popupSwiper.autoplay.running;

    popupPlayImage.src = isPlaying
      ? "./img/button_pause.png"
      : "./img/button_play.png";

    popupPlay.setAttribute(
      "aria-label",
      isPlaying ? "자동재생 정지" : "자동재생 시작"
    );
  }

  popupPlay.addEventListener("click", function () {
    if (!popupSwiper) return;

    if (popupSwiper.autoplay.running) {
      popupSwiper.autoplay.stop();
    } else {
      popupSwiper.autoplay.start();
    }
  });

  mainPopup.addEventListener("focusin", function (event) {
    if (popupPlay.contains(event.target)) return;

    popupSwiper?.autoplay.stop();
  });

  function closePopup() {
    if (popupToday.checked) {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;

      try {
        localStorage.setItem(storageKey, String(tomorrow));
      } catch {
      }
    }

    const focusWasInside = mainPopup.contains(
      document.activeElement
    );

    popupSwiper?.autoplay.stop();
    mainPopup.hidden = true;

    if (focusWasInside) {
      document.querySelector(".logo a")?.focus();
    }
  }

  popupClose.addEventListener("click", closePopup);

  mainPopup.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePopup();
    }
  });
}

const siteMapButton = document.querySelector(".menu-btn");
const siteMapPanel = document.querySelector("#site-map");
const siteMapHeader = document.querySelector(".header");
const gnbMenuItems = document.querySelectorAll(".gnb-item");

function clearGnbMenu() {
  gnbMenuItems.forEach(function (item) {
    item.classList.remove("is-open");
  });

  siteMapHeader.classList.remove("is-menu-open");
}

function openSiteMap() {
  clearGnbMenu();

  siteMapPanel.hidden = false;
  siteMapPanel.setAttribute("aria-hidden", "false");

  siteMapButton.classList.add("is-open");
  siteMapButton.setAttribute("aria-expanded", "true");
  siteMapButton.setAttribute("aria-label", "전체 메뉴 닫기");

  siteMapHeader.classList.add("site-map-open");
}

function closeSiteMap() {
  siteMapPanel.hidden = true;
  siteMapPanel.setAttribute("aria-hidden", "true");

  siteMapButton.classList.remove("is-open");
  siteMapButton.setAttribute("aria-expanded", "false");
  siteMapButton.setAttribute("aria-label", "전체 메뉴 열기");

  siteMapHeader.classList.remove("site-map-open");
}

if (siteMapButton && siteMapPanel && siteMapHeader) {
  siteMapButton.addEventListener("click", function () {
    const isOpen = siteMapButton.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeSiteMap();
    } else {
      openSiteMap();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    const isOpen = siteMapButton.getAttribute("aria-expanded") === "true";

    if (!isOpen) return;

    closeSiteMap();
    siteMapButton.focus();
  });
}

{
  const guideElement = document.querySelector(".guide-swiper");
  const guideMedia = window.matchMedia("(max-width: 760px)");

  let guideSwiper = null;
  let guideTimer = null;

  function startGuideTimer() {
    clearInterval(guideTimer);

    guideTimer = setInterval(function () {
      if (!guideSwiper) return;

      if (guideSwiper.isEnd) {
        guideSwiper.slideTo(0, 700);
      } else {
        guideSwiper.slideNext(700);
      }
    }, 2200);
  }

  function stopGuideTimer() {
    clearInterval(guideTimer);
    guideTimer = null;
  }

  function setGuideSwiper() {
    if (!guideElement || typeof Swiper === "undefined") return;

    if (guideMedia.matches && !guideSwiper) {
      guideSwiper = new Swiper(guideElement, {
        slidesPerView: "auto",
        slidesPerGroup: 1,
        spaceBetween: 16,
        slidesOffsetAfter: 12,
        speed: 600,
        grabCursor: true,
        allowTouchMove: true,
        observer: true,
        observeParents: true,
        updateOnWindowResize: true,
      });

      guideSwiper.update();
      startGuideTimer();
      return;
    }

    if (!guideMedia.matches && guideSwiper) {
      stopGuideTimer();

      guideSwiper.destroy(true, true);
      guideSwiper = null;
    }
  }

  setGuideSwiper();

  guideMedia.addEventListener("change", setGuideSwiper);

  guideElement?.addEventListener("touchend", function () {
    if (guideSwiper) {
      startGuideTimer();
    }
  });
}