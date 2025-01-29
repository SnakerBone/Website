import { enableDropdownLogic } from "./api.js";

document.addEventListener('DOMContentLoaded', () => 
{
    setLanguageIcons();
    setSnakerAge();
    enableDropdownLogic();
});

function setLanguageIcons()
{
    const elements = document.getElementsByTagName('img');
    const devIconsUrl = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';
    const builtInIconsUrl = 'https://gist.githubusercontent.com/SnakerBone/7d80b604f5f4aa07db8d37c9393d7f79/raw';

    for (let i = 0; i < elements.length; i++) {
        const element = elements.item(i);

        if (element?.hasAttribute('langRef')) {
            const ref = element.getAttribute('langRef');
            const pieces = ref.split('::');

            const type = pieces[0];
            const design = pieces[1];

            let iconPath;

            if (type === 'builtin') {
                iconPath = `${builtInIconsUrl}/${design}.svg`;
            } else {
                iconPath = `${devIconsUrl}/${type}/${type}-${design}.svg`;
            }

            element.setAttribute('src', iconPath);
        }
    }
}

function setSnakerAge() 
{
    const millisOnBirthDate = 1075135080000;
    const birthDate = new Date(millisOnBirthDate);
    const dateNow = new Date();
    const age = dateNow.getFullYear() - birthDate.getFullYear();
    const element = document.getElementById('snaker-age');

    element.textContent = age.toString();
}