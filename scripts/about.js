import { setDarkMode, setHeading, setNavbar } from "./api.js";
const DEV_ICONS_URL = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';
const BUILT_IN_ICONS_URL = 'https://gist.githubusercontent.com/SnakerBone/7d80b604f5f4aa07db8d37c9393d7f79/raw';
setDarkMode();
setNavbar();
setHeading('About', 4, 'main');
setIcons();
setAge();
setCollapsibles();
function setIcons() {
    const images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
        const image = images.item(i);
        if (image === null || image === void 0 ? void 0 : image.hasAttribute('icon')) {
            const icon = image.getAttribute('icon');
            const pieces = icon === null || icon === void 0 ? void 0 : icon.split('.');
            const type = pieces[0];
            const design = pieces[1];
            let source;
            if (type === 'builtin') {
                source = `${BUILT_IN_ICONS_URL}/${design}.svg`;
            }
            else {
                source = `${DEV_ICONS_URL}/${type}/${type}-${design}.svg`;
            }
            image.setAttribute('src', source);
        }
    }
}
function setAge() {
    const millisOnBirthDate = 1075135080000;
    const birthDate = new Date(millisOnBirthDate);
    const dateNow = new Date();
    const age = dateNow.getFullYear() - birthDate.getFullYear();
    const element = document.getElementById('snaker-age');
    element.textContent = age.toString();
}
function setCollapsibles() {
    const elements = document.getElementsByClassName('info-collapse-title');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.addEventListener('click', () => {
            const contents = element.nextElementSibling;
            const style = contents.style;
            const collapsed = style.maxHeight.length != 0;
            let suffix;
            if (collapsed) {
                style.maxHeight = '';
                suffix = '+';
            }
            else {
                style.maxHeight = contents.scrollHeight + 'px';
                suffix = '-';
            }
            element.children[0].children[0].textContent = suffix;
        });
    }
}
