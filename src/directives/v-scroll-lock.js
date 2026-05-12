// src/directives/v-scroll-lock.js
export default {
  mounted(el) {
    let lastScrollTop = 0;
    let lastScrollLeft = 0;
    let isScrollingVertical = false;
    let isScrollingHorizontal = false;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollLeft = el.scrollLeft;

      // Determine scroll direction
      if (
        Math.abs(scrollTop - lastScrollTop) >
        Math.abs(scrollLeft - lastScrollLeft)
      ) {
        isScrollingVertical = true;
        isScrollingHorizontal = false;
        el.scrollLeft = lastScrollLeft; // Prevent horizontal scrolling
      } else {
        isScrollingHorizontal = true;
        isScrollingVertical = false;
        el.scrollTop = lastScrollTop; // Prevent vertical scrolling
      }

      lastScrollTop = scrollTop;
      lastScrollLeft = scrollLeft;
    };

    el.addEventListener('scroll', handleScroll);

    el._removeScrollListener = () => {
      el.removeEventListener('scroll', handleScroll);
    };
  },
  unmounted(el) {
    el._removeScrollListener();
  },
};
