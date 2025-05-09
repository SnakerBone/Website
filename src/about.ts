import { setDarkMode, setHeading, setNavbar } from "./api.js";

const DEV_ICONS_URL: string = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';
const BUILT_IN_ICONS_URL: string = 'https://gist.githubusercontent.com/SnakerBone/7d80b604f5f4aa07db8d37c9393d7f79/raw';

setDarkMode();
setNavbar();
setHeading('About', 4, 'main');
setIcons();
setAge();
setCollapsibles();

function setIcons(): void
{
    const images: HTMLCollectionOf<HTMLImageElement> = document.getElementsByTagName('img');

    for (let i = 0; i < images.length; i++) 
    {
        const image: HTMLImageElement | null = images.item(i);

        if (image?.hasAttribute('icon')) 
        {
            const icon: string | null = image.getAttribute('icon');
            const pieces: string[] = icon?.split('.') as string[];
            const type: string = pieces[0];
            const design: string = pieces[1];

            let source: string;

            if (type === 'builtin') {
                source = `${BUILT_IN_ICONS_URL}/${design}.svg`;
            } else {
                source = `${DEV_ICONS_URL}/${type}/${type}-${design}.svg`;
            }

            image.setAttribute('src', source);
        }
    }
}

function setAge(): void
{
    const millisOnBirthDate: number = 1075135080000;
    const birthDate: Date = new Date(millisOnBirthDate);
    const dateNow: Date = new Date();
    const age: number = dateNow.getFullYear() - birthDate.getFullYear();
    const element: HTMLElement | null = document.getElementById('snaker-age') as HTMLElement;

    element.textContent = age.toString();
}

function setCollapsibles(): void
{
    const elements: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('info-collapse-title') as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < elements.length; i++) 
    {
        const element: HTMLElement = elements[i];

        element.addEventListener('click', () =>
        {
            const contents: HTMLElement = element.nextElementSibling as HTMLElement;
            const style: CSSStyleDeclaration = contents.style;
            const collapsed: boolean = style.maxHeight.length != 0;

            let suffix: string;

            if (collapsed) {
                style.maxHeight = '';
                suffix = '+';
            } else {
                style.maxHeight = contents.scrollHeight + 'px';
                suffix = '-';
            }

            element.children[0].children[0].textContent = suffix;
        });
    }
}