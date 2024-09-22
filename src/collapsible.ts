const iconApiUrl: string = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';
const gistUrl: string = 'https://gist.githubusercontent.com/SnakerBone/7d80b604f5f4aa07db8d37c9393d7f79/raw';

document.addEventListener('DOMContentLoaded', () => 
{
    findAndHook();
    setAge();
    defineLangRefs();
});

function findAndHook() 
{
    const elements: HTMLCollection = document.getElementsByClassName('info-collapse-title');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        element.addEventListener('click', () => {
            element.classList.toggle('info-active');
            const holder: HTMLElement = element.nextElementSibling as HTMLElement;
            const footer: HTMLElement = document.getElementById('transforming-footer') as HTMLElement;
            
            let suffix: string;

            if (holder.style.maxHeight.length != 0) {
                holder.style.maxHeight = '';
                suffix = '+';

                if (footer) {
                    footer.removeAttribute('hidden');
                }
            } else {
                holder.style.maxHeight = holder.scrollHeight + 'px';
                suffix = '-';
                
                if (footer) {
                    footer.setAttribute('hidden', 'true');
                }
            }

            const suffixElement: HTMLElement = element.children[0].children[0] as HTMLElement;

            suffixElement.textContent = suffix;
        });
    }
}

function defineLangRefs()
{
    const elements: HTMLCollection = document.getElementsByTagName('img');
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements.item(i);

        if (element?.hasAttribute('langRef')) {
            const ref: string = element.getAttribute('langRef') as string;
            const pieces: Array<string> = ref.split('::');

            const type: string = pieces[0];
            const design: string = pieces[1];

            let iconPath;

            if (type === 'builtin') {
                iconPath = `${gistUrl}/${design}.svg`;
            } else {
                iconPath = `${iconApiUrl}/${type}/${type}-${design}.svg`;
            }

            element.setAttribute('src', iconPath);
        }
    }
}

function setAge() 
{
    const birthMillis: number = 1075135080000; // close enough good enough xD
    const birthDate: Date = new Date(birthMillis);
    const dateNow: Date = new Date();
    const age: number = dateNow.getFullYear() - birthDate.getFullYear();

    const element: HTMLElement = document.getElementById('my-age') as HTMLElement;
    element.textContent = age.toString();
}