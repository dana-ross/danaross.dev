// Swap in special characters for the Ballpoint Signature font
document.fonts.ready.then(() => {
        if (document.fonts.check('1em "Ballpoint Signature"')) {
                document.querySelectorAll('[data-font-swap-text]').forEach((target) => {
                        target.innerText = target.dataset.fontSwapText
                })
        }
});

console.log("\
8   8                           8   8  8\n\
8   8 eeee e     e     eeeee    8   8  8 eeeee eeeee  e     eeeee\n\
8eee8 8    8     8     8  88    8e  8  8 8  88 8   8  8     8   8\n\
88  8 8eee 8e    8e    8   8    88  8  8 8   8 8eee8e 8e    8e  8\n\
88  8 88   88    88    8   8    88  8  8 8   8 88   8 88    88  8\n\
88  8 88ee 88eee 88eee 8eee8    88ee8ee8 8eee8 88   8 88eee 88ee8\n\
\n\
LET'S GO OLD SCHOOL!\n\
See my vintage computing projects at https://csixty4.com\n\
Got a gopher client? Visit my gopher site at danaross.dev\n\
Get my public key and current projects using the Unix finger command: finger dana@danaross.dev")

// webp test adapted from Modernizr https://github.com/modernizr/modernizr
document.addEventListener('DOMContentLoaded', () => {
        const image = new Image()

        function addResult(event) {
                // if the event is from 'onload', check the see if the image's width is
                // 1 pixel (which indicates support). otherwise, it fails

                const result = event && event.type === 'load' ? image.width === 1 : false;

                Array.prototype.slice.call(document.getElementsByTagName('html')).forEach((element) => {
                        element.classList.add(result ? 'webp' : 'no-webp')
                });
        }

        image.onerror = addResult
        image.onload = addResult

        image.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
})
